// Test Suite for Pythonic and Advanced Concepts in Sanskrit
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { Sanskrit } = require('../src/index');

describe('Pythonic Extensions', () => {
    test('Slicing: array slicing with start, stop, step and negatives', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर संख्याएं = [१०, २०, ३०, ४०, ५०];
            मुद्रण(संख्याएं[१:४]);
            मुद्रण(संख्याएं[:३]);
            मुद्रण(संख्याएं[२:]);
            मुद्रण(संख्याएं[::२]);
            मुद्रण(संख्याएं[::-१]);
        `;

        sanskrit.run(code);
        assert.equal(output[0], '[२०, ३०, ४०]');
        assert.equal(output[1], '[१०, २०, ३०]');
        assert.equal(output[2], '[३०, ४०, ५०]');
        assert.equal(output[3], '[१०, ३०, ५०]');
        assert.equal(output[4], '[५०, ४०, ३०, २०, १०]');
    });

    test('Slicing: string slicing and reversing', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर पाठ = "संस्कृतभाषा";
            चर आंग्ल = "sanskrit";
            मुद्रण(पाठ[०:७]);
            मुद्रण(आंग्ल[::-१]);
        `;

        sanskrit.run(code);
        assert.equal(output[0], 'संस्कृत');
        assert.equal(output[1], 'tirksnas');
    });

    test('List Comprehensions: transformation and optional filtering', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर मूल = [१, २, ३, ४, ५, ६];
            चर वर्ग = [x * x पुनः (x में मूल)];
            चर सम_द्वि = [x * २ पुनः (x में मूल) यदि (x % २ === ०)];
            मुद्रण(वर्ग);
            मुद्रण(सम_द्वि);
        `;

        sanskrit.run(code);
        assert.equal(output[0], '[१, ४, ९, १६, २५, ३६]');
        assert.equal(output[1], '[४, ८, १२]');
    });

    test('Arrow Functions: lambdas with expression body and block body', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर योग = (क, ख) => क + ख;
            चर द्वि = x => x * २;
            चर विस्तृत = (क, ख) => {
                चर परिणाम = क * ख;
                प्रत्यागम परिणाम + १०;
            };
            चर कार्य_रूप = कार्य(x) => x + १००;

            मुद्रण(योग(५, १०));
            मुद्रण(द्वि(७));
            मुद्रण(विस्तृत(३, ४));
            मुद्रण(कार्य_रूप(५०));
        `;

        sanskrit.run(code);
        assert.equal(output[0], '१५');
        assert.equal(output[1], '१४');
        assert.equal(output[2], '२२');
        assert.equal(output[3], '१५०');
    });

    test('Conditional Expression: Pythonic ternary (consequent यदि test अन्यथा alternate)', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर आयु = १८;
            चर स्थिति = "वयस्क" यदि (आयु >= १८) अन्यथा "नाबालिग";
            मुद्रण(स्थिति);

            चर न्यून_आयु = १५;
            स्थिति = "वयस्क" यदि (न्यून_आयु >= १८) अन्यथा "नाबालिग";
            मुद्रण(स्थिति);
        `;

        sanskrit.run(code);
        assert.equal(output[0], 'वयस्क');
        assert.equal(output[1], 'नाबालिग');
    });

    test('Functional Built-ins: श्रेणी, मानचित्रण, शोधन, संक्षिप्त, योग', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर अंक = श्रेणी(१, ६); // [1, 2, 3, 4, 5]
            मुद्रण(अंक);

            चर गुणा_दस = मानचित्रण(अंक, x => x * १०);
            मुद्रण(गुणा_दस);

            चर केवल_सम = शोधन(अंक, x => x % २ === ०);
            मुद्रण(केवल_सम);

            चर कुल_योग = संक्षिप्त((संचय, x) => संचय + x, अंक, ०);
            मुद्रण(कुल_योग);

            चर सीधा_योग = योग(अंक);
            मुद्रण(सीधा_योग);
        `;

        sanskrit.run(code);
        assert.equal(output[0], '[१, २, ३, ४, ५]');
        assert.equal(output[1], '[१०, २०, ३०, ४०, ५०]');
        assert.equal(output[2], '[२, ४]');
        assert.equal(output[3], '१५');
        assert.equal(output[4], '१५');
    });

    test('Functional Built-ins: सभी, कोई, उलटा, क्रमबद्ध, संयोजन, क्रमांकन', () => {
        const sanskrit = new Sanskrit();
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर परीक्षण_१ = [सत्य, सत्य, असत्य];
            मुद्रण(सभी(परीक्षण_१));
            मुद्रण(कोई(परीक्षण_१));

            चर अव्यवस्थित = [४०, १०, ५०, २०, ३०];
            मुद्रण(क्रमबद्ध(अव्यवस्थित));
            मुद्रण(उलटा(अव्यवस्थित));

            चर नाम = ["अ", "ब"];
            चर मान = [१, २];
            मुद्रण(संयोजन(नाम, मान));
            मुद्रण(क्रमांकन(नाम));
        `;

        sanskrit.run(code);
        assert.equal(output[0], 'असत्य');
        assert.equal(output[1], 'सत्य');
        assert.equal(output[2], '[१०, २०, ३०, ४०, ५०]');
        assert.equal(output[3], '[३०, २०, ५०, १०, ४०]');
        assert.equal(output[4], '[[अ, १], [ब, २]]');
        assert.equal(output[5], '[[०, अ], [१, ब]]');
    });
});
