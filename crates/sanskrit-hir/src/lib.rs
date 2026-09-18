use sanskrit_ast::*;
use sanskrit_diagnostics::Span;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HirModule {
    pub functions: Vec<HirFunction>,
    pub structs: Vec<StructDef>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HirFunction {
    pub name: String,
    pub canonical_name: String,
    pub params: Vec<Param>,
    pub return_type: Option<TypeAnnotation>,
    pub body: Vec<Stmt>,
    pub span: Span,
}

pub fn lower_ast_to_hir(program: Program) -> Result<HirModule, String> {
    let mut functions = Vec::new();
    let mut structs = Vec::new();
    let mut top_level_stmts = Vec::new();

    for item in program.items {
        match item {
            Item::Function(f) => {
                let canonical = match f.name.as_str() {
                    "मुख्य" | "main" => "main".to_string(),
                    other => other.to_string(),
                };
                functions.push(HirFunction {
                    name: f.name,
                    canonical_name: canonical,
                    params: f.params,
                    return_type: f.return_type,
                    body: f.body,
                    span: f.span,
                });
            }
            Item::Struct(s) => structs.push(s),
            Item::Import(_) => {
                // Imports tracked for module resolution
            }
            Item::Trait(_) | Item::Enum(_) => {}
            Item::Stmt(stmt) => top_level_stmts.push(stmt),
        }
    }

    // If top-level statements exist and no main function exists, wrap them into synthetic main
    if !top_level_stmts.is_empty() {
        let has_main = functions.iter().any(|f| f.canonical_name == "main");
        if !has_main {
            functions.push(HirFunction {
                name: "main".to_string(),
                canonical_name: "main".to_string(),
                params: Vec::new(),
                return_type: None,
                body: top_level_stmts,
                span: program.span,
            });
        }
    }

    Ok(HirModule {
        functions,
        structs,
        span: program.span,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hir_desugars_top_level_script() {
        let stmt = Stmt::Print {
            args: vec![Expr::Int(42, Span::dummy())],
            span: Span::dummy(),
        };
        let prog = Program {
            items: vec![Item::Stmt(stmt)],
            span: Span::dummy(),
        };

        let hir = lower_ast_to_hir(prog).unwrap();
        assert_eq!(hir.functions.len(), 1);
        assert_eq!(hir.functions[0].canonical_name, "main");
        assert_eq!(hir.functions[0].body.len(), 1);
    }
}
