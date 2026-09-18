use sanskrit_ast::*;
use sanskrit_tensor::Tensor;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum OpCode {
    Constant = 1,
    Nil = 2,
    True = 3,
    False = 4,
    Pop = 5,

    GetLocal = 6,
    SetLocal = 7,
    GetGlobal = 8,
    SetGlobal = 9,

    Add = 10,
    Sub = 11,
    Mul = 12,
    Div = 13,
    Mod = 14,
    MatMul = 15, // @

    Equal = 16,
    Greater = 17,
    Less = 18,
    Not = 19,
    Negate = 20,

    Print = 21,
    Jump = 22,
    JumpIfFalse = 23,
    Loop = 24,

    Call = 25,
    Return = 26,

    TensorAlloc = 27,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Value {
    Nil,
    Bool(bool),
    Int(i64),
    Float(f64),
    Str(String),
    Tensor(Tensor<f64>),
}

impl std::fmt::Display for Value {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Value::Nil => write!(f, "nil"),
            Value::Bool(b) => write!(f, "{}", b),
            Value::Int(i) => write!(f, "{}", i),
            Value::Float(v) => write!(f, "{}", v),
            Value::Str(s) => write!(f, "{}", s),
            Value::Tensor(t) => write!(f, "Tensor(shape={:?})", t.shape),
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Chunk {
    pub code: Vec<u8>,
    pub constants: Vec<Value>,
    pub lines: Vec<usize>,
}

impl Chunk {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn write_byte(&mut self, byte: u8, line: usize) {
        self.code.push(byte);
        self.lines.push(line);
    }

    pub fn write_op(&mut self, op: OpCode, line: usize) {
        self.write_byte(op as u8, line);
    }

    pub fn add_constant(&mut self, value: Value) -> usize {
        self.constants.push(value);
        self.constants.len() - 1
    }
}

pub struct VirtualMachine {
    pub chunk: Chunk,
    pub ip: usize,
    pub stack: Vec<Value>,
    pub globals: HashMap<String, Value>,
    pub output: Vec<String>,
}

impl VirtualMachine {
    pub fn new(chunk: Chunk) -> Self {
        Self {
            chunk,
            ip: 0,
            stack: Vec::with_capacity(256),
            globals: HashMap::new(),
            output: Vec::new(),
        }
    }

    pub fn run(&mut self) -> Result<Value, String> {
        let code_len = self.chunk.code.len();
        while self.ip < code_len {
            let instruction = self.chunk.code[self.ip];
            self.ip += 1;

            match instruction {
                x if x == OpCode::Constant as u8 => {
                    let const_idx = self.read_byte() as usize;
                    let val = self.chunk.constants[const_idx].clone();
                    self.stack.push(val);
                }
                x if x == OpCode::Nil as u8 => self.stack.push(Value::Nil),
                x if x == OpCode::True as u8 => self.stack.push(Value::Bool(true)),
                x if x == OpCode::False as u8 => self.stack.push(Value::Bool(false)),
                x if x == OpCode::Pop as u8 => {
                    self.stack.pop();
                }

                x if x == OpCode::GetLocal as u8 => {
                    let slot = self.read_byte() as usize;
                    if slot < self.stack.len() {
                        let val = self.stack[slot].clone();
                        self.stack.push(val);
                    } else {
                        return Err(format!("Invalid local slot {}", slot));
                    }
                }
                x if x == OpCode::SetLocal as u8 => {
                    let slot = self.read_byte() as usize;
                    if let Some(val) = self.stack.last().cloned() {
                        if slot < self.stack.len() {
                            self.stack[slot] = val;
                        }
                    }
                }
                x if x == OpCode::GetGlobal as u8 => {
                    let idx = self.read_byte() as usize;
                    if let Value::Str(ref name) = self.chunk.constants[idx] {
                        if let Some(val) = self.globals.get(name) {
                            self.stack.push(val.clone());
                        } else {
                            return Err(format!("Undefined variable '{}'", name));
                        }
                    }
                }
                x if x == OpCode::SetGlobal as u8 => {
                    let idx = self.read_byte() as usize;
                    if let Value::Str(ref name) = self.chunk.constants[idx] {
                        let val = self.stack.last().cloned().unwrap_or(Value::Nil);
                        self.globals.insert(name.clone(), val);
                    }
                }

                x if x == OpCode::Add as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Int(0));
                    let a = self.stack.pop().unwrap_or(Value::Int(0));
                    match (a, b) {
                        (Value::Int(x), Value::Int(y)) => self.stack.push(Value::Int(x + y)),
                        (Value::Float(x), Value::Float(y)) => self.stack.push(Value::Float(x + y)),
                        (Value::Int(x), Value::Float(y)) => self.stack.push(Value::Float(x as f64 + y)),
                        (Value::Float(x), Value::Int(y)) => self.stack.push(Value::Float(x + y as f64)),
                        (Value::Str(x), Value::Str(y)) => self.stack.push(Value::Str(format!("{}{}", x, y))),
                        (Value::Tensor(x), Value::Tensor(y)) => {
                            let res = x.add(&y)?;
                            self.stack.push(Value::Tensor(res));
                        }
                        (other_a, other_b) => return Err(format!("Cannot add {:?} and {:?}", other_a, other_b)),
                    }
                }
                x if x == OpCode::Sub as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Int(0));
                    let a = self.stack.pop().unwrap_or(Value::Int(0));
                    match (a, b) {
                        (Value::Int(x), Value::Int(y)) => self.stack.push(Value::Int(x - y)),
                        (Value::Float(x), Value::Float(y)) => self.stack.push(Value::Float(x - y)),
                        (Value::Int(x), Value::Float(y)) => self.stack.push(Value::Float(x as f64 - y)),
                        (Value::Float(x), Value::Int(y)) => self.stack.push(Value::Float(x - y as f64)),
                        (other_a, other_b) => return Err(format!("Cannot sub {:?} and {:?}", other_a, other_b)),
                    }
                }
                x if x == OpCode::Mul as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Int(0));
                    let a = self.stack.pop().unwrap_or(Value::Int(0));
                    match (a, b) {
                        (Value::Int(x), Value::Int(y)) => self.stack.push(Value::Int(x * y)),
                        (Value::Float(x), Value::Float(y)) => self.stack.push(Value::Float(x * y)),
                        (Value::Int(x), Value::Float(y)) => self.stack.push(Value::Float(x as f64 * y)),
                        (Value::Float(x), Value::Int(y)) => self.stack.push(Value::Float(x * y as f64)),
                        (other_a, other_b) => return Err(format!("Cannot mul {:?} and {:?}", other_a, other_b)),
                    }
                }
                x if x == OpCode::Div as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Int(1));
                    let a = self.stack.pop().unwrap_or(Value::Int(0));
                    match (a, b) {
                        (Value::Int(x), Value::Int(y)) => {
                            if y == 0 { return Err("Division by zero".to_string()); }
                            self.stack.push(Value::Int(x / y));
                        }
                        (Value::Float(x), Value::Float(y)) => self.stack.push(Value::Float(x / y)),
                        (Value::Int(x), Value::Float(y)) => self.stack.push(Value::Float(x as f64 / y)),
                        (Value::Float(x), Value::Int(y)) => self.stack.push(Value::Float(x / y as f64)),
                        (other_a, other_b) => return Err(format!("Cannot div {:?} and {:?}", other_a, other_b)),
                    }
                }
                x if x == OpCode::MatMul as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Nil);
                    let a = self.stack.pop().unwrap_or(Value::Nil);
                    match (a, b) {
                        (Value::Tensor(t1), Value::Tensor(t2)) => {
                            let res = t1.matmul(&t2)?;
                            self.stack.push(Value::Tensor(res));
                        }
                        _ => return Err("MatMul (@) requires two Tensor values".to_string()),
                    }
                }
                x if x == OpCode::Equal as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Nil);
                    let a = self.stack.pop().unwrap_or(Value::Nil);
                    self.stack.push(Value::Bool(a == b));
                }
                x if x == OpCode::Greater as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Int(0));
                    let a = self.stack.pop().unwrap_or(Value::Int(0));
                    match (a, b) {
                        (Value::Int(x), Value::Int(y)) => self.stack.push(Value::Bool(x > y)),
                        (Value::Float(x), Value::Float(y)) => self.stack.push(Value::Bool(x > y)),
                        _ => return Err("Cannot compare non-numerics".to_string()),
                    }
                }
                x if x == OpCode::Less as u8 => {
                    let b = self.stack.pop().unwrap_or(Value::Int(0));
                    let a = self.stack.pop().unwrap_or(Value::Int(0));
                    match (a, b) {
                        (Value::Int(x), Value::Int(y)) => self.stack.push(Value::Bool(x < y)),
                        (Value::Float(x), Value::Float(y)) => self.stack.push(Value::Bool(x < y)),
                        _ => return Err("Cannot compare non-numerics".to_string()),
                    }
                }

                x if x == OpCode::Print as u8 => {
                    let arg_count = self.read_byte() as usize;
                    let mut line_parts = Vec::new();
                    for _ in 0..arg_count {
                        if let Some(val) = self.stack.pop() {
                            line_parts.push(val.to_string());
                        }
                    }
                    line_parts.reverse();
                    let out_line = line_parts.join(" ");
                    self.output.push(out_line.clone());
                    println!("{}", out_line);
                }

                x if x == OpCode::Jump as u8 => {
                    let offset = self.read_short() as usize;
                    self.ip += offset;
                }
                x if x == OpCode::JumpIfFalse as u8 => {
                    let offset = self.read_short() as usize;
                    if let Some(val) = self.stack.last() {
                        if is_falsey(val) {
                            self.ip += offset;
                        }
                    }
                }
                x if x == OpCode::Loop as u8 => {
                    let offset = self.read_short() as usize;
                    self.ip -= offset;
                }

                x if x == OpCode::TensorAlloc as u8 => {
                    let const_idx = self.read_byte() as usize;
                    if let Value::Str(ref spec) = self.chunk.constants[const_idx] {
                        // e.g. "ones:1024,1024" or "zeros:512,512"
                        let parts: Vec<&str> = spec.split(':').collect();
                        let kind = parts[0];
                        let dims: Vec<usize> = parts[1].split(',').filter_map(|s| s.parse().ok()).collect();
                        let tensor = match kind {
                            "ones" => Tensor::ones(dims),
                            _ => Tensor::zeros(dims),
                        };
                        self.stack.push(Value::Tensor(tensor));
                    }
                }

                x if x == OpCode::Return as u8 => {
                    return Ok(self.stack.pop().unwrap_or(Value::Nil));
                }

                other => return Err(format!("Unknown opcode: {}", other)),
            }
        }

        Ok(self.stack.pop().unwrap_or(Value::Nil))
    }

    fn read_byte(&mut self) -> u8 {
        let b = self.chunk.code[self.ip];
        self.ip += 1;
        b
    }

    fn read_short(&mut self) -> u16 {
        let b1 = self.read_byte() as u16;
        let b2 = self.read_byte() as u16;
        (b1 << 8) | b2
    }
}

