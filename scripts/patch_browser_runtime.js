const fs = require('fs');

const filePath = 'docs/sanskrit-browser.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Patch readIdentifier
const oldReadIdent = `        const type = Keywords.has(value) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
        return new Token(type, value, startLine, startColumn, value);`;

const newReadIdent = `        // Dual-Script Invariance: map Latin and alternate keywords to canonical Devanagari
        const CANONICAL_MAP = {
            'fn': 'कार्य',
            'function': 'कार्य',
            'let': 'चर',
            'var': 'चर',
            'mut': 'चर',
            'मान': 'चर',
            'man': 'चर',
            'const': 'स्थिर',
            'class': 'वर्ग',
            'extends': 'विस्तार',
            'constructor': 'निर्माण',
            'this': 'स्व',
            'super': 'सुपर',
            'new': 'नया',
            'static': 'स्थैतिक',
            'if': 'यदि',
            'else': 'अन्यथा',
            'while': 'यावत्',
            'for': 'पुनः',
            'foreach': 'प्रत्येक',
            'in': 'में',
            'of': 'का',
            'switch': 'स्विच',
            'case': 'केस',
            'default': 'डिफ़ॉल्ट',
            'break': 'तोड़',
            'continue': 'जारी',
            'return': 'प्रत्यागम',
            'try': 'प्रयत्न',
            'catch': 'पकड़',
            'finally': 'अंततः',
            'throw': 'फेंक',
            'true': 'सत्य',
            'सत्यम्': 'सत्य',
            'false': 'असत्य',
            'असत्यम्': 'असत्य',
            'null': 'शून्य',
            'शून्यम्': 'शून्य',
            'undefined': 'अपरिभाषित',
            'and': 'और',
            'or': 'या',
            'not': 'नहीं'
        };

        const canonical = CANONICAL_MAP[value] || value;
        const isKeyword = Keywords.has(canonical);
        const type = isKeyword ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
        return new Token(type, isKeyword ? canonical : value, startLine, startColumn, value);`;

if (!content.includes(oldReadIdent)) {
    console.error('Failed to locate oldReadIdent in', filePath);
    process.exit(1);
}
content = content.replace(oldReadIdent, newReadIdent);

// 2. Patch formatValue
const oldFormatObj = `    if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => \`\${k}: \${formatValue(v)}\`);
        return '{ ' + entries.join(', ') + ' }';
    }`;

const newFormatObj = `    if (val && typeof val.toString === 'function' && val.toString !== Object.prototype.toString) {
        return val.toString();
    }

    if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => \`\${k}: \${formatValue(v)}\`);
        return '{ ' + entries.join(', ') + ' }';
    }`;

if (!content.includes(oldFormatObj)) {
    console.error('Failed to locate oldFormatObj in', filePath);
    process.exit(1);
}
content = content.replace(oldFormatObj, newFormatObj);

// 3. Patch createBuiltins & callUserFunction
const oldCallUser = `    function callUserFunction(fn, args) {
        if (fn && (fn instanceof SanskritFunction || (fn.constructor && fn.constructor.name === 'SanskritBoundMethod'))) {
            if (interpreter) {
                return fn.call(interpreter, args);
            }
            throw new Error('Interpreter required to invoke Sanskrit function');
        }
        if (typeof fn === 'function') {
            return fn(...args);
        }
        throw new Error(\`Value is not a callable function\`);
    }`;

const newCallUser = `    function callUserFunction(fn, args) {
        if (!fn) throw new Error('Cannot invoke null or undefined');
        if (fn instanceof SanskritFunction || (fn.constructor && fn.constructor.name === 'SanskritBoundMethod')) {
            if (interpreter) {
                return fn.call(interpreter, args);
            }
        }
        if (typeof fn === 'function') {
            return fn(...args);
        }
        if (typeof fn.call === 'function') {
            return fn.call(interpreter || null, args);
        }
        throw new Error(\`Value is not a callable function\`);
    }`;

if (!content.includes(oldCallUser)) {
    console.error('Failed to locate oldCallUser in', filePath);
    process.exit(1);
}
content = content.replace(oldCallUser, newCallUser);

// 4. Add Tensor, Autodiff, and English builtins before "return builtins;"
const oldReturnBuiltins = `    // समय & प्रतीक्षा
    builtins.set('समय', () => Date.now());
    builtins.set('प्रतीक्षा', async (ms) => new Promise(resolve => setTimeout(resolve, ms)));

    return builtins;`;

