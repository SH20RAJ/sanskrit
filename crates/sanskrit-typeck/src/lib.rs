use sanskrit_ast::*;
use sanskrit_diagnostics::Diagnostic;
use sanskrit_hir::HirModule;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Type {
    I64,
    I32,
    F64,
    F32,
    Bool,
    String,
    Void,
    Tensor {
        elem: Box<Type>,
        shape: Option<Vec<usize>>,
    },
    Custom(String),
}

impl Type {
    pub fn is_numeric(&self) -> bool {
        matches!(self, Type::I64 | Type::I32 | Type::F64 | Type::F32)
    }

    pub fn is_floating(&self) -> bool {
        matches!(self, Type::F64 | Type::F32)
    }
}

pub struct TypeChecker {
    scopes: Vec<HashMap<String, Type>>,
    function_signatures: HashMap<String, (Vec<Type>, Type)>,
    pub diagnostics: Vec<Diagnostic>,
}

impl TypeChecker {
    pub fn new() -> Self {
        let mut tc = Self {
            scopes: vec![HashMap::new()],
            function_signatures: HashMap::new(),
            diagnostics: Vec::new(),
        };

        // Built-in functions
        tc.function_signatures.insert(
            "print".to_string(),
            (vec![Type::String], Type::Void),
        );
        tc.function_signatures.insert(
            "मुद्रण".to_string(),
            (vec![Type::String], Type::Void),
        );

        tc
    }

    pub fn check_module(&mut self, module: &HirModule) -> Result<(), Vec<Diagnostic>> {
        // Collect function signatures first
        for func in &module.functions {
            let mut param_types = Vec::new();
            for p in &func.params {
                let ty = match &p.ty {
                    Some(annot) => self.resolve_type_annot(annot),
                    None => Type::I64, // Default inferred parameter type
                };
                param_types.push(ty);
            }
            let ret_ty = match &func.return_type {
                Some(annot) => self.resolve_type_annot(annot),
                None => Type::Void,
            };

            self.function_signatures.insert(func.name.clone(), (param_types.clone(), ret_ty.clone()));
            self.function_signatures.insert(func.canonical_name.clone(), (param_types, ret_ty));
        }

        // Type check each function body
        for func in &module.functions {
            self.enter_scope();
            let param_bindings: Vec<(String, Type)> = if let Some((param_types, _)) = self.function_signatures.get(&func.name) {
                func.params.iter().zip(param_types.iter()).map(|(p, ty)| (p.name.clone(), ty.clone())).collect()
            } else {
                Vec::new()
            };
            for (name, ty) in param_bindings {
                self.insert_binding(&name, ty);
            }

            for stmt in &func.body {
                self.check_stmt(stmt);
            }
            self.exit_scope();
        }

        if self.diagnostics.is_empty() {
            Ok(())
        } else {
            Err(self.diagnostics.clone())
        }
    }