fn is_falsey(val: &Value) -> bool {
    match val {
        Value::Nil => true,
        Value::Bool(b) => !b,
        Value::Int(i) => *i == 0,
        Value::Float(f) => *f == 0.0,
        _ => false,
    }
}

/// Tier-0 AST to Bytecode Compiler
pub struct BytecodeCompiler {
    chunk: Chunk,
    functions: HashMap<String, FunctionDef>,
}

impl BytecodeCompiler {
    pub fn new() -> Self {
        Self {
            chunk: Chunk::new(),
            functions: HashMap::new(),
        }
    }

    pub fn compile_program(mut self, program: &Program) -> Result<Chunk, String> {
        let mut main_func = None;
        let mut top_level = Vec::new();

        for item in &program.items {
            match item {
                Item::Function(f) => {
                    self.functions.insert(f.name.clone(), f.clone());
                    if f.name == "मुख्य" || f.name == "main" {
                        main_func = Some(f.clone());
                    }
                }
                Item::Stmt(s) => top_level.push(s.clone()),
                _ => {}
            }
        }

        if let Some(main) = main_func {
            for s in &main.body {
                self.compile_stmt(s)?;
            }
        } else {
            for s in &top_level {
                self.compile_stmt(s)?;
            }
        }

        self.chunk.write_op(OpCode::Return, 1);
        Ok(self.chunk)
    }

