#!/bin/bash

echo "संस्कृत Programming Language Installer"
echo "======================================"

# Check for required dependencies
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "Error: $1 is required but not installed."
        echo "Please install $1 and try again."
        exit 1
    fi
}

check_dependency "node"
check_dependency "npm"
check_dependency "git"

# Create installation directory
INSTALL_DIR="$HOME/.sanskrit"
mkdir -p "$INSTALL_DIR"

# Clone the repository
echo "Cloning Sanskrit repository..."
git clone https://github.com/sh20raj/sanskrit.git "$INSTALL_DIR/sanskrit"
cd "$INSTALL_DIR/sanskrit"

# Install dependencies
echo "Installing dependencies..."
npm install

# Add sanskrit to PATH
PROFILE_FILE="$HOME/.bashrc"
if [[ "$SHELL" == *"zsh"* ]]; then
    PROFILE_FILE="$HOME/.zshrc"
fi

# Add PATH entry if not already present
if ! grep -q "sanskrit" "$PROFILE_FILE"; then
    echo 'export PATH="$HOME/.sanskrit/sanskrit/bin:$PATH"' >> "$PROFILE_FILE"
    echo "Added Sanskrit to PATH in $PROFILE_FILE"
fi

# Create symbolic links
mkdir -p "$INSTALL_DIR/sanskrit/bin"
cat > "$INSTALL_DIR/sanskrit/bin/sanskrit" << 'EOF'
#!/bin/bash
NODE_PATH="$HOME/.sanskrit/sanskrit/node_modules" node "$HOME/.sanskrit/sanskrit/src/cli.js" "$@"
EOF

chmod +x "$INSTALL_DIR/sanskrit/bin/sanskrit"

echo ""
echo "संस्कृत has been successfully installed!"
echo "Please restart your terminal or run: source $PROFILE_FILE"
echo ""
echo "Get started with:"
echo "  sanskrit --help"
echo "  sanskrit repl"
echo "  sanskrit run hello.sns"
echo "  sanskrit compile hello.sns"
echo "  sanskrit fmt hello.sns"
echo ""
echo "Documentation: https://sh20raj.github.io/sanskrit/"
echo "GitHub Repository: https://github.com/sh20raj/sanskrit"
