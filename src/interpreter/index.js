// Sanskrit Language Interpreter
class Interpreter {
    constructor() {
        this.globalScope = new Map();
        this.scopes = [this.globalScope];
        this.functions = new Map();
        this.classes = new Map();
        this.currentThis = null;
        this.returnValue = null;
        this.shouldReturn = false;
        this.shouldBreak = false;
        this.shouldContinue = false;
        this.errorStack = [];

        // Add built-in functions
        this.addBuiltinFunctions();
        this.addBuiltinConstants();
    }

    addBuiltinFunctions() {
        const builtins = {
            'मुद्रण': (...args) => {
                console.log(...args.map(arg => this.formatOutput(arg)));
                return undefined;
            },
            'लंबाई': (obj) => {
                if (typeof obj === 'string' || Array.isArray(obj)) {
                    return obj.length;
                }
                if (obj && typeof obj === 'object') {
                    return Object.keys(obj).length;
                }
                return 0;
            },
            'प्रकार': (obj) => {
                if (obj === null) return 'शून्य';
                if (obj === undefined) return 'अपरिभाषित';
                if (Array.isArray(obj)) return 'सूची';
                return typeof obj;
            },
            'पार्स_संख्या': (str) => {
                const num = Number(str);
                return isNaN(num) ? undefined : num;
            },
            'स्ट्रिंग': (obj) => String(obj),
            'संख्या': (obj) => Number(obj),
            'बूलियन': (obj) => Boolean(obj),
            'गणित_वर्ग': (x) => Math.sqrt(x),
            'गणित_शक्ति': (base, exp) => Math.pow(base, exp),
            'गणित_न्यूनतम': (...args) => Math.min(...args),
            'गणित_अधिकतम': (...args) => Math.max(...args),
            'गणित_यादृच्छिक': () => Math.random(),
            'समय': () => Date.now(),
            'प्रतीक्षा': async (ms) => new Promise(resolve => setTimeout(resolve, ms))
        };

        for (const [name, func] of Object.entries(builtins)) {
            this.functions.set(name, {
                builtin: true,
                execute: func
            });
        }
    }

    addBuiltinConstants() {
        this.globalScope.set('अनंत', Infinity);
        this.globalScope.set('NaN', NaN);
        this.globalScope.set('सत्य', true);
        this.globalScope.set('असत्य', false);
        this.globalScope.set('शून्य', null);
        this.globalScope.set('अपरिभाषित', undefined);
    }

