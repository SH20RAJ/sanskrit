// Sanskrit Language Standard Library Built-ins
const { SanskritInstance, SanskritClass, SanskritFunction } = require('./values');

function toDevanagariDigits(num) {
    return String(num).replace(/[0-9]/g, d =>
        String.fromCharCode(d.charCodeAt(0) - 0x30 + 0x0966)
    );
}

function parseToNumber(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const normalized = val.replace(/[०-९]/g, d =>
            String.fromCharCode(d.charCodeAt(0) - 0x0966 + 0x30)
        );
        const num = Number(normalized);
        return isNaN(num) ? undefined : num;
    }
    return undefined;
}

function formatValue(val) {
    if (val === null) return 'शून्य';
    if (val === undefined) return 'अपरिभाषित';
    if (val === true) return 'सत्य';
    if (val === false) return 'असत्य';

    if (typeof val === 'number') {
        return toDevanagariDigits(val);
    }

    if (typeof val === 'string') {
        return val;
    }

    if (Array.isArray(val)) {
        return '[' + val.map(formatValue).join(', ') + ']';
    }

    if (val instanceof SanskritInstance) {
        const entries = [];
        for (const [k, v] of val.fields.entries()) {
            entries.push(`${k}: ${formatValue(v)}`);
        }
        return `${val.sanskritClass.name} { ${entries.join(', ')} }`;
    }

    if (val instanceof SanskritClass) {
        return `<वर्ग ${val.name}>`;
    }

    if (val instanceof SanskritFunction) {
        return `<कार्य ${val.name || 'गुमनाम'}>`;
    }

    if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => `${k}: ${formatValue(v)}`);
        return '{ ' + entries.join(', ') + ' }';
    }

    return String(val);
}

function createBuiltins(outputStream = console.log) {
    const builtins = new Map();

    // मुद्रण (print)
    builtins.set('मुद्रण', (...args) => {
        const formatted = args.map(formatValue).join(' ');
        outputStream(formatted);
        return undefined;
    });

    // लंबाई (length)
    builtins.set('लंबाई', (obj) => {
        if (typeof obj === 'string' || Array.isArray(obj)) {
            return obj.length;
        }
        if (obj instanceof SanskritInstance) {
            return obj.fields.size;
        }
        if (obj && typeof obj === 'object') {
            return Object.keys(obj).length;
        }
        return 0;
    });

    // प्रकार (typeof)
    builtins.set('प्रकार', (obj) => {
        if (obj === null) return 'शून्य';
        if (obj === undefined) return 'अपरिभाषित';
        if (typeof obj === 'boolean') return 'बूलियन';
        if (typeof obj === 'number') return 'संख्या';
        if (typeof obj === 'string') return 'स्ट्रिंग';
        if (Array.isArray(obj)) return 'सूची';
        if (obj instanceof SanskritFunction || typeof obj === 'function') return 'कार्य';
        if (obj instanceof SanskritClass) return 'वर्ग';
        if (obj instanceof SanskritInstance || typeof obj === 'object') return 'वस्तु';
        return typeof obj;
    });

    // पार्स_संख्या (parse number)
    builtins.set('पार्स_संख्या', (str) => {
        return parseToNumber(str);
    });

    // Type casting
    builtins.set('स्ट्रिंग', (val) => formatValue(val));
    builtins.set('संख्या', (val) => parseToNumber(val) || 0);
    builtins.set('बूलियन', (val) => Boolean(val));

    // गणित (Math) utilities
    builtins.set('गणित_वर्ग', (x) => Math.sqrt(x));
    builtins.set('गणित_शक्ति', (base, exp) => Math.pow(base, exp));
    builtins.set('गणित_न्यूनतम', (...args) => {
        if (args.length === 1) return Math.floor(args[0]);
        return Math.min(...args);
    });
    builtins.set('गणित_अधिकतम', (...args) => Math.max(...args));
    builtins.set('गणित_पूर्णांक', (x) => Math.floor(x));
    builtins.set('गणित_तली', (x) => Math.floor(x));
    builtins.set('गणित_छत', (x) => Math.ceil(x));
    builtins.set('गणित_गोल', (x) => Math.round(x));
    builtins.set('गणित_यादृच्छिक', () => Math.random());

    // समय & प्रतीक्षा
    builtins.set('समय', () => Date.now());
    builtins.set('प्रतीक्षा', async (ms) => new Promise(resolve => setTimeout(resolve, ms)));

    return builtins;
}

module.exports = {
    createBuiltins,
    formatValue,
    toDevanagariDigits,
    parseToNumber
};
