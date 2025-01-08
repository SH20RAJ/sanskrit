// Sanskrit Language Parser
const { TokenTypes } = require('./lexer');

class ASTNode {
    constructor(type, value = null) {
        this.type = type;
        this.value = value;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
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
        throw new Error(`Expected ${tokenType} but got ${this.currentToken.type} at line ${this.currentToken.line}, column ${this.currentToken.column}`);
    }

    parse() {
        const program = new ASTNode('Program');
        
        while (this.currentToken.type !== TokenTypes.EOF) {
            program.addChild(this.statement());
        }
        
        return program;
    }

    statement() {
        switch (this.currentToken.type) {
            case TokenTypes.KEYWORD:
                switch (this.currentToken.value) {
                    case 'कार्य':
                        return this.functionDeclaration();
                    case 'चर':
                        return this.variableDeclaration();
                    default:
                        throw new Error(`Unexpected keyword ${this.currentToken.value}`);
                }
            case TokenTypes.IDENTIFIER:
                return this.expressionStatement();
            case TokenTypes.STRING:
                return this.expressionStatement();
            default:
                throw new Error(`Unexpected token ${this.currentToken.type}`);
        }
    }

    functionDeclaration() {
        this.eat(TokenTypes.KEYWORD); // eat कार्य
        const identifier = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
        
        this.eat(TokenTypes.DELIMITER); // eat (
        const params = new ASTNode('Parameters');
        
        if (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== ')') {
            do {
                if (params.children.length > 0) {
                    this.eat(TokenTypes.DELIMITER); // eat ,
                }
                const paramName = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
                params.addChild(paramName);
            } while (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ',');
        }
        
        this.eat(TokenTypes.DELIMITER); // eat )
        
        this.eat(TokenTypes.DELIMITER); // eat {
        const body = this.blockStatement();
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('FunctionDeclaration');
        return node.addChild(identifier).addChild(params).addChild(null).addChild(body);
    }

    blockStatement() {
        const node = new ASTNode('BlockStatement');
        
        while (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== '}') {
            node.addChild(this.statement());
        }
        
        return node;
    }

    expressionStatement() {
        const expr = this.expression();
        this.eat(TokenTypes.DELIMITER); // eat ;
        return expr;
    }

    expression() {
        let node = this.term();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && ['+', '-'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.term();
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    term() {
        let node = this.factor();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && ['*', '/'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.factor();
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    factor() {
        const token = this.currentToken;
        
        switch (token.type) {
            case TokenTypes.NUMBER:
                this.eat(TokenTypes.NUMBER);
                return new ASTNode('NumberLiteral', token.value);
            
            case TokenTypes.STRING:
                this.eat(TokenTypes.STRING);
                return new ASTNode('StringLiteral', token.value);
            
            case TokenTypes.IDENTIFIER:
                this.eat(TokenTypes.IDENTIFIER);
                if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '(') {
                    this.eat(TokenTypes.DELIMITER); // eat (
                    const args = new ASTNode('Arguments');
                    
                    if (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== ')') {
                        do {
                            if (args.children.length > 0) {
                                this.eat(TokenTypes.DELIMITER); // eat ,
                            }
                            args.addChild(this.expression());
                        } while (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ',');
                    }
                    
                    this.eat(TokenTypes.DELIMITER); // eat )
                    
                    const node = new ASTNode('FunctionCall');
                    return node.addChild(new ASTNode('Identifier', token.value)).addChild(args);
                }
                return new ASTNode('Identifier', token.value);
            
            case TokenTypes.DELIMITER:
                if (token.value === '(') {
                    this.eat(TokenTypes.DELIMITER); // eat (
                    const node = this.expression();
                    this.eat(TokenTypes.DELIMITER); // eat )
                    return node;
                }
            
            default:
                throw new Error(`Unexpected token ${token.type}`);
        }
    }
}

module.exports = { Parser, ASTNode };
