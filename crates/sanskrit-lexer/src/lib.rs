use sanskrit_diagnostics::Span;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TokenKind {
    // Keywords (Normalized from Devanagari & ASCII)
    Fn,     // कार्य / fn
    Let,    // मान / let / var
    Const,  // स्थिर / const
    Struct, // संरचना / struct
    Trait,  // लक्षण / trait
    Enum,   // गणना / enum
    Import, // आयात / import
    Export, // निर्यात / export
    If,     // यदि / if
    Else,   // अन्यथा / else
    For,    // चक्र / for / loop
    In,     // में / in
    Return, // प्रत्यागम / return
    Async,  // असमकाल / async
    Await,  // प्रतीक्षा / await
    Move,   // त्याग / move
    Mut,    // परिवर्तन / mut
    Read,   // पठन / read
    Print,  // मुद्रण / print

    // Literals
    Int(i64),
    Float(f64),
    Str(String),
    Bool(bool),
    Nil,

    // Identifiers
    Ident(String),

    // Type Identifiers (builtin)
    TypeI64,
    TypeI32,
    TypeF64,
    TypeF32,
    TypeBool,
    TypeString,
    TypeTensor,
    TypeMatrix,
    TypeVector,

    // Operators
    Plus,     // +
    Minus,    // -
    Star,     // *
    Slash,    // /
    Percent,  // %
    MatMul,   // @
    Eq,       // =
    EqEq,     // ==
    NotEq,    // !=
    Lt,       // <
    LtEq,     // <=
    Gt,       // >
    GtEq,     // >=
    Arrow,    // ->
    FatArrow, // =>
    PlusEq,   // +=
    MinusEq,  // -=
    StarEq,   // *=
    SlashEq,  // /=
    And,      // && or &
    Or,       // || or |
    Not,      // !

    // Punctuation & Delimiters
    LParen,      // (
    RParen,      // )
    LBracket,    // [
    RBracket,    // ]
    LBrace,      // {
    RBrace,      // }
    Colon,       // :
    DoubleColon, // ::
    Comma,       // ,
    Dot,         // .
    Semicolon,   // ;
    Newline,     // \n

    // End of file
    Eof,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Token {
    pub kind: TokenKind,
    pub span: Span,
    pub text: String,
}

pub struct Lexer<'a> {
    source: &'a str,
    chars: Vec<(usize, char)>,
    cursor: usize,
    line: usize,
    column: usize,
}

