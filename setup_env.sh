#!/bin/bash
export PATH="/opt/homebrew/opt/llvm@14/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/llvm@14/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm@14/include"
export LLVM_DIR="/opt/homebrew/opt/llvm@14/lib/cmake/llvm"
