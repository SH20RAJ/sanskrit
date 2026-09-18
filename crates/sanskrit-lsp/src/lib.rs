use sanskrit_lexer::Lexer;
use sanskrit_parser::Parser;
use sanskrit_typeck::TypeChecker;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::io::{self, BufRead, BufReader, Read, Write};

#[derive(Debug, Serialize, Deserialize)]
pub struct LspHover {
    pub contents: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LspCompletionItem {
    pub label: String,
    pub detail: String,
    pub documentation: String,
    pub insert_text: Option<String>,
}

pub struct SanskritLanguageServer;

impl Default for SanskritLanguageServer {
    fn default() -> Self {
        Self::new()
    }
}

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
            "यदि" | "if" => "```sanskrit\nयदि (प्रतिबन्ध) { ... }\n```\nConditional branch execution.",
            "अन्यथा" | "else" => "```sanskrit\nअन्यथा { ... }\n```\nAlternative branch when condition is false.",
            "यावत्" | "while" => "```sanskrit\nयावत् (प्रतिबन्ध) { ... }\n```\nLoop executing while condition holds true.",
            "प्रत्यागम" | "return" => "```sanskrit\nप्रत्यागम <मूल्य>;\n```\nReturns a value from the current function.",
            "प्रकार" | "struct" => "```sanskrit\nप्रकार <नाम> { ... }\n```\nDefines a structured record type.",
            "गुण" | "trait" => "```sanskrit\nगुण <नाम> { ... }\n```\nDefines an interface/trait contract.",
            "प्रयोजयतु" | "impl" => "```sanskrit\nप्रयोजयतु <गुण> कृते <प्रकार> { ... }\n```\nImplements traits or methods for a type.",
            "आयात" | "import" => "```sanskrit\nआयात <संकुल>::<घटक>;\n```\nImports symbols from a module or package.",
            "Dual" => "```sanskrit\nDual(primal, tangent)\n```\nDual number forward-mode automatic differentiation primitive.",
            "diff" => "```sanskrit\ndiff(func, x)\n```\nComputes first derivative of scalar function at point x via automatic differentiation.",
            "grad" => "```sanskrit\ngrad(func, x)\n```\nComputes gradient vector for multivariable scalar function.",
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
                documentation: "कार्य मुख्य(): पूर्णाङ्क { प्रत्यागम ०; }".to_string(),
                insert_text: Some(
                    "कार्य ${1:name}(${2:params}): ${3:पूर्णाङ्क} {\n    ${0}\n}".to_string(),
                ),
            },
            LspCompletionItem {
                label: "fn".to_string(),
                detail: "Function declaration (ASCII)".to_string(),
                documentation: "fn main(): i32 { return 0; }".to_string(),
                insert_text: Some("fn ${1:name}(${2:params}): ${3:i32} {\n    ${0}\n}".to_string()),
            },
            LspCompletionItem {
                label: "मान".to_string(),
                detail: "Variable binding (Devanagari)".to_string(),
                documentation: "मान क = १०;".to_string(),
                insert_text: Some("मान ${1:name} = ${2:value};".to_string()),
            },
            LspCompletionItem {
                label: "let".to_string(),
                detail: "Variable binding (ASCII)".to_string(),
                documentation: "let x = 10;".to_string(),
                insert_text: Some("let ${1:name} = ${2:value};".to_string()),
            },
            LspCompletionItem {
                label: "स्थिर".to_string(),
                detail: "Constant binding (Devanagari)".to_string(),
                documentation: "स्थिर पाई = ३.१४१५९;".to_string(),
                insert_text: Some("स्थिर ${1:NAME} = ${2:value};".to_string()),
            },
            LspCompletionItem {
                label: "const".to_string(),
                detail: "Constant binding (ASCII)".to_string(),
                documentation: "const PI = 3.14159;".to_string(),
                insert_text: Some("const ${1:NAME} = ${2:value};".to_string()),
            },
            LspCompletionItem {
                label: "दिश".to_string(),
                detail: "Tensor type (Devanagari)".to_string(),
                documentation: "दिश[दशमलव, [१२८, १२८]]".to_string(),
                insert_text: Some("दिश[${1:दशमलव}, [${2:128}, ${3:128}]]".to_string()),
            },
            LspCompletionItem {
                label: "Tensor".to_string(),
                detail: "Tensor type (ASCII)".to_string(),
                documentation: "Tensor[f32, [128, 128]]".to_string(),
                insert_text: Some("Tensor[${1:f32}, [${2:128}, ${3:128}]]".to_string()),
            },
            LspCompletionItem {
                label: "मुद्रण".to_string(),
                detail: "Print statement (Devanagari)".to_string(),
                documentation: "मुद्रण(\"नमस्ते विश्वम्!\");".to_string(),
                insert_text: Some("मुद्रण(\"${1:text}\");".to_string()),
            },
            LspCompletionItem {
                label: "print".to_string(),
                detail: "Print statement (ASCII)".to_string(),
                documentation: "print(\"Hello World!\");".to_string(),
                insert_text: Some("print(\"${1:text}\");".to_string()),
            },
            LspCompletionItem {
                label: "diff".to_string(),
                detail: "Automatic differentiation".to_string(),
                documentation: "diff(f, x)".to_string(),
                insert_text: Some("diff(${1:f}, ${2:x})".to_string()),
            },
        ]
    }

    pub fn check_document(&self, source: &str) -> Vec<DiagnosticInfo> {
        let mut diags = Vec::new();
        let mut lexer = Lexer::new(source);
        let tokens = match lexer.tokenize() {
            Ok(t) => t,
            Err(e) => {
                diags.push(DiagnosticInfo {
                    line: 0,
                    col: 0,
                    message: format!("Lexer error: {}", e),
                });
                return diags;
            }
        };

        let mut parser = Parser::new(tokens);
        let program = match parser.parse_program() {
            Ok(p) => p,
            Err(e) => {
                diags.push(DiagnosticInfo {
                    line: 0,
                    col: 0,
                    message: format!("Parser error: {}", e),
                });
                return diags;
            }
        };

        let hir = match sanskrit_hir::lower_ast_to_hir(program) {
            Ok(h) => h,
            Err(e) => {
                diags.push(DiagnosticInfo {
                    line: 0,
                    col: 0,
                    message: format!("HIR error: {}", e),
                });
                return diags;
            }
        };

        let mut tc = TypeChecker::new();
        if let Err(type_diags) = tc.check_module(&hir) {
            for td in type_diags {
                let (line, col) = if let Some(sp) = td.primary_span {
                    (
                        sp.line.saturating_sub(1) as u32,
                        sp.column.saturating_sub(1) as u32,
                    )
                } else {
                    (0, 0)
                };
                diags.push(DiagnosticInfo {
                    line,
                    col,
                    message: td.message,
                });
            }
        }

        diags
    }

    /// Runs standard JSON-RPC stdio language server
    pub fn run_stdio_server(&self) -> io::Result<()> {
        let stdin = io::stdin();
        let mut reader = BufReader::new(stdin.lock());
        let stdout = io::stdout();
        let mut writer = stdout.lock();

        loop {
            // Read headers
            let mut content_length: Option<usize> = None;
            loop {
                let mut line = String::new();
                let bytes_read = reader.read_line(&mut line)?;
                if bytes_read == 0 {
                    return Ok(()); // EOF
                }
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    break; // Header section end
                }
                if let Some(val) = trimmed.strip_prefix("Content-Length:") {
                    if let Ok(len) = val.trim().parse::<usize>() {
                        content_length = Some(len);
                    }
                }
            }

            let len = match content_length {
                Some(l) => l,
                None => continue,
            };

            // Read payload body
            let mut body_buf = vec![0u8; len];
            reader.read_exact(&mut body_buf)?;
            let body_str = match String::from_utf8(body_buf) {
                Ok(s) => s,
                Err(_) => continue,
            };

            let msg: Value = match serde_json::from_str(&body_str) {
                Ok(m) => m,
                Err(_) => continue,
            };

            let id = msg.get("id").cloned();
            let method = msg.get("method").and_then(|m| m.as_str()).unwrap_or("");

            match method {
                "initialize" => {
                    let res = json!({
                        "jsonrpc": "2.0",
                        "id": id,
                        "result": {
                            "capabilities": {
                                "textDocumentSync": 1, // Full sync
                                "hoverProvider": true,
                                "completionProvider": {
                                    "resolveProvider": false,
                                    "triggerCharacters": [".", ":", " "]
                                }
                            },
                            "serverInfo": {
                                "name": "sanskrit-lsp",
                                "version": "2.0.0-alpha.1"
                            }
                        }
                    });
                    send_lsp_response(&mut writer, &res)?;
                }
                "initialized" => {
                    // Notification, no reply needed
                }
                "textDocument/didOpen" => {
                    if let Some(params) = msg.get("params") {
                        if let Some(doc) = params.get("textDocument") {
                            let uri = doc.get("uri").and_then(|u| u.as_str()).unwrap_or("");
                            let text = doc.get("text").and_then(|t| t.as_str()).unwrap_or("");
                            let diags = self.check_document(text);
                            publish_diagnostics(&mut writer, uri, diags)?;
                        }
                    }
                }
                "textDocument/didChange" => {
                    if let Some(params) = msg.get("params") {
                        let uri = params
                            .get("textDocument")
                            .and_then(|td| td.get("uri"))
                            .and_then(|u| u.as_str())
                            .unwrap_or("");
                        if let Some(changes) =
                            params.get("contentChanges").and_then(|c| c.as_array())
                        {
                            if let Some(last) = changes.last() {
                                if let Some(text) = last.get("text").and_then(|t| t.as_str()) {
                                    let diags = self.check_document(text);
                                    publish_diagnostics(&mut writer, uri, diags)?;
                                }
                            }
                        }
                    }
                }
                "textDocument/hover" => {
                    // Provide helpful hover documentation
                    let res = json!({
                        "jsonrpc": "2.0",
                        "id": id,
                        "result": {
                            "contents": {
                                "kind": "markdown",
                                "value": "**Sanskrit Next** 2.0\nSafe, Fast, AI/ML-Native Systems Language."
                            }
                        }
                    });
                    send_lsp_response(&mut writer, &res)?;
                }
                "textDocument/completion" => {
                    let items = self.get_completions();
                    let lsp_items: Vec<Value> = items
                        .into_iter()
                        .map(|item| {
                            json!({
                                "label": item.label,
                                "detail": item.detail,
                                "documentation": {
                                    "kind": "markdown",
                                    "value": item.documentation
                                },
                                "insertText": item.insert_text.unwrap_or(item.label.clone()),
                                "insertTextFormat": 2 // Snippet
                            })
                        })
                        .collect();

                    let res = json!({
                        "jsonrpc": "2.0",
                        "id": id,
                        "result": {
                            "isIncomplete": false,
                            "items": lsp_items
                        }
                    });
                    send_lsp_response(&mut writer, &res)?;
                }
                "shutdown" => {
                    let res = json!({
                        "jsonrpc": "2.0",
                        "id": id,
                        "result": null
                    });
                    send_lsp_response(&mut writer, &res)?;
                }
                "exit" => {
                    return Ok(());
                }
                _ => {
                    if id.is_some() {
                        let res = json!({
                            "jsonrpc": "2.0",
                            "id": id,
                            "result": null
                        });
                        send_lsp_response(&mut writer, &res)?;
                    }
                }
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct DiagnosticInfo {
    pub line: u32,
    pub col: u32,
    pub message: String,
}

fn send_lsp_response<W: Write>(writer: &mut W, val: &Value) -> io::Result<()> {
    let payload = serde_json::to_string(val)?;
    write!(
        writer,
        "Content-Length: {}\r\n\r\n{}",
        payload.len(),
        payload
    )?;
    writer.flush()?;
    Ok(())
}

fn publish_diagnostics<W: Write>(
    writer: &mut W,
    uri: &str,
    diags: Vec<DiagnosticInfo>,
) -> io::Result<()> {
    let lsp_diags: Vec<Value> = diags
        .into_iter()
        .map(|d| {
            json!({
                "range": {
                    "start": { "line": d.line, "character": d.col },
                    "end": { "line": d.line, "character": d.col + 5 }
                },
                "severity": 1, // Error
                "source": "sanskrit-next",
                "message": d.message
            })
        })
        .collect();

    let notification = json!({
        "jsonrpc": "2.0",
        "method": "textDocument/publishDiagnostics",
        "params": {
            "uri": uri,
            "diagnostics": lsp_diags
        }
    });

    send_lsp_response(writer, &notification)
}
