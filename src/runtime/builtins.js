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

function createBuiltins(outputStream = console.log, interpreter = null) {
    const builtins = new Map();

    function callUserFunction(fn, args) {
        if (fn && (fn instanceof SanskritFunction || (fn.constructor && fn.constructor.name === 'SanskritBoundMethod'))) {
            if (interpreter) {
                return fn.call(interpreter, args);
            }
            throw new Error('Interpreter required to invoke Sanskrit function');
        }
        if (typeof fn === 'function') {
            return fn(...args);
        }
        throw new Error(`Value is not a callable function`);
    }

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

    // Pythonic & Functional Utilities
    // श्रेणी (range)
    builtins.set('श्रेणी', (...args) => {
        let start = 0, stop = 0, step = 1;
        if (args.length === 1) {
            stop = Number(args[0]) || 0;
        } else if (args.length === 2) {
            start = Number(args[0]) || 0;
            stop = Number(args[1]) || 0;
        } else if (args.length >= 3) {
            start = Number(args[0]) || 0;
            stop = Number(args[1]) || 0;
            step = Number(args[2]) || 1;
        }
        if (step === 0) throw new Error('श्रेणी (range) step cannot be zero');
        const result = [];
        if (step > 0) {
            for (let i = start; i < stop; i += step) result.push(i);
        } else {
            for (let i = start; i > stop; i += step) result.push(i);
        }
        return result;
    });

    // मानचित्रण (map)
    builtins.set('मानचित्रण', (arg1, arg2) => {
        const fn = typeof arg1 === 'function' || (arg1 && arg1 instanceof SanskritFunction) ? arg1 : arg2;
        const list = fn === arg1 ? arg2 : arg1;
        if (!list || typeof list[Symbol.iterator] !== 'function') {
            throw new Error('मानचित्रण (map) requires an iterable collection');
        }
        const result = [];
        let idx = 0;
        for (const item of list) {
            result.push(callUserFunction(fn, [item, idx++]));
        }
        return result;
    });

    // शोधन (filter)
    builtins.set('शोधन', (arg1, arg2) => {
        const fn = typeof arg1 === 'function' || (arg1 && arg1 instanceof SanskritFunction) ? arg1 : arg2;
        const list = fn === arg1 ? arg2 : arg1;
        if (!list || typeof list[Symbol.iterator] !== 'function') {
            throw new Error('शोधन (filter) requires an iterable collection');
        }
        const result = [];
        let idx = 0;
        for (const item of list) {
            const keep = callUserFunction(fn, [item, idx++]);
            if (keep) result.push(item);
        }
        return result;
    });

    // संक्षिप्त (reduce)
    builtins.set('संक्षिप्त', (fn, list, initial) => {
        if (!list || typeof list[Symbol.iterator] !== 'function') {
            throw new Error('संक्षिप्त (reduce) requires an iterable collection');
        }
        const arr = Array.isArray(list) ? list : Array.from(list);
        let accumulator = initial;
        let startIdx = 0;
        if (accumulator === undefined) {
            if (arr.length === 0) throw new Error('संक्षिप्त (reduce) of empty sequence with no initial value');
            accumulator = arr[0];
            startIdx = 1;
        }
        for (let i = startIdx; i < arr.length; i++) {
            accumulator = callUserFunction(fn, [accumulator, arr[i], i]);
        }
        return accumulator;
    });

    // योग (sum)
    builtins.set('योग', (coll, start = 0) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return Number(coll) || 0;
        let total = start;
        for (const x of coll) total += Number(x) || 0;
        return total;
    });

    // सभी (all)
    builtins.set('सभी', (coll) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return Boolean(coll);
        for (const x of coll) {
            if (!x) return false;
        }
        return true;
    });

    // कोई (any)
    builtins.set('कोई', (coll) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return Boolean(coll);
        for (const x of coll) {
            if (x) return true;
        }
        return false;
    });

    // उलटा (reversed)
    builtins.set('उलटा', (coll) => {
        if (typeof coll === 'string') return coll.split('').reverse().join('');
        if (Array.isArray(coll)) return [...coll].reverse();
        if (coll && typeof coll[Symbol.iterator] === 'function') return Array.from(coll).reverse();
        return coll;
    });

    // क्रमबद्ध (sorted)
    builtins.set('क्रमबद्ध', (coll, keyFn = null) => {
        const arr = Array.isArray(coll) ? [...coll] : Array.from(coll || []);
        if (keyFn) {
            return arr.sort((a, b) => {
                const ka = callUserFunction(keyFn, [a]);
                const kb = callUserFunction(keyFn, [b]);
                return ka < kb ? -1 : (ka > kb ? 1 : 0);
            });
        }
        return arr.sort((a, b) => (a < b ? -1 : (a > b ? 1 : 0)));
    });

    // संयोजन (zip)
    builtins.set('संयोजन', (...iterables) => {
        if (iterables.length === 0) return [];
        const arrays = iterables.map(it => Array.isArray(it) ? it : Array.from(it || []));
        const minLen = Math.min(...arrays.map(a => a.length));
        const result = [];
        for (let i = 0; i < minLen; i++) {
            result.push(arrays.map(a => a[i]));
        }
        return result;
    });

    // क्रमांकन (enumerate)
    builtins.set('क्रमांकन', (coll, start = 0) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return [];
        const result = [];
        let idx = Number(start) || 0;
        for (const item of coll) {
            result.push([idx++, item]);
        }
        return result;
    });

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
