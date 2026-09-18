// Sanskrit Language Lexical Environment
const { NameError, ConstantError, RuntimeError } = require('../diagnostics/errors');

class Environment {
    constructor(parent = null) {
        this.parent = parent;
        this.bindings = new Map();
    }

    createChild() {
        return new Environment(this);
    }

    declare(name, value = undefined, isConstant = false, loc = null) {
        if (this.bindings.has(name)) {
            throw new RuntimeError(`Identifier '${name}' has already been declared in this scope`, {
                line: loc ? loc.line : 1,
                column: loc ? loc.column : 1,
                hint: `Choose a different name or assign without 'चर' / 'स्थिर'`
            });
        }

        this.bindings.set(name, {
            value,
            isConstant: Boolean(isConstant)
        });

        return value;
    }

    assign(name, value, loc = null) {
        if (this.bindings.has(name)) {
            const binding = this.bindings.get(name);
            if (binding.isConstant) {
                throw new ConstantError(`Assignment to constant variable '${name}'`, {
                    line: loc ? loc.line : 1,
                    column: loc ? loc.column : 1,
                    hint: `'${name}' was declared with 'स्थिर' (const) and cannot be reassigned`
                });
            }
            binding.value = value;
            return value;
        }

        if (this.parent) {
            return this.parent.assign(name, value, loc);
        }

        throw new NameError(`Variable '${name}' is not defined`, {
            line: loc ? loc.line : 1,
            column: loc ? loc.column : 1,
            hint: `Declare it first using: चर ${name} = ...;`
        });
    }

    lookup(name, loc = null) {
        if (this.bindings.has(name)) {
            return this.bindings.get(name).value;
        }

        if (this.parent) {
            return this.parent.lookup(name, loc);
        }

        throw new NameError(`Variable '${name}' is not defined`, {
            line: loc ? loc.line : 1,
            column: loc ? loc.column : 1,
            hint: `Make sure '${name}' is spelled correctly and in scope`
        });
    }

    exists(name) {
        if (this.bindings.has(name)) return true;
        if (this.parent) return this.parent.exists(name);
        return false;
    }
}

module.exports = { Environment };
