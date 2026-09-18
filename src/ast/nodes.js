// Sanskrit Language Canonical AST Nodes
const { NodeTypes } = require('./node-types');

class ASTNode {
    constructor(type, loc = null) {
        this.type = type;
        this.loc = loc;
    }
}

class ProgramNode extends ASTNode {
    constructor(body = [], loc = null) {
        super(NodeTypes.PROGRAM, loc);
        this.body = body;
    }
}

class IdentifierNode extends ASTNode {
    constructor(name, loc = null) {
        super(NodeTypes.IDENTIFIER, loc);
        this.name = name;
    }
}

class NumericLiteralNode extends ASTNode {
    constructor(value, raw = '', loc = null) {
        super(NodeTypes.NUMERIC_LITERAL, loc);
        this.value = value;
        this.raw = raw;
    }
}

class StringLiteralNode extends ASTNode {
    constructor(value, raw = '', loc = null) {
        super(NodeTypes.STRING_LITERAL, loc);
        this.value = value;
        this.raw = raw;
    }
}

class BooleanLiteralNode extends ASTNode {
    constructor(value, loc = null) {
        super(NodeTypes.BOOLEAN_LITERAL, loc);
        this.value = Boolean(value);
    }
}

class NullLiteralNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.NULL_LITERAL, loc);
        this.value = null;
    }
}

class UndefinedLiteralNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.UNDEFINED_LITERAL, loc);
        this.value = undefined;
    }
}

class ArrayLiteralNode extends ASTNode {
    constructor(elements = [], loc = null) {
        super(NodeTypes.ARRAY_LITERAL, loc);
        this.elements = elements;
    }
}

class PropertyNode extends ASTNode {
    constructor(key, value, loc = null) {
        super(NodeTypes.PROPERTY, loc);
        this.key = key;
        this.value = value;
    }
}

class ObjectLiteralNode extends ASTNode {
    constructor(properties = [], loc = null) {
        super(NodeTypes.OBJECT_LITERAL, loc);
        this.properties = properties;
    }
}

class VariableDeclarationNode extends ASTNode {
    constructor(id, init = null, isConstant = false, loc = null) {
        super(NodeTypes.VARIABLE_DECLARATION, loc);
        this.id = id;
        this.init = init;
        this.isConstant = isConstant;
    }
}

class FunctionDeclarationNode extends ASTNode {
    constructor(id, params = [], body = null, loc = null) {
        super(NodeTypes.FUNCTION_DECLARATION, loc);
        this.id = id;
        this.params = params;
        this.body = body;
    }
}

class BlockStatementNode extends ASTNode {
    constructor(body = [], loc = null) {
        super(NodeTypes.BLOCK_STATEMENT, loc);
        this.body = body;
    }
}

class ExpressionStatementNode extends ASTNode {
    constructor(expression, loc = null) {
        super(NodeTypes.EXPRESSION_STATEMENT, loc);
        this.expression = expression;
    }
}

class IfStatementNode extends ASTNode {
    constructor(test, consequent, alternate = null, loc = null) {
        super(NodeTypes.IF_STATEMENT, loc);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class WhileStatementNode extends ASTNode {
    constructor(test, body, loc = null) {
        super(NodeTypes.WHILE_STATEMENT, loc);
        this.test = test;
        this.body = body;
    }
}

class ForStatementNode extends ASTNode {
    constructor(init, test, update, body, loc = null) {
        super(NodeTypes.FOR_STATEMENT, loc);
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
}

class ForEachStatementNode extends ASTNode {
    constructor(left, right, body, loc = null) {
        super(NodeTypes.FOR_EACH_STATEMENT, loc);
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

class ReturnStatementNode extends ASTNode {
    constructor(argument = null, loc = null) {
        super(NodeTypes.RETURN_STATEMENT, loc);
        this.argument = argument;
    }
}

class BreakStatementNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.BREAK_STATEMENT, loc);
    }
}

class ContinueStatementNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.CONTINUE_STATEMENT, loc);
    }
}

class TryStatementNode extends ASTNode {
    constructor(block, handler = null, finalizer = null, loc = null) {
        super(NodeTypes.TRY_STATEMENT, loc);
        this.block = block;
        this.handler = handler;
        this.finalizer = finalizer;
    }
}

class CatchClauseNode extends ASTNode {
    constructor(param, body, loc = null) {
        super(NodeTypes.CATCH_CLAUSE, loc);
        this.param = param;
        this.body = body;
    }
}

class ThrowStatementNode extends ASTNode {
    constructor(argument, loc = null) {
        super(NodeTypes.THROW_STATEMENT, loc);
        this.argument = argument;
    }
}

