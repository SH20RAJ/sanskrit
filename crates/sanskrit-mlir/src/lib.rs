use sanskrit_ir::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MlirModule {
    pub raw_mlir_text: String,
}

pub struct MlirEmitter;

impl MlirEmitter {
    pub fn emit_mlir(sir_module: &SirModule) -> MlirModule {
        let mut out = String::new();
        out.push_str("// MLIR Module emitted by Sanskrit Next Compiler\n");
        out.push_str("module attributes {sanskrit.dialect = \"2.0\"} {\n");

        for func in &sir_module.functions {
            out.push_str(&format!("  func.func @{}() -> () {{\n", func.name));

            for block in &func.blocks {
                out.push_str(&format!("  ^bb{}:\n", block.id));

                for inst in &block.instructions {
                    match inst {
                        SirInstruction::ConstInt { id, val } => {
                            out.push_str(&format!("    %{} = arith.constant {} : i64\n", id, val));
                        }
                        SirInstruction::ConstFloat { id, val } => {
                            out.push_str(&format!(
                                "    %{} = arith.constant {:.6} : f64\n",
                                id, val
                            ));
                        }
                        SirInstruction::AllocTensor { id, shape, dtype } => {
                            let shape_str = shape
                                .iter()
                                .map(|d| d.to_string())
                                .collect::<Vec<_>>()
                                .join("x");
                            let dt_str = match dtype {
                                sanskrit_typeck::Type::F64 => "f64",
                                _ => "f32",
                            };
                            out.push_str(&format!(
                                "    %{} = tensor.empty() : tensor<{}x{}>\n",
                                id, shape_str, dt_str
                            ));
                        }
                        SirInstruction::TensorMatMul { id, lhs, rhs } => {
                            out.push_str(&format!(
                                "    %{} = linalg.matmul ins(%{}, %{}) : tensor<2D> -> tensor<2D>\n",
                                id, lhs, rhs
                            ));
                        }
                        SirInstruction::BinaryOp { id, op, lhs, rhs } => {
                            let arith_op = match op.as_str() {
                                "+" => "arith.addi",
                                "-" => "arith.subi",
                                "*" => "arith.muli",
                                "/" => "arith.divsi",
                                _ => "arith.addi",
                            };
                            out.push_str(&format!(
                                "    %{} = {} %{}, %{} : i64\n",
                                id, arith_op, lhs, rhs
                            ));
                        }
                        SirInstruction::Print { args } => {
                            let args_str = args
                                .iter()
                                .map(|a| format!("%{}", a))
                                .collect::<Vec<_>>()
                                .join(", ");
                            out.push_str(&format!("    sanskrit.print {}\n", args_str));
                        }
                        _ => {}
                    }
                }

                out.push_str("    return\n");
            }

            out.push_str("  }\n");
        }

        out.push_str("}\n");

        MlirModule { raw_mlir_text: out }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mlir_emission() {
        let sir = SirModule {
            functions: vec![SirFunction {
                name: "main".to_string(),
                blocks: vec![SirBlock {
                    id: 0,
                    instructions: vec![
                        SirInstruction::ConstInt { id: 1, val: 42 },
                        SirInstruction::Print { args: vec![1] },
                    ],
                    terminator: SirTerminator::Return(None),
                }],
                return_type: sanskrit_typeck::Type::Void,
            }],
        };

        let mlir = MlirEmitter::emit_mlir(&sir);
        assert!(mlir.raw_mlir_text.contains("arith.constant 42 : i64"));
        assert!(mlir.raw_mlir_text.contains("func.func @main"));
    }
}
