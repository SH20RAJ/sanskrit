// Sanskrit AST to Bytecode Compiler
const { Opcodes } = require('./opcodes');
const { Chunk } = require('./chunk');
const { NodeTypes } = require('../ast/node-types');
const { RuntimeError } = require('../diagnostics/errors');

class Local {
    constructor(name, depth) {
        this.name = name;
        this.depth = depth;
    }
}

class BytecodeCompiler {
    constructor(parent = null, functionType = 'TYPE_SCRIPT') {
        this.parent = parent;
        this.functionType = functionType;
        this.chunk = new Chunk();
        this.locals = [];
        this.scopeDepth = 0;
        this.loopContexts = [];

        // Claim slot 0 for function closure / call frame
        this.locals.push(new Local('', 0));
    }

    compile(ast) {
        this.visit(ast);
        this.emitReturn();
        return this.chunk;
    }

    emit(byte, line = 1) {
        return this.chunk.write(byte, line);
    }

    emitConstant(value, line = 1) {
        const constIdx = this.chunk.addConstant(value);
        this.emit(Opcodes.OP_CONSTANT, line);
        this.emit(constIdx, line);
    }

    emitJump(instruction, line = 1) {
        this.emit(instruction, line);
        return this.emit(0xff, line); // Placeholder jump offset
    }

    patchJump(offset) {
        this.chunk.code[offset] = this.chunk.code.length;
    }

    emitLoop(loopStart, line = 1) {
        this.emit(Opcodes.OP_LOOP, line);
        this.emit(loopStart, line);
    }

    emitReturn(line = 1) {
        this.emit(Opcodes.OP_UNDEFINED, line);
        this.emit(Opcodes.OP_RETURN, line);
    }

    beginScope() {
        this.scopeDepth++;
    }

    endScope(line = 1) {
        this.scopeDepth--;
        while (this.locals.length > 0 && this.locals[this.locals.length - 1].depth > this.scopeDepth) {
            this.emit(Opcodes.OP_POP, line);
            this.locals.pop();
        }
    }

    resolveLocal(name) {
        for (let i = this.locals.length - 1; i >= 0; i--) {
            if (this.locals[i].name === name) {
                return i;
            }
        }
        return -1;
    }

    addLocal(name, line = 1) {
        for (let i = this.locals.length - 1; i >= 0; i--) {
            const local = this.locals[i];
            if (local.depth < this.scopeDepth) break;
            if (local.name === name) {
                throw new RuntimeError(`Identifier '${name}' already declared in this scope`, { line });
            }
        }
        this.locals.push(new Local(name, this.scopeDepth));
        return this.locals.length - 1;
    }

