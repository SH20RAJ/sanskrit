// Sanskrit Language Object Model & Runtime Values
const { ReturnSignal } = require('./signals');
const { RuntimeError, TypeError } = require('../diagnostics/errors');

class SanskritFunction {
    constructor(name, params, body, closure, isExpressionBody = false) {
        this.name = name;
        this.params = params; // array of string names
        this.body = body;
        this.closure = closure; // Environment
        this.isExpressionBody = isExpressionBody;
    }

    call(interpreter, args = [], loc = null) {
        const callEnv = this.closure.createChild();

        // Bind arguments to parameters
        for (let i = 0; i < this.params.length; i++) {
            const paramName = this.params[i];
            const argVal = i < args.length ? args[i] : undefined;
            callEnv.declare(paramName, argVal, false, loc);
        }

        if (this.isExpressionBody) {
            return interpreter.evaluate(this.body, callEnv);
        }

        try {
            interpreter.execute(this.body, callEnv);
        } catch (signal) {
            if (signal instanceof ReturnSignal) {
                return signal.value;
            }
            throw signal;
        }

        return undefined;
    }

    toString() {
        return `<कार्य ${this.name || 'गुमनाम'}>`;
    }
}

class SanskritClass {
    constructor(name, superClass = null) {
        this.name = name;
        this.superClass = superClass; // SanskritClass or null
        this.methods = new Map();
        this.staticMethods = new Map();
        this.constructorMethod = null;
        this.closure = null; // Environment where class was defined
    }

    findMethod(name) {
        if (this.methods.has(name)) {
            return this.methods.get(name);
        }
        if (this.superClass) {
            return this.superClass.findMethod(name);
        }
        return null;
    }

    findStaticMethod(name) {
        if (this.staticMethods.has(name)) {
            return this.staticMethods.get(name);
        }
        if (this.superClass) {
            return this.superClass.findStaticMethod(name);
        }
        return null;
    }

    findConstructor() {
        if (this.constructorMethod) {
            return this.constructorMethod;
        }
        if (this.superClass) {
            return this.superClass.findConstructor();
        }
        return null;
    }

    instantiate(interpreter, args = [], loc = null) {
        const instance = new SanskritInstance(this);
        const ctor = this.findConstructor();

        if (ctor) {
            const boundCtor = new SanskritBoundMethod(instance, ctor, this.closure);
            boundCtor.call(interpreter, args, loc);
        }

        return instance;
    }

    get(prop, loc = null) {
        const staticMethod = this.findStaticMethod(prop);
        if (staticMethod) {
            return new SanskritBoundMethod(this, staticMethod, this.closure, true);
        }
        return undefined;
    }

    toString() {
        return `<वर्ग ${this.name}>`;
    }
}

class SanskritInstance {
    constructor(sanskritClass) {
        this.sanskritClass = sanskritClass;
        this.fields = new Map();
    }

    get(prop, loc = null) {
        if (this.fields.has(prop)) {
            return this.fields.get(prop);
        }

        const method = this.sanskritClass.findMethod(prop);
        if (method) {
            return new SanskritBoundMethod(this, method, this.sanskritClass.closure);
        }

        return undefined;
    }

    set(prop, value) {
        this.fields.set(prop, value);
        return value;
    }

    toString() {
        return `<${this.sanskritClass.name} वस्तु>`;
    }
}

class SanskritBoundMethod {
    constructor(instanceOrClass, methodNode, closure, isStatic = false) {
        this.target = instanceOrClass; // instance (or class for static)
        this.methodNode = methodNode;
        this.closure = closure;
        this.isStatic = isStatic;
    }

    call(interpreter, args = [], loc = null) {
        const callEnv = (this.closure || interpreter.globalEnv).createChild();

        // Bind 'स्व' (this)
        callEnv.declare('स्व', this.target, false, loc);

        // Bind 'सुपर' (super) if target is instance and class has superClass
        if (!this.isStatic && this.target instanceof SanskritInstance && this.target.sanskritClass.superClass) {
            const superClass = this.target.sanskritClass.superClass;
            const superCtor = (...superArgs) => {
                const parentCtor = superClass.findConstructor();
                if (parentCtor) {
                    const bound = new SanskritBoundMethod(this.target, parentCtor, superClass.closure);
                    return bound.call(interpreter, superArgs, loc);
                }
            };
            callEnv.declare('सुपर', superCtor, false, loc);
        }

        // Bind parameters
        const paramNames = this.methodNode.params.map(p => p.name);
        for (let i = 0; i < paramNames.length; i++) {
            const pName = paramNames[i];
            const pVal = i < args.length ? args[i] : undefined;
            callEnv.declare(pName, pVal, false, loc);
        }

        try {
            interpreter.execute(this.methodNode.body, callEnv);
        } catch (signal) {
            if (signal instanceof ReturnSignal) {
                return signal.value;
            }
            throw signal;
        }

        return undefined;
    }

    toString() {
        return `<विधि ${this.methodNode.id ? this.methodNode.id.name : 'कार्य'}>`;
    }
}

module.exports = {
    SanskritFunction,
    SanskritClass,
    SanskritInstance,
    SanskritBoundMethod
};
