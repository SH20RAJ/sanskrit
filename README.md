# संस्कृत Programming Language

[![GitHub stars](https://img.shields.io/github/stars/sh20raj/sanskrit.svg)](https://github.com/sh20raj/sanskrit/stargazers)
[![License](https://img.shields.io/github/license/sh20raj/sanskrit.svg)](https://github.com/sh20raj/sanskrit/blob/main/LICENSE)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fsh20raj.github.io%2Fsanskrit%2F)](https://sh20raj.github.io/sanskrit/)
[![Visitors](https://api.visitorbadge.io/api/combined?path=https%3A%2F%2Fgithub.com%2FSH20RAJ%2Fsanskrit&labelColor=%23f47373&countColor=%23dce775&style=flat)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2FSH20RAJ%2Fsanskrit)

A modern programming language that uses Sanskrit vocabulary and grammar, combining the ancient wisdom of Sanskrit with modern computing concepts. Write code in देवनागरी (Devanagari) script with the simplicity of JavaScript.

## Features

- **Sanskrit-Based Syntax**: Write code using Sanskrit words and grammar
- **Devanagari Support**: Native support for Devanagari script and numerals
- **Cultural Integration**: Programming concepts expressed through Sanskrit terminology
- **JavaScript-Based**: Easy to install and run with Node.js
- **Interpreter**: Fast development with immediate feedback
- **Simple Installation**: No complex dependencies required
- **Cross-Platform**: Runs anywhere Node.js is available

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Quick Install

```bash
npm install -g sanskrit-lang
```

### Manual Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sh20raj/sanskrit.git
   cd sanskrit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Link for Development**
   ```bash
   npm link
   ```

## Quick Start

Create a file `main.sns` with the following content:

```sanskrit
// नमस्ते विश्व
कार्य नमस्ते() {
    मुद्रण("नमस्ते विश्व!");
}

नमस्ते();
```

Run it:
```bash
sanskrit run main.sns
```

## More Examples

### Variables and Functions
```sanskrit
कार्य योग(क, ख) {
    मुद्रण(क + ख);
}

योग(१०, २०);  // Outputs: ३०
```

### String Operations
```sanskrit
कार्य वाक्य() {
    मुद्रण("संस्कृत" + " " + "भाषा");  // Outputs: संस्कृत भाषा
}

वाक्य();
```

## Usage

### Command Line Interface

1. **Run a Sanskrit File**
   ```bash
   sanskrit run program.sns
   ```

2. **Start REPL (Coming Soon)**
   ```bash
   sanskrit repl
   ```

## Project Structure

```
sanskrit/
├── src/                 # Source code
│   ├── compiler/       # Lexer and Parser
│   ├── interpreter/    # JavaScript interpreter
│   └── cli.js         # Command-line interface
├── test/              # Test files
├── package.json       # Project metadata
└── README.md         # This file
```

## Language Features

### Current Features
- Devanagari script support
- Function declarations and calls
- String literals
- Basic arithmetic operations
- Built-in `मुद्रण` (print) function

### Coming Soon
- Variables and assignments
- Control flow (if/else, loops)
- Arrays and objects
- More built-in functions
- REPL environment

## Contributing

We welcome contributions! Whether it's:
- Adding new features
- Fixing bugs
- Improving documentation
- Adding examples

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Sanskrit is open source and available under the MIT License. See [LICENSE](LICENSE) for more information.

## Community

- **GitHub**: [https://github.com/sh20raj/sanskrit](https://github.com/sh20raj/sanskrit)
- **Documentation**: [https://sh20raj.github.io/sanskrit/docs](https://sh20raj.github.io/sanskrit/docs)

## Acknowledgments

Special thanks to all contributors and the Sanskrit community for their support in making programming more accessible through this ancient and beautiful language.
