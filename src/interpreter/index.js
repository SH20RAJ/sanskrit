// Sanskrit Language Interpreter
class Interpreter {
    constructor() {
        this.variables = new Map();
        this.functions = new Map();

        // Add built-in functions
        this.functions.set('मुद्रण', {
            builtin: true,
            execute: (...args) => console.log(...args)
        });
    }

    interpret(ast) {
        return this.visit(ast);
    }

    visit(node) {
        const methodName = `visit${node.type}`;
        if (this[methodName]) {
            return this[methodName](node);
        }
        throw new Error(`No visit method for ${node.type}`);
    }

    visitProgram(node) {
        let result;
        for (const child of node.children) {
            result = this.visit(child);
        }
        return result;
    }

    visitFunctionDeclaration(node) {
        const [identifier, params, , body] = node.children;
        const funcName = identifier.value;
        this.functions.set(funcName, {
            params: params.children.map(p => p.value),
            body,
            builtin: false
        });
    }

    visitBlockStatement(node) {
        let result;
        for (const child of node.children) {
            result = this.visit(child);
        }
        return result;
    }

    visitFunctionCall(node) {
        const [identifier, args] = node.children;
        const funcName = identifier.value;
        const func = this.functions.get(funcName);
        
        if (!func) {
            throw new Error(`Function ${funcName} is not defined`);
        }

        if (func.builtin) {
            const evaluatedArgs = args.children.map(arg => this.visit(arg));
            return func.execute(...evaluatedArgs);
        }

        const scope = new Map(this.variables);
        const evaluatedArgs = args.children.map(arg => this.visit(arg));
        
        func.params.forEach((param, i) => {
            scope.set(param, evaluatedArgs[i]);
        });

        const oldVars = this.variables;
        this.variables = scope;
        const result = this.visit(func.body);
        this.variables = oldVars;
        
        return result;
    }

    visitIdentifier(node) {
        const value = this.variables.get(node.value);
        if (value === undefined && !this.functions.has(node.value)) {
            throw new Error(`Variable ${node.value} is not defined`);
        }
        return value;
    }

    visitNumberLiteral(node) {
        return Number(node.value);
    }

    visitStringLiteral(node) {
        return String(node.value);
    }

    visitBinaryExpression(node) {
        const left = this.visit(node.children[0]);
        const right = this.visit(node.children[1]);
        
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: throw new Error(`Unknown operator ${node.operator}`);
        }
    }
}

module.exports = { Interpreter };
