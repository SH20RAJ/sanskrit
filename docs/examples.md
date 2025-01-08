---
layout: default
title: Examples
nav_order: 4
---

# Sanskrit Code Examples
{: .no_toc }

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Basic Examples

### Hello World

```sanskrit
कार्य नमस्ते() {
    मुद्रण("नमस्ते विश्व!");
}

नमस्ते();
```

### Basic Calculator

```sanskrit
कार्य योग(क, ख) {
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
योग(१०, ५);    // Outputs: १५
घटा(१०, ५);    // Outputs: ५
गुणा(१०, ५);   // Outputs: ५०
भाग(१०, ५);    // Outputs: २
```

### String Operations

```sanskrit
कार्य नमस्कार(नाम) {
    मुद्रण("नमस्ते " + नाम + "!");
}

नमस्कार("राम");     // Outputs: नमस्ते राम!
नमस्कार("सीता");    // Outputs: नमस्ते सीता!
```

### Number Systems

```sanskrit
// Using Devanagari numerals
कार्य देवनागरी() {
    मुद्रण(१ + २);        // Outputs: ३
    मुद्रण(१० * २०);      // Outputs: २००
    मुद्रण(१०० / २५);     // Outputs: ४
}

// Using Arabic numerals
कार्य अरबी() {
    मुद्रण(1 + 2);        // Outputs: ३
    मुद्रण(10 * 20);      // Outputs: २००
    मुद्रण(100 / 25);     // Outputs: ४
}
```

## Coming Soon

These examples showcase upcoming features that are currently under development:

### Variables and Control Flow

```sanskrit
कार्य गणना() {
    चर क = १०;
    
    यदि (क > ५) {
        मुद्रण("क पाँच से बड़ा है");
    } अन्यथा {
        मुद्रण("क पाँच से छोटा है");
    }
}
```

### Arrays

```sanskrit
कार्य सूची_उदाहरण() {
    चर संख्याएँ = [१, २, ३, ४, ५];
    
    मुद्रण(संख्याएँ[०]);     // First element
    मुद्रण(संख्याएँ[४]);     // Last element
}
```

### Objects

```sanskrit
कार्य वस्तु_उदाहरण() {
    चर विद्यार्थी = {
        नाम: "राम",
        आयु: २०,
        कक्षा: "द्वादश"
    };
    
    मुद्रण(विद्यार्थी.नाम);
}
```

## Running the Examples

1. Save any of these examples with a `.sns` extension
2. Run using the Sanskrit CLI:
   ```bash
   sanskrit run example.sns
   ```

## Contributing

Have a cool example to share? We'd love to see it! Please consider:

1. Fork the repository
2. Add your example
3. Submit a pull request

Make sure your example:
- Demonstrates a clear concept
- Is well-commented
- Uses proper Sanskrit programming conventions
- Works with the current version of Sanskrit

## More Resources

- For more details about the language syntax, please see the [Language Guide](../language-guide).
- [Getting Started]({% link getting-started.md %})
- [GitHub Repository](https://github.com/sh20raj/sanskrit)
