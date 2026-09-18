use sanskrit_hir::HirModule;
use sanskrit_typeck::Type;
use serde::{Deserialize, Serialize};

pub type ValueId = usize;
pub type BlockId = usize;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SirModule {
    pub functions: Vec<SirFunction>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SirFunction {
    pub name: String,
    pub blocks: Vec<SirBlock>,
    pub return_type: Type,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SirBlock {
    pub id: BlockId,
    pub instructions: Vec<SirInstruction>,
    pub terminator: SirTerminator,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SirInstruction {
    ConstInt {
        id: ValueId,
        val: i64,
    },
    ConstFloat {
        id: ValueId,
        val: f64,
    },
    ConstString {
        id: ValueId,
        val: String,
    },
    ConstBool {
        id: ValueId,
        val: bool,
    },
    AllocTensor {
        id: ValueId,
        shape: Vec<usize>,
        dtype: Type,
    },
    TensorMatMul {
        id: ValueId,
        lhs: ValueId,
        rhs: ValueId,
    },
    TensorAdd {
        id: ValueId,
        lhs: ValueId,
        rhs: ValueId,
    },
    BinaryOp {
        id: ValueId,
        op: String,
        lhs: ValueId,
        rhs: ValueId,
    },
    Call {
        id: ValueId,
        callee: String,
        args: Vec<ValueId>,
    },
    Print {
        args: Vec<ValueId>,
    },
    Copy {
        id: ValueId,
        src: ValueId,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SirTerminator {
    Return(Option<ValueId>),
    Branch(BlockId),
    CondBranch {
        cond: ValueId,
        then_block: BlockId,
        else_block: BlockId,
    },
}

pub fn lower_hir_to_sir(module: &HirModule) -> Result<SirModule, String> {
    let mut sir_functions = Vec::new();

    for func in &module.functions {
        let mut block = SirBlock {
            id: 0,
            instructions: Vec::new(),
            terminator: SirTerminator::Return(None),
        };

        let mut val_counter: ValueId = 0;
        let mut var_map = std::collections::HashMap::new();

        for stmt in &func.body {
            match stmt {
                sanskrit_ast::Stmt::Let {
                    name,
                    init: Some(expr),
                    ..
                } => {
                    let val = lower_expr(expr, &mut block, &mut val_counter, &var_map);
                    var_map.insert(name.clone(), val);
                }
                sanskrit_ast::Stmt::Let { init: None, .. } => {}
                sanskrit_ast::Stmt::Assign { target, value, .. } => {
                    let val = lower_expr(value, &mut block, &mut val_counter, &var_map);
                    var_map.insert(target.clone(), val);
                }
                sanskrit_ast::Stmt::Print { args, .. } => {
                    let mut arg_ids = Vec::new();
                    for a in args {
                        arg_ids.push(lower_expr(a, &mut block, &mut val_counter, &var_map));
                    }
                    block
                        .instructions
                        .push(SirInstruction::Print { args: arg_ids });
                }
                sanskrit_ast::Stmt::Return { value, .. } => {
                    let ret_id = value
                        .as_ref()
                        .map(|v| lower_expr(v, &mut block, &mut val_counter, &var_map));
                    block.terminator = SirTerminator::Return(ret_id);
                }
                sanskrit_ast::Stmt::Expr(e) => {
                    lower_expr(e, &mut block, &mut val_counter, &var_map);
                }
                _ => {}
            }
        }

        sir_functions.push(SirFunction {
            name: func.canonical_name.clone(),
            blocks: vec![block],
            return_type: Type::Void,
        });
    }

    Ok(SirModule {
        functions: sir_functions,
    })
}

fn lower_expr(
    expr: &sanskrit_ast::Expr,
    block: &mut SirBlock,
    counter: &mut ValueId,
    var_map: &std::collections::HashMap<String, ValueId>,
) -> ValueId {
    *counter += 1;
    let id = *counter;

    match expr {
        sanskrit_ast::Expr::Int(v, _) => {
            block
                .instructions
                .push(SirInstruction::ConstInt { id, val: *v });
            id
        }
        sanskrit_ast::Expr::Float(v, _) => {
            block
                .instructions
                .push(SirInstruction::ConstFloat { id, val: *v });
            id
        }
        sanskrit_ast::Expr::Str(s, _) => {
            block
                .instructions
                .push(SirInstruction::ConstString { id, val: s.clone() });
            id
        }
        sanskrit_ast::Expr::Bool(b, _) => {
            block
                .instructions
                .push(SirInstruction::ConstBool { id, val: *b });
            id
        }
        sanskrit_ast::Expr::Ident(name, _) => {
            if let Some(&existing_id) = var_map.get(name) {
                block.instructions.push(SirInstruction::Copy {
                    id,
                    src: existing_id,
                });
                id
            } else {
                id
            }
        }
        sanskrit_ast::Expr::Binary { op, lhs, rhs, .. } => {
            let l_id = lower_expr(lhs, block, counter, var_map);
            let r_id = lower_expr(rhs, block, counter, var_map);

            if *op == sanskrit_ast::BinaryOp::MatMul {
                block.instructions.push(SirInstruction::TensorMatMul {
                    id,
                    lhs: l_id,
                    rhs: r_id,
                });
            } else {
                let op_str = match op {
                    sanskrit_ast::BinaryOp::Add => "+",
                    sanskrit_ast::BinaryOp::Sub => "-",
                    sanskrit_ast::BinaryOp::Mul => "*",
                    sanskrit_ast::BinaryOp::Div => "/",
                    sanskrit_ast::BinaryOp::Eq => "==",
                    sanskrit_ast::BinaryOp::Lt => "<",
                    _ => "?",
                };
                block.instructions.push(SirInstruction::BinaryOp {
                    id,
                    op: op_str.to_string(),
                    lhs: l_id,
                    rhs: r_id,
                });
            }
            id
        }
        sanskrit_ast::Expr::TensorConstructor { shape, dtype, .. } => {
            let ty = match dtype.as_deref() {
                Some("F64") => Type::F64,
                _ => Type::F32,
            };
            block.instructions.push(SirInstruction::AllocTensor {
                id,
                shape: shape.clone(),
                dtype: ty,
            });
            id
        }
        sanskrit_ast::Expr::Call { callee, args, .. } => {
            let name = if let sanskrit_ast::Expr::Ident(n, _) = &**callee {
                n.clone()
            } else {
                "anonymous".to_string()
            };
            let mut arg_ids = Vec::new();
            for a in args {
                arg_ids.push(lower_expr(a, block, counter, var_map));
            }
            block.instructions.push(SirInstruction::Call {
                id,
                callee: name,
                args: arg_ids,
            });
            id
        }
        _ => id,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sir_lowering_matmul() {
        let hir = HirModule {
            functions: vec![sanskrit_hir::HirFunction {
                name: "main".to_string(),
                canonical_name: "main".to_string(),
                params: Vec::new(),
                return_type: None,
                body: vec![sanskrit_ast::Stmt::Let {
                    name: "A".to_string(),
                    ty: None,
                    init: Some(sanskrit_ast::Expr::TensorConstructor {
                        kind: "ones".to_string(),
                        shape: vec![16, 16],
                        dtype: None,
                        span: sanskrit_diagnostics::Span::dummy(),
                    }),
                    span: sanskrit_diagnostics::Span::dummy(),
                }],
                span: sanskrit_diagnostics::Span::dummy(),
            }],
            structs: Vec::new(),
            span: sanskrit_diagnostics::Span::dummy(),
        };

        let sir = lower_hir_to_sir(&hir).unwrap();
        assert_eq!(sir.functions.len(), 1);
        assert!(!sir.functions[0].blocks[0].instructions.is_empty());
    }
}
