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
                    case 'स्थिर':
                        return this.variableDeclaration();
                    case 'वर्ग':
                        return this.classDeclaration();
                    case 'यदि':
                        return this.ifStatement();
                    case 'यावत्':
                        return this.whileStatement();
                    case 'पुनः':
                        return this.forStatement();
                    case 'प्रत्येक':
                        return this.forEachStatement();
                    case 'स्विच':
                        return this.switchStatement();
                    case 'प्रत्यागम':
                        return this.returnStatement();
                    case 'तोड़':
                        return this.breakStatement();
                    case 'जारी':
                        return this.continueStatement();
                    case 'प्रयत्न':
                        return this.tryStatement();
                    case 'फेंक':
                        return this.throwStatement();
                    case 'आयात':
                        return this.importStatement();
                    case 'निर्यात':
                        return this.exportStatement();
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

    variableDeclaration() {
        const isConstant = this.currentToken.value === 'स्थिर';
        this.eat(TokenTypes.KEYWORD); // eat चर or स्थिर
        
        const identifier = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
        
        let initialValue = null;
        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '=') {
            this.eat(TokenTypes.OPERATOR); // eat =
            initialValue = this.expression();
        }
        
        this.eat(TokenTypes.DELIMITER); // eat ;
        
        const node = new ASTNode('VariableDeclaration');
        node.isConstant = isConstant;
        return node.addChild(identifier).addChild(initialValue);
    }

    classDeclaration() {
        this.eat(TokenTypes.KEYWORD); // eat वर्ग
        const className = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
        
        let superClass = null;
        if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'विस्तार') {
            this.eat(TokenTypes.KEYWORD); // eat विस्तार
            superClass = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
        }
        
        this.eat(TokenTypes.DELIMITER); // eat {
        const body = new ASTNode('ClassBody');
        
        while (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== '}') {
            if (this.currentToken.type === TokenTypes.KEYWORD) {
                switch (this.currentToken.value) {
                    case 'कार्य':
                    case 'निर्माण':
                    case 'स्थैतिक':
                    case 'निजी':
                    case 'सार्वजनिक':
                    case 'संरक्षित':
                        body.addChild(this.methodDeclaration());
                        break;
                    default:
                        throw new Error(`Unexpected keyword in class: ${this.currentToken.value}`);
                }
            } else {
                throw new Error(`Unexpected token in class: ${this.currentToken.type}`);
            }
        }
        
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('ClassDeclaration');
        return node.addChild(className).addChild(superClass).addChild(body);
    }

    methodDeclaration() {
        const modifiers = [];
        
        // Parse access modifiers and static
        while (this.currentToken.type === TokenTypes.KEYWORD && 
               ['स्थैतिक', 'निजी', 'सार्वजनिक', 'संरक्षित'].includes(this.currentToken.value)) {
            modifiers.push(this.eat(TokenTypes.KEYWORD).value);
        }
        
        const isConstructor = this.currentToken.value === 'निर्माण';
        if (isConstructor) {
            this.eat(TokenTypes.KEYWORD); // eat निर्माण
        } else {
            this.eat(TokenTypes.KEYWORD); // eat कार्य
        }
        
        const methodName = isConstructor ? 'निर्माण' : this.eat(TokenTypes.IDENTIFIER).value;
        const identifier = new ASTNode('Identifier', methodName);
        
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
        
        const node = new ASTNode('MethodDeclaration');
        node.modifiers = modifiers;
        node.isConstructor = isConstructor;
        return node.addChild(identifier).addChild(params).addChild(null).addChild(body);
    }

    ifStatement() {
        this.eat(TokenTypes.KEYWORD); // eat यदि
        this.eat(TokenTypes.DELIMITER); // eat (
        const condition = this.expression();
        this.eat(TokenTypes.DELIMITER); // eat )
        this.eat(TokenTypes.DELIMITER); // eat {
        const thenBranch = this.blockStatement();
        this.eat(TokenTypes.DELIMITER); // eat }
        
        let elseBranch = null;
        if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'अन्यथा') {
            this.eat(TokenTypes.KEYWORD); // eat अन्यथा
            if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'यदि') {
                elseBranch = this.ifStatement(); // else if
            } else {
                this.eat(TokenTypes.DELIMITER); // eat {
                elseBranch = this.blockStatement();
                this.eat(TokenTypes.DELIMITER); // eat }
            }
        }
        
        const node = new ASTNode('IfStatement');
        return node.addChild(condition).addChild(thenBranch).addChild(elseBranch);
    }

    whileStatement() {
        this.eat(TokenTypes.KEYWORD); // eat यावत्
        this.eat(TokenTypes.DELIMITER); // eat (
        const condition = this.expression();
        this.eat(TokenTypes.DELIMITER); // eat )
        this.eat(TokenTypes.DELIMITER); // eat {
        const body = this.blockStatement();
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('WhileStatement');
        return node.addChild(condition).addChild(body);
    }

    forStatement() {
        this.eat(TokenTypes.KEYWORD); // eat पुनः
        this.eat(TokenTypes.DELIMITER); // eat (
        
        const init = this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ';' 
            ? null : this.statement();
        if (!init) this.eat(TokenTypes.DELIMITER); // eat ;
        
        const condition = this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ';'
            ? null : this.expression();
        this.eat(TokenTypes.DELIMITER); // eat ;
        
        const update = this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ')'
            ? null : this.expression();
        this.eat(TokenTypes.DELIMITER); // eat )
        
        this.eat(TokenTypes.DELIMITER); // eat {
        const body = this.blockStatement();
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('ForStatement');
        return node.addChild(init).addChild(condition).addChild(update).addChild(body);
    }

    forEachStatement() {
        this.eat(TokenTypes.KEYWORD); // eat प्रत्येक
        this.eat(TokenTypes.DELIMITER); // eat (
        
        const variable = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
        this.eat(TokenTypes.KEYWORD); // eat में or का
        const iterable = this.expression();
        
        this.eat(TokenTypes.DELIMITER); // eat )
        this.eat(TokenTypes.DELIMITER); // eat {
        const body = this.blockStatement();
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('ForEachStatement');
        return node.addChild(variable).addChild(iterable).addChild(body);
    }

    switchStatement() {
        this.eat(TokenTypes.KEYWORD); // eat स्विच
        this.eat(TokenTypes.DELIMITER); // eat (
        const discriminant = this.expression();
        this.eat(TokenTypes.DELIMITER); // eat )
        this.eat(TokenTypes.DELIMITER); // eat {
        
        const cases = new ASTNode('SwitchCases');
        while (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== '}') {
            if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'केस') {
                this.eat(TokenTypes.KEYWORD); // eat केस
                const value = this.expression();
                this.eat(TokenTypes.DELIMITER); // eat :
                const statements = new ASTNode('CaseStatements');
                
                while (this.currentToken.type !== TokenTypes.KEYWORD || 
                       !['केस', 'डिफ़ॉल्ट'].includes(this.currentToken.value)) {
                    if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '}') break;
                    statements.addChild(this.statement());
                }
                
                const caseNode = new ASTNode('SwitchCase');
                caseNode.addChild(value).addChild(statements);
                cases.addChild(caseNode);
            } else if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'डिफ़ॉल्ट') {
                this.eat(TokenTypes.KEYWORD); // eat डिफ़ॉल्ट
                this.eat(TokenTypes.DELIMITER); // eat :
                const statements = new ASTNode('DefaultStatements');
                
                while (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== '}') {
                    statements.addChild(this.statement());
                }
                
                const defaultNode = new ASTNode('DefaultCase');
                defaultNode.addChild(statements);
                cases.addChild(defaultNode);
            }
        }
        
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('SwitchStatement');
        return node.addChild(discriminant).addChild(cases);
    }

    returnStatement() {
        this.eat(TokenTypes.KEYWORD); // eat प्रत्यागम
        let value = null;
        if (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== ';') {
            value = this.expression();
        }
        this.eat(TokenTypes.DELIMITER); // eat ;
        
        const node = new ASTNode('ReturnStatement');
        return node.addChild(value);
    }

    breakStatement() {
        this.eat(TokenTypes.KEYWORD); // eat तोड़
        this.eat(TokenTypes.DELIMITER); // eat ;
        return new ASTNode('BreakStatement');
    }

    continueStatement() {
        this.eat(TokenTypes.KEYWORD); // eat जारी
        this.eat(TokenTypes.DELIMITER); // eat ;
        return new ASTNode('ContinueStatement');
    }

    tryStatement() {
        this.eat(TokenTypes.KEYWORD); // eat प्रयत्न
        this.eat(TokenTypes.DELIMITER); // eat {
        const tryBlock = this.blockStatement();
        this.eat(TokenTypes.DELIMITER); // eat }
        
        let catchBlock = null;
        let finallyBlock = null;
        
        if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'पकड़') {
            this.eat(TokenTypes.KEYWORD); // eat पकड़
            this.eat(TokenTypes.DELIMITER); // eat (
            const errorVar = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
            this.eat(TokenTypes.DELIMITER); // eat )
            this.eat(TokenTypes.DELIMITER); // eat {
            const catchBody = this.blockStatement();
            this.eat(TokenTypes.DELIMITER); // eat }
            
            catchBlock = new ASTNode('CatchClause');
            catchBlock.addChild(errorVar).addChild(catchBody);
        }
        
        if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'अंततः') {
            this.eat(TokenTypes.KEYWORD); // eat अंततः
            this.eat(TokenTypes.DELIMITER); // eat {
            finallyBlock = this.blockStatement();
            this.eat(TokenTypes.DELIMITER); // eat }
        }
        
        const node = new ASTNode('TryStatement');
        return node.addChild(tryBlock).addChild(catchBlock).addChild(finallyBlock);
    }

    throwStatement() {
        this.eat(TokenTypes.KEYWORD); // eat फेंक
        const expression = this.expression();
        this.eat(TokenTypes.DELIMITER); // eat ;
        
        const node = new ASTNode('ThrowStatement');
        return node.addChild(expression);
    }

    importStatement() {
        this.eat(TokenTypes.KEYWORD); // eat आयात
        const imports = new ASTNode('ImportSpecifiers');
        
        if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '{') {
            this.eat(TokenTypes.DELIMITER); // eat {
            do {
                if (imports.children.length > 0) {
                    this.eat(TokenTypes.DELIMITER); // eat ,
                }
                const imported = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
                let local = imported;
                
                if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'के रूप में') {
                    this.eat(TokenTypes.KEYWORD); // eat के रूप में
                    local = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
                }
                
                const specifier = new ASTNode('ImportSpecifier');
                specifier.addChild(imported).addChild(local);
                imports.addChild(specifier);
            } while (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ',');
            this.eat(TokenTypes.DELIMITER); // eat }
        } else {
            const defaultImport = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
            const specifier = new ASTNode('ImportDefaultSpecifier');
            specifier.addChild(defaultImport);
            imports.addChild(specifier);
        }
        
        this.eat(TokenTypes.KEYWORD); // eat से
        const source = this.expression();
        this.eat(TokenTypes.DELIMITER); // eat ;
        
        const node = new ASTNode('ImportStatement');
        return node.addChild(imports).addChild(source);
    }

    exportStatement() {
        this.eat(TokenTypes.KEYWORD); // eat निर्यात
        
        if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'डिफ़ॉल्ट') {
            this.eat(TokenTypes.KEYWORD); // eat डिफ़ॉल्ट
            const declaration = this.statement();
            
            const node = new ASTNode('ExportDefaultStatement');
            return node.addChild(declaration);
        } else {
            const declaration = this.statement();
            
            const node = new ASTNode('ExportStatement');
            return node.addChild(declaration);
        }
    }

    expressionStatement() {
        const expr = this.expression();
        if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ';') {
            this.eat(TokenTypes.DELIMITER); // eat ;
        }
        return expr;
    }

    expression() {
        return this.assignmentExpression();
    }

    assignmentExpression() {
        let node = this.logicalOrExpression();
        
        if (this.currentToken.type === TokenTypes.OPERATOR && 
            ['=', '+=', '-=', '*=', '/=', '%=', '**='].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.assignmentExpression();
            const newNode = new ASTNode('AssignmentExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            return newNode;
        }
        
        return node;
    }

    logicalOrExpression() {
        let node = this.logicalAndExpression();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['||', 'या'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.logicalAndExpression();
            const newNode = new ASTNode('LogicalExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    logicalAndExpression() {
        let node = this.equalityExpression();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['&&', 'और'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.equalityExpression();
            const newNode = new ASTNode('LogicalExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    equalityExpression() {
        let node = this.relationalExpression();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['==', '!=', '===', '!=='].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.relationalExpression();
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    relationalExpression() {
        let node = this.additiveExpression();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && 
               ['<', '>', '<=', '>='].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.additiveExpression();
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    additiveExpression() {
        let node = this.multiplicativeExpression();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && ['+', '-'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.multiplicativeExpression();
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    multiplicativeExpression() {
        let node = this.exponentiationExpression();
        
        while (this.currentToken.type === TokenTypes.OPERATOR && ['*', '/', '%'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.exponentiationExpression();
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            node = newNode;
        }
        
        return node;
    }

    exponentiationExpression() {
        let node = this.unaryExpression();
        
        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '**') {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const right = this.exponentiationExpression(); // Right associative
            const newNode = new ASTNode('BinaryExpression');
            newNode.operator = operator;
            newNode.addChild(node).addChild(right);
            return newNode;
        }
        
        return node;
    }

    unaryExpression() {
        if (this.currentToken.type === TokenTypes.OPERATOR && 
            ['+', '-', '!', '~', '++', '--', 'नहीं'].includes(this.currentToken.value)) {
            const operator = this.eat(TokenTypes.OPERATOR).value;
            const operand = this.unaryExpression();
            const node = new ASTNode('UnaryExpression');
            node.operator = operator;
            node.prefix = true;
            return node.addChild(operand);
        }
        
        return this.postfixExpression();
    }

    postfixExpression() {
        let node = this.memberExpression();
        
        while (true) {
            if (this.currentToken.type === TokenTypes.OPERATOR && 
                ['++', '--'].includes(this.currentToken.value)) {
                const operator = this.eat(TokenTypes.OPERATOR).value;
                const newNode = new ASTNode('UpdateExpression');
                newNode.operator = operator;
                newNode.prefix = false;
                newNode.addChild(node);
                node = newNode;
            } else {
                break;
            }
        }
        
        return node;
    }

    memberExpression() {
        let node = this.primaryExpression();
        
        while (true) {
            if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '.') {
                this.eat(TokenTypes.DELIMITER); // eat .
                const property = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
                const newNode = new ASTNode('MemberExpression');
                newNode.computed = false;
                newNode.addChild(node).addChild(property);
                node = newNode;
            } else if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '[') {
                this.eat(TokenTypes.DELIMITER); // eat [
                const property = this.expression();
                this.eat(TokenTypes.DELIMITER); // eat ]
                const newNode = new ASTNode('MemberExpression');
                newNode.computed = true;
                newNode.addChild(node).addChild(property);
                node = newNode;
            } else if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '(') {
                // Function call
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
                
                const newNode = new ASTNode('CallExpression');
                newNode.addChild(node).addChild(args);
                node = newNode;
            } else {
                break;
            }
        }
        
        return node;
    }

    primaryExpression() {
        const token = this.currentToken;
        
        switch (token.type) {
            case TokenTypes.NUMBER:
                this.eat(TokenTypes.NUMBER);
                return new ASTNode('NumberLiteral', token.value);
            
            case TokenTypes.STRING:
                this.eat(TokenTypes.STRING);
                return new ASTNode('StringLiteral', token.value);
            
            case TokenTypes.KEYWORD:
                if (['सत्य', 'असत्य'].includes(token.value)) {
                    this.eat(TokenTypes.KEYWORD);
                    return new ASTNode('BooleanLiteral', token.value === 'सत्य');
                } else if (token.value === 'शून्य') {
                    this.eat(TokenTypes.KEYWORD);
                    return new ASTNode('NullLiteral', null);
                } else if (token.value === 'अपरिभाषित') {
                    this.eat(TokenTypes.KEYWORD);
                    return new ASTNode('UndefinedLiteral', undefined);
                } else if (token.value === 'स्व') {
                    this.eat(TokenTypes.KEYWORD);
                    return new ASTNode('ThisExpression');
                } else if (token.value === 'सुपर') {
                    this.eat(TokenTypes.KEYWORD);
                    return new ASTNode('SuperExpression');
                }
                break;
            
            case TokenTypes.IDENTIFIER:
                this.eat(TokenTypes.IDENTIFIER);
                return new ASTNode('Identifier', token.value);
            
            case TokenTypes.DELIMITER:
                if (token.value === '(') {
                    this.eat(TokenTypes.DELIMITER); // eat (
                    const node = this.expression();
                    this.eat(TokenTypes.DELIMITER); // eat )
                    return node;
                } else if (token.value === '[') {
                    return this.arrayLiteral();
                } else if (token.value === '{') {
                    return this.objectLiteral();
                }
                break;
        }
        
        throw new Error(`Unexpected token ${token.type}: ${token.value}`);
    }

    arrayLiteral() {
        this.eat(TokenTypes.DELIMITER); // eat [
        const elements = new ASTNode('ArrayElements');
        
        if (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== ']') {
            do {
                if (elements.children.length > 0) {
                    this.eat(TokenTypes.DELIMITER); // eat ,
                }
                
                // Handle sparse arrays (empty elements)
                if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ',') {
                    elements.addChild(new ASTNode('EmptyElement'));
                } else {
                    elements.addChild(this.expression());
                }
            } while (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ',');
        }
        
        this.eat(TokenTypes.DELIMITER); // eat ]
        
        const node = new ASTNode('ArrayLiteral');
        return node.addChild(elements);
    }

    objectLiteral() {
        this.eat(TokenTypes.DELIMITER); // eat {
        const properties = new ASTNode('ObjectProperties');
        
        if (this.currentToken.type !== TokenTypes.DELIMITER || this.currentToken.value !== '}') {
            do {
                if (properties.children.length > 0) {
                    this.eat(TokenTypes.DELIMITER); // eat ,
                }
                
                let key;
                if (this.currentToken.type === TokenTypes.STRING) {
                    key = new ASTNode('StringLiteral', this.eat(TokenTypes.STRING).value);
                } else if (this.currentToken.type === TokenTypes.IDENTIFIER) {
                    key = new ASTNode('Identifier', this.eat(TokenTypes.IDENTIFIER).value);
                } else if (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === '[') {
                    this.eat(TokenTypes.DELIMITER); // eat [
                    key = this.expression();
                    this.eat(TokenTypes.DELIMITER); // eat ]
                } else {
                    throw new Error('Expected property key');
                }
                
                this.eat(TokenTypes.DELIMITER); // eat :
                const value = this.expression();
                
                const property = new ASTNode('ObjectProperty');
                property.addChild(key).addChild(value);
                properties.addChild(property);
                
            } while (this.currentToken.type === TokenTypes.DELIMITER && this.currentToken.value === ',');
        }
        
        this.eat(TokenTypes.DELIMITER); // eat }
        
        const node = new ASTNode('ObjectLiteral');
        return node.addChild(properties);
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
