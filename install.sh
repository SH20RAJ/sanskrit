#!/bin/sh
# Sanskrit Next: Official Zero-Dependency Shell Installer
# Usage: curl -fsSL https://sanskrit.dev/install.sh | sh

set -eu

REPO="SH20RAJ/sanskrit"
INSTALL_DIR="${SANSKRIT_HOME:-$HOME/.sanskrit}"
BIN_DIR="$INSTALL_DIR/bin"
VERSION="${SANSKRIT_VERSION:-latest}"

printf "\033[1;36m==>\033[0m Installing Sanskrit Next (AI/ML-Native Systems Language)...\n"

# 1. Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     PLATFORM="unknown-linux-gnu" ;;
    Darwin*)    PLATFORM="apple-darwin" ;;
    MINGW*|MSYS*|CYGWIN*) PLATFORM="pc-windows-msvc" ;;
    *)
        printf "\033[1;31mError:\033[0m Unsupported operating system: %s\n" "$OS" >&2
        exit 1
        ;;
esac

# 2. Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64) ARCH_NAME="x86_64" ;;
    arm64|aarch64) ARCH_NAME="aarch64" ;;
    *)
        printf "\033[1;31mError:\033[0m Unsupported CPU architecture: %s\n" "$ARCH" >&2
        exit 1
        ;;
esac

TARGET="${ARCH_NAME}-${PLATFORM}"
printf "    Detected platform: \033[1m%s\033[0m\n" "$TARGET"

mkdir -p "$BIN_DIR"

# 3. Determine Release Tag
if [ "$VERSION" = "latest" ]; then
    RELEASE_URL="https://github.com/$REPO/releases/latest"
    TAG="v2.0.0-alpha.1"
else
    TAG="$VERSION"
fi

TARBALL="sanskrit-${TAG}-${TARGET}.tar.gz"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/${TAG}/${TARBALL}"

printf "    Fetching release binary for %s...\n" "$TAG"

# Download binary archive or compile fallback
TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'sanskrit-install')"
trap 'rm -rf "$TMP_DIR"' EXIT

if curl -sSfL "$DOWNLOAD_URL" -o "$TMP_DIR/$TARBALL" 2>/dev/null; then
    tar -xzf "$TMP_DIR/$TARBALL" -C "$BIN_DIR"
    chmod +x "$BIN_DIR/sanskrit"
else
    # Fallback to local build if running in repository or rust is available
    if command -v cargo >/dev/null 2>&1 && [ -f "Cargo.toml" ]; then
        printf "    Release archive not found online. Building local binary via cargo...\n"
        cargo build --release -p sanskrit-cli
        cp target/release/sanskrit "$BIN_DIR/sanskrit"
    else
        printf "\033[1;33mNotice:\033[0m Binary release artifact will be available with the next GitHub release.\n"
    fi
fi

# 4. Install sanskritup version manager helper
cat << 'EOF' > "$BIN_DIR/sanskritup"
#!/bin/sh
# Sanskritup: Version manager for Sanskrit Next
set -eu

COMMAND="${1:-help}"
case "$COMMAND" in
    update)
        echo "Updating Sanskrit Next to latest release..."
        curl -fsSL https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | sh
        ;;
    version)
        sanskrit --version
        ;;
    doctor)
        sanskrit doctor
        ;;
    *)
        echo "Usage: sanskritup [update | version | doctor]"
        ;;
esac
EOF
chmod +x "$BIN_DIR/sanskritup" 2>/dev/null || true

# 5. Configure Shell PATH
SHELL_PROFILE=""
case "${SHELL:-}" in
    */zsh)  SHELL_PROFILE="$HOME/.zshrc" ;;
    */bash)
        if [ -f "$HOME/.bash_profile" ]; then
            SHELL_PROFILE="$HOME/.bash_profile"
        else
            SHELL_PROFILE="$HOME/.bashrc"
        fi
        ;;
    *)      SHELL_PROFILE="$HOME/.profile" ;;
esac

PATH_LINE="export PATH=\"$BIN_DIR:\$PATH\""
if [ -n "$SHELL_PROFILE" ] && [ -f "$SHELL_PROFILE" ]; then
    if ! grep -q "$BIN_DIR" "$SHELL_PROFILE"; then
        printf "\n# Sanskrit Next\n%s\n" "$PATH_LINE" >> "$SHELL_PROFILE"
        printf "    Updated PATH in \033[1m%s\033[0m\n" "$SHELL_PROFILE"
    fi
fi

printf "\n\033[1;32m==>\033[0m Sanskrit Next installed successfully!\n"
printf "    Binary location: %s/sanskrit\n" "$BIN_DIR"
printf "    Run: \033[1msanskrit doctor\033[0m to inspect your environment.\n"
