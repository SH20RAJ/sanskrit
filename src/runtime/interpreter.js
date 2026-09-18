// Sanskrit Language Interpreter
const { Environment } = require('./environment');
const { ControlFlowSignal, ReturnSignal, BreakSignal, ContinueSignal, ThrowSignal } = require('./signals');
const { SanskritFunction, SanskritClass, SanskritInstance, SanskritBoundMethod } = require('./values');
const { createBuiltins, formatValue } = require('./builtins');
const { NodeTypes } = require('../ast/node-types');
const { RuntimeError, TypeError, NameError } = require('../diagnostics/errors');

class Interpreter {
    constructor(options = {}) {
        this.filename = options.filename || '<anonymous>';
        this.outputStream = options.outputStream || console.log;
        this.globalEnv = new Environment();
        this.setupGlobals();
    }

    setupGlobals() {
        // Built-in constants
        this.globalEnv.declare('सत्य', true, true);
        this.globalEnv.declare('असत्य', false, true);
        this.globalEnv.declare('शून्य', null, true);
        this.globalEnv.declare('अपरिभाषित', undefined, true);
        this.globalEnv.declare('अनंत', Infinity, true);
        this.globalEnv.declare('NaN', NaN, true);

        // Standard built-in functions
        const builtins = createBuiltins(this.outputStream);
        for (const [name, fn] of builtins.entries()) {
            this.globalEnv.declare(name, fn, false);
        }
    }

    interpret(ast) {
        return this.execute(ast, this.globalEnv);
    }

