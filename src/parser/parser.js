// Sanskrit Language Parser (produces Canonical AST)
const { TokenTypes } = require('../lexer/tokens');
const { ParserError } = require('../diagnostics/errors');
const Nodes = require('../ast/nodes');

class Parser {
    constructor(lexer, filename = '<anonymous>') {
        this.lexer = lexer;
        this.filename = filename || (lexer && lexer.filename) || '<anonymous>';
        this.sourceCode = (lexer && lexer.input) || '';
        this.currentToken = this.lexer.getNextToken();
    }

    peek() {
        return this.currentToken;
    }

    match(type, value = null) {
        if (this.currentToken.type !== type) return false;
        if (value !== null && this.currentToken.value !== value) return false;
        return true;
    }

    eat(tokenType, expectedValue = null) {
        const token = this.currentToken;

        if (token.type !== tokenType) {
            const expected = expectedValue ? `'${expectedValue}' (${tokenType})` : tokenType;
            throw new ParserError(`Expected ${expected} but got ${token.type} ('${token.value}')`, {
                filename: this.filename,
                line: token.line,
                column: token.column,
                sourceCode: this.sourceCode
            });
        }

        if (expectedValue !== null && token.value !== expectedValue) {
            throw new ParserError(`Expected '${expectedValue}' but got '${token.value}'`, {
                filename: this.filename,
                line: token.line,
                column: token.column,
                sourceCode: this.sourceCode
            });
        }

        this.currentToken = this.lexer.getNextToken();
        return token;
    }

    parse() {
        const body = [];
        const startLine = this.currentToken.line;
        const startCol = this.currentToken.column;

        while (this.currentToken.type !== TokenTypes.EOF) {
            const stmt = this.statement();
            if (stmt) {
                body.push(stmt);
            }
        }

        return new Nodes.ProgramNode(body, { line: startLine, column: startCol });
    }

    statement() {
        // Skip stray semicolons
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
            return null;
        }

        if (this.match(TokenTypes.DELIMITER, '{')) {
            return this.blockStatement();
        }