class ClassDeclarationNode extends ASTNode {
    constructor(id, superClass = null, body = [], loc = null) {
        super(NodeTypes.CLASS_DECLARATION, loc);
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
}

class MethodDeclarationNode extends ASTNode {
    constructor(id, params = [], body = null, isConstructor = false, isStatic = false, modifiers = [], loc = null) {
        super(NodeTypes.METHOD_DECLARATION, loc);
        this.id = id;
        this.params = params;
        this.body = body;
        this.isConstructor = isConstructor;
        this.isStatic = isStatic;
        this.modifiers = modifiers;
    }
}

class NewExpressionNode extends ASTNode {
    constructor(callee, args = [], loc = null) {
        super(NodeTypes.NEW_EXPRESSION, loc);
        this.callee = callee;
        this.arguments = args;
    }
}

class CallExpressionNode extends ASTNode {
    constructor(callee, args = [], loc = null) {
        super(NodeTypes.CALL_EXPRESSION, loc);
        this.callee = callee;
        this.arguments = args;
    }
}

class MemberExpressionNode extends ASTNode {
    constructor(object, property, computed = false, loc = null) {
        super(NodeTypes.MEMBER_EXPRESSION, loc);
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
}

class ThisExpressionNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.THIS_EXPRESSION, loc);
    }
}

class SuperExpressionNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.SUPER_EXPRESSION, loc);
    }
}

class AssignmentExpressionNode extends ASTNode {
    constructor(operator, left, right, loc = null) {
        super(NodeTypes.ASSIGNMENT_EXPRESSION, loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class BinaryExpressionNode extends ASTNode {
    constructor(operator, left, right, loc = null) {
        super(NodeTypes.BINARY_EXPRESSION, loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class LogicalExpressionNode extends ASTNode {
    constructor(operator, left, right, loc = null) {
        super(NodeTypes.LOGICAL_EXPRESSION, loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class UnaryExpressionNode extends ASTNode {
    constructor(operator, argument, prefix = true, loc = null) {
        super(NodeTypes.UNARY_EXPRESSION, loc);
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
}

class UpdateExpressionNode extends ASTNode {
    constructor(operator, argument, prefix = false, loc = null) {
        super(NodeTypes.UPDATE_EXPRESSION, loc);
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
}

class SliceExpressionNode extends ASTNode {
    constructor(start = null, stop = null, step = null, loc = null) {
        super(NodeTypes.SLICE_EXPRESSION, loc);
        this.start = start;
        this.stop = stop;
        this.step = step;
    }
}

class ComprehensionNode extends ASTNode {
    constructor(expression, variable, collection, filterCondition = null, loc = null) {
        super(NodeTypes.COMPREHENSION, loc);
        this.expression = expression;
        this.variable = variable;
        this.collection = collection;
        this.filterCondition = filterCondition;
    }
}

class ArrowFunctionNode extends ASTNode {
    constructor(params = [], body = null, isExpressionBody = true, loc = null) {
        super(NodeTypes.ARROW_FUNCTION, loc);
        this.params = params;
        this.body = body;
        this.isExpressionBody = isExpressionBody;
    }
}

class ConditionalExpressionNode extends ASTNode {
    constructor(test, consequent, alternate, loc = null) {
        super(NodeTypes.CONDITIONAL_EXPRESSION, loc);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

module.exports = {
    ASTNode,
    ProgramNode,
    IdentifierNode,
    NumericLiteralNode,
    StringLiteralNode,
    BooleanLiteralNode,
    NullLiteralNode,
    UndefinedLiteralNode,
    ArrayLiteralNode,
    PropertyNode,
    ObjectLiteralNode,
    VariableDeclarationNode,
    FunctionDeclarationNode,
    BlockStatementNode,
    ExpressionStatementNode,
    IfStatementNode,
    WhileStatementNode,
    ForStatementNode,
    ForEachStatementNode,
    ReturnStatementNode,
    BreakStatementNode,
    ContinueStatementNode,
    TryStatementNode,
    CatchClauseNode,
    ThrowStatementNode,
    ClassDeclarationNode,
    MethodDeclarationNode,
    NewExpressionNode,
    CallExpressionNode,
    MemberExpressionNode,
    ThisExpressionNode,
    SuperExpressionNode,
    AssignmentExpressionNode,
    BinaryExpressionNode,
    LogicalExpressionNode,
    UnaryExpressionNode,
    UpdateExpressionNode,
    SliceExpressionNode,
    ComprehensionNode,
    ArrowFunctionNode,
    ConditionalExpressionNode
};
