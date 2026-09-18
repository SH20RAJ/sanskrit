use sanskrit_diagnostics::Span;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Program {
    pub items: Vec<Item>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Item {
    Function(FunctionDef),
    Struct(StructDef),
    Trait(TraitDef),
    Enum(EnumDef),
    Import(ImportDef),
    Stmt(Stmt),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FunctionDef {
    pub name: String,
    pub params: Vec<Param>,
    pub return_type: Option<TypeAnnotation>,
    pub body: Vec<Stmt>,
    pub is_async: bool,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Param {
    pub name: String,
    pub ty: Option<TypeAnnotation>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StructDef {
    pub name: String,
    pub fields: Vec<FieldDef>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FieldDef {
    pub name: String,
    pub ty: TypeAnnotation,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TraitDef {
    pub name: String,
    pub methods: Vec<FunctionDef>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EnumDef {
    pub name: String,
    pub variants: Vec<String>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImportDef {
    pub path: Vec<String>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TypeAnnotation {
    I64,
    I32,
    F64,
    F32,
    Bool,
    String,
    Tensor {
        elem: Box<TypeAnnotation>,
        shape: Option<Vec<usize>>,
    },
    Custom(String),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Stmt {
    Let {
        name: String,
        ty: Option<TypeAnnotation>,
        init: Option<Expr>,
        span: Span,
    },
    Const {
        name: String,
        ty: Option<TypeAnnotation>,
        value: Expr,
        span: Span,
    },
    Assign {
        target: String,
        value: Expr,
        span: Span,
    },
    If {
        cond: Expr,
        then_branch: Vec<Stmt>,
        else_branch: Option<Vec<Stmt>>,
        span: Span,
    },
    For {
        var: String,
        iterable: Expr,
        body: Vec<Stmt>,
        span: Span,
    },
    Return {
        value: Option<Expr>,
        span: Span,
    },
    Print {
        args: Vec<Expr>,
        span: Span,
    },
    Expr(Expr),
}

impl Stmt {
    pub fn span(&self) -> Span {
        match self {
            Stmt::Let { span, .. }
            | Stmt::Const { span, .. }
            | Stmt::Assign { span, .. }
            | Stmt::If { span, .. }
            | Stmt::For { span, .. }
            | Stmt::Return { span, .. }
            | Stmt::Print { span, .. } => *span,
            Stmt::Expr(e) => e.span(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Expr {
    Int(i64, Span),
    Float(f64, Span),
    Str(String, Span),
    Bool(bool, Span),
    Nil(Span),
    Ident(String, Span),
    Binary {
        op: BinaryOp,
        lhs: Box<Expr>,
        rhs: Box<Expr>,
        span: Span,
    },
    Unary {
        op: UnaryOp,
        operand: Box<Expr>,
        span: Span,
    },
    Call {
        callee: Box<Expr>,
        args: Vec<Expr>,
        span: Span,
    },
    Index {
        target: Box<Expr>,
        index: Box<Expr>,
        span: Span,
    },
    Slice {
        target: Box<Expr>,
        start: Option<Box<Expr>>,
        stop: Option<Box<Expr>>,
        step: Option<Box<Expr>>,
        span: Span,
    },
    TensorLit {
        elements: Vec<Expr>,
        span: Span,
    },
    TensorConstructor {
        kind: String, // "zeros", "ones", "randn"
        shape: Vec<usize>,
        dtype: Option<String>,
        span: Span,
    },
}

impl Expr {
    pub fn span(&self) -> Span {
        match self {
            Expr::Int(_, s)
            | Expr::Float(_, s)
            | Expr::Str(_, s)
            | Expr::Bool(_, s)
            | Expr::Nil(s)
            | Expr::Ident(_, s)
            | Expr::Binary { span: s, .. }
            | Expr::Unary { span: s, .. }
            | Expr::Call { span: s, .. }
            | Expr::Index { span: s, .. }
            | Expr::Slice { span: s, .. }
            | Expr::TensorLit { span: s, .. }
            | Expr::TensorConstructor { span: s, .. } => *s,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BinaryOp {
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    MatMul, // @
    Eq,
    NotEq,
    Lt,
    LtEq,
    Gt,
    GtEq,
    And,
    Or,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UnaryOp {
    Neg,
    Not,
}
