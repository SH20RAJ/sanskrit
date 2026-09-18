// [EXPERIMENTAL] Sanskrit Language LLVM Code Generator
// WARNING: This backend is experimental and NOT part of the stable language runtime.
// It requires external native llvm-bindings which are optional.

let llvm = null;
try {
    llvm = require('llvm-bindings');
} catch (e) {
    // llvm-bindings not installed
}

class CodeGenerator {
    constructor() {
        if (!llvm) {
            throw new Error(
                'Experimental LLVM code generator requires the optional "llvm-bindings" package.\n' +
                'Note: The stable Sanskrit runtime uses the JavaScript interpreter backend.'
            );
        }
        this.context = new llvm.LLVMContext();
        this.module = new llvm.Module('sanskrit_module', this.context);
        this.builder = new llvm.IRBuilder(this.context);
        this.symbolTable = new Map();
    }

    generateCode(ast) {
        throw new Error('LLVM codegen for canonical AST is currently experimental and under development.');
    }
}

module.exports = { CodeGenerator };
