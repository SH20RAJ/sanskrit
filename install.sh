#!/usr/bin/env bash
# ==============================================================================
# Sanskrit (संस्कृत) Programming Language Installer
# Safe, idempotent, standalone installer (macOS & Linux)
# ==============================================================================

set -euo pipefail

REPO="SH20RAJ/sanskrit"
DEFAULT_INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/sanskrit"
DEFAULT_BIN_DIR="${XDG_BIN_HOME:-$HOME/.local/bin}"

INSTALL_DIR="$DEFAULT_INSTALL_DIR"
BIN_DIR="$DEFAULT_BIN_DIR"
REQUESTED_VERSION=""
UNINSTALL=false

print_help() {
    cat << EOF
संस्कृत (Sanskrit) Installer

Usage:
  install.sh [options]

Options:
  --version <ver>      Install a specific version or tag
  --install-dir <dir>  Custom installation directory (default: ~/.local/share/sanskrit)
  --bin-dir <dir>      Custom binary directory (default: ~/.local/bin)
  --uninstall          Uninstall Sanskrit from the system
  -h, --help           Display this help message
EOF
}

# Parse command-line options
while [[ $# -gt 0 ]]; do
    case "$1" in
        --version)
            REQUESTED_VERSION="$2"
            shift 2
            ;;
        --install-dir)
            INSTALL_DIR="$2"
            shift 2
            ;;
        --bin-dir)
            BIN_DIR="$2"
            shift 2
            ;;
        --uninstall)
            UNINSTALL=true
            shift
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        *)
            echo "Error: Unknown argument '$1'" >&2
            print_help
            exit 1
            ;;
    esac
done

# Handle Uninstallation
if [ "$UNINSTALL" = true ]; then
    echo "Uninstalling Sanskrit Programming Language..."
    rm -rf "$INSTALL_DIR"
    rm -f "$BIN_DIR/sanskrit"
    echo "✓ Sanskrit uninstalled successfully."
    exit 0
fi

echo "================================================="
echo "   संस्कृत (Sanskrit) Programming Language Installer"
echo "================================================="

# Check for required tools
check_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Error: Required command '$1' is not installed." >&2
        exit 1
    fi
}

check_cmd "tar"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is required to run Sanskrit, but was not found." >&2
    echo "Please install Node.js (version 18 or higher) from: https://nodejs.org/" >&2
    echo "Alternatively use NVM (Node Version Manager):" >&2
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash" >&2
    echo "  nvm install 20" >&2
    exit 1
fi

