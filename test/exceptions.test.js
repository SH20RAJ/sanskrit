const test = require('node:test');
const assert = require('node:assert/strict');
const { Lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/runtime');
const { ThrowSignal } = require('../src/runtime/signals');

function execute(code) {
    const outputs = [];
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const ast = parser.parse();
    const interpreter = new Interpreter({
        outputStream: (msg) => outputs.push(msg)
    });
    interpreter.interpret(ast);
    return outputs;
}

test('Exceptions: basic throw and catch', () => {
    const code = `
    प्रयत्न {
        फेंक "परीक्षण त्रुटि";
    } पकड़ (त्रुटि) {
        मुद्रण("पकड़ी गई:", त्रुटि);
    }
    `;
    const out = execute(code);
    assert.deepEqual(out, ['पकड़ी गई: परीक्षण त्रुटि']);
});

test('Exceptions: finally block executes after normal completion', () => {
    const code = `
    प्रयत्न {
        मुद्रण("प्रयास सफल");
    } अंततः {
        मुद्रण("अंततः कार्य संपन्न");
    }
    `;
    const out = execute(code);
    assert.deepEqual(out, ['प्रयास सफल', 'अंततः कार्य संपन्न']);
});

test('Exceptions: finally block executes after an error is caught', () => {
    const code = `
    प्रयत्न {
        फेंक "संकट!";
    } पकड़ (e) {
        मुद्रण("पकड़:", e);
    } अंततः {
        मुद्रण("सफाई पूर्ण");
    }
    `;
    const out = execute(code);
    assert.deepEqual(out, ['पकड़: संकट!', 'सफाई पूर्ण']);
});

test('Exceptions: nested try-catch blocks', () => {
    const code = `
    प्रयत्न {
        मुद्रण("बाहरी प्रयास");
        प्रयत्न {
            फेंक "भीतरी त्रुटि";
        } पकड़ (inner) {
            मुद्रण("भीतरी पकड़:", inner);
            फेंक "पुनः फेंकी गई";
        }
    } पकड़ (outer) {
        मुद्रण("बाहरी पकड़:", outer);
    }
    `;
    const out = execute(code);
    assert.deepEqual(out, [
        'बाहरी प्रयास',
        'भीतरी पकड़: भीतरी त्रुटि',
        'बाहरी पकड़: पुनः फेंकी गई'
    ]);
});

test('Exceptions: uncaught throw propagates out as ThrowSignal', () => {
    const code = `
    फेंक "असंभालित त्रुटि";
    `;
    assert.throws(() => {
        execute(code);
    }, (err) => err instanceof ThrowSignal && err.value === 'असंभालित त्रुटि');
});