    fn check_stmt(&mut self, stmt: &Stmt) {
        match stmt {
            Stmt::Let { name, ty, init, span } => {
                let expected_ty = ty.as_ref().map(|t| self.resolve_type_annot(t));
                let inferred_ty = if let Some(init_expr) = init {
                    let actual_ty = self.check_expr(init_expr);
                    if let Some(expected) = &expected_ty {
                        if &actual_ty != expected && actual_ty != Type::Void {
                            self.diagnostics.push(
                                Diagnostic::error("S1002", format!("mismatched types: expected `{:?}`, found `{:?}`", expected, actual_ty))
                                    .with_span(*span)
                                    .with_help("ensure the initializer matches the annotated type"),
                            );
                        }
                    }
                    actual_ty
                } else {
                    expected_ty.clone().unwrap_or(Type::Void)
                };

                let final_ty = expected_ty.unwrap_or(inferred_ty);
                self.insert_binding(name, final_ty);
            }
            Stmt::Const { name, ty, value, span } => {
                let actual_ty = self.check_expr(value);
                if let Some(annot) = ty {
                    let expected = self.resolve_type_annot(annot);
                    if actual_ty != expected {
                        self.diagnostics.push(
                            Diagnostic::error("S1003", format!("constant type mismatch: expected `{:?}`, found `{:?}`", expected, actual_ty))
                                .with_span(*span),
                        );
                    }
                }
                self.insert_binding(name, actual_ty);
            }
            Stmt::Assign { target, value, span } => {
                let val_ty = self.check_expr(value);
                if let Some(target_ty) = self.lookup_binding(target) {
                    if target_ty != val_ty && val_ty != Type::Void {
                        self.diagnostics.push(
                            Diagnostic::error("S1004", format!("cannot assign `{:?}` to variable `{}` of type `{:?}`", val_ty, target, target_ty))
                                .with_span(*span),
                        );
                    }
                } else {
                    self.diagnostics.push(
                        Diagnostic::error("S1001", format!("unresolved variable `{}`", target))
                            .with_span(*span),
                    );
                }
            }
            Stmt::If { cond, then_branch, else_branch, span } => {
                let cond_ty = self.check_expr(cond);
                if cond_ty != Type::Bool {
                    self.diagnostics.push(
                        Diagnostic::error("S1005", format!("if condition must evaluate to `Bool`, found `{:?}`", cond_ty))
                            .with_span(*span),
                    );
                }
                self.enter_scope();
                for s in then_branch {
                    self.check_stmt(s);
                }
                self.exit_scope();

                if let Some(else_stmts) = else_branch {
                    self.enter_scope();
                    for s in else_stmts {
                        self.check_stmt(s);
                    }
                    self.exit_scope();
                }
            }
            Stmt::For { var, iterable, body, .. } => {
                let iter_ty = self.check_expr(iterable);
                self.enter_scope();
                let elem_ty = match iter_ty {
                    Type::Tensor { elem, .. } => *elem,
                    _ => Type::I64,
                };
                self.insert_binding(var, elem_ty);
                for s in body {
                    self.check_stmt(s);
                }
                self.exit_scope();
            }
            Stmt::Return { value, .. } => {
                if let Some(expr) = value {
                    self.check_expr(expr);
                }
            }
            Stmt::Print { args, .. } => {
                for arg in args {
                    self.check_expr(arg);
                }
            }
            Stmt::Expr(expr) => {
                self.check_expr(expr);
            }
        }
    }