NODE_MAJOR=$(node -v | sed -E 's/v([0-9]+).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "Warning: Node.js version 18+ is recommended (current: $(node -v))." >&2
fi

# Detect download tool (curl or wget)
DOWNLOADER=""
if command -v curl >/dev/null 2>&1; then
    DOWNLOADER="curl"
elif command -v wget >/dev/null 2>&1; then
    DOWNLOADER="wget"
else
    echo "Error: Neither 'curl' nor 'wget' was found. Please install one to proceed." >&2
    exit 1
fi

download_file() {
    local url="$1"
    local dest="$2"
    if [ "$DOWNLOADER" = "curl" ]; then
        curl -fsSL "$url" -o "$dest"
    else
        wget -qO "$dest" "$url"
    fi
}

# Resolve target version / tag
VERSION="$REQUESTED_VERSION"
if [ -z "$VERSION" ]; then
    echo "Resolving latest release..."
    if [ "$DOWNLOADER" = "curl" ]; then
        LATEST_JSON=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null || echo "")
    else
        LATEST_JSON=$(wget -qO- "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null || echo "")
    fi

    if [ -n "$LATEST_JSON" ]; then
        VERSION=$(echo "$LATEST_JSON" | grep '"tag_name":' | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/' || echo "")
    fi

    if [ -z "$VERSION" ]; then
        VERSION="main"
    fi
fi

echo "Selected version: $VERSION"

# Setup temporary scratch directory
TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'sanskrit-install')
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Download tarball
TAR_URL="https://github.com/${REPO}/archive/refs/tags/${VERSION}.tar.gz"
if [ "$VERSION" = "main" ]; then
    TAR_URL="https://github.com/${REPO}/archive/refs/heads/main.tar.gz"
fi

echo "Downloading Sanskrit source archive..."
ARCHIVE_PATH="$TMP_DIR/sanskrit.tar.gz"

if ! download_file "$TAR_URL" "$ARCHIVE_PATH"; then
    echo "Falling back to main repository archive..."
    TAR_URL="https://github.com/${REPO}/archive/refs/heads/main.tar.gz"
    download_file "$TAR_URL" "$ARCHIVE_PATH"
fi

# Prepare install directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

echo "Extracting files to $INSTALL_DIR..."
tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR"
EXTRACTED_FOLDER=$(find "$TMP_DIR" -maxdepth 1 -mindepth 1 -type d | head -n 1)

# Copy files idempotently
rm -rf "${INSTALL_DIR:?}"/*
cp -R "$EXTRACTED_FOLDER"/* "$INSTALL_DIR/"

# Install runtime dependencies if npm is available
if command -v npm >/dev/null 2>&1; then
    echo "Installing runtime dependencies via npm..."
    (cd "$INSTALL_DIR" && npm install --omit=dev --silent >/dev/null 2>&1 || true)
fi

# Create executable binary wrapper in $BIN_DIR
WRAPPER_FILE="$BIN_DIR/sanskrit"
cat > "$WRAPPER_FILE" << WRAPPER_EOF
#!/usr/bin/env bash
# Sanskrit CLI Executable Wrapper
INSTALL_DIR_RESOLVED="$INSTALL_DIR"
if [ ! -d "\$INSTALL_DIR_RESOLVED" ]; then
    INSTALL_DIR_RESOLVED="\$(dirname "\$(dirname "\$0")")/share/sanskrit"
fi

if [ -f "\$INSTALL_DIR_RESOLVED/bin/sanskrit" ]; then
    exec node "\$INSTALL_DIR_RESOLVED/bin/sanskrit" "\$@"
elif [ -f "\$INSTALL_DIR_RESOLVED/src/cli/index.js" ]; then
    exec node "\$INSTALL_DIR_RESOLVED/src/cli/index.js" "\$@"
elif [ -f "\$INSTALL_DIR_RESOLVED/src/cli.js" ]; then
    exec node "\$INSTALL_DIR_RESOLVED/src/cli.js" "\$@"
else
    echo "Error: Sanskrit CLI entrypoint not found in \$INSTALL_DIR_RESOLVED" >&2
    exit 1
fi
WRAPPER_EOF

chmod +x "$WRAPPER_FILE"

# Verify installation
INSTALLED_VER=$("$WRAPPER_FILE" --version 2>/dev/null || echo "installed")

echo ""
echo "================================================="
echo "✓ Sanskrit v${INSTALLED_VER} installed successfully!"
echo "  Binary location: $WRAPPER_FILE"
echo "  Install location: $INSTALL_DIR"
echo "================================================="

# Check PATH
case ":$PATH:" in
    *":$BIN_DIR:"*) ;;
    *)
        echo ""
        echo "Notice: '$BIN_DIR' is not currently in your PATH."
        echo "To use 'sanskrit' from any terminal, add it to your shell configuration:"
        echo ""
        if [ -n "${ZSH_VERSION:-}" ] || [[ "${SHELL:-}" == *"zsh"* ]]; then
            echo "  echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.zshrc"
            echo "  source ~/.zshrc"
        else
            echo "  echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.bashrc"
            echo "  source ~/.bashrc"
        fi
        echo ""
        ;;
esac

echo "Try running:"
echo "  sanskrit --help"
echo "  sanskrit repl"
echo ""