    execute(node, env) {
        if (!node) return undefined;

        switch (node.type) {
            case NodeTypes.PROGRAM: {
                let result = undefined;
                for (const stmt of node.body) {
                    result = this.execute(stmt, env);
                }
                return result;
            }

            case NodeTypes.BLOCK_STATEMENT: {
                const blockEnv = env.createChild();
                let result = undefined;
                for (const stmt of node.body) {
                    result = this.execute(stmt, blockEnv);
                }
                return result;
            }

            case NodeTypes.VARIABLE_DECLARATION: {
                const initVal = node.init ? this.evaluate(node.init, env) : undefined;
                env.declare(node.id.name, initVal, node.isConstant, node.loc);
                return initVal;
            }

            case NodeTypes.FUNCTION_DECLARATION: {
                const func = new SanskritFunction(
                    node.id.name,
                    node.params.map(p => p.name),
                    node.body,
                    env
                );
                env.declare(node.id.name, func, false, node.loc);
                return func;
            }

            case NodeTypes.CLASS_DECLARATION: {
                let parentClass = null;
                if (node.superClass) {
                    parentClass = env.lookup(node.superClass.name, node.superClass.loc);
                    if (!(parentClass instanceof SanskritClass)) {
                        throw new TypeError(`'${node.superClass.name}' is not a class and cannot be extended`, {
                            filename: this.filename,
                            line: node.superClass.loc ? node.superClass.loc.line : 1,
                            column: node.superClass.loc ? node.superClass.loc.column : 1
                        });
                    }
                }

                const cls = new SanskritClass(node.id.name, parentClass);
                cls.closure = env;

                for (const method of node.body) {
                    if (method.isConstructor) {
                        cls.constructorMethod = method;
                    } else if (method.isStatic) {
                        cls.staticMethods.set(method.id.name, method);
                    } else {
                        cls.methods.set(method.id.name, method);
                    }
                }

                env.declare(node.id.name, cls, false, node.loc);
                return cls;
            }

            case NodeTypes.EXPRESSION_STATEMENT: {
                return this.evaluate(node.expression, env);
            }

            case NodeTypes.IF_STATEMENT: {
                const condition = this.evaluate(node.test, env);
                if (this.isTruthy(condition)) {
                    return this.execute(node.consequent, env);
                } else if (node.alternate) {
                    return this.execute(node.alternate, env);
                }
                return undefined;
            }

            case NodeTypes.WHILE_STATEMENT: {
                let result = undefined;
                while (this.isTruthy(this.evaluate(node.test, env))) {
                    try {
                        result = this.execute(node.body, env);
                    } catch (signal) {
                        if (signal instanceof BreakSignal) break;
                        if (signal instanceof ContinueSignal) continue;
                        throw signal;
                    }
                }
                return result;
            }

            case NodeTypes.FOR_STATEMENT: {
                const forEnv = env.createChild();
                if (node.init) {
                    if (node.init.type === NodeTypes.VARIABLE_DECLARATION) {
                        this.execute(node.init, forEnv);
                    } else {
                        this.evaluate(node.init, forEnv);
                    }
                }

                let result = undefined;
                while (!node.test || this.isTruthy(this.evaluate(node.test, forEnv))) {
                    try {
                        result = this.execute(node.body, forEnv);
                    } catch (signal) {
                        if (signal instanceof BreakSignal) break;
                        if (signal instanceof ContinueSignal) {
                            // Continue goes to update step
                        } else {
                            throw signal;
                        }
                    }

                    if (node.update) {
                        this.evaluate(node.update, forEnv);
                    }
                }
                return result;
            }

            case NodeTypes.FOR_EACH_STATEMENT: {
                const collection = this.evaluate(node.right, env);
                let items = [];

                if (Array.isArray(collection)) {
                    items = collection;
                } else if (typeof collection === 'string') {
                    items = Array.from(collection);
                } else if (collection instanceof SanskritInstance) {
                    items = Array.from(collection.fields.keys());
                } else if (collection && typeof collection === 'object') {
                    items = Object.keys(collection);
                }

                let result = undefined;
                for (const item of items) {
                    const loopEnv = env.createChild();
                    loopEnv.declare(node.left.name, item, false, node.loc);

                    try {
                        result = this.execute(node.body, loopEnv);
                    } catch (signal) {
                        if (signal instanceof BreakSignal) break;
                        if (signal instanceof ContinueSignal) continue;
                        throw signal;
                    }
                }
                return result;
            }

            case NodeTypes.RETURN_STATEMENT: {
                const val = node.argument ? this.evaluate(node.argument, env) : undefined;
                throw new ReturnSignal(val);
            }

            case NodeTypes.BREAK_STATEMENT: {
                throw new BreakSignal();
            }

            case NodeTypes.CONTINUE_STATEMENT: {
                throw new ContinueSignal();
            }

            case NodeTypes.TRY_STATEMENT: {
                try {
                    return this.execute(node.block, env);
                } catch (err) {
                    if (err instanceof ControlFlowSignal && !(err instanceof ThrowSignal)) {
                        throw err; // Let return/break/continue propagate unless finally runs
                    }

                    if (node.handler) {
                        const catchEnv = env.createChild();
                        const caughtVal = err instanceof ThrowSignal ? err.value : err.message;
                        catchEnv.declare(node.handler.param.name, caughtVal, false, node.handler.loc);
                        return this.execute(node.handler.body, catchEnv);
                    } else {
                        throw err;
                    }
                } finally {
                    if (node.finalizer) {
                        this.execute(node.finalizer, env);
                    }
                }
            }

            case NodeTypes.THROW_STATEMENT: {
                const val = this.evaluate(node.argument, env);
                throw new ThrowSignal(val, node.loc);
            }

            default:
                return this.evaluate(node, env);
        }
    }

