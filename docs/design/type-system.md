# Sanskrit Next Type System Specification

This document defines the static type system, constraint resolution, and trait dispatch rules of **Sanskrit Next**.

---

## 1. Type Grammar

```
Type ::= PrimitiveType
       | TensorType
       | StructType
       | EnumType
       | TupleType
       | FunctionType
       | TraitBound

PrimitiveType ::= 'I8' | 'I16' | 'I32' | 'I64' | 'I128'
                | 'U8' | 'U16' | 'U32' | 'U64' | 'U128'
                | 'F16' | 'BF16' | 'F32' | 'F64'
                | 'Complex32' | 'Complex64'
                | 'Bool' | 'String' | 'Void'

TensorType ::= 'Tensor' '[' ElementType ',' Shape (',' Layout)? (',' Device)? ']'
Shape      ::= '[' Dimension (',' Dimension)* ']'
Layout     ::= 'RowMajor' | 'ColMajor' | 'SparseCSR'
Device     ::= 'CPU' | 'GPU' | 'NPU'
```

---

## 2. Type Inference Algorithm

The type checker utilizes local bidirectional inference:
1. **Type Synthesis (Bottom-Up)**: Expressions synthesize their types based on literal annotations or sub-expression rules.
2. **Type Checking (Top-Down)**: Function return types and explicit type declarations propagate constraints downward into expressions.
3. **No Hidden Coercion**: Narrowing conversions require explicit `.to[TargetType]()` or `cast[T](v)` calls.
