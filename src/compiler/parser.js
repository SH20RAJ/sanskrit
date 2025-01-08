// Sanskrit Language Parser
const { TokenTypes } = require('./lexer');

class ASTNode {
    constructor(type, value = null) {
        this.type = type;
        this.value = value;
        this.children = [];
    }

    addChild(node) {
        this.children.push(node);
        return this;
    }
}

class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    eat(tokenType) {
        if (this.currentToken.type === tokenType) {
            const token = this.currentToken;
            this.currentToken = this.lexer.getNextToken();
            return token;
        }
        throw new Error(`Expected ${tokenType} but got ${this.currentToken.type}`);
    }

    parseProgram() {
        const program = new ASTNode('Program');
        while (this.currentToken.type !== TokenTypes.EOF) {
            program.addChild(this.parseStatement());
        }
        return program;
    }

    parseStatement() {
        switch (this.currentToken.type) {
            case TokenTypes.KEYWORD:
                switch (this.currentToken.value) {
                    case 'let':
                    case 'const':
                        return this.parseVariableDeclaration();
                    case 'fn':
                        return this.parseFunctionDeclaration();
                    case 'if':
                        return this.parseIfStatement();
                    case 'while':
                        return this.parseWhileStatement();
                    case 'return':
                        return this.parseReturnStatement();
                    case 'async':
                        return this.parseAsyncDeclaration();
                    default:
                        throw new Error(`Unexpected keyword: ${this.currentToken.value}`);
                }
            default:
                return this.parseExpressionStatement();
        }
    }

    parseVariableDeclaration() {
        const node = new ASTNode('VariableDeclaration');
        node.kind = this.eat(TokenTypes.KEYWORD).value; // 'let' or 'const'
        node.addChild(new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value));

        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === ':') {
            this.eat(TokenTypes.OPERATOR);
            node.addChild(new ASTNode('Type', this.eat(TokenTypes.IDENTIFIER).value));
        }

        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '=') {
            this.eat(TokenTypes.OPERATOR);
            node.addChild(this.parseExpression());
        }

        this.eat(TokenTypes.DELIMITER); // semicolon
        return node;
    }

    parseFunctionDeclaration() {
        const node = new ASTNode('FunctionDeclaration');
        this.eat(TokenTypes.KEYWORD); // 'fn'
        node.addChild(new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value));
        
        // Parse parameters
        this.eat(TokenTypes.DELIMITER); // (
        const params = new ASTNode('Parameters');
        while (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== ')') {
            const param = new ASTNode('Parameter');
            param.addChild(new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value));
            
            if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === ':') {
                this.eat(TokenTypes.OPERATOR);
                param.addChild(new ASTNode('Type', this.eat(TokenTypes.IDENTIFIER).value));
            }
            
            params.addChild(param);
            
            if (this.currentToken.value === ',') {
                this.eat(TokenTypes.DELIMITER);
            }
        }
        node.addChild(params);
        this.eat(TokenTypes.DELIMITER); // )

        // Parse return type
        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '->') {
            this.eat(TokenTypes.OPERATOR);
            node.addChild(new ASTNode('ReturnType', this.eat(TokenTypes.IDENTIFIER).value));
        }

        // Parse function body
        node.addChild(this.parseBlock());
        return node;
    }

    parseBlock() {
        const node = new ASTNode('Block');
        this.eat(TokenTypes.DELIMITER); // {
        while (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== '}') {
            node.addChild(this.parseStatement());
        }
        this.eat(TokenTypes.DELIMITER); // }
        return node;
    }

    parseExpression() {
        return this.parseAssignmentExpression();
    }

    parseAssignmentExpression() {
        const left = this.parseLogicalORExpression();

        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '=') {
            const node = new ASTNode('AssignmentExpression');
            this.eat(TokenTypes.OPERATOR);
            node.addChild(left);
            node.addChild(this.parseAssignmentExpression());
            return node;
        }

        return left;
    }

    parseLogicalORExpression() {
        let node = this.parseLogicalANDExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '||') {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.parseLogicalANDExpression();
            const newNode = new ASTNode('LogicalExpression', operator);
            newNode.addChild(node);
            newNode.addChild(right);
            node = newNode;
        }

        return node;
    }

    parseLogicalANDExpression() {
        let node = this.parseEqualityExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '&&') {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.parseEqualityExpression();
            const newNode = new ASTNode('LogicalExpression', operator);
            newNode.addChild(node);
            newNode.addChild(right);
            node = newNode;
        }

        return node;
    }

    parseEqualityExpression() {
        let node = this.parseRelationalExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['==', '!='].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.parseRelationalExpression();
            const newNode = new ASTNode('BinaryExpression', operator);
            newNode.addChild(node);
            newNode.addChild(right);
            node = newNode;
        }

        return node;
    }

    parseRelationalExpression() {
        let node = this.parseAdditiveExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['<', '>', '<=', '>='].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.parseAdditiveExpression();
            const newNode = new ASTNode('BinaryExpression', operator);
            newNode.addChild(node);
            newNode.addChild(right);
            node = newNode;
        }

        return node;
    }

    parseAdditiveExpression() {
        let node = this.parseMultiplicativeExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['+', '-'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.parseMultiplicativeExpression();
            const newNode = new ASTNode('BinaryExpression', operator);
            newNode.addChild(node);
            newNode.addChild(right);
            node = newNode;
        }

        return node;
    }

    parseMultiplicativeExpression() {
        let node = this.parseUnaryExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['*', '/', '%'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.parseUnaryExpression();
            const newNode = new ASTNode('BinaryExpression', operator);
            newNode.addChild(node);
            newNode.addChild(right);
            node = newNode;
        }

        return node;
    }

    parseUnaryExpression() {
        if (this.currentToken.type === TokenTypes.OPERATOR && 
            ['+', '-', '!'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const node = new ASTNode('UnaryExpression', operator);
            node.addChild(this.parseUnaryExpression());
            return node;
        }

        return this.parsePrimaryExpression();
    }

    parsePrimaryExpression() {
        switch (this.currentToken.type) {
            case TokenTypes.IDENTIFIER:
                return new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
            case TokenTypes.NUMBER:
                return new ASTNode('NumericLiteral', this.eat(TokenTypes.NUMBER).value);
            case TokenTypes.STRING:
                return new ASTNode('StringLiteral', this.eat(TokenTypes.STRING).value);
            case TokenTypes.DELIMITER:
                if (this.currentToken.value === '(') {
                    this.eat(TokenTypes.DELIMITER);
                    const node = this.parseExpression();
                    this.eat(TokenTypes.DELIMITER); // )
                    return node;
                }
                break;
            default:
                throw new Error(`Unexpected token: ${this.currentToken.type}`);
        }
    }
}

module.exports = {
    Parser,
    ASTNode
};