    evaluate(node, env) {
        if (!node) return undefined;

        switch (node.type) {
            case NodeTypes.NUMERIC_LITERAL:
                return node.value;

            case NodeTypes.STRING_LITERAL:
                return node.value;

            case NodeTypes.BOOLEAN_LITERAL:
                return node.value;

            case NodeTypes.NULL_LITERAL:
                return null;

            case NodeTypes.UNDEFINED_LITERAL:
                return undefined;

            case NodeTypes.IDENTIFIER:
                return env.lookup(node.name, node.loc);

            case NodeTypes.THIS_EXPRESSION:
                return env.lookup('स्व', node.loc);

            case NodeTypes.SUPER_EXPRESSION:
                return env.lookup('सुपर', node.loc);

            case NodeTypes.ARRAY_LITERAL:
                return node.elements.map(elem => this.evaluate(elem, env));

            case NodeTypes.OBJECT_LITERAL: {
                const obj = {};
                for (const prop of node.properties) {
                    const key = prop.key.type === NodeTypes.IDENTIFIER ? prop.key.name : prop.key.value;
                    obj[key] = this.evaluate(prop.value, env);
                }
                return obj;
            }

            case NodeTypes.NEW_EXPRESSION: {
                const callee = this.evaluate(node.callee, env);
                if (!(callee instanceof SanskritClass)) {
                    const name = node.callee.name || 'Object';
                    throw new TypeError(`'${name}' is not a class and cannot be instantiated with 'नया'`, {
                        filename: this.filename,
                        line: node.loc ? node.loc.line : 1,
                        column: node.loc ? node.loc.column : 1,
                        hint: `Define '${name}' using 'वर्ग ${name} { ... }'`
                    });
                }
                const args = node.arguments.map(arg => this.evaluate(arg, env));
                return callee.instantiate(this, args, node.loc);
            }

            case NodeTypes.CALL_EXPRESSION: {
                let fn;
                let target = null;

                if (node.callee.type === NodeTypes.MEMBER_EXPRESSION) {
                    target = this.evaluate(node.callee.object, env);
                    const prop = node.callee.computed
                        ? this.evaluate(node.callee.property, env)
                        : node.callee.property.name;

                    if (target instanceof SanskritInstance || target instanceof SanskritClass) {
                        fn = target.get(prop, node.loc);
                    } else if (target !== null && target !== undefined) {
                        fn = target[prop];
                    }
                } else {
                    fn = this.evaluate(node.callee, env);
                }

                const evaluatedArgs = node.arguments.map(arg => this.evaluate(arg, env));

                if (fn instanceof SanskritFunction) {
                    return fn.call(this, evaluatedArgs, node.loc);
                }
                if (fn instanceof SanskritBoundMethod) {
                    return fn.call(this, evaluatedArgs, node.loc);
                }
                if (typeof fn === 'function') {
                    return fn.apply(target, evaluatedArgs);
                }

                const calleeName = node.callee.name || (node.callee.property ? node.callee.property.name : 'expression');
                throw new TypeError(`'${calleeName}' is not a function`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1,
                    hint: `Check that '${calleeName}' is defined as a function or method`
                });
            }

            case NodeTypes.MEMBER_EXPRESSION: {
                const object = this.evaluate(node.object, env);
                const property = node.computed
                    ? this.evaluate(node.property, env)
                    : node.property.name;

                if (object === null || object === undefined) {
                    throw new TypeError(`Cannot read property '${property}' of ${object}`, {
                        filename: this.filename,
                        line: node.loc ? node.loc.line : 1,
                        column: node.loc ? node.loc.column : 1
                    });
                }

                if (object instanceof SanskritInstance || object instanceof SanskritClass) {
                    return object.get(property, node.loc);
                }

                return object[property];
            }

            case NodeTypes.ASSIGNMENT_EXPRESSION: {
                const value = this.evaluate(node.right, env);

                if (node.left.type === NodeTypes.IDENTIFIER) {
                    const varName = node.left.name;
                    if (node.operator === '=') {
                        return env.assign(varName, value, node.loc);
                    }
                    const currentVal = env.lookup(varName, node.loc);
                    const newVal = this.applyCompound(currentVal, value, node.operator, node.loc);
                    return env.assign(varName, newVal, node.loc);
                }

                if (node.left.type === NodeTypes.MEMBER_EXPRESSION) {
                    const targetObj = this.evaluate(node.left.object, env);
                    const prop = node.left.computed
                        ? this.evaluate(node.left.property, env)
                        : node.left.property.name;

                    if (targetObj === null || targetObj === undefined) {
                        throw new TypeError(`Cannot set property '${prop}' of ${targetObj}`, {
                            filename: this.filename,
                            line: node.loc ? node.loc.line : 1,
                            column: node.loc ? node.loc.column : 1
                        });
                    }

                    if (node.operator === '=') {
                        if (targetObj instanceof SanskritInstance) {
                            return targetObj.set(prop, value);
                        }
                        targetObj[prop] = value;
                        return value;
                    }

                    const currentVal = targetObj instanceof SanskritInstance
                        ? targetObj.get(prop, node.loc)
                        : targetObj[prop];
                    const newVal = this.applyCompound(currentVal, value, node.operator, node.loc);

                    if (targetObj instanceof SanskritInstance) {
                        return targetObj.set(prop, newVal);
                    }
                    targetObj[prop] = newVal;
                    return newVal;
                }

                throw new RuntimeError(`Invalid target in assignment expression`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
            }

            case NodeTypes.UPDATE_EXPRESSION: {
                if (node.argument.type === NodeTypes.IDENTIFIER) {
                    const varName = node.argument.name;
                    const currentVal = env.lookup(varName, node.loc);
                    const delta = node.operator === '++' ? 1 : -1;
                    const newVal = currentVal + delta;
                    env.assign(varName, newVal, node.loc);
                    return node.prefix ? newVal : currentVal;
                }

                if (node.argument.type === NodeTypes.MEMBER_EXPRESSION) {
                    const targetObj = this.evaluate(node.argument.object, env);
                    const prop = node.argument.computed
                        ? this.evaluate(node.argument.property, env)
                        : node.argument.property.name;

                    const currentVal = targetObj instanceof SanskritInstance
                        ? targetObj.get(prop, node.loc)
                        : targetObj[prop];
                    const delta = node.operator === '++' ? 1 : -1;
                    const newVal = currentVal + delta;

                    if (targetObj instanceof SanskritInstance) {
                        targetObj.set(prop, newVal);
                    } else {
                        targetObj[prop] = newVal;
                    }

                    return node.prefix ? newVal : currentVal;
                }

                throw new RuntimeError(`Invalid operand in update expression`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
            }

            case NodeTypes.BINARY_EXPRESSION: {
                const left = this.evaluate(node.left, env);
                const right = this.evaluate(node.right, env);

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '%': return left % right;
                    case '**': return Math.pow(left, right);
                    case '===': return left === right;
                    case '!==': return left !== right;
                    case '==': return left == right;
                    case '!=': return left != right;
                    case '<': return left < right;
                    case '>': return left > right;
                    case '<=': return left <= right;
                    case '>=': return left >= right;
                    case '&': return left & right;
                    case '|': return left | right;
                    case '^': return left ^ right;
                    case '<<': return left << right;
                    case '>>': return left >> right;
                    case '>>>': return left >>> right;
                    default:
                        throw new RuntimeError(`Unknown binary operator: '${node.operator}'`, {
                            filename: this.filename,
                            line: node.loc ? node.loc.line : 1,
                            column: node.loc ? node.loc.column : 1
                        });
                }
            }

            case NodeTypes.LOGICAL_EXPRESSION: {
                const left = this.evaluate(node.left, env);

                if (node.operator === '&&' || node.operator === 'और') {
                    return this.isTruthy(left) ? this.evaluate(node.right, env) : left;
                }
                if (node.operator === '||' || node.operator === 'या') {
                    return this.isTruthy(left) ? left : this.evaluate(node.right, env);
                }

                throw new RuntimeError(`Unknown logical operator: '${node.operator}'`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
            }

            case NodeTypes.UNARY_EXPRESSION: {
                const operand = this.evaluate(node.argument, env);

                switch (node.operator) {
                    case '+': return +operand;
                    case '-': return -operand;
                    case '!': return !this.isTruthy(operand);
                    case '~': return ~operand;
                    default:
                        throw new RuntimeError(`Unknown unary operator: '${node.operator}'`, {
                            filename: this.filename,
                            line: node.loc ? node.loc.line : 1,
                            column: node.loc ? node.loc.column : 1
                        });
                }
            }

            default:
                throw new RuntimeError(`Unknown AST node type: '${node.type}'`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
        }
    }

    applyCompound(left, right, operator, loc) {
        switch (operator) {
            case '+=': return left + right;
            case '-=': return left - right;
            case '*=': return left * right;
            case '/=': return left / right;
            case '%=': return left % right;
            case '**=': return Math.pow(left, right);
            default:
                throw new RuntimeError(`Unknown compound assignment operator: '${operator}'`, {
                    filename: this.filename,
                    line: loc ? loc.line : 1,
                    column: loc ? loc.column : 1
                });
        }
    }

    isTruthy(val) {
        if (val === null || val === undefined) return false;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val !== 0 && !isNaN(val);
        if (typeof val === 'string') return val.length > 0;
        return true;
    }
}

module.exports = { Interpreter };
