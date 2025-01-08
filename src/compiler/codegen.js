// Sanskrit Language Code Generator
const llvm = require('llvm-bindings');

class CodeGenerator {
    constructor() {
        this.context = new llvm.LLVMContext();
        this.module = new llvm.Module('sanskrit_module', this.context);
        this.builder = new llvm.IRBuilder(this.context);
        this.symbolTable = new Map();
    }

    generateCode(ast) {
        return this.visit(ast);
    }

    visit(node) {
        const methodName = `visit${node.type}`;
        if (this[methodName]) {
            return this[methodName](node);
        }
        throw new Error(`No visit method for ${node.type}`);
    }

    visitProgram(node) {
        // Generate code for each statement in the program
        node.children.forEach(child => this.visit(child));
        return this.module;
    }

    visitFunctionDeclaration(node) {
        const [identifier, params, returnType, body] = node.children;
        const funcName = identifier.value;
        
        // Create function type
        const paramTypes = params.children.map(param => this.getLLVMType(param.children[1].value));
        const retType = returnType ? this.getLLVMType(returnType.value) : llvm.Type.getVoidTy(this.context);
        const funcType = llvm.FunctionType.get(retType, paramTypes, false);
        
        // Create function
        const func = llvm.Function.Create(
            funcType,
            llvm.Function.LinkageTypes.ExternalLinkage,
            funcName,
            this.module
        );

        // Create basic block and set insert point
        const basicBlock = llvm.BasicBlock.Create(this.context, 'entry', func);
        this.builder.SetInsertPoint(basicBlock);

        // Add parameters to symbol table
        params.children.forEach((param, i) => {
            const paramName = param.children[0].value;
            const paramValue = func.getArg(i);
            this.symbolTable.set(paramName, paramValue);
        });

        // Generate code for function body
        this.visit(body);

        return func;
    }

    visitVariableDeclaration(node) {
        const [identifier, type, initializer] = node.children;
        const varName = identifier.value;
        const llvmType = type ? this.getLLVMType(type.value) : null;

        if (initializer) {
            const value = this.visit(initializer);
            const alloca = this.builder.CreateAlloca(
                llvmType || value.getType(),
                null,
                varName
            );
            this.builder.CreateStore(value, alloca);
            this.symbolTable.set(varName, alloca);
        } else {
            if (!llvmType) {
                throw new Error('Type annotation required for uninitialized variables');
            }
            const alloca = this.builder.CreateAlloca(llvmType, null, varName);
            this.symbolTable.set(varName, alloca);
        }
    }

    visitBinaryExpression(node) {
        const [left, right] = node.children.map(child => this.visit(child));
        
        switch (node.value) {
            case '+':
                return this.builder.CreateAdd(left, right, 'addtmp');
            case '-':
                return this.builder.CreateSub(left, right, 'subtmp');
            case '*':
                return this.builder.CreateMul(left, right, 'multmp');
            case '/':
                return this.builder.CreateSDiv(left, right, 'divtmp');
            case '%':
                return this.builder.CreateSRem(left, right, 'modtmp');
            case '<':
                return this.builder.CreateICmpSLT(left, right, 'cmptmp');
            case '>':
                return this.builder.CreateICmpSGT(left, right, 'cmptmp');
            case '<=':
                return this.builder.CreateICmpSLE(left, right, 'cmptmp');
            case '>=':
                return this.builder.CreateICmpSGE(left, right, 'cmptmp');
            case '==':
                return this.builder.CreateICmpEQ(left, right, 'cmptmp');
            case '!=':
                return this.builder.CreateICmpNE(left, right, 'cmptmp');
            default:
                throw new Error(`Unknown binary operator: ${node.value}`);
        }
    }

    visitIdentifier(node) {
        const value = this.symbolTable.get(node.value);
        if (!value) {
            throw new Error(`Undefined variable: ${node.value}`);
        }
        return this.builder.CreateLoad(value.getType().getElementType(), value, node.value);
    }

    visitNumericLiteral(node) {
        return llvm.ConstantInt.get(this.context, node.value);
    }

    visitStringLiteral(node) {
        return this.builder.CreateGlobalStringPtr(node.value);
    }

    visitReturnStatement(node) {
        if (node.children.length === 0) {
            return this.builder.CreateRetVoid();
        }
        const value = this.visit(node.children[0]);
        return this.builder.CreateRet(value);
    }

    getLLVMType(typeStr) {
        switch (typeStr.toLowerCase()) {
            case 'void':
                return llvm.Type.getVoidTy(this.context);
            case 'bool':
                return llvm.Type.getInt1Ty(this.context);
            case 'int':
            case 'int32':
                return llvm.Type.getInt32Ty(this.context);
            case 'int64':
                return llvm.Type.getInt64Ty(this.context);
            case 'float':
                return llvm.Type.getFloatTy(this.context);
            case 'double':
                return llvm.Type.getDoubleTy(this.context);
            case 'string':
                return llvm.Type.getInt8PtrTy(this.context);
            default:
                throw new Error(`Unknown type: ${typeStr}`);
        }
    }

    // Tensor operations
    createTensor(dimensions, elementType) {
        const rank = dimensions.length;
        const shape = llvm.ConstantArray.get(
            llvm.ArrayType.get(llvm.Type.getInt64Ty(this.context), rank),
            dimensions.map(d => llvm.ConstantInt.get(this.context, d))
        );

        // Create tensor struct type
        const tensorType = llvm.StructType.create(this.context, 'Tensor');
        tensorType.setBody([
            llvm.Type.getInt32Ty(this.context), // rank
            llvm.ArrayType.get(llvm.Type.getInt64Ty(this.context), rank), // shape
            llvm.PointerType.get(elementType, 0) // data
        ]);

        return tensorType;
    }

    // Neural network operations
    createNeuralNetwork(layers) {
        // Implementation for neural network creation
        // This would involve creating LLVM structures for layers, weights, biases
        // and the necessary computation functions
    }
}

module.exports = {
    CodeGenerator
};
