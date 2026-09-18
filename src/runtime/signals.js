// Sanskrit Language Control Flow Signals
// Replaces global mutable flags on the interpreter

class ControlFlowSignal {
    constructor(type) {
        this.type = type;
    }
}

class ReturnSignal extends ControlFlowSignal {
    constructor(value) {
        super('RETURN');
        this.value = value;
    }
}

class BreakSignal extends ControlFlowSignal {
    constructor() {
        super('BREAK');
    }
}

class ContinueSignal extends ControlFlowSignal {
    constructor() {
        super('CONTINUE');
    }
}

class ThrowSignal extends ControlFlowSignal {
    constructor(value, loc = null) {
        super('THROW');
        this.value = value;
        this.loc = loc;
    }
}

module.exports = {
    ControlFlowSignal,
    ReturnSignal,
    BreakSignal,
    ContinueSignal,
    ThrowSignal
};