    formatOutput(value) {
        if (typeof value === 'number') {
            // Convert to Devanagari numerals for output
            return value.toString().replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x30 + 0x0966));
        }
        return value;
    }

    pushScope() {
        this.scopes.push(new Map());
    }

    popScope() {
        if (this.scopes.length > 1) {
            this.scopes.pop();
        }
    }

    getCurrentScope() {
        return this.scopes[this.scopes.length - 1];
    }

    setVariable(name, value, isConstant = false) {
        const scope = this.getCurrentScope();
        if (scope.has(name) && scope.get(name).isConstant) {
            throw new Error(`Cannot reassign constant variable: ${name}`);
        }
        scope.set(name, { value, isConstant });
    }

    getVariable(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            const scope = this.scopes[i];
            if (scope.has(name)) {
                const variable = scope.get(name);
                return variable.value !== undefined ? variable.value : variable;
            }
        }
        throw new Error(`Variable '${name}' is not defined`);
    }

    hasVariable(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                return true;
            }
        }
        return false;
    }

    interpret(ast) {
        try {
            return this.visit(ast);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    visit(node) {
        if (!node) return undefined;
        
        const methodName = `visit${node.type}`;
        if (this[methodName]) {
            return this[methodName](node);
        }
        throw new Error(`No visit method for ${node.type}`);
    }

    handleError(error) {
        this.errorStack.push({
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    visitProgram(node) {
        let result;
        for (const child of node.children) {
            if (this.shouldReturn || this.shouldBreak || this.shouldContinue) break;
            result = this.visit(child);
        }
        return result;
    }

    visitVariableDeclaration(node) {
        const [identifier, initialValue] = node.children;
        const name = identifier.value;
        const value = initialValue ? this.visit(initialValue) : undefined;
        this.setVariable(name, value, node.isConstant);
        return value;
    }

    visitFunctionDeclaration(node) {
        const [identifier, params, , body] = node.children;
        const funcName = identifier.value;
        this.functions.set(funcName, {
            params: params.children.map(p => p.value),
            body,
            builtin: false,
            closure: new Map(this.getCurrentScope())
        });
        return undefined;
    }

    visitClassDeclaration(node) {
        const [className, superClass, body] = node.children;
        const name = className.value;
        
        const classDef = {
            name,
            superClass: superClass ? superClass.value : null,
            methods: new Map(),
            staticMethods: new Map(),
            constructor: null
        };

        // Process class body
        for (const method of body.children) {
            if (method.type === 'MethodDeclaration') {
                const [methodName, params, , methodBody] = method.children;
                const methodDef = {
                    params: params.children.map(p => p.value),
                    body: methodBody,
                    modifiers: method.modifiers || []
                };

                if (method.isConstructor) {
                    classDef.constructor = methodDef;
                } else if (method.modifiers.includes('स्थैतिक')) {
                    classDef.staticMethods.set(methodName.value, methodDef);
                } else {
                    classDef.methods.set(methodName.value, methodDef);
                }
            }
        }

        this.classes.set(name, classDef);
        return undefined;
    }

    visitBlockStatement(node) {
        this.pushScope();
        let result;
        
        try {
            for (const child of node.children) {
                if (this.shouldReturn || this.shouldBreak || this.shouldContinue) break;
                result = this.visit(child);
            }
        } finally {
            this.popScope();
        }
        
        return result;
    }

    visitIfStatement(node) {
        const [condition, thenBranch, elseBranch] = node.children;
        const conditionValue = this.visit(condition);
        
        if (this.isTruthy(conditionValue)) {
            return this.visit(thenBranch);
        } else if (elseBranch) {
            return this.visit(elseBranch);
        }
        
        return undefined;
    }

    visitWhileStatement(node) {
        const [condition, body] = node.children;
        let result;
        
        while (this.isTruthy(this.visit(condition))) {
            result = this.visit(body);
            
            if (this.shouldReturn) break;
            if (this.shouldBreak) {
                this.shouldBreak = false;
                break;
            }
            if (this.shouldContinue) {
                this.shouldContinue = false;
                continue;
            }
        }
        
        return result;
    }

    visitForStatement(node) {
        const [init, condition, update, body] = node.children;
        let result;
        
        this.pushScope();
        try {
            if (init) this.visit(init);
            
            while (!condition || this.isTruthy(this.visit(condition))) {
                result = this.visit(body);
                
                if (this.shouldReturn) break;
                if (this.shouldBreak) {
                    this.shouldBreak = false;
                    break;
                }
                if (this.shouldContinue) {
                    this.shouldContinue = false;
                }
                
                if (update) this.visit(update);
            }
        } finally {
            this.popScope();
        }
        
        return result;
    }

    visitReturnStatement(node) {
        const [value] = node.children;
        this.returnValue = value ? this.visit(value) : undefined;
        this.shouldReturn = true;
        return this.returnValue;
    }

    visitBreakStatement(node) {
        this.shouldBreak = true;
        return undefined;
    }

    visitContinueStatement(node) {
        this.shouldContinue = true;
        return undefined;
    }

    visitCallExpression(node) {
        const [callee, args] = node.children;
        const evaluatedArgs = args.children.map(arg => this.visit(arg));
        
        if (callee.type === 'Identifier') {
            const funcName = callee.value;
            const func = this.functions.get(funcName);
            
            if (!func) {
                throw new Error(`Function ${funcName} is not defined`);
            }

            if (func.builtin) {
                return func.execute(...evaluatedArgs);
            }

            return this.callFunction(func, evaluatedArgs);
        } else if (callee.type === 'MemberExpression') {
            const object = this.visit(callee.children[0]);
            const property = callee.computed ? 
                this.visit(callee.children[1]) : 
                callee.children[1].value;
            
            const method = object[property];
            if (typeof method === 'function') {
                return method.apply(object, evaluatedArgs);
            }
            throw new Error(`${property} is not a function`);
        }
        
        throw new Error('Invalid function call');
    }

    callFunction(func, args) {
        this.pushScope();
        
        // Set up closure variables
        if (func.closure) {
            for (const [name, value] of func.closure) {
                this.setVariable(name, value);
            }
        }
        
        // Set parameters
        func.params.forEach((param, i) => {
            this.setVariable(param, args[i]);
        });

        const oldReturn = this.shouldReturn;
        this.shouldReturn = false;
        this.returnValue = undefined;
        
        try {
            this.visit(func.body);
            return this.returnValue;
        } finally {
            this.shouldReturn = oldReturn;
            this.popScope();
        }
    }

    visitAssignmentExpression(node) {
        const [left, right] = node.children;
        const value = this.visit(right);
        
        if (left.type === 'Identifier') {
            const name = left.value;
            if (node.operator === '=') {
                this.setVariable(name, value);
            } else {
                const currentValue = this.getVariable(name);
                const newValue = this.applyCompoundAssignment(currentValue, value, node.operator);
                this.setVariable(name, newValue);
            }
        } else if (left.type === 'MemberExpression') {
            const object = this.visit(left.children[0]);
            const property = left.computed ? 
                this.visit(left.children[1]) : 
                left.children[1].value;
            
            if (node.operator === '=') {
                object[property] = value;
            } else {
                const currentValue = object[property];
                object[property] = this.applyCompoundAssignment(currentValue, value, node.operator);
            }
        }
        
        return value;
    }

    applyCompoundAssignment(left, right, operator) {
        switch (operator) {
            case '+=': return left + right;
            case '-=': return left - right;
            case '*=': return left * right;
            case '/=': return left / right;
            case '%=': return left % right;
            case '**=': return Math.pow(left, right);
            default: throw new Error(`Unknown assignment operator: ${operator}`);
        }
    }

    visitIdentifier(node) {
        return this.getVariable(node.value);
    }

    visitNumberLiteral(node) {
        return Number(node.value);
    }

    visitStringLiteral(node) {
        return String(node.value);
    }

    visitBooleanLiteral(node) {
        return Boolean(node.value);
    }

    visitNullLiteral(node) {
        return null;
    }

    visitUndefinedLiteral(node) {
        return undefined;
    }

    visitArrayLiteral(node) {
        const [elements] = node.children;
        return elements.children.map(element => 
            element.type === 'EmptyElement' ? undefined : this.visit(element)
        );
    }

    visitObjectLiteral(node) {
        const [properties] = node.children;
        const obj = {};
        
        for (const property of properties.children) {
            const [key, value] = property.children;
            const keyValue = key.type === 'Identifier' ? key.value : this.visit(key);
            obj[keyValue] = this.visit(value);
        }
        
        return obj;
    }

    visitMemberExpression(node) {
        const [object, property] = node.children;
        const obj = this.visit(object);
        const prop = node.computed ? this.visit(property) : property.value;
        return obj[prop];
    }

    visitBinaryExpression(node) {
        const left = this.visit(node.children[0]);
        const right = this.visit(node.children[1]);
        
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            case '**': return Math.pow(left, right);
            case '==': return left == right;
            case '!=': return left != right;
            case '===': return left === right;
            case '!==': return left !== right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            default: throw new Error(`Unknown operator ${node.operator}`);
        }
    }

    visitLogicalExpression(node) {
        const left = this.visit(node.children[0]);
        
        switch (node.operator) {
            case '&&':
            case 'और':
                return this.isTruthy(left) ? this.visit(node.children[1]) : left;
            case '||':
            case 'या':
                return this.isTruthy(left) ? left : this.visit(node.children[1]);
            default:
                throw new Error(`Unknown logical operator ${node.operator}`);
        }
    }

    visitUnaryExpression(node) {
        const [operand] = node.children;
        const value = this.visit(operand);
        
        switch (node.operator) {
            case '+': return +value;
            case '-': return -value;
            case '!':
            case 'नहीं': return !this.isTruthy(value);
            case '~': return ~value;
            case '++':
                if (operand.type === 'Identifier') {
                    const newValue = this.getVariable(operand.value) + 1;
                    this.setVariable(operand.value, newValue);
                    return node.prefix ? newValue : newValue - 1;
                }
                throw new Error('Invalid increment operation');
            case '--':
                if (operand.type === 'Identifier') {
                    const newValue = this.getVariable(operand.value) - 1;
                    this.setVariable(operand.value, newValue);
                    return node.prefix ? newValue : newValue + 1;
                }
                throw new Error('Invalid decrement operation');
            default:
                throw new Error(`Unknown unary operator ${node.operator}`);
        }
    }

    isTruthy(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        return true;
    }
}

module.exports = { Interpreter };
