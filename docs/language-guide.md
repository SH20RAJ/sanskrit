# Sanskrit Programming Language Guide

## Introduction

Sanskrit is a programming language that uses Sanskrit vocabulary and Devanagari script. This guide covers the basic concepts and syntax of the language.

## Basic Syntax

### Comments

```sanskrit
// एक पंक्ति टिप्पणी (Single line comment)

/* 
बहु पंक्ति टिप्पणी
(Multi-line comment)
*/
```

### Functions

Functions are declared using the `कार्य` (kārya) keyword:

```sanskrit
कार्य नमस्ते() {
    मुद्रण("नमस्ते विश्व!");
}

// Function with parameters
कार्य योग(क, ख) {
    मुद्रण(क + ख);
}

// Calling functions
नमस्ते();
योग(१०, २०);  // Outputs: ३०
```

### Strings

Strings can be written in both Devanagari and Latin scripts:

```sanskrit
मुद्रण("संस्कृत भाषा");
मुद्रण("Sanskrit Language");

// String concatenation
मुद्रण("संस्कृत" + " " + "भाषा");
```

### Numbers

Sanskrit supports both Devanagari and Arabic numerals:

```sanskrit
// Devanagari numerals
मुद्रण(१ + २);      // Outputs: ३
मुद्रण(१० * २०);    // Outputs: २००

// Arabic numerals
मुद्रण(1 + 2);      // Outputs: ३
मुद्रण(10 * 20);    // Outputs: २००
```

### Built-in Functions

#### मुद्रण (Print)
Prints values to the console:

```sanskrit
मुद्रण("Hello");              // Prints: Hello
मुद्रण(१० + २०);              // Prints: ३०
मुद्रण("संख्या:", १०);        // Prints: संख्या: १०
```

## Coming Soon

The following features are under development:

### Variables (Coming Soon)

```sanskrit
चर नाम = "राम";
स्थिर संख्या = ४२;
```

### Control Flow (Coming Soon)

```sanskrit
यदि (क > ख) {
    मुद्रण("क बड़ा है");
} अन्यथा {
    मुद्रण("ख बड़ा है");
}

यावत् (क < १०) {
    मुद्रण(क);
    क = क + १;
}
```

### Arrays (Coming Soon)

```sanskrit
चर सूची = [१, २, ३, ४, ५];
मुद्रण(सूची[०]);  // Prints: १
```

### Objects (Coming Soon)

```sanskrit
चर विद्यार्थी = {
    नाम: "राम",
    आयु: २०,
    कक्षा: "द्वादश"
};
```

## Best Practices

1. **Use Meaningful Names**: Choose Sanskrit words that clearly describe your variables and functions.
2. **Consistent Script**: Try to stick to either Devanagari or Latin script within a single file.
3. **Comments**: Add comments in Sanskrit or English to explain complex logic.
4. **Formatting**: Use proper indentation and spacing for better readability.

## Error Messages

Common error messages you might encounter:

- `Function is not defined`: Function name is misspelled or not declared
- `Unexpected token`: Syntax error in your code
- `Cannot read property of undefined`: Trying to access an undefined value

## Examples

Here are some complete examples to help you get started:

### Basic Calculator

```sanskrit
कार्य जोड़(क, ख) {
    मुद्रण(क + ख);
}

कार्य घटा(क, ख) {
    मुद्रण(क - ख);
}

कार्य गुणा(क, ख) {
    मुद्रण(क * ख);
}

कार्य भाग(क, ख) {
    मुद्रण(क / ख);
}

// Usage
जोड़(१०, ५);   // Outputs: १५
घटा(१०, ५);   // Outputs: ५
गुणा(१०, ५);  // Outputs: ५०
भाग(१०, ५);   // Outputs: २
```

### String Operations

```sanskrit
कार्य नमस्कार(नाम) {
    मुद्रण("नमस्ते " + नाम + "!");
}

नमस्कार("राम");    // Outputs: नमस्ते राम!
नमस्कार("सीता");   // Outputs: नमस्ते सीता!
```

## Further Reading

- [Getting Started Guide](../getting-started)
- [Examples](../examples)
- [GitHub Repository](https://github.com/sh20raj/sanskrit)
