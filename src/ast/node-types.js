// Canonical AST Node Types for Sanskrit Language

const NodeTypes = {
    // Root & Identifiers
    PROGRAM: 'Program',
    IDENTIFIER: 'Identifier',

    // Literals
    NUMERIC_LITERAL: 'NumericLiteral',
    STRING_LITERAL: 'StringLiteral',
    BOOLEAN_LITERAL: 'BooleanLiteral',
    NULL_LITERAL: 'NullLiteral',
    UNDEFINED_LITERAL: 'UndefinedLiteral',
    ARRAY_LITERAL: 'ArrayLiteral',
    OBJECT_LITERAL: 'ObjectLiteral',
    PROPERTY: 'Property',

    // Declarations & Statements
    VARIABLE_DECLARATION: 'VariableDeclaration',
    FUNCTION_DECLARATION: 'FunctionDeclaration',
    BLOCK_STATEMENT: 'BlockStatement',
    EXPRESSION_STATEMENT: 'ExpressionStatement',
    IF_STATEMENT: 'IfStatement',
    WHILE_STATEMENT: 'WhileStatement',
    FOR_STATEMENT: 'ForStatement',
    FOR_EACH_STATEMENT: 'ForEachStatement',
    RETURN_STATEMENT: 'ReturnStatement',
    BREAK_STATEMENT: 'BreakStatement',
    CONTINUE_STATEMENT: 'ContinueStatement',

    // Exceptions
    TRY_STATEMENT: 'TryStatement',
    CATCH_CLAUSE: 'CatchClause',
    THROW_STATEMENT: 'ThrowStatement',

    // Classes & OOP
    CLASS_DECLARATION: 'ClassDeclaration',
    METHOD_DECLARATION: 'MethodDeclaration',
    NEW_EXPRESSION: 'NewExpression',
    THIS_EXPRESSION: 'ThisExpression',
    SUPER_EXPRESSION: 'SuperExpression',

    // Expressions
    CALL_EXPRESSION: 'CallExpression',
    MEMBER_EXPRESSION: 'MemberExpression',
    ASSIGNMENT_EXPRESSION: 'AssignmentExpression',
    BINARY_EXPRESSION: 'BinaryExpression',
    LOGICAL_EXPRESSION: 'LogicalExpression',
    UNARY_EXPRESSION: 'UnaryExpression',
    UPDATE_EXPRESSION: 'UpdateExpression',

    // Pythonic & Functional Extensions
    SLICE_EXPRESSION: 'SliceExpression',
    COMPREHENSION: 'Comprehension',
    ARROW_FUNCTION: 'ArrowFunction',
    CONDITIONAL_EXPRESSION: 'ConditionalExpression'
};

module.exports = { NodeTypes };
