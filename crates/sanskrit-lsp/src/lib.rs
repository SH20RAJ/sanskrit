use sanskrit_lexer::Lexer;
use sanskrit_parser::Parser;
use sanskrit_typeck::TypeChecker;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LspHover {
    pub contents: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LspCompletionItem {
    pub label: String,
    pub detail: String,
    pub documentation: String,
}

pub struct SanskritLanguageServer;

impl SanskritLanguageServer {
    pub fn new() -> Self {
        Self
    }

    pub fn get_hover(&self, word: &str) -> Option<LspHover> {
        let doc = match word {
            "कार्य" | "fn" => "```sanskrit\nकार्य <नाम>(<मापदण्ड>): <प्रत्यागम_प्रकार>\n```\nDeclares a Sanskrit function definition.",
            "मान" | "let" => "```sanskrit\nमान <चर> = <मूल्य>\n```\nDeclares a local mutable or inferred variable binding.",
            "स्थिर" | "const" => "```sanskrit\nस्थिर <स्थिराङ्क> = <मूल्य>\n```\nDeclares an immutable constant.",
            "दिश" | "Tensor" => "```sanskrit\nदिश[प्रकार, आकार, विन्यास]\n```\nFirst-class multi-dimensional strided tensor primitive.",
            "मुद्रण" | "print" => "```sanskrit\nमुद्रण(...)\n```\nPrints formatted values to standard output.",
            _ => return None,
        };

        Some(LspHover {
            contents: doc.to_string(),
        })
    }

    pub fn get_completions(&self) -> Vec<LspCompletionItem> {
        vec![
            LspCompletionItem {
                label: "कार्य".to_string(),
                detail: "Function declaration (Devanagari)".to_string(),
                documentation: "कार्य मुख्य(): ...".to_string(),
            },
            LspCompletionItem {
                label: "fn".to_string(),
                detail: "Function declaration (ASCII)".to_string(),
                documentation: "fn main(): ...".to_string(),
            },
            LspCompletionItem {
                label: "दिश".to_string(),
                detail: "Tensor type (Devanagari)".to_string(),
                documentation: "Tensor[F32, [1024, 1024]]".to_string(),
            },
            LspCompletionItem {
                label: "Tensor".to_string(),
                detail: "Tensor type (ASCII)".to_string(),
                documentation: "Tensor[F32, [1024, 1024]]".to_string(),
            },
        ]
    }

    pub fn check_document(&self, source: &str) -> Vec<String> {
        let mut lexer = Lexer::new(source);
        let tokens = match lexer.tokenize() {
            Ok(t) => t,
            Err(e) => return vec![format!("Lexer error: {}", e)],
        };

        let mut parser = Parser::new(tokens);
        let program = match parser.parse_program() {
            Ok(p) => p,
            Err(e) => return vec![format!("Parser error: {}", e)],
        };

        let hir = match sanskrit_hir::lower_ast_to_hir(program) {
            Ok(h) => h,
            Err(e) => return vec![format!("HIR error: {}", e)],
        };

        let mut tc = TypeChecker::new();
        if let Err(diags) = tc.check_module(&hir) {
            return diags.into_iter().map(|d| d.message).collect();
        }

        Vec::new()
    }
}