    fn check_expr(&mut self, expr: &Expr) -> Type {
        match expr {
            Expr::Int(_, _) => Type::I64,
            Expr::Float(_, _) => Type::F64,
            Expr::Str(_, _) => Type::String,
            Expr::Bool(_, _) => Type::Bool,
            Expr::Nil(_) => Type::Void,
            Expr::Ident(name, span) => {
                if let Some(ty) = self.lookup_binding(name) {
                    ty
                } else if self.function_signatures.contains_key(name) {
                    Type::Void
                } else {
                    self.diagnostics.push(
                        Diagnostic::error("S1001", format!("unresolved identifier `{}`", name))
                            .with_span(*span),
                    );
                    Type::Void
                }
            }
            Expr::Binary { op, lhs, rhs, span } => {
                let l_ty = self.check_expr(lhs);
                let r_ty = self.check_expr(rhs);

                match op {
                    BinaryOp::Add | BinaryOp::Sub | BinaryOp::Mul | BinaryOp::Div | BinaryOp::Mod => {
                        // Tensor arithmetic or scalar arithmetic
                        if let (Type::Tensor { elem: l_elem, shape: l_shape }, Type::Tensor { elem: r_elem, shape: _r_shape }) = (&l_ty, &r_ty) {
                            if l_elem != r_elem {
                                self.diagnostics.push(
                                    Diagnostic::error("S1008", format!("cannot operate on tensors with different element types `{:?}` and `{:?}`", l_elem, r_elem))
                                        .with_span(*span),
                                );
                            }
                            return Type::Tensor { elem: l_elem.clone(), shape: l_shape.clone() };
                        }

                        if l_ty != r_ty && l_ty != Type::Void && r_ty != Type::Void {
                            self.diagnostics.push(
                                Diagnostic::error("S1007", format!("cannot apply binary operator `{:?}` to `{:?}` and `{:?}`", op, l_ty, r_ty))
                                    .with_span(*span)
                                    .with_help("ensure both operands have compatible numerical types"),
                            );
                        }
                        l_ty
                    }
                    BinaryOp::MatMul => {
                        // Tensor matrix multiplication @
                        match (&l_ty, &r_ty) {
                            (Type::Tensor { elem, shape: s1 }, Type::Tensor { shape: s2, .. }) => {
                                let mut out_shape = None;
                                if let (Some(shape1), Some(shape2)) = (s1, s2) {
                                    if shape1.len() >= 2 && shape2.len() >= 2 {
                                        let k1 = shape1[shape1.len() - 1];
                                        let k2 = shape2[shape2.len() - 2];
                                        if k1 != k2 {
                                            self.diagnostics.push(
                                                Diagnostic::error("S1009", format!("tensor matmul dimension mismatch: inner dimensions {} and {} do not match", k1, k2))
                                                    .with_span(*span),
                                            );
                                        } else {
                                            out_shape = Some(vec![shape1[0], shape2[shape2.len() - 1]]);
                                        }
                                    }
                                }
                                Type::Tensor { elem: elem.clone(), shape: out_shape }
                            }
                            _ => {
                                self.diagnostics.push(
                                    Diagnostic::error("S1009", "operator `@` is only valid on `Tensor` operands")
                                        .with_span(*span),
                                );
                                Type::Void
                            }
                        }
                    }
                    BinaryOp::Eq | BinaryOp::NotEq | BinaryOp::Lt | BinaryOp::LtEq | BinaryOp::Gt | BinaryOp::GtEq => Type::Bool,
                    BinaryOp::And | BinaryOp::Or => Type::Bool,
                }
            }
            Expr::Unary { op: _, operand, .. } => self.check_expr(operand),
            Expr::Call { callee, args, span } => {
                if let Expr::Ident(name, _) = &**callee {
                    if let Some((param_types, ret_ty)) = self.function_signatures.get(name).cloned() {
                        if name != "print" && name != "मुद्रण" && args.len() != param_types.len() {
                            self.diagnostics.push(
                                Diagnostic::error("S1006", format!("function `{}` expected {} arguments, found {}", name, param_types.len(), args.len()))
                                    .with_span(*span),
                            );
                        }
                        return ret_ty;
                    }
                }
                for a in args {
                    self.check_expr(a);
                }
                Type::Void
            }
            Expr::Index { target, index, .. } => {
                let target_ty = self.check_expr(target);
                self.check_expr(index);
                match target_ty {
                    Type::Tensor { elem, .. } => *elem,
                    _ => Type::Void,
                }
            }
            Expr::Slice { target, start, stop, step, .. } => {
                if let Some(s) = start { self.check_expr(s); }
                if let Some(s) = stop { self.check_expr(s); }
                if let Some(s) = step { self.check_expr(s); }
                self.check_expr(target)
            }
            Expr::TensorLit { elements, .. } => {
                let mut elem_ty = Type::F32;
                if let Some(first) = elements.first() {
                    elem_ty = self.check_expr(first);
                }
                Type::Tensor {
                    elem: Box::new(elem_ty),
                    shape: Some(vec![elements.len()]),
                }
            }
            Expr::TensorConstructor { shape, dtype, .. } => {
                let elem_ty = match dtype.as_deref() {
                    Some("F64") | Some("दशमलव६४") => Type::F64,
                    Some("I64") | Some("पूर्णाङ्क६४") => Type::I64,
                    _ => Type::F32,
                };
                Type::Tensor {
                    elem: Box::new(elem_ty),
                    shape: Some(shape.clone()),
                }
            }
        }
    }