        if (this.currentToken.type === TokenTypes.KEYWORD) {
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
            }
        }

        // Default to expression statement (covers identifiers, 'स्व', 'सुपर', literals, calls, assignments)
        return this.expressionStatement();
    }

    blockStatement() {
        const startToken = this.eat(TokenTypes.DELIMITER, '{');
        const body = [];

        while (!this.match(TokenTypes.DELIMITER, '}') && this.currentToken.type !== TokenTypes.EOF) {
            const stmt = this.statement();
            if (stmt) {
                body.push(stmt);
            }
        }

        this.eat(TokenTypes.DELIMITER, '}');
        return new Nodes.BlockStatementNode(body, { line: startToken.line, column: startToken.column });
    }

    functionDeclaration() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'कार्य');
        const nameToken = this.eat(TokenTypes.IDENTIFIER);
        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        this.eat(TokenTypes.DELIMITER, '(');
        const params = [];

        if (!this.match(TokenTypes.DELIMITER, ')')) {
            do {
                if (params.length > 0) {
                    this.eat(TokenTypes.DELIMITER, ',');
                }
                const paramToken = this.eat(TokenTypes.IDENTIFIER);
                params.push(new Nodes.IdentifierNode(paramToken.value, { line: paramToken.line, column: paramToken.column }));
            } while (this.match(TokenTypes.DELIMITER, ','));
        }

        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.FunctionDeclarationNode(id, params, body, { line: startToken.line, column: startToken.column });
    }

    variableDeclaration(consumeSemicolon = true) {
        const isConstant = this.currentToken.value === 'स्थिर';
        const startToken = this.eat(TokenTypes.KEYWORD); // 'चर' or 'स्थिर'

        const nameToken = this.eat(TokenTypes.IDENTIFIER);
        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        let init = null;
        if (this.match(TokenTypes.OPERATOR, '=')) {
            this.eat(TokenTypes.OPERATOR, '=');
            init = this.expression();
        }

        if (consumeSemicolon && this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }

        return new Nodes.VariableDeclarationNode(id, init, isConstant, { line: startToken.line, column: startToken.column });
    }

    classDeclaration() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'वर्ग');
        const nameToken = this.eat(TokenTypes.IDENTIFIER);
        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        let superClass = null;
        if (this.match(TokenTypes.KEYWORD, 'विस्तार')) {
            this.eat(TokenTypes.KEYWORD, 'विस्तार');
            const superToken = this.eat(TokenTypes.IDENTIFIER);
            superClass = new Nodes.IdentifierNode(superToken.value, { line: superToken.line, column: superToken.column });
        }

        this.eat(TokenTypes.DELIMITER, '{');
        const methods = [];

        while (!this.match(TokenTypes.DELIMITER, '}') && this.currentToken.type !== TokenTypes.EOF) {
            // Skip stray semicolons in class body
            if (this.match(TokenTypes.DELIMITER, ';')) {
                this.eat(TokenTypes.DELIMITER, ';');
                continue;
            }

            const method = this.methodDeclaration();
            methods.push(method);
        }

        this.eat(TokenTypes.DELIMITER, '}');
        return new Nodes.ClassDeclarationNode(id, superClass, methods, { line: startToken.line, column: startToken.column });
    }

    methodDeclaration() {
        const startToken = this.currentToken;
        let isStatic = false;

        if (this.match(TokenTypes.KEYWORD, 'स्थैतिक')) {
            this.eat(TokenTypes.KEYWORD, 'स्थैतिक');
            isStatic = true;
        }

        let isConstructor = false;
        let nameToken;

        if (this.match(TokenTypes.KEYWORD, 'निर्माण')) {
            isConstructor = true;
            nameToken = this.eat(TokenTypes.KEYWORD, 'निर्माण');
        } else {
            // Optional 'कार्य' before method name
            if (this.match(TokenTypes.KEYWORD, 'कार्य')) {
                this.eat(TokenTypes.KEYWORD, 'कार्य');
            }
            nameToken = this.eat(TokenTypes.IDENTIFIER);
        }

        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        this.eat(TokenTypes.DELIMITER, '(');
        const params = [];

        if (!this.match(TokenTypes.DELIMITER, ')')) {
            do {
                if (params.length > 0) {
                    this.eat(TokenTypes.DELIMITER, ',');
                }
                const pToken = this.eat(TokenTypes.IDENTIFIER);
                params.push(new Nodes.IdentifierNode(pToken.value, { line: pToken.line, column: pToken.column }));
            } while (this.match(TokenTypes.DELIMITER, ','));
        }

        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.MethodDeclarationNode(id, params, body, isConstructor, isStatic, [], {
            line: startToken.line,
            column: startToken.column
        });
    }

    ifStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'यदि');
        this.eat(TokenTypes.DELIMITER, '(');
        const test = this.expression();
        this.eat(TokenTypes.DELIMITER, ')');

        const consequent = this.blockStatement();
        let alternate = null;

        if (this.match(TokenTypes.KEYWORD, 'अन्यथा')) {
            this.eat(TokenTypes.KEYWORD, 'अन्यथा');
            if (this.match(TokenTypes.KEYWORD, 'यदि')) {
                alternate = this.ifStatement(); // else if
            } else {
                alternate = this.blockStatement(); // else block
            }
        }

        return new Nodes.IfStatementNode(test, consequent, alternate, { line: startToken.line, column: startToken.column });
    }

    whileStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'यावत्');
        this.eat(TokenTypes.DELIMITER, '(');
        const test = this.expression();
        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.WhileStatementNode(test, body, { line: startToken.line, column: startToken.column });
    }

    forStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'पुनः');
        this.eat(TokenTypes.DELIMITER, '(');

        let init = null;
        if (!this.match(TokenTypes.DELIMITER, ';')) {
            if (this.match(TokenTypes.KEYWORD, 'चर') || this.match(TokenTypes.KEYWORD, 'स्थिर')) {
                init = this.variableDeclaration(false);
            } else {
                init = this.expression();
            }
        }
        this.eat(TokenTypes.DELIMITER, ';');

        let test = null;
        if (!this.match(TokenTypes.DELIMITER, ';')) {
            test = this.expression();
        }
        this.eat(TokenTypes.DELIMITER, ';');

        let update = null;
        if (!this.match(TokenTypes.DELIMITER, ')')) {
            update = this.expression();
        }
        this.eat(TokenTypes.DELIMITER, ')');

        const body = this.blockStatement();

        return new Nodes.ForStatementNode(init, test, update, body, { line: startToken.line, column: startToken.column });
    }

    forEachStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'प्रत्येक');
        this.eat(TokenTypes.DELIMITER, '(');

        // Optional 'चर'
        if (this.match(TokenTypes.KEYWORD, 'चर')) {
            this.eat(TokenTypes.KEYWORD, 'चर');
        }

        const varToken = this.eat(TokenTypes.IDENTIFIER);
        const left = new Nodes.IdentifierNode(varToken.value, { line: varToken.line, column: varToken.column });

        if (this.match(TokenTypes.KEYWORD, 'में')) {
            this.eat(TokenTypes.KEYWORD, 'में');
        } else if (this.match(TokenTypes.KEYWORD, 'का')) {
            this.eat(TokenTypes.KEYWORD, 'का');
        } else {
            throw new ParserError(`Expected 'में' or 'का' in foreach statement`, {
                filename: this.filename,
                line: this.currentToken.line,
                column: this.currentToken.column,
                sourceCode: this.sourceCode
            });
        }

        const right = this.expression();
        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.ForEachStatementNode(left, right, body, { line: startToken.line, column: startToken.column });
    }

    returnStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'प्रत्यागम');
        let argument = null;

        if (!this.match(TokenTypes.DELIMITER, ';')) {
            argument = this.expression();
        }

        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }

        return new Nodes.ReturnStatementNode(argument, { line: startToken.line, column: startToken.column });
    }

    breakStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'तोड़');
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }
        return new Nodes.BreakStatementNode({ line: startToken.line, column: startToken.column });
    }

    continueStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'जारी');
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }
        return new Nodes.ContinueStatementNode({ line: startToken.line, column: startToken.column });
    }

    tryStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'प्रयत्न');
        const block = this.blockStatement();

        let handler = null;
        let finalizer = null;

        if (this.match(TokenTypes.KEYWORD, 'पकड़')) {
            const catchToken = this.eat(TokenTypes.KEYWORD, 'पकड़');
            this.eat(TokenTypes.DELIMITER, '(');
            const errToken = this.eat(TokenTypes.IDENTIFIER);
            const param = new Nodes.IdentifierNode(errToken.value, { line: errToken.line, column: errToken.column });
            this.eat(TokenTypes.DELIMITER, ')');
            const catchBody = this.blockStatement();
            handler = new Nodes.CatchClauseNode(param, catchBody, { line: catchToken.line, column: catchToken.column });
        }

        if (this.match(TokenTypes.KEYWORD, 'अंततः')) {
            this.eat(TokenTypes.KEYWORD, 'अंततः');
            finalizer = this.blockStatement();
        }

        if (!handler && !finalizer) {
            throw new ParserError("Try statement must have at least a 'पकड़' (catch) or 'अंततः' (finally) block", {
                filename: this.filename,
                line: startToken.line,
                column: startToken.column,
                sourceCode: this.sourceCode
            });
        }

        return new Nodes.TryStatementNode(block, handler, finalizer, { line: startToken.line, column: startToken.column });
    }

    throwStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'फेंक');
        const argument = this.expression();

        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }

        return new Nodes.ThrowStatementNode(argument, { line: startToken.line, column: startToken.column });
    }

    expressionStatement() {
        const expr = this.expression();
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }
        return new Nodes.ExpressionStatementNode(expr, expr.loc);
    }

    expression() {
        return this.assignmentExpression();
    }

    assignmentExpression() {
        const left = this.logicalOrExpression();

        if (this.currentToken.type === TokenTypes.OPERATOR &&
            ['=', '+=', '-=', '*=', '/=', '%=', '**='].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.assignmentExpression(); // Right-associative

            if (!(left instanceof Nodes.IdentifierNode) && !(left instanceof Nodes.MemberExpressionNode)) {
                throw new ParserError(`Invalid left-hand side in assignment expression`, {
                    filename: this.filename,
                    line: opToken.line,
                    column: opToken.column,
                    sourceCode: this.sourceCode
                });
            }

            return new Nodes.AssignmentExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    logicalOrExpression() {
        let left = this.logicalAndExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['||', 'या'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.logicalAndExpression();
            left = new Nodes.LogicalExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    logicalAndExpression() {
        let left = this.bitwiseOrExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['&&', 'और'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.bitwiseOrExpression();
            left = new Nodes.LogicalExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    bitwiseOrExpression() {
        let left = this.bitwiseXorExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '|') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.bitwiseXorExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    bitwiseXorExpression() {
        let left = this.bitwiseAndExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '^') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.bitwiseAndExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    bitwiseAndExpression() {
        let left = this.equalityExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '&') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.equalityExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    equalityExpression() {
        let left = this.relationalExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR &&
               ['===', '!==', '==', '!='].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.relationalExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    relationalExpression() {
        let left = this.shiftExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR &&
               ['<', '>', '<=', '>='].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.shiftExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    shiftExpression() {
        let left = this.additiveExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR &&
               ['<<', '>>', '>>>'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.additiveExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    additiveExpression() {
        let left = this.multiplicativeExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['+', '-'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.multiplicativeExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    multiplicativeExpression() {
        let left = this.exponentiationExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['*', '/', '%'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.exponentiationExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    exponentiationExpression() {
        const left = this.unaryExpression();

        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '**') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.exponentiationExpression(); // Right-associative
            return new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    unaryExpression() {
        if (this.currentToken.type === TokenTypes.OPERATOR &&
            ['+', '-', '!', '~', '++', '--', 'नहीं'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const operand = this.unaryExpression();
            const operator = opToken.value === 'नहीं' ? '!' : opToken.value;

            if (operator === '++' || operator === '--') {
                return new Nodes.UpdateExpressionNode(operator, operand, true, {
                    line: opToken.line,
                    column: opToken.column
                });
            }

            return new Nodes.UnaryExpressionNode(operator, operand, true, {
                line: opToken.line,
                column: opToken.column
            });
        }

        return this.postfixExpression();
    }

    postfixExpression() {
        let node = this.memberExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['++', '--'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            node = new Nodes.UpdateExpressionNode(opToken.value, node, false, node.loc);
        }

        return node;
    }

    memberExpression() {
        let node = this.primaryExpression();

        while (true) {
            if (this.match(TokenTypes.DELIMITER, '.')) {
                this.eat(TokenTypes.DELIMITER, '.');
                const propToken = this.eat(TokenTypes.IDENTIFIER);
                const property = new Nodes.IdentifierNode(propToken.value, {
                    line: propToken.line,
                    column: propToken.column
                });
                node = new Nodes.MemberExpressionNode(node, property, false, node.loc);
            } else if (this.match(TokenTypes.DELIMITER, '[')) {
                this.eat(TokenTypes.DELIMITER, '[');
                const property = this.expression();
                this.eat(TokenTypes.DELIMITER, ']');
                node = new Nodes.MemberExpressionNode(node, property, true, node.loc);
            } else if (this.match(TokenTypes.DELIMITER, '(')) {
                // Function call
                this.eat(TokenTypes.DELIMITER, '(');
                const args = [];

                if (!this.match(TokenTypes.DELIMITER, ')')) {
                    do {
                        if (args.length > 0) {
                            this.eat(TokenTypes.DELIMITER, ',');
                        }
                        args.push(this.expression());
                    } while (this.match(TokenTypes.DELIMITER, ','));
                }

                this.eat(TokenTypes.DELIMITER, ')');
                node = new Nodes.CallExpressionNode(node, args, node.loc);
            } else {
                break;
            }
        }

        return node;
    }

    primaryExpression() {
        const token = this.currentToken;

        // New Expression: नया ClassName(args)
        if (token.type === TokenTypes.KEYWORD && token.value === 'नया') {
            this.eat(TokenTypes.KEYWORD, 'नया');
            const callee = this.memberExpression();
            let args = [];

            if (this.match(TokenTypes.DELIMITER, '(')) {
                this.eat(TokenTypes.DELIMITER, '(');
                if (!this.match(TokenTypes.DELIMITER, ')')) {
                    do {
                        if (args.length > 0) {
                            this.eat(TokenTypes.DELIMITER, ',');
                        }
                        args.push(this.expression());
                    } while (this.match(TokenTypes.DELIMITER, ','));
                }
                this.eat(TokenTypes.DELIMITER, ')');
            }

            return new Nodes.NewExpressionNode(callee, args, { line: token.line, column: token.column });
        }

        // Numbers
        if (token.type === TokenTypes.NUMBER) {
            this.eat(TokenTypes.NUMBER);
            return new Nodes.NumericLiteralNode(token.value, token.raw, { line: token.line, column: token.column });
        }

        // Strings
        if (token.type === TokenTypes.STRING) {
            this.eat(TokenTypes.STRING);
            return new Nodes.StringLiteralNode(token.value, token.raw, { line: token.line, column: token.column });
        }

        // Keywords
        if (token.type === TokenTypes.KEYWORD) {
            switch (token.value) {
                case 'सत्य':
                    this.eat(TokenTypes.KEYWORD, 'सत्य');
                    return new Nodes.BooleanLiteralNode(true, { line: token.line, column: token.column });
                case 'असत्य':
                    this.eat(TokenTypes.KEYWORD, 'असत्य');
                    return new Nodes.BooleanLiteralNode(false, { line: token.line, column: token.column });
                case 'शून्य':
                    this.eat(TokenTypes.KEYWORD, 'शून्य');
                    return new Nodes.NullLiteralNode({ line: token.line, column: token.column });
                case 'अपरिभाषित':
                    this.eat(TokenTypes.KEYWORD, 'अपरिभाषित');
                    return new Nodes.UndefinedLiteralNode({ line: token.line, column: token.column });
                case 'स्व':
                    this.eat(TokenTypes.KEYWORD, 'स्व');
                    return new Nodes.ThisExpressionNode({ line: token.line, column: token.column });
                case 'सुपर':
                    this.eat(TokenTypes.KEYWORD, 'सुपर');
                    return new Nodes.SuperExpressionNode({ line: token.line, column: token.column });
            }
        }

        // Identifiers
        if (token.type === TokenTypes.IDENTIFIER) {
            this.eat(TokenTypes.IDENTIFIER);
            return new Nodes.IdentifierNode(token.value, { line: token.line, column: token.column });
        }

        // Array Literal: [elem1, elem2]
        if (this.match(TokenTypes.DELIMITER, '[')) {
            const startToken = this.eat(TokenTypes.DELIMITER, '[');
            const elements = [];

            if (!this.match(TokenTypes.DELIMITER, ']')) {
                do {
                    if (elements.length > 0) {
                        this.eat(TokenTypes.DELIMITER, ',');
                    }
                    if (this.match(TokenTypes.DELIMITER, ']')) break;
                    elements.push(this.expression());
                } while (this.match(TokenTypes.DELIMITER, ','));
            }

            this.eat(TokenTypes.DELIMITER, ']');
            return new Nodes.ArrayLiteralNode(elements, { line: startToken.line, column: startToken.column });
        }

        // Object Literal: { key: value, ... }
        if (this.match(TokenTypes.DELIMITER, '{')) {
            const startToken = this.eat(TokenTypes.DELIMITER, '{');
            const properties = [];

            if (!this.match(TokenTypes.DELIMITER, '}')) {
                do {
                    if (properties.length > 0) {
                        this.eat(TokenTypes.DELIMITER, ',');
                    }
                    if (this.match(TokenTypes.DELIMITER, '}')) break;

                    let key;
                    if (this.currentToken.type === TokenTypes.IDENTIFIER) {
                        const idToken = this.eat(TokenTypes.IDENTIFIER);
                        key = new Nodes.IdentifierNode(idToken.value, { line: idToken.line, column: idToken.column });
                    } else if (this.currentToken.type === TokenTypes.STRING) {
                        const strToken = this.eat(TokenTypes.STRING);
                        key = new Nodes.StringLiteralNode(strToken.value, strToken.raw, {
                            line: strToken.line,
                            column: strToken.column
                        });
                    } else if (this.currentToken.type === TokenTypes.NUMBER) {
                        const numToken = this.eat(TokenTypes.NUMBER);
                        key = new Nodes.NumericLiteralNode(numToken.value, numToken.raw, {
                            line: numToken.line,
                            column: numToken.column
                        });
                    } else {
                        throw new ParserError(`Expected property name but got ${this.currentToken.type}`, {
                            filename: this.filename,
                            line: this.currentToken.line,
                            column: this.currentToken.column,
                            sourceCode: this.sourceCode
                        });
                    }

                    this.eat(TokenTypes.DELIMITER, ':');
                    const value = this.expression();
                    properties.push(new Nodes.PropertyNode(key, value, key.loc));
                } while (this.match(TokenTypes.DELIMITER, ','));
            }

            this.eat(TokenTypes.DELIMITER, '}');
            return new Nodes.ObjectLiteralNode(properties, { line: startToken.line, column: startToken.column });
        }

        // Grouped Expression: (expr)
        if (this.match(TokenTypes.DELIMITER, '(')) {
            this.eat(TokenTypes.DELIMITER, '(');
            const expr = this.expression();
            this.eat(TokenTypes.DELIMITER, ')');
            return expr;
        }

        throw new ParserError(`Unexpected token ${token.type} ('${token.value}')`, {
            filename: this.filename,
            line: token.line,
            column: token.column,
            sourceCode: this.sourceCode
        });
    }
}

module.exports = { Parser };
