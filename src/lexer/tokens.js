// Sanskrit Language Token Definitions and Keywords

const TokenTypes = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    OPERATOR: 'OPERATOR',
    DELIMITER: 'DELIMITER',
    EOF: 'EOF'
};

// Sanskrit Language Keywords with English equivalents & meanings
const Keywords = new Map([
    // Declarations
    ['कार्य', { english: 'function', category: 'declaration', description: 'Function declaration' }],
    ['चर', { english: 'var/let', category: 'declaration', description: 'Mutable variable declaration' }],
    ['स्थिर', { english: 'const', category: 'declaration', description: 'Constant variable declaration' }],

    // Object-Oriented Programming
    ['वर्ग', { english: 'class', category: 'oop', description: 'Class declaration' }],
    ['विस्तार', { english: 'extends', category: 'oop', description: 'Class inheritance' }],
    ['निर्माण', { english: 'constructor', category: 'oop', description: 'Class constructor method' }],
    ['स्व', { english: 'this', category: 'oop', description: 'Current instance reference' }],
    ['सुपर', { english: 'super', category: 'oop', description: 'Parent class reference' }],
    ['स्थैतिक', { english: 'static', category: 'oop', description: 'Static class method/property' }],
    ['नया', { english: 'new', category: 'oop', description: 'Instantiate class' }],

    // Control Flow
    ['यदि', { english: 'if', category: 'control_flow', description: 'Conditional statement' }],
    ['अन्यथा', { english: 'else', category: 'control_flow', description: 'Alternative branch' }],
    ['यावत्', { english: 'while', category: 'control_flow', description: 'While loop' }],
    ['पुनः', { english: 'for', category: 'control_flow', description: 'For loop' }],
    ['प्रत्येक', { english: 'foreach', category: 'control_flow', description: 'For-each iteration' }],
    ['में', { english: 'in', category: 'control_flow', description: 'In collection' }],
    ['का', { english: 'of', category: 'control_flow', description: 'Of collection' }],
    ['स्विच', { english: 'switch', category: 'control_flow', description: 'Switch statement' }],
    ['केस', { english: 'case', category: 'control_flow', description: 'Switch case branch' }],
    ['डिफ़ॉल्ट', { english: 'default', category: 'control_flow', description: 'Default case branch' }],
    ['तोड़', { english: 'break', category: 'control_flow', description: 'Break loop/switch' }],
    ['जारी', { english: 'continue', category: 'control_flow', description: 'Continue loop' }],
    ['प्रत्यागम', { english: 'return', category: 'control_flow', description: 'Return value from function' }],

    // Error Handling
    ['प्रयत्न', { english: 'try', category: 'error_handling', description: 'Try block' }],
    ['पकड़', { english: 'catch', category: 'error_handling', description: 'Catch error block' }],
    ['अंततः', { english: 'finally', category: 'error_handling', description: 'Finally block' }],
    ['फेंक', { english: 'throw', category: 'error_handling', description: 'Throw error' }],

    // Literal Keywords
    ['सत्य', { english: 'true', category: 'literal', description: 'Boolean true' }],
    ['असत्य', { english: 'false', category: 'literal', description: 'Boolean false' }],
    ['शून्य', { english: 'null', category: 'literal', description: 'Null literal' }],
    ['अपरिभाषित', { english: 'undefined', category: 'literal', description: 'Undefined literal' }],

    // Logical Operators as Keywords
    ['और', { english: 'and', category: 'operator', description: 'Logical AND (&&)' }],
    ['या', { english: 'or', category: 'operator', description: 'Logical OR (||)' }],
    ['नहीं', { english: 'not', category: 'operator', description: 'Logical NOT (!)' }]
]);

class Token {
    constructor(type, value, line, column, raw = value) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.raw = raw;
    }

    toString() {
        return `Token(${this.type}, ${JSON.stringify(this.value)}, line: ${this.line}, col: ${this.column})`;
    }
}

module.exports = {
    TokenTypes,
    Keywords,
    Token
};
