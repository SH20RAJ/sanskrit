use sanskrit_ast::*;
use sanskrit_diagnostics::Span;
use sanskrit_lexer::{Token, TokenKind};

pub struct Parser {
    tokens: Vec<Token>,
    cursor: usize,
}

#[derive(Debug, PartialEq, PartialOrd)]
enum Precedence {
    Lowest,
    Or,
    And,
    Equality,   // == !=
    Comparison, // < <= > >=
    Term,       // + -
    Factor,     // * / % @
    Unary,      // - !
    Call,       // . () []
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self { tokens, cursor: 0 }
    }

    pub fn parse_program(&mut self) -> Result<Program, String> {
        let mut items = Vec::new();
        let start_span = self.peek_span();

        while !self.is_eof() {
            self.skip_newlines_and_semicolons();
            if self.is_eof() {
                break;
            }

            let item = self.parse_item()?;
            items.push(item);
        }

        let end_span = self.peek_span();
        Ok(Program {
            items,
            span: start_span.merge(&end_span),
        })
    }

    fn parse_item(&mut self) -> Result<Item, String> {
        match self.peek_kind() {
            TokenKind::Fn => self.parse_function().map(Item::Function),
            TokenKind::Struct => self.parse_struct().map(Item::Struct),
            TokenKind::Import => self.parse_import().map(Item::Import),
            _ => self.parse_stmt().map(Item::Stmt),
        }
    }

    fn parse_function(&mut self) -> Result<FunctionDef, String> {
        let fn_tok = self.consume(TokenKind::Fn, "Expected 'कार्य' or 'fn'")?;
        let name_tok = self.consume_ident("Expected function name")?;
        let name = name_tok.text;

        self.consume(TokenKind::LParen, "Expected '(' after function name")?;
        let mut params = Vec::new();
        if self.peek_kind() != TokenKind::RParen {
            loop {
                let p_tok = self.consume_ident("Expected parameter name")?;
                let p_span = p_tok.span;
                let mut ty = None;

                if self.match_kind(TokenKind::Colon) {
                    ty = Some(self.parse_type_annotation()?);
                }

                params.push(Param {
                    name: p_tok.text,
                    ty,
                    span: p_span,
                });

                if !self.match_kind(TokenKind::Comma) {
                    break;
                }
            }
        }
        self.consume(TokenKind::RParen, "Expected ')' after parameters")?;

        let mut return_type = None;
        if self.match_kind(TokenKind::Arrow) {
            return_type = Some(self.parse_type_annotation()?);
        }

        self.consume(TokenKind::Colon, "Expected ':' before function body")?;
        let body = self.parse_block()?;

        let end_span = body.last().map(|s| s.span()).unwrap_or(fn_tok.span);

        Ok(FunctionDef {
            name,
            params,
            return_type,
            body,
            is_async: false,
            span: fn_tok.span.merge(&end_span),
        })
    }

    fn parse_struct(&mut self) -> Result<StructDef, String> {
        let st_tok = self.consume(TokenKind::Struct, "Expected 'संरचना' or 'struct'")?;
        let name_tok = self.consume_ident("Expected struct name")?;
        self.consume(TokenKind::Colon, "Expected ':' after struct name")?;

        let mut fields = Vec::new();
        self.skip_newlines_and_semicolons();

        // Optional { } or indent block
        let has_brace = self.match_kind(TokenKind::LBrace);

        while !self.is_eof() {
            self.skip_newlines_and_semicolons();
            if has_brace && self.peek_kind() == TokenKind::RBrace {
                self.advance();
                break;
            }
            if !has_brace
                && (self.peek_kind() == TokenKind::Fn
                    || self.peek_kind() == TokenKind::Struct
                    || self.peek_kind() == TokenKind::Eof)
            {
                break;
            }

            let field_tok = match self.peek_kind() {
                TokenKind::Ident(_) => self.advance(),
                _ => break,
            };

            self.consume(TokenKind::Colon, "Expected ':' after field name")?;
            let ty = self.parse_type_annotation()?;
            let span = field_tok.span;

            fields.push(FieldDef {
                name: field_tok.text,
                ty,
                span,
            });

            self.match_kind(TokenKind::Comma);
            self.skip_newlines_and_semicolons();
        }

        Ok(StructDef {
            name: name_tok.text,
            fields,
            span: st_tok.span,
        })
    }

    fn parse_import(&mut self) -> Result<ImportDef, String> {
        let imp_tok = self.consume(TokenKind::Import, "Expected 'आयात' or 'import'")?;
        let mut path = Vec::new();
        let first = self.consume_ident("Expected module path")?;
        path.push(first.text);

        while self.match_kind(TokenKind::Dot) {
            let seg = self.consume_ident("Expected module segment")?;
            path.push(seg.text);
        }

        Ok(ImportDef {
            path,
            span: imp_tok.span,
        })
    }

    fn parse_type_annotation(&mut self) -> Result<TypeAnnotation, String> {
        match self.advance().kind {
            TokenKind::TypeI64 => Ok(TypeAnnotation::I64),
            TokenKind::TypeI32 => Ok(TypeAnnotation::I32),
            TokenKind::TypeF64 => Ok(TypeAnnotation::F64),
            TokenKind::TypeF32 => Ok(TypeAnnotation::F32),
            TokenKind::TypeBool => Ok(TypeAnnotation::Bool),
            TokenKind::TypeString => Ok(TypeAnnotation::String),
            TokenKind::TypeTensor | TokenKind::TypeMatrix | TokenKind::TypeVector => {
                let mut elem = Box::new(TypeAnnotation::F32);
                let mut shape = None;

                if self.match_kind(TokenKind::LBracket) {
                    elem = Box::new(self.parse_type_annotation()?);
                    if self.match_kind(TokenKind::Comma) {
                        // Shape dimensions
                        if self.match_kind(TokenKind::LBracket) {
                            let mut dims = Vec::new();
                            while !self.match_kind(TokenKind::RBracket) {
                                if let TokenKind::Int(val) = self.peek_kind() {
                                    self.advance();
                                    dims.push(val as usize);
                                }
                                self.match_kind(TokenKind::Comma);
                            }
                            shape = Some(dims);
                        }
                    }
                    self.consume(TokenKind::RBracket, "Expected ']' after Tensor parameters")?;
                }

                Ok(TypeAnnotation::Tensor { elem, shape })
            }
            TokenKind::Ident(name) => Ok(TypeAnnotation::Custom(name)),
            other => Err(format!("Unexpected token in type annotation: {:?}", other)),
        }
    }

    fn parse_block(&mut self) -> Result<Vec<Stmt>, String> {
        let mut stmts = Vec::new();
        self.skip_newlines_and_semicolons();

        let has_brace = self.match_kind(TokenKind::LBrace);

        while !self.is_eof() {
            self.skip_newlines_and_semicolons();
            if has_brace && self.peek_kind() == TokenKind::RBrace {
                self.advance();
                break;
            }
            if !has_brace
                && (self.peek_kind() == TokenKind::Fn
                    || self.peek_kind() == TokenKind::Struct
                    || self.peek_kind() == TokenKind::Else
                    || self.peek_kind() == TokenKind::Eof)
            {
                break;
            }

            let stmt = self.parse_stmt()?;
            stmts.push(stmt);

            if !has_brace
                && (self.peek_kind() == TokenKind::Fn
                    || self.peek_kind() == TokenKind::Struct
                    || self.peek_kind() == TokenKind::Else)
            {
                break;
            }
        }

        Ok(stmts)
    }

    fn parse_stmt(&mut self) -> Result<Stmt, String> {
        self.skip_newlines_and_semicolons();

        match self.peek_kind() {
            TokenKind::Let => {
                let let_tok = self.advance();
                let name_tok = self.consume_ident("Expected variable name after 'मान'/'let'")?;
                let mut ty = None;
                if self.match_kind(TokenKind::Colon) {
                    ty = Some(self.parse_type_annotation()?);
                }
                let mut init = None;
                if self.match_kind(TokenKind::Eq) {
                    init = Some(self.parse_expr(Precedence::Lowest)?);
                }
                let span = let_tok.span.merge(&self.peek_span());
                Ok(Stmt::Let {
                    name: name_tok.text,
                    ty,
                    init,
                    span,
                })
            }
            TokenKind::Const => {
                let c_tok = self.advance();
                let name_tok = self.consume_ident("Expected constant name after 'स्थिर'/'const'")?;
                let mut ty = None;
                if self.match_kind(TokenKind::Colon) {
                    ty = Some(self.parse_type_annotation()?);
                }
                self.consume(TokenKind::Eq, "Expected '=' after constant name")?;
                let value = self.parse_expr(Precedence::Lowest)?;
                let span = c_tok.span.merge(&value.span());
                Ok(Stmt::Const {
                    name: name_tok.text,
                    ty,
                    value,
                    span,
                })
            }
            TokenKind::If => {
                let if_tok = self.advance();
                let cond = self.parse_expr(Precedence::Lowest)?;
                self.consume(TokenKind::Colon, "Expected ':' after if condition")?;
                let then_branch = self.parse_block()?;
                let mut else_branch = None;

                self.skip_newlines_and_semicolons();
                if self.match_kind(TokenKind::Else) {
                    if self.peek_kind() == TokenKind::If {
                        // Else-if handled by nested parse_stmt
                        let nested_if = self.parse_stmt()?;
                        else_branch = Some(vec![nested_if]);
                    } else {
                        self.consume(TokenKind::Colon, "Expected ':' after 'अन्यथा'/'else'")?;
                        else_branch = Some(self.parse_block()?);
                    }
                }

                let span = if_tok.span;
                Ok(Stmt::If {
                    cond,
                    then_branch,
                    else_branch,
                    span,
                })
            }
            TokenKind::For => {
                let for_tok = self.advance();
                let var_tok = self.consume_ident("Expected loop variable name")?;
                self.consume(TokenKind::In, "Expected 'में' or 'in' in loop")?;
                let iterable = self.parse_expr(Precedence::Lowest)?;
                self.consume(TokenKind::Colon, "Expected ':' after loop header")?;
                let body = self.parse_block()?;
                let span = for_tok.span;
                Ok(Stmt::For {
                    var: var_tok.text,
                    iterable,
                    body,
                    span,
                })
            }
            TokenKind::Return => {
                let ret_tok = self.advance();
                let mut val = None;
                if self.peek_kind() != TokenKind::Newline
                    && self.peek_kind() != TokenKind::Semicolon
                    && !self.is_eof()
                {
                    val = Some(self.parse_expr(Precedence::Lowest)?);
                }
                let span = ret_tok.span;
                Ok(Stmt::Return { value: val, span })
            }
            TokenKind::Print => {
                let p_tok = self.advance();
                self.consume(TokenKind::LParen, "Expected '(' after print")?;
                let mut args = Vec::new();
                if self.peek_kind() != TokenKind::RParen {
                    loop {
                        args.push(self.parse_expr(Precedence::Lowest)?);
                        if !self.match_kind(TokenKind::Comma) {
                            break;
                        }
                    }
                }
                self.consume(TokenKind::RParen, "Expected ')' after print arguments")?;
                let span = p_tok.span;
                Ok(Stmt::Print { args, span })
            }
            _ => {
                // Check if assignment `target = expr`
                if let TokenKind::Ident(id) = self.peek_kind() {
                    if self.peek_ahead(1) == Some(TokenKind::Eq) {
                        let id_tok = self.advance();
                        self.advance(); // consume '='
                        let val = self.parse_expr(Precedence::Lowest)?;
                        let span = id_tok.span.merge(&val.span());
                        return Ok(Stmt::Assign {
                            target: id,
                            value: val,
                            span,
                        });
                    }
                }

                let expr = self.parse_expr(Precedence::Lowest)?;
                Ok(Stmt::Expr(expr))
            }
        }
    }

    fn parse_expr(&mut self, precedence: Precedence) -> Result<Expr, String> {
        let mut lhs = self.parse_prefix()?;

        while !self.is_eof() {
            let next_prec = self.current_precedence();
            if precedence >= next_prec {
                break;
            }
            lhs = self.parse_infix(lhs)?;
        }

        Ok(lhs)
    }

    fn parse_prefix(&mut self) -> Result<Expr, String> {
        let tok = self.advance();
        match tok.kind {
            TokenKind::Int(v) => Ok(Expr::Int(v, tok.span)),
            TokenKind::Float(v) => Ok(Expr::Float(v, tok.span)),
            TokenKind::Str(s) => Ok(Expr::Str(s, tok.span)),
            TokenKind::Bool(b) => Ok(Expr::Bool(b, tok.span)),
            TokenKind::Nil => Ok(Expr::Nil(tok.span)),
            TokenKind::Ident(name) => {
                // Check for tensor constructor: tensor.zeros(...), tensor.ones(...)
                if (name == "tensor" || name == "दिश") && self.peek_kind() == TokenKind::Dot {
                    self.advance(); // consume '.'
                    let kind_tok =
                        self.consume_ident("Expected constructor name (zeros, ones, randn)")?;
                    self.consume(TokenKind::LParen, "Expected '('")?;

                    let mut shape = Vec::new();
                    if self.match_kind(TokenKind::LBracket) {
                        while !self.match_kind(TokenKind::RBracket) {
                            if let TokenKind::Int(dim) = self.peek_kind() {
                                self.advance();
                                shape.push(dim as usize);
                            }
                            self.match_kind(TokenKind::Comma);
                        }
                    }

                    let mut dtype = None;
                    if self.match_kind(TokenKind::Comma) {
                        if let TokenKind::Ident(k) = self.peek_kind() {
                            if k == "dtype" {
                                self.advance();
                                self.consume(TokenKind::Eq, "Expected '=' after dtype")?;
                                let dt_tok = self.advance();
                                dtype = Some(dt_tok.text);
                            }
                        }
                    }

                    self.consume(TokenKind::RParen, "Expected ')'")?;
                    return Ok(Expr::TensorConstructor {
                        kind: kind_tok.text,
                        shape,
                        dtype,
                        span: tok.span.merge(&self.peek_span()),
                    });
                }

                Ok(Expr::Ident(name, tok.span))
            }
            TokenKind::Minus => {
                let operand = self.parse_expr(Precedence::Unary)?;
                let span = tok.span.merge(&operand.span());
                Ok(Expr::Unary {
                    op: UnaryOp::Neg,
                    operand: Box::new(operand),
                    span,
                })
            }
            TokenKind::Not => {
                let operand = self.parse_expr(Precedence::Unary)?;
                let span = tok.span.merge(&operand.span());
                Ok(Expr::Unary {
                    op: UnaryOp::Not,
                    operand: Box::new(operand),
                    span,
                })
            }
            TokenKind::LParen => {
                let expr = self.parse_expr(Precedence::Lowest)?;
                self.consume(TokenKind::RParen, "Expected ')'")?;
                Ok(expr)
            }
            TokenKind::LBracket => {
                // Tensor / Array Literal [1, 2, 3]
                let mut elements = Vec::new();
                if self.peek_kind() != TokenKind::RBracket {
                    loop {
                        elements.push(self.parse_expr(Precedence::Lowest)?);
                        if !self.match_kind(TokenKind::Comma) {
                            break;
                        }
                    }
                }
                let end_tok = self.consume(TokenKind::RBracket, "Expected ']'")?;
                Ok(Expr::TensorLit {
                    elements,
                    span: tok.span.merge(&end_tok.span),
                })
            }
            other => Err(format!(
                "Unexpected prefix token in expression: {:?}",
                other
            )),
        }
    }

    fn parse_infix(&mut self, lhs: Expr) -> Result<Expr, String> {
        let op_tok = self.advance();
        let (op, prec) = match op_tok.kind {
            TokenKind::Plus => (BinaryOp::Add, Precedence::Term),
            TokenKind::Minus => (BinaryOp::Sub, Precedence::Term),
            TokenKind::Star => (BinaryOp::Mul, Precedence::Factor),
            TokenKind::Slash => (BinaryOp::Div, Precedence::Factor),
            TokenKind::Percent => (BinaryOp::Mod, Precedence::Factor),
            TokenKind::MatMul => (BinaryOp::MatMul, Precedence::Factor),
            TokenKind::EqEq => (BinaryOp::Eq, Precedence::Equality),
            TokenKind::NotEq => (BinaryOp::NotEq, Precedence::Equality),
            TokenKind::Lt => (BinaryOp::Lt, Precedence::Comparison),
            TokenKind::LtEq => (BinaryOp::LtEq, Precedence::Comparison),
            TokenKind::Gt => (BinaryOp::Gt, Precedence::Comparison),
            TokenKind::GtEq => (BinaryOp::GtEq, Precedence::Comparison),
            TokenKind::And => (BinaryOp::And, Precedence::And),
            TokenKind::Or => (BinaryOp::Or, Precedence::Or),

            TokenKind::LParen => {
                // Function call
                let mut args = Vec::new();
                if self.peek_kind() != TokenKind::RParen {
                    loop {
                        args.push(self.parse_expr(Precedence::Lowest)?);
                        if !self.match_kind(TokenKind::Comma) {
                            break;
                        }
                    }
                }
                let end_tok =
                    self.consume(TokenKind::RParen, "Expected ')' after call arguments")?;
                let span = lhs.span().merge(&end_tok.span);
                return Ok(Expr::Call {
                    callee: Box::new(lhs),
                    args,
                    span,
                });
            }

            TokenKind::LBracket => {
                // Index or Slice: a[i] or a[start:stop:step]
                let mut start = None;
                let mut stop = None;
                let mut step = None;

                if self.peek_kind() == TokenKind::Colon {
                    self.advance(); // consume ':'
                    if self.peek_kind() != TokenKind::Colon
                        && self.peek_kind() != TokenKind::RBracket
                    {
                        stop = Some(Box::new(self.parse_expr(Precedence::Lowest)?));
                    }
                    if self.match_kind(TokenKind::Colon) && self.peek_kind() != TokenKind::RBracket
                    {
                        step = Some(Box::new(self.parse_expr(Precedence::Lowest)?));
                    }
                } else {
                    let first_expr = self.parse_expr(Precedence::Lowest)?;
                    if self.match_kind(TokenKind::Colon) {
                        start = Some(Box::new(first_expr));
                        if self.peek_kind() != TokenKind::Colon
                            && self.peek_kind() != TokenKind::RBracket
                        {
                            stop = Some(Box::new(self.parse_expr(Precedence::Lowest)?));
                        }
                        if self.match_kind(TokenKind::Colon)
                            && self.peek_kind() != TokenKind::RBracket
                        {
                            step = Some(Box::new(self.parse_expr(Precedence::Lowest)?));
                        }
                    } else {
                        let end_tok = self.consume(TokenKind::RBracket, "Expected ']'")?;
                        let span = lhs.span().merge(&end_tok.span);
                        return Ok(Expr::Index {
                            target: Box::new(lhs),
                            index: Box::new(first_expr),
                            span,
                        });
                    }
                }

                let end_tok = self.consume(TokenKind::RBracket, "Expected ']'")?;
                let span = lhs.span().merge(&end_tok.span);
                return Ok(Expr::Slice {
                    target: Box::new(lhs),
                    start,
                    stop,
                    step,
                    span,
                });
            }

            other => return Err(format!("Unexpected infix token: {:?}", other)),
        };

        let rhs = self.parse_expr(prec)?;
        let span = lhs.span().merge(&rhs.span());
        Ok(Expr::Binary {
            op,
            lhs: Box::new(lhs),
            rhs: Box::new(rhs),
            span,
        })
    }

    fn current_precedence(&self) -> Precedence {
        match self.peek_kind() {
            TokenKind::Or => Precedence::Or,
            TokenKind::And => Precedence::And,
            TokenKind::EqEq | TokenKind::NotEq => Precedence::Equality,
            TokenKind::Lt | TokenKind::LtEq | TokenKind::Gt | TokenKind::GtEq => {
                Precedence::Comparison
            }
            TokenKind::Plus | TokenKind::Minus => Precedence::Term,
            TokenKind::Star | TokenKind::Slash | TokenKind::Percent | TokenKind::MatMul => {
                Precedence::Factor
            }
            TokenKind::LParen | TokenKind::LBracket => Precedence::Call,
            _ => Precedence::Lowest,
        }
    }

    fn skip_newlines_and_semicolons(&mut self) {
        while !self.is_eof() {
            match self.peek_kind() {
                TokenKind::Newline | TokenKind::Semicolon => {
                    self.advance();
                }
                _ => break,
            }
        }
    }

    fn is_eof(&self) -> bool {
        self.cursor >= self.tokens.len() || self.tokens[self.cursor].kind == TokenKind::Eof
    }

    fn advance(&mut self) -> Token {
        let tok = self.tokens[self.cursor].clone();
        if self.cursor < self.tokens.len() {
            self.cursor += 1;
        }
        tok
    }

    fn peek_kind(&self) -> TokenKind {
        if self.cursor < self.tokens.len() {
            self.tokens[self.cursor].kind.clone()
        } else {
            TokenKind::Eof
        }
    }

    fn peek_ahead(&self, n: usize) -> Option<TokenKind> {
        if self.cursor + n < self.tokens.len() {
            Some(self.tokens[self.cursor + n].kind.clone())
        } else {
            None
        }
    }

    fn peek_span(&self) -> Span {
        if self.cursor < self.tokens.len() {
            self.tokens[self.cursor].span
        } else {
            Span::dummy()
        }
    }

    fn match_kind(&mut self, kind: TokenKind) -> bool {
        if self.peek_kind() == kind {
            self.advance();
            true
        } else {
            false
        }
    }

    fn consume(&mut self, kind: TokenKind, err: &str) -> Result<Token, String> {
        if self.peek_kind() == kind {
            Ok(self.advance())
        } else {
            Err(format!(
                "{} (found {:?} at {:?})",
                err,
                self.peek_kind(),
                self.peek_span()
            ))
        }
    }

    fn consume_ident(&mut self, err: &str) -> Result<Token, String> {
        match self.peek_kind() {
            TokenKind::Ident(_) => Ok(self.advance()),
            other => Err(format!(
                "{} (found {:?} at {:?})",
                err,
                other,
                self.peek_span()
            )),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sanskrit_lexer::Lexer;

    #[test]
    fn test_parse_dual_script_function() {
        let src = "कार्य मुख्य():\n    मान x = 42\n    मुद्रण(x)";
        let mut lexer = Lexer::new(src);
        let tokens = lexer.tokenize().unwrap();
        let mut parser = Parser::new(tokens);
        let prog = parser.parse_program().unwrap();

        assert_eq!(prog.items.len(), 1);
        if let Item::Function(f) = &prog.items[0] {
            assert_eq!(f.name, "मुख्य");
            assert_eq!(f.body.len(), 2);
        } else {
            panic!("Expected function item");
        }
    }

    #[test]
    fn test_parse_tensor_matmul() {
        let src = "fn main():\n    let A = tensor.ones([1024, 1024])\n    let B = tensor.ones([1024, 1024])\n    let C = A @ B";
        let mut lexer = Lexer::new(src);
        let tokens = lexer.tokenize().unwrap();
        let mut parser = Parser::new(tokens);
        let prog = parser.parse_program().unwrap();

        assert_eq!(prog.items.len(), 1);
    }
}
