# RFC 0002: Dual-Script Syntax Specification

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Syntax & Lexical Structure

---

## 1. Problem
For a Sanskrit programming language to be globally usable in research, education, and industry, it cannot impose a barrier to entry on developers without Devanagari input methods. Simultaneously, it must not strip away its cultural, etymological, and grammatical roots.

## 2. Goals
- Define a unified grammatical syntax where Devanagari and ASCII keywords map to identical AST nodes.
- Provide clean, modern syntax combining the readability of Python/Mojo with the precision of Rust/Swift.
- Support first-class tensor slicing, broadcasting, pattern matching, and closure expressions.

## 3. Non-Goals
- Preserving non-standard prototype constructs (`वद`, `यदा_तदा`).

## 4. Alternatives Considered
- **Strict Devanagari only**: Limits developer adoption and CI/CD integration in non-Unicode terminal environments.
- **ASCII only**: Destroys the cultural and linguistic mission of the Sanskrit language.

## 5. Decision
Support **Dual-Script Invariance**:
```sanskrit
// Canonical Devanagari
कार्य योग(a: पूर्णाङ्क६४, b: पूर्णाङ्क६४) -> पूर्णाङ्क६४:
    प्रत्यागम a + b

// Canonical ASCII Alias
fn add(a: I64, b: I64) -> I64:
    return a + b
```

## 6. Syntax Grammar Specification
```ebnf
Program         ::= (Item)* ;
Item            ::= FunctionDef | StructDef | TraitDef | EnumDef | ImportStmt ;
FunctionDef     ::= ("कार्य" | "fn") IDENT ("[" Generics "]")? "(" Params? ")" ("->" Type)? ":" Block ;
StructDef       ::= ("संरचना" | "struct") IDENT ":" Indent (FieldDef)* Dedent ;
LetBinding      ::= ("मान" | "let") IDENT (":" Type)? ("=" Expr)? ;
ConstBinding    ::= ("स्थिर" | "const") IDENT (":" Type)? "=" Expr ;
IfExpr          ::= ("यदि" | "if") Expr ":" Block (("अन्यथा यदि" | "else if") Expr ":" Block)* (("अन्यथा" | "else") ":" Block)? ;
ReturnStmt      ::= ("प्रत्यागम" | "return") Expr? ;
TensorLiteral   ::= "[" Expr ("," Expr)* "]" | "tensor" "." ("zeros" | "ones" | "randn") "(" Shape ")" ;
```

## 7. Compiler Consequences
The lexer normalizes keyword tokens into internal enums (`TokenKind::Fn`, `TokenKind::Let`, `TokenKind::Struct`). The parser is completely script-agnostic.

## 8. Developer Experience (DX) Consequences
Developers can format code back and forth or choose their preferred visual presentation using the `sanskrit fmt --script devanagari|ascii` command.

## 9. Performance Consequences
Zero runtime cost. Token normalization occurs at compile-time during tokenization.

## 10. Migration Consequences
Legacy scripts are translated via `sanskrit migrate`.