    visit(node) {
        if (!node) return;
        const line = (node.loc && node.loc.line) || 1;

        switch (node.type) {
            case NodeTypes.PROGRAM:
                for (const stmt of node.body) {
                    this.visit(stmt);
                }
                break;

            case NodeTypes.BLOCK_STATEMENT:
                this.beginScope();
                for (const stmt of node.body) {
                    this.visit(stmt);
                }
                this.endScope(line);
                break;

            case NodeTypes.EXPRESSION_STATEMENT:
                this.visit(node.expression);
                this.emit(Opcodes.OP_POP, line);
                break;

            case NodeTypes.NUMERIC_LITERAL:
                this.emitConstant(node.value, line);
                break;

            case NodeTypes.STRING_LITERAL:
                this.emitConstant(node.value, line);
                break;

            case NodeTypes.BOOLEAN_LITERAL:
                this.emit(node.value ? Opcodes.OP_TRUE : Opcodes.OP_FALSE, line);
                break;

            case NodeTypes.NULL_LITERAL:
                this.emit(Opcodes.OP_NULL, line);
                break;

            case NodeTypes.UNDEFINED_LITERAL:
                this.emit(Opcodes.OP_UNDEFINED, line);
                break;

            case NodeTypes.IDENTIFIER: {
                const localIdx = this.resolveLocal(node.name);
                if (localIdx !== -1) {
                    this.emit(Opcodes.OP_GET_LOCAL, line);
                    this.emit(localIdx, line);
                } else {
                    const constIdx = this.chunk.addConstant(node.name);
                    this.emit(Opcodes.OP_GET_GLOBAL, line);
                    this.emit(constIdx, line);
                }
                break;
            }

            case NodeTypes.VARIABLE_DECLARATION: {
                const varName = node.id.name;
                if (node.init) {
                    this.visit(node.init);
                } else {
                    this.emit(Opcodes.OP_UNDEFINED, line);
                }

                if (this.scopeDepth > 0) {
                    this.addLocal(varName, line);
                } else {
                    const constIdx = this.chunk.addConstant(varName);
                    this.emit(Opcodes.OP_DEFINE_GLOBAL, line);
                    this.emit(constIdx, line);
                }
                break;
            }

            case NodeTypes.ASSIGNMENT_EXPRESSION: {
                this.visit(node.right);

                if (node.left.type === NodeTypes.IDENTIFIER) {
                    const varName = node.left.name;
                    const localIdx = this.resolveLocal(varName);

                    if (node.operator !== '=') {
                        // Compound assignment: load current value, apply operator
                        if (localIdx !== -1) {
                            this.emit(Opcodes.OP_GET_LOCAL, line);
                            this.emit(localIdx, line);
                        } else {
                            const constIdx = this.chunk.addConstant(varName);
                            this.emit(Opcodes.OP_GET_GLOBAL, line);
                            this.emit(constIdx, line);
                        }
                        this.emitCompoundOp(node.operator, line);
                    }

                    if (localIdx !== -1) {
                        this.emit(Opcodes.OP_SET_LOCAL, line);
                        this.emit(localIdx, line);
                    } else {
                        const constIdx = this.chunk.addConstant(varName);
                        this.emit(Opcodes.OP_SET_GLOBAL, line);
                        this.emit(constIdx, line);
                    }
                } else if (node.left.type === NodeTypes.MEMBER_EXPRESSION) {
                    this.visit(node.left.object);
                    if (node.left.computed) {
                        this.visit(node.left.property);
                    } else {
                        this.emitConstant(node.left.property.name, line);
                    }
                    this.emit(Opcodes.OP_SET_INDEX, line);
                }
                break;
            }

            case NodeTypes.BINARY_EXPRESSION: {
                this.visit(node.left);
                this.visit(node.right);

                switch (node.operator) {
                    case '+': this.emit(Opcodes.OP_ADD, line); break;
                    case '-': this.emit(Opcodes.OP_SUBTRACT, line); break;
                    case '*': this.emit(Opcodes.OP_MULTIPLY, line); break;
                    case '/': this.emit(Opcodes.OP_DIVIDE, line); break;
                    case '%': this.emit(Opcodes.OP_MODULO, line); break;
                    case '**': this.emit(Opcodes.OP_POWER, line); break;
                    case '==': this.emit(Opcodes.OP_EQUAL, line); break;
                    case '!=': this.emit(Opcodes.OP_NOT_EQUAL, line); break;
                    case '===': this.emit(Opcodes.OP_STRICT_EQUAL, line); break;
                    case '!==': this.emit(Opcodes.OP_STRICT_NOT_EQUAL, line); break;
                    case '<': this.emit(Opcodes.OP_LESS, line); break;
                    case '<=': this.emit(Opcodes.OP_LESS_EQUAL, line); break;
                    case '>': this.emit(Opcodes.OP_GREATER, line); break;
                    case '>=': this.emit(Opcodes.OP_GREATER_EQUAL, line); break;
                }
                break;
            }

            case NodeTypes.LOGICAL_EXPRESSION: {
                this.visit(node.left);

                if (node.operator === '||' || node.operator === 'या') {
                    const elseJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                    const endJump = this.emitJump(Opcodes.OP_JUMP, line);

                    this.patchJump(elseJump);
                    this.emit(Opcodes.OP_POP, line);
                    this.visit(node.right);
                    this.patchJump(endJump);
                } else if (node.operator === '&&' || node.operator === 'और') {
                    const endJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                    this.emit(Opcodes.OP_POP, line);
                    this.visit(node.right);
                    this.patchJump(endJump);
                }
                break;
            }

            case NodeTypes.UNARY_EXPRESSION: {
                this.visit(node.argument);
                if (node.operator === '-') {
                    this.emit(Opcodes.OP_NEGATE, line);
                } else if (node.operator === '!' || node.operator === 'नहीं') {
                    this.emit(Opcodes.OP_NOT, line);
                }
                break;
            }

            case NodeTypes.UPDATE_EXPRESSION: {
                if (node.argument.type === NodeTypes.IDENTIFIER) {
                    const varName = node.argument.name;
                    const localIdx = this.resolveLocal(varName);

                    // Load current value
                    if (localIdx !== -1) {
                        this.emit(Opcodes.OP_GET_LOCAL, line);
                        this.emit(localIdx, line);
                    } else {
                        const constIdx = this.chunk.addConstant(varName);
                        this.emit(Opcodes.OP_GET_GLOBAL, line);
                        this.emit(constIdx, line);
                    }

                    if (!node.prefix) {
                        this.emit(Opcodes.OP_DUP, line);
                    }

                    this.emitConstant(1, line);
                    this.emit(node.operator === '++' ? Opcodes.OP_ADD : Opcodes.OP_SUBTRACT, line);

                    if (localIdx !== -1) {
                        this.emit(Opcodes.OP_SET_LOCAL, line);
                        this.emit(localIdx, line);
                    } else {
                        const constIdx = this.chunk.addConstant(varName);
                        this.emit(Opcodes.OP_SET_GLOBAL, line);
                        this.emit(constIdx, line);
                    }

                    if (!node.prefix) {
                        this.emit(Opcodes.OP_POP, line);
                    }
                }
                break;
            }

            case NodeTypes.IF_STATEMENT: {
                this.visit(node.test);
                const thenJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.consequent);
                const elseJump = this.emitJump(Opcodes.OP_JUMP, line);

                this.patchJump(thenJump);
                this.emit(Opcodes.OP_POP, line);

                if (node.alternate) {
                    this.visit(node.alternate);
                }
                this.patchJump(elseJump);
                break;
            }

            case NodeTypes.CONDITIONAL_EXPRESSION: {
                this.visit(node.test);
                const thenJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.consequent);
                const elseJump = this.emitJump(Opcodes.OP_JUMP, line);

                this.patchJump(thenJump);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.alternate);
                this.patchJump(elseJump);
                break;
            }

            case NodeTypes.WHILE_STATEMENT: {
                const loopStart = this.chunk.code.length;
                this.loopContexts.push({ breaks: [], continues: [], start: loopStart });

                this.visit(node.test);
                const exitJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.body);
                this.emitLoop(loopStart, line);

                this.patchJump(exitJump);
                this.emit(Opcodes.OP_POP, line);

                const loopCtx = this.loopContexts.pop();
                for (const brk of loopCtx.breaks) {
                    this.patchJump(brk);
                }
                break;
            }

            case NodeTypes.BREAK_STATEMENT: {
                if (this.loopContexts.length === 0) {
                    throw new RuntimeError("'तोड़' (break) used outside loop", { line });
                }
                const brkJump = this.emitJump(Opcodes.OP_JUMP, line);
                this.loopContexts[this.loopContexts.length - 1].breaks.push(brkJump);
                break;
            }

            case NodeTypes.CONTINUE_STATEMENT: {
                if (this.loopContexts.length === 0) {
                    throw new RuntimeError("'जारी' (continue) used outside loop", { line });
                }
                const ctx = this.loopContexts[this.loopContexts.length - 1];
                this.emitLoop(ctx.start, line);
                break;
            }

            case NodeTypes.FUNCTION_DECLARATION: {
                const subCompiler = new BytecodeCompiler(this, 'TYPE_FUNCTION');
                subCompiler.chunk.name = node.id ? node.id.name : '<anonymous>';

                // Add parameters as local slots
                for (const param of node.params) {
                    subCompiler.addLocal(param.name, line);
                }

                subCompiler.visit(node.body);
                subCompiler.emitReturn(line);

                const proto = {
                    name: node.id ? node.id.name : '<anonymous>',
                    arity: node.params.length,
                    chunk: subCompiler.chunk
                };

                const protoIdx = this.chunk.addConstant(proto);
                this.emit(Opcodes.OP_CLOSURE, line);
                this.emit(protoIdx, line);

                if (node.id) {
                    if (this.scopeDepth > 0) {
                        this.addLocal(node.id.name, line);
                    } else {
                        const constIdx = this.chunk.addConstant(node.id.name);
                        this.emit(Opcodes.OP_DEFINE_GLOBAL, line);
                        this.emit(constIdx, line);
                    }
                }
                break;
            }

            case NodeTypes.ARROW_FUNCTION: {
                const subCompiler = new BytecodeCompiler(this, 'TYPE_FUNCTION');
                subCompiler.chunk.name = '<lambda>';

                for (const param of node.params) {
                    subCompiler.addLocal(param.name, line);
                }

                if (node.isExpressionBody) {
                    subCompiler.visit(node.body);
                    subCompiler.emit(Opcodes.OP_RETURN, line);
                } else {
                    subCompiler.visit(node.body);
                    subCompiler.emitReturn(line);
                }

                const proto = {
                    name: '<lambda>',
                    arity: node.params.length,
                    chunk: subCompiler.chunk
                };

                const protoIdx = this.chunk.addConstant(proto);
                this.emit(Opcodes.OP_CLOSURE, line);
                this.emit(protoIdx, line);
                break;
            }

            case NodeTypes.CALL_EXPRESSION: {
                this.visit(node.callee);
                for (const arg of node.arguments) {
                    this.visit(arg);
                }
                this.emit(Opcodes.OP_CALL, line);
                this.emit(node.arguments.length, line);
                break;
            }

            case NodeTypes.RETURN_STATEMENT: {
                if (node.argument) {
                    this.visit(node.argument);
                } else {
                    this.emit(Opcodes.OP_UNDEFINED, line);
                }
                this.emit(Opcodes.OP_RETURN, line);
                break;
            }

            case NodeTypes.ARRAY_LITERAL: {
                for (const elem of node.elements) {
                    this.visit(elem);
                }
                this.emit(Opcodes.OP_BUILD_LIST, line);
                this.emit(node.elements.length, line);
                break;
            }

            case NodeTypes.OBJECT_LITERAL: {
                for (const prop of node.properties) {
                    const key = prop.key.type === NodeTypes.IDENTIFIER ? prop.key.name : prop.key.value;
                    this.emitConstant(key, line);
                    this.visit(prop.value);
                }
                this.emit(Opcodes.OP_BUILD_MAP, line);
                this.emit(node.properties.length, line);
                break;
            }

            case NodeTypes.MEMBER_EXPRESSION: {
                this.visit(node.object);

                if (node.property.type === NodeTypes.SLICE_EXPRESSION) {
                    // Slicing: push start, stop, step
                    const slice = node.property;
                    if (slice.start) this.visit(slice.start); else this.emit(Opcodes.OP_NULL, line);
                    if (slice.stop) this.visit(slice.stop); else this.emit(Opcodes.OP_NULL, line);
                    if (slice.step) this.visit(slice.step); else this.emitConstant(1, line);
                    this.emit(Opcodes.OP_SLICE, line);
                } else if (node.computed) {
                    this.visit(node.property);
                    this.emit(Opcodes.OP_GET_INDEX, line);
                } else {
                    this.emitConstant(node.property.name, line);
                    this.emit(Opcodes.OP_GET_INDEX, line);
                }
                break;
            }

            default:
                // Fallback for statements/nodes
                break;
        }
    }

    emitCompoundOp(operator, line) {
        switch (operator) {
            case '+=': this.emit(Opcodes.OP_ADD, line); break;
            case '-=': this.emit(Opcodes.OP_SUBTRACT, line); break;
            case '*=': this.emit(Opcodes.OP_MULTIPLY, line); break;
            case '/=': this.emit(Opcodes.OP_DIVIDE, line); break;
            case '%=': this.emit(Opcodes.OP_MODULO, line); break;
            case '**=': this.emit(Opcodes.OP_POWER, line); break;
        }
    }
}

module.exports = { BytecodeCompiler };