const newReturnBuiltins = `    // समय & प्रतीक्षा
    builtins.set('समय', () => Date.now());
    builtins.set('प्रतीक्षा', async (ms) => new Promise(resolve => setTimeout(resolve, ms)));

    // =========================================================================
    // Sanskrit Next v2.0 AI/ML First-Class Primitives: Tensor & Autodiff
    // =========================================================================
    class SanskritTensor {
        constructor(data, shape) {
            this.data = Array.isArray(data) ? data : [data];
            this.shape = Array.isArray(shape) ? shape : [this.data.length];
        }

        static zeros(shape) {
            const size = shape.reduce((a, b) => a * b, 1);
            return new SanskritTensor(new Array(size).fill(0), shape);
        }

        static ones(shape) {
            const size = shape.reduce((a, b) => a * b, 1);
            return new SanskritTensor(new Array(size).fill(1), shape);
        }

        static from_vec(data, shape) {
            return new SanskritTensor(data, shape);
        }

        static from_array(data, shape) {
            return new SanskritTensor(data, shape);
        }

        matmul(other) {
            if (!other || !other.shape) {
                throw new Error('Tensor.matmul expects a valid Tensor operand');
            }
            const [r1, c1] = this.shape;
            const [r2, c2] = other.shape;
            if (c1 !== r2) {
                throw new Error(\`Dimension mismatch: cannot multiply [\${r1}, \${c1}] by [\${r2}, \${c2}]\`);
            }
            const out = new Array(r1 * c2).fill(0);
            for (let i = 0; i < r1; i++) {
                for (let j = 0; j < c2; j++) {
                    let sum = 0;
                    for (let k = 0; k < c1; k++) {
                        sum += this.data[i * c1 + k] * other.data[k * c2 + j];
                    }
                    out[i * c2 + j] = sum;
                }
            }
            return new SanskritTensor(out, [r1, c2]);
        }

        add(other) {
            if (other instanceof SanskritTensor) {
                return new SanskritTensor(this.data.map((v, i) => v + (other.data[i] || 0)), this.shape);
            }
            return new SanskritTensor(this.data.map(v => v + other), this.shape);
        }

        sub(other) {
            if (other instanceof SanskritTensor) {
                return new SanskritTensor(this.data.map((v, i) => v - (other.data[i] || 0)), this.shape);
            }
            return new SanskritTensor(this.data.map(v => v - other), this.shape);
        }

        toString() {
            if (this.shape.length === 2) {
                const [rows, cols] = this.shape;
                const lines = [];
                for (let r = 0; r < rows; r++) {
                    const row = this.data.slice(r * cols, (r + 1) * cols);
                    lines.push('  [' + row.join(', ') + ']');
                }
                return \`Tensor(shape=[\${this.shape.join(', ')}], dtype=F32, data=[\\n\${lines.join(',\\n')}\\n])\`;
            }
            return \`Tensor(shape=[\${this.shape.join(', ')}], data=[\${this.data.join(', ')}])\`;
        }
    }

    function autodiffFn(fn, x) {
        const xVal = typeof x === 'number' ? x : Number(x);
        if (isNaN(xVal)) throw new Error('autodiff expects a numerical point');

        // Central difference forward-mode analytical approximation
        const h = 1e-7;
        const fx = callUserFunction(fn, [xVal]);
        const fxPlus = callUserFunction(fn, [xVal + h]);
        const fxMinus = callUserFunction(fn, [xVal - h]);
        const deriv = (fxPlus - fxMinus) / (2 * h);
        const roundedDeriv = Math.round(deriv * 10000) / 10000;
        return {
            value: fx,
            derivative: roundedDeriv,
            toString: () => \`DerivativeResult(value=\${fx}, derivative=\${roundedDeriv})\`
        };
    }

    const mathObj = {
        sqrt: Math.sqrt,
        pow: Math.pow,
        abs: Math.abs,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        exp: Math.exp,
        log: Math.log,
        min: Math.min,
        max: Math.max,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        random: Math.random,
        PI: Math.PI,
        E: Math.E,
        वर्ग: Math.sqrt,
        शक्ति: Math.pow,
        तली: Math.floor,
        छत: Math.ceil,
        गोल: Math.round,
        यादृच्छिक: Math.random
    };

    function assertFn(condition, message = 'Assertion failed') {
        if (!condition) throw new Error('AssertionError (निश्चय): ' + message);
        return true;
    }

    function panicFn(message = 'Program panic') {
        throw new Error('Panic (विफल): ' + message);
    }

    // Register Sanskrit Next v2.0 AI/ML primitives
    builtins.set('Tensor', SanskritTensor);
    builtins.set('दिश', SanskritTensor);
    builtins.set('autodiff', autodiffFn);
    builtins.set('अवकलन', autodiffFn);
    builtins.set('Math', mathObj);
    builtins.set('गणित', mathObj);
    builtins.set('assert', assertFn);
    builtins.set('निश्चय', assertFn);
    builtins.set('panic', panicFn);
    builtins.set('विफल', panicFn);

    // Dual-Script Parity Aliases
    builtins.set('print', builtins.get('मुद्रण'));
    builtins.set('len', builtins.get('लंबाई'));
    builtins.set('length', builtins.get('लंबाई'));
    builtins.set('typeof', builtins.get('प्रकार'));
    builtins.set('range', builtins.get('श्रेणी'));
    builtins.set('map', builtins.get('मानचित्रण'));
    builtins.set('filter', builtins.get('शोधन'));
    builtins.set('reduce', builtins.get('संक्षिप्त'));
    builtins.set('sum', builtins.get('योग'));
    builtins.set('all', builtins.get('सभी'));
    builtins.set('any', builtins.get('कोई'));
    builtins.set('zip', builtins.get('संयोजन'));
    builtins.set('enumerate', builtins.get('क्रमांकन'));
    builtins.set('time', builtins.get('समय'));
    builtins.set('sleep', builtins.get('प्रतीक्षा'));

    return builtins;`;

if (!content.includes(oldReturnBuiltins)) {
    console.error('Failed to locate oldReturnBuiltins in', filePath);
    process.exit(1);
}
content = content.replace(oldReturnBuiltins, newReturnBuiltins);

fs.writeFileSync(filePath, content, 'utf8');
fs.writeFileSync('sanskrit-browser.js', content, 'utf8');
console.log('Successfully patched docs/sanskrit-browser.js and sanskrit-browser.js!');