    fn compile_stmt(&mut self, stmt: &Stmt) -> Result<(), String> {
        match stmt {
            Stmt::Let { name, init, .. } => {
                if let Some(init_expr) = init {
                    self.compile_expr(init_expr)?;
                } else {
                    self.chunk.write_op(OpCode::Nil, 1);
                }

                let idx = self.chunk.add_constant(Value::Str(name.clone()));
                self.chunk.write_op(OpCode::SetGlobal, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Stmt::Const { name, value, .. } => {
                self.compile_expr(value)?;
                let idx = self.chunk.add_constant(Value::Str(name.clone()));
                self.chunk.write_op(OpCode::SetGlobal, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Stmt::Assign { target, value, .. } => {
                self.compile_expr(value)?;
                let idx = self.chunk.add_constant(Value::Str(target.clone()));
                self.chunk.write_op(OpCode::SetGlobal, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Stmt::Print { args, .. } => {
                for arg in args {
                    self.compile_expr(arg)?;
                }
                self.chunk.write_op(OpCode::Print, 1);
                self.chunk.write_byte(args.len() as u8, 1);
            }
            Stmt::Return { value, .. } => {
                if let Some(v) = value {
                    self.compile_expr(v)?;
                } else {
                    self.chunk.write_op(OpCode::Nil, 1);
                }
                self.chunk.write_op(OpCode::Return, 1);
            }
            Stmt::Expr(e) => {
                self.compile_expr(e)?;
                self.chunk.write_op(OpCode::Pop, 1);
            }
            _ => {}
        }
        Ok(())
    }

    fn compile_expr(&mut self, expr: &Expr) -> Result<(), String> {
        match expr {
            Expr::Int(i, _) => {
                let idx = self.chunk.add_constant(Value::Int(*i));
                self.chunk.write_op(OpCode::Constant, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Expr::Float(f, _) => {
                let idx = self.chunk.add_constant(Value::Float(*f));
                self.chunk.write_op(OpCode::Constant, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Expr::Str(s, _) => {
                let idx = self.chunk.add_constant(Value::Str(s.clone()));
                self.chunk.write_op(OpCode::Constant, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Expr::Bool(b, _) => {
                if *b {
                    self.chunk.write_op(OpCode::True, 1);
                } else {
                    self.chunk.write_op(OpCode::False, 1);
                }
            }
            Expr::Nil(_) => self.chunk.write_op(OpCode::Nil, 1),
            Expr::Ident(name, _) => {
                let idx = self.chunk.add_constant(Value::Str(name.clone()));
                self.chunk.write_op(OpCode::GetGlobal, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Expr::Binary { op, lhs, rhs, .. } => {
                self.compile_expr(lhs)?;
                self.compile_expr(rhs)?;
                match op {
                    BinaryOp::Add => self.chunk.write_op(OpCode::Add, 1),
                    BinaryOp::Sub => self.chunk.write_op(OpCode::Sub, 1),
                    BinaryOp::Mul => self.chunk.write_op(OpCode::Mul, 1),
                    BinaryOp::Div => self.chunk.write_op(OpCode::Div, 1),
                    BinaryOp::MatMul => self.chunk.write_op(OpCode::MatMul, 1),
                    BinaryOp::Eq => self.chunk.write_op(OpCode::Equal, 1),
                    BinaryOp::Gt => self.chunk.write_op(OpCode::Greater, 1),
                    BinaryOp::Lt => self.chunk.write_op(OpCode::Less, 1),
                    _ => {}
                }
            }
            Expr::TensorConstructor { kind, shape, .. } => {
                let spec = format!("{}:{}", kind, shape.iter().map(|d| d.to_string()).collect::<Vec<_>>().join(","));
                let idx = self.chunk.add_constant(Value::Str(spec));
                self.chunk.write_op(OpCode::TensorAlloc, 1);
                self.chunk.write_byte(idx as u8, 1);
            }
            Expr::Call { callee, args, .. } => {
                if let Expr::Ident(name, _) = &**callee {
                    if let Some(func) = self.functions.get(name).cloned() {
                        for (arg_expr, param) in args.iter().zip(func.params.iter()) {
                            self.compile_expr(arg_expr)?;
                            let idx = self.chunk.add_constant(Value::Str(param.name.clone()));
                            self.chunk.write_op(OpCode::SetGlobal, 1);
                            self.chunk.write_byte(idx as u8, 1);
                        }

                        for s in &func.body {
                            match s {
                                Stmt::Return { value: Some(v), .. } => {
                                    self.compile_expr(v)?;
                                }
                                other => {
                                    self.compile_stmt(other)?;
                                }
                            }
                        }
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vm_execution_arithmetic() {
        let mut chunk = Chunk::new();
        let idx1 = chunk.add_constant(Value::Int(25));
        let idx2 = chunk.add_constant(Value::Int(17));

        chunk.write_op(OpCode::Constant, 1);
        chunk.write_byte(idx1 as u8, 1);

        chunk.write_op(OpCode::Constant, 1);
        chunk.write_byte(idx2 as u8, 1);

        chunk.write_op(OpCode::Add, 1);
        chunk.write_op(OpCode::Return, 1);

        let mut vm = VirtualMachine::new(chunk);
        let result = vm.run().unwrap();
        assert_eq!(result, Value::Int(42));
    }

    #[test]
    fn test_vm_tensor_matmul() {
        let mut chunk = Chunk::new();
        let a_spec = chunk.add_constant(Value::Str("ones:4,4".to_string()));
        let b_spec = chunk.add_constant(Value::Str("ones:4,4".to_string()));

        chunk.write_op(OpCode::TensorAlloc, 1);
        chunk.write_byte(a_spec as u8, 1);

        chunk.write_op(OpCode::TensorAlloc, 1);
        chunk.write_byte(b_spec as u8, 1);

        chunk.write_op(OpCode::MatMul, 1);
        chunk.write_op(OpCode::Return, 1);

        let mut vm = VirtualMachine::new(chunk);
        let result = vm.run().unwrap();
        if let Value::Tensor(t) = result {
            assert_eq!(t.shape, vec![4, 4]);
            assert_eq!(t.get_2d(0, 0), 4.0);
        } else {
            panic!("Expected Tensor result");
        }
    }
}
