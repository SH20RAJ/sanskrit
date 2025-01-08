# Sanskrit Programming Language

Sanskrit is a modern, high-performance programming language designed for scientific computing, AI/ML operations, and general-purpose programming. It combines the simplicity of Python, the performance of C++, and the flexibility of JavaScript into a unified, elegant syntax.

## Key Features

- **Simple and Intuitive Syntax**: Clean, readable code with minimal boilerplate
- **High Performance**: Native compilation with LLVM backend
- **AI/ML First**: Built-in support for tensor operations and neural networks
- **Scientific Computing**: Advanced mathematical and statistical libraries
- **Type System**: Strong, static typing with type inference
- **Memory Safety**: Automatic memory management with optional manual control
- **Concurrency**: Built-in async/await, parallel processing, and actor model
- **Metaprogramming**: Powerful macro system and compile-time code execution
- **Cross-Platform**: Run anywhere - Linux, macOS, Windows, and WebAssembly
- **Interoperability**: Seamless integration with C, C++, Python, and JavaScript

## Quick Start

```sanskrit
// Hello World
fn main() {
    print("नमस्ते विश्व!") // Hello World in Sanskrit!
}

// Variables and Types
let x = 42                  // Type inference
let y: Int = 42            // Explicit typing
let z: Float64 = 3.14159

// Functions
fn add(a: Int, b: Int) -> Int {
    return a + b
}

// Pattern Matching
match value {
    0 => print("Zero"),
    n if n > 0 => print("Positive"),
    _ => print("Negative"),
}

// Async Programming
async fn fetch_data() -> Result<Data> {
    let response = await http.get("api.example.com")
    return response.json()
}

// AI/ML Example
tensor Matrix = [[1, 2, 3],
                [4, 5, 6]]
let model = NeuralNetwork {
    layers: [
        Dense(units: 128, activation: "relu"),
        Dense(units: 10, activation: "softmax")
    ]
}

// Scientific Computing
let vector = Vector[1, 2, 3]
let result = vector.normalize().dot(other_vector)
```

## Installation

```bash
curl -fsSL https://sanskrit-lang.org/install.sh | sh
```

## Documentation

Visit [docs.sanskrit-lang.org](https://docs.sanskrit-lang.org) for comprehensive documentation.

## Community

- GitHub: [github.com/sanskrit-lang/sanskrit](https://github.com/sanskrit-lang/sanskrit)
- Discord: [discord.gg/sanskrit](https://discord.gg/sanskrit)
- Twitter: [@SanskritLang](https://twitter.com/SanskritLang)

## License

Sanskrit is open source and available under the MIT License.
