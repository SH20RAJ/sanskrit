# संस्कृत Programming Language

[![GitHub stars](https://img.shields.io/github/stars/sh20raj/sanskrit.svg)](https://github.com/sh20raj/sanskrit/stargazers)
[![License](https://img.shields.io/github/license/sh20raj/sanskrit.svg)](https://github.com/sh20raj/sanskrit/blob/main/LICENSE)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fsh20raj.github.io%2Fsanskrit%2F)](https://sh20raj.github.io/sanskrit/)
[![Visitors](https://api.visitorbadge.io/api/combined?path=https%3A%2F%2Fgithub.com%2FSH20RAJ%2Fsanskrit&labelColor=%23f47373&countColor=%23dce775&style=flat)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2FSH20RAJ%2Fsanskrit)

A modern programming language that uses Sanskrit vocabulary and grammar, combining the ancient wisdom of Sanskrit with modern computing concepts. Write code in देवनागरी (Devanagari) script with the power of modern programming paradigms.


![sanskrit](https://socialify.git.ci/SH20RAJ/sanskrit/image?description=1&forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Auto)

## Features

- **Sanskrit-Based Syntax**: Write code using Sanskrit words and grammar
- **Devanagari Support**: Native support for Devanagari script
- **Cultural Integration**: Programming concepts expressed through Sanskrit terminology
- **High Performance**: Native compilation with LLVM backend
- **Scientific Computing**: Advanced mathematical and tensor operations
- **AI/ML First**: Built-in support for neural networks and machine learning
- **Type System**: Strong, static typing with type inference
- **Memory Safety**: Automatic memory management with optional manual control

## Installation

### Quick Install (Linux/macOS)

```bash
curl -fsSL https://sh20raj.github.io/sanskrit/install.sh | sh
```

### Manual Installation

1. **Prerequisites**
   - Node.js (v14 or higher)
   - npm (v6 or higher)
   - git

2. **Clone the Repository**
   ```bash
   git clone https://github.com/sh20raj/sanskrit.git
   cd sanskrit
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Add to PATH**
   ```bash
   # For bash
   echo 'export PATH="$PWD/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc

   # For zsh
   echo 'export PATH="$PWD/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

## Quick Start

```sanskrit
// Hello World
कार्य मुख्य() {
    लेख("नमस्ते विश्व!")  // Prints: नमस्ते विश्व!
}

// Variables and Types
चर क = ४२                   // Type inference
चर ख: पूर्णांक = ४२         // Explicit typing
चर ग: दशांश = ३.१४१५९     // Floating point

// Functions
कार्य योग(क: पूर्णांक, ख: पूर्णांक) -> पूर्णांक {
    प्रत्यागम क + ख
}

// Pattern Matching
मिलान मान {
    ० => लेख("शून्य"),
    न यदि न > ० => लेख("धनात्मक"),
    _ => लेख("ऋणात्मक"),
}

// AI/ML Example
टेन्सर मैट्रिक्स = [[१, २, ३],
                    [४, ५, ६]]

चर मॉडल = तंत्रिकाजाल {
    स्तर: [
        घन(इकाई: १२८, सक्रियण: "रेलु"),
        घन(इकाई: १०, सक्रियण: "सॉफ्टमैक्स")
    ]
}
```

## Usage

### Command Line Interface

1. **Run a Sanskrit File**
   ```bash
   sanskrit run program.sns
   ```

2. **Compile a Sanskrit File**
   ```bash
   sanskrit compile program.sns
   ```

3. **Start REPL**
   ```bash
   sanskrit repl
   ```

4. **Format Code**
   ```bash
   sanskrit fmt program.sns
   ```

### IDE Support

- Visual Studio Code: [Sanskrit Language Extension](https://sh20raj.github.io/sanskrit/vscode)
- Sublime Text: [Sanskrit Package](https://sh20raj.github.io/sanskrit/sublime)
- Vim/Neovim: [Sanskrit Plugin](https://sh20raj.github.io/sanskrit/vim)

## Documentation

- [Language Guide](https://sh20raj.github.io/sanskrit/docs/guide)
- [API Reference](https://sh20raj.github.io/sanskrit/docs/api)
- [Examples](https://sh20raj.github.io/sanskrit/docs/examples)
- [Contributing Guide](https://sh20raj.github.io/sanskrit/docs/contributing)

## Package Management

```bash
# Initialize a new project
संस्कृत आरंभ मेरी-परियोजना

# Add dependencies
संस्कृत जोड़ें टेन्सर-पुस्तकालय
```

## Project Structure

```
sanskrit/
├── bin/                  # Executable binaries
├── docs/                 # Documentation
├── examples/             # Example programs
├── src/                  # Source code
│   ├── compiler/        # Compiler implementation
│   ├── runtime/         # Runtime library
│   └── cli.js           # Command-line interface
├── tests/               # Test suite
├── package.json         # Project metadata
└── README.md           # This file
```

## Community

- **Website**: [https://sh20raj.github.io/sanskrit/](https://sh20raj.github.io/sanskrit/)
- **GitHub**: [https://github.com/sh20raj/sanskrit](https://github.com/sh20raj/sanskrit)
- **Documentation**: [https://sh20raj.github.io/sanskrit/docs](https://sh20raj.github.io/sanskrit/docs)
- **Discord**: [Join our community](https://discord.gg/sanskrit)
- **Twitter**: [@SanskritLang](https://twitter.com/SanskritLang)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://sh20raj.github.io/sanskrit/docs/contributing) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Sanskrit is open source and available under the MIT License. See [LICENSE](LICENSE) for more information.

## Acknowledgments

Special thanks to all contributors and the Sanskrit community for their support and contributions.