    fn resolve_type_annot(&self, annot: &TypeAnnotation) -> Type {
        match annot {
            TypeAnnotation::I64 => Type::I64,
            TypeAnnotation::I32 => Type::I32,
            TypeAnnotation::F64 => Type::F64,
            TypeAnnotation::F32 => Type::F32,
            TypeAnnotation::Bool => Type::Bool,
            TypeAnnotation::String => Type::String,
            TypeAnnotation::Tensor { elem, shape } => Type::Tensor {
                elem: Box::new(self.resolve_type_annot(elem)),
                shape: shape.clone(),
            },
            TypeAnnotation::Custom(c) => Type::Custom(c.clone()),
        }
    }

    fn enter_scope(&mut self) {
        self.scopes.push(HashMap::new());
    }

    fn exit_scope(&mut self) {
        self.scopes.pop();
    }

    fn insert_binding(&mut self, name: &str, ty: Type) {
        if let Some(scope) = self.scopes.last_mut() {
            scope.insert(name.to_string(), ty);
        }
    }

    fn lookup_binding(&self, name: &str) -> Option<Type> {
        for scope in self.scopes.iter().rev() {
            if let Some(ty) = scope.get(name) {
                return Some(ty.clone());
            }
        }
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sanskrit_diagnostics::Span;
    use sanskrit_hir::{HirFunction, HirModule};

    #[test]
    fn test_typeck_valid_tensor_matmul() {
        let mut tc = TypeChecker::new();
        let module = HirModule {
            functions: vec![HirFunction {
                name: "main".to_string(),
                canonical_name: "main".to_string(),
                params: Vec::new(),
                return_type: None,
                body: vec![
                    Stmt::Let {
                        name: "A".to_string(),
                        ty: None,
                        init: Some(Expr::TensorConstructor {
                            kind: "ones".to_string(),
                            shape: vec![32, 64],
                            dtype: Some("F32".to_string()),
                            span: Span::dummy(),
                        }),
                        span: Span::dummy(),
                    },
                    Stmt::Let {
                        name: "B".to_string(),
                        ty: None,
                        init: Some(Expr::TensorConstructor {
                            kind: "ones".to_string(),
                            shape: vec![64, 128],
                            dtype: Some("F32".to_string()),
                            span: Span::dummy(),
                        }),
                        span: Span::dummy(),
                    },
                    Stmt::Let {
                        name: "C".to_string(),
                        ty: None,
                        init: Some(Expr::Binary {
                            op: BinaryOp::MatMul,
                            lhs: Box::new(Expr::Ident("A".to_string(), Span::dummy())),
                            rhs: Box::new(Expr::Ident("B".to_string(), Span::dummy())),
                            span: Span::dummy(),
                        }),
                        span: Span::dummy(),
                    },
                ],
                span: Span::dummy(),
            }],
            structs: Vec::new(),
            span: Span::dummy(),
        };

        let res = tc.check_module(&module);
        assert!(res.is_ok());
    }

    #[test]
    fn test_typeck_mismatched_types() {
        let mut tc = TypeChecker::new();
        let module = HirModule {
            functions: vec![HirFunction {
                name: "main".to_string(),
                canonical_name: "main".to_string(),
                params: Vec::new(),
                return_type: None,
                body: vec![
                    Stmt::Let {
                        name: "x".to_string(),
                        ty: Some(TypeAnnotation::I64),
                        init: Some(Expr::Str("invalid".to_string(), Span::dummy())),
                        span: Span::dummy(),
                    },
                ],
                span: Span::dummy(),
            }],
            structs: Vec::new(),
            span: Span::dummy(),
        };

        let res = tc.check_module(&module);
        assert!(res.is_err());
    }
}