impl<'a> Lexer<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            chars: source.char_indices().collect(),
            cursor: 0,
            line: 1,
            column: 1,
        }
    }

    pub fn tokenize(&mut self) -> Result<Vec<Token>, String> {
        let mut tokens = Vec::new();

        while !self.is_eof() {
            self.skip_whitespace_and_comments();
            if self.is_eof() {
                break;
            }

            let start_byte = self.current_byte_pos();
            let start_line = self.line;
            let start_col = self.column;
            let ch = self.advance();

            let kind = match ch {
                '\n' => {
                    self.line += 1;
                    self.column = 1;
                    TokenKind::Newline
                }
                '+' => {
                    if self.match_char('=') {
                        TokenKind::PlusEq
                    } else {
                        TokenKind::Plus
                    }
                }
                '-' => {
                    if self.match_char('>') {
                        TokenKind::Arrow
                    } else if self.match_char('=') {
                        TokenKind::MinusEq
                    } else {
                        TokenKind::Minus
                    }
                }
                '*' => {
                    if self.match_char('=') {
                        TokenKind::StarEq
                    } else {
                        TokenKind::Star
                    }
                }
                '/' => {
                    if self.match_char('=') {
                        TokenKind::SlashEq
                    } else {
                        TokenKind::Slash
                    }
                }
                '%' => TokenKind::Percent,
                '@' => TokenKind::MatMul,
                '=' => {
                    if self.match_char('=') {
                        TokenKind::EqEq
                    } else if self.match_char('>') {
                        TokenKind::FatArrow
                    } else {
                        TokenKind::Eq
                    }
                }
                '!' => {
                    if self.match_char('=') {
                        TokenKind::NotEq
                    } else {
                        TokenKind::Not
                    }
                }
                '<' => {
                    if self.match_char('=') {
                        TokenKind::LtEq
                    } else {
                        TokenKind::Lt
                    }
                }
                '>' => {
                    if self.match_char('=') {
                        TokenKind::GtEq
                    } else {
                        TokenKind::Gt
                    }
                }
                '&' => {
                    self.match_char('&');
                    TokenKind::And
                }
                '|' => {
                    self.match_char('|');
                    TokenKind::Or
                }
                '(' => TokenKind::LParen,
                ')' => TokenKind::RParen,
                '[' => TokenKind::LBracket,
                ']' => TokenKind::RBracket,
                '{' => TokenKind::LBrace,
                '}' => TokenKind::RBrace,
                ':' => {
                    if self.match_char(':') {
                        TokenKind::DoubleColon
                    } else {
                        TokenKind::Colon
                    }
                }
                ',' => TokenKind::Comma,
                '.' => TokenKind::Dot,
                ';' => TokenKind::Semicolon,
                '"' | '\'' => self.lex_string(ch, start_line, start_col)?,
                c if c.is_ascii_digit() || is_devanagari_digit(c) => {
                    self.lex_number(c, start_byte)?
                }
                c if is_ident_start(c) => self.lex_ident(c, start_byte),
                other => {
                    return Err(format!(
                        "Unexpected character '{}' at line {}, column {}",
                        other, start_line, start_col
                    ))
                }
            };

            let end_byte = self.current_byte_pos();
            let text = self.source[start_byte..end_byte].to_string();
            let span = Span::new(start_byte, end_byte, start_line, start_col);

            tokens.push(Token { kind, span, text });
        }

        let eof_pos = self.source.len();
        tokens.push(Token {
            kind: TokenKind::Eof,
            span: Span::new(eof_pos, eof_pos, self.line, self.column),
            text: String::new(),
        });

        Ok(tokens)
    }

    fn skip_whitespace_and_comments(&mut self) {
        while !self.is_eof() {
            let (_, ch) = self.chars[self.cursor];
            if ch == ' ' || ch == '\t' || ch == '\r' {
                self.advance();
            } else if ch == '/' && self.peek() == Some('/') {
                // Line comment
                while !self.is_eof() && self.peek_curr() != Some('\n') {
                    self.advance();
                }
            } else if ch == '#' {
                // Shell/Python-style comment
                while !self.is_eof() && self.peek_curr() != Some('\n') {
                    self.advance();
                }
            } else {
                break;
            }
        }
    }

    fn lex_string(
        &mut self,
        quote: char,
        start_line: usize,
        start_col: usize,
    ) -> Result<TokenKind, String> {
        let mut s = String::new();
        while !self.is_eof() {
            let ch = self.advance();
            if ch == quote {
                return Ok(TokenKind::Str(s));
            } else if ch == '\\' && !self.is_eof() {
                let esc = self.advance();
                match esc {
                    'n' => s.push('\n'),
                    't' => s.push('\t'),
                    'r' => s.push('\r'),
                    '\\' => s.push('\\'),
                    '\'' => s.push('\''),
                    '"' => s.push('"'),
                    other => s.push(other),
                }
            } else {
                if ch == '\n' {
                    self.line += 1;
                    self.column = 1;
                }
                s.push(ch);
            }
        }
        Err(format!(
            "Unterminated string literal starting at line {}, column {}",
            start_line, start_col
        ))
    }

    fn lex_number(&mut self, _first: char, start_byte: usize) -> Result<TokenKind, String> {
        let mut is_float = false;

        while !self.is_eof() {
            if let Some(ch) = self.peek_curr() {
                if ch.is_ascii_digit() || is_devanagari_digit(ch) || ch == '_' {
                    self.advance();
                } else if ch == '.'
                    && !is_float
                    && self
                        .peek()
                        .map(|c| c.is_ascii_digit() || is_devanagari_digit(c))
                        .unwrap_or(false)
                {
                    is_float = true;
                    self.advance();
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        // Check for typed suffixes like _f32, _i64, etc.
        if self.peek_curr() == Some('_') {
            self.advance();
            while !self.is_eof()
                && self
                    .peek_curr()
                    .map(|c| c.is_ascii_alphanumeric())
                    .unwrap_or(false)
            {
                self.advance();
            }
        }

        let end_byte = self.current_byte_pos();
        let raw = &self.source[start_byte..end_byte];
        let cleaned: String = raw
            .chars()
            .take_while(|&c| c != '_')
            .map(normalize_digit)
            .collect();

        if is_float {
            let val: f64 = cleaned
                .parse()
                .map_err(|e| format!("Invalid float literal '{}': {}", raw, e))?;
            Ok(TokenKind::Float(val))
        } else {
            let val: i64 = cleaned
                .parse()
                .map_err(|e| format!("Invalid integer literal '{}': {}", raw, e))?;
            Ok(TokenKind::Int(val))
        }
    }

    fn lex_ident(&mut self, _first: char, start_byte: usize) -> TokenKind {
        while !self.is_eof() {
            if let Some(ch) = self.peek_curr() {
                if is_ident_continue(ch) {
                    self.advance();
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        let end_byte = self.current_byte_pos();
        let text = &self.source[start_byte..end_byte];

        // Match Dual-Script Keywords
        match text {
            "कार्य" | "fn" => TokenKind::Fn,
            "मान" | "let" | "var" => TokenKind::Let,
            "स्थिर" | "const" => TokenKind::Const,
            "संरचना" | "struct" => TokenKind::Struct,
            "लक्षण" | "trait" => TokenKind::Trait,
            "गणना" | "enum" => TokenKind::Enum,
            "आयात" | "import" => TokenKind::Import,
            "निर्यात" | "export" => TokenKind::Export,
            "यदि" | "if" => TokenKind::If,
            "अन्यथा" | "else" => TokenKind::Else,
            "चक्र" | "for" | "loop" => TokenKind::For,
            "में" | "in" => TokenKind::In,
            "प्रत्यागम" | "return" => TokenKind::Return,
            "असमकाल" | "async" => TokenKind::Async,
            "प्रतीक्षा" | "await" => TokenKind::Await,
            "त्याग" | "move" => TokenKind::Move,
            "परिवर्तन" | "mut" => TokenKind::Mut,
            "पठन" | "read" => TokenKind::Read,
            "मुद्रण" | "print" => TokenKind::Print,

            "सत्य" | "true" => TokenKind::Bool(true),
            "असत्य" | "false" => TokenKind::Bool(false),
            "शून्य" | "nil" | "null" => TokenKind::Nil,

            "पूर्णाङ्क६४" | "I64" | "i64" => TokenKind::TypeI64,
            "पूर्णाङ्क३२" | "I32" | "i32" => TokenKind::TypeI32,
            "दशमलव६४" | "F64" | "f64" => TokenKind::TypeF64,
            "दशमलव३२" | "F32" | "f32" => TokenKind::TypeF32,
            "तर्क" | "Bool" | "bool" => TokenKind::TypeBool,
            "सूत्र" | "String" | "string" => TokenKind::TypeString,
            "दिश" | "Tensor" => TokenKind::TypeTensor,
            "आव्यूह" | "Matrix" => TokenKind::TypeMatrix,
            "सदिश" | "Vector" => TokenKind::TypeVector,

            other => TokenKind::Ident(other.to_string()),
        }
    }

    fn is_eof(&self) -> bool {
        self.cursor >= self.chars.len()
    }

    fn advance(&mut self) -> char {
        let (_, ch) = self.chars[self.cursor];
        self.cursor += 1;
        self.column += 1;
        ch
    }

    fn match_char(&mut self, expected: char) -> bool {
        if self.is_eof() {
            return false;
        }
        if self.chars[self.cursor].1 == expected {
            self.advance();
            true
        } else {
            false
        }
    }

    fn peek_curr(&self) -> Option<char> {
        if self.is_eof() {
            None
        } else {
            Some(self.chars[self.cursor].1)
        }
    }

    fn peek(&self) -> Option<char> {
        if self.cursor + 1 < self.chars.len() {
            Some(self.chars[self.cursor + 1].1)
        } else {
            None
        }
    }

    fn current_byte_pos(&self) -> usize {
        if self.is_eof() {
            self.source.len()
        } else {
            self.chars[self.cursor].0
        }
    }
}

fn is_devanagari_digit(c: char) -> bool {
    matches!(c, '०'..='९')
}

fn normalize_digit(c: char) -> char {
    match c {
        '०' => '0',
        '१' => '1',
        '२' => '2',
        '३' => '3',
        '४' => '4',
        '५' => '5',
        '६' => '6',
        '७' => '7',
        '८' => '8',
        '९' => '9',
        other => other,
    }
}

fn is_ident_start(c: char) -> bool {
    c.is_alphabetic() || c == '_' || is_devanagari(c)
}

fn is_ident_continue(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || is_devanagari(c)
}

fn is_devanagari(c: char) -> bool {
    // Unicode Devanagari block: U+0900 - U+097F
    matches!(c, '\u{0900}'..='\u{097F}')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dual_script_tokenization() {
        let devanagari_src = "कार्य योग(क, ख): प्रत्यागम क + ख";
        let mut lexer1 = Lexer::new(devanagari_src);
        let tokens1 = lexer1.tokenize().unwrap();

        let ascii_src = "fn add(a, b): return a + b";
        let mut lexer2 = Lexer::new(ascii_src);
        let tokens2 = lexer2.tokenize().unwrap();

        assert_eq!(tokens1[0].kind, TokenKind::Fn);
        assert_eq!(tokens2[0].kind, TokenKind::Fn);

        assert_eq!(tokens1[7].kind, TokenKind::Colon);
        assert_eq!(tokens2[7].kind, TokenKind::Colon);

        assert_eq!(tokens1[8].kind, TokenKind::Return);
        assert_eq!(tokens2[8].kind, TokenKind::Return);

        assert_eq!(tokens1[10].kind, TokenKind::Plus);
        assert_eq!(tokens2[10].kind, TokenKind::Plus);
    }

    #[test]
    fn test_tensor_tokens() {
        let src = "मान A = tensor.ones([1024, 1024])\nमान C = A @ B";
        let mut lexer = Lexer::new(src);
        let tokens = lexer.tokenize().unwrap();
        assert!(tokens.iter().any(|t| t.kind == TokenKind::MatMul));
    }
}
