# Sanskrit Programming Language Guide

Sanskrit is a modern programming language with native support for Devanagari script and Sanskrit vocabulary. This guide covers the complete syntax, features, and runtime semantics of the language.

---

## Table of Contents

1. [Lexical Structure](#lexical-structure)
2. [Variables and Constants](#variables-and-constants)
3. [Data Types and Literals](#data-types-and-literals)
4. [Operators and Expressions](#operators-and-expressions)
5. [Functions and Closures](#functions-and-closures)
6. [Control Flow](#control-flow)
7. [Collections: Arrays and Objects](#collections-arrays-and-objects)
8. [Object-Oriented Programming (OOP)](#object-oriented-programming-oop)
9. [Exception Handling](#exception-handling)
10. [Built-in Standard Functions](#built-in-standard-functions)

---

## Lexical Structure

### Comments

```sanskrit
// एक पंक्ति टिप्पणी (Single-line comment)

/*
   बहु पंक्ति टिप्पणी
   (Multi-line block comment)
*/
```

### Identifiers

Identifiers can use Devanagari characters, Sanskrit vowel marks, and Latin characters:

```sanskrit
चर संख्या = १०;
चर myVariable = २०;
```

### Numerals

Both Devanagari (`०-९`) and Arabic (`0-9`) numerals are natively supported:

```sanskrit
मुद्रण(१० + २०); // Devanagari numerals -> ३०
मुद्रण(10 + 20); // Arabic numerals -> ३०
```

---

## Variables and Constants

### Variables (`चर`)

Declared with `चर` (chara), variables are mutable and block-scoped:

```sanskrit
चर नाम = "राम";
नाम = "लक्ष्मण"; // Allowed
```

### Constants (`स्थिर`)

Declared with `स्थिर` (sthira), constants are immutable:

```sanskrit
स्थिर पाई = ३.१४१५९;
// पाई = ३.१४; // Error: Cannot reassign constant variable
```

---

## Data Types and Literals

- **संख्या (Number)**: Integer and floating-point values (`४२`, `३.१४`)
- **स्ट्रिंग (String)**: Text enclosed in double or single quotes (`"नमस्ते"`, `'संस्कृत'`)
- **बूलियन (Boolean)**: `सत्य` (true) or `असत्य` (false)
- **शून्य (Null)**: Represents intentional absence of value (`शून्य`)
- **अपरिभाषित (Undefined)**: Uninitialized variables (`अपरिभाषित`)
- **सूची (Array)**: Ordered collection (`[१, २, ३]`)
- **वस्तु (Object)**: Key-value dictionary (`{ नाम: "सीता", आयु: २५ }`)

---

## Operators and Expressions

### Arithmetic Operators
- `+` (योग / Addition)
- `-` (व्यवकलन / Subtraction)
- `*` (गुणन / Multiplication)
- `/` (भाग / Division)
- `%` (शेषफल / Modulo)
- `**` (घातांक / Exponentiation)

### Comparison Operators
- `===` (Strict Equality)
- `!==` (Strict Inequality)
- `>` (Greater than)
- `<` (Less than)
- `>=` (Greater than or equal)
- `<=` (Less than or equal)

### Logical Operators
- `&&` or `और` (Logical AND)
- `||` or `या` (Logical OR)
- `!` or `नहीं` (Logical NOT)

### Compound Assignment
- `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `**=`

---

## Functions and Closures

Functions are declared with `कार्य` and return values with `प्रत्यागम`:

```sanskrit
कार्य योग(क, ख) {
    प्रत्यागम क + ख;
}

मुद्रण(योग(५, १०)); // Outputs: १५
```

### Lexical Closures

Functions capture their enclosing scope dynamically:

```sanskrit
कार्य गणक_बनाओ() {
    चर गणना = ०;
    कार्य अगला() {
        गणना++;
        प्रत्यागम गणना;
    }
    प्रत्यागम अगला;
}

चर गणक = गणक_बनाओ();
मुद्रण(गणक()); // Outputs: १
मुद्रण(गणक()); // Outputs: २
```

---

## Control Flow

### Conditionals (`यदि` / `अन्यथा`)

```sanskrit
यदि (अंक >= ६०) {
    मुद्रण("प्रथम श्रेणी");
} अन्यथा यदि (अंक >= ४५) {
    मुद्रण("द्वितीय श्रेणी");
} अन्यथा {
    मुद्रण("उत्तीर्ण");
}
```

### Loops

#### While Loop (`यावत्`)
```sanskrit
चर i = ०;
यावत् (i < ३) {
    मुद्रण("गणना:", i);
    i++;
}
```

#### For Loop (`पुनः`)
```sanskrit
पुनः (चर i = १; i <= ५; i++) {
    मुद्रण("संख्या:", i);
}
```

#### ForEach Loop (`प्रत्येक`)
```sanskrit
चर सूची = ["सेब", "केला", "आम"];
प्रत्येक (फल में सूची) {
    मुद्रण("फल:", फल);
}
```

---

## Collections: Arrays and Objects

### Arrays (सूची)
```sanskrit
चर संख्याएं = [१०, २०, ३०, ४०];
मुद्रण("प्रथम तत्व:", संख्याएं[०]);
मुद्रण("कुल संख्या:", लंबाई(संख्याएं));
```

### Objects (वस्तु)
```sanskrit
चर छात्र = {
    नाम: "अर्जुन",
    कक्षा: "१०वीं",
    आयु: १५
};

मुद्रण("नाम:", छात्र.नाम);
छात्र.आयु = १६; // Property mutation
```

---

## Object-Oriented Programming (OOP)

Classes are declared using `वर्ग`, constructor using `निर्माण`, instance reference with `स्व` (this), inheritance with `विस्तार`, superclass reference with `सुपर`, and creation with `नया`:

```sanskrit
वर्ग व्यक्ति {
    निर्माण(नाम, आयु) {
        स्व.नाम = नाम;
        स्व.आयु = आयु;
    }

    कार्य परिचय() {
        मुद्रण("नमस्ते, मेरा नाम", स्व.नाम, "है।");
    }

    स्थैतिक कार्य प्रजाति() {
        मुद्रण("मानव");
    }
}

वर्ग छात्र विस्तार व्यक्ति {
    निर्माण(नाम, आयु, कक्षा) {
        सुपर(नाम, आयु);
        स्व.कक्षा = कक्षा;
    }

    कार्य परिचय() {
        मुद्रण("मैं", स्व.नाम, "हूँ, कक्षा", स्व.कक्षा, "का छात्र।");
    }
}

// Create instance
चर राम = नया छात्र("राम", १६, "१०वीं");
राम.परिचय();
व्यक्ति.प्रजाति(); // Static method call
```

---

## Exception Handling

Handle runtime errors gracefully using `प्रयत्न` (try), `पकड़` (catch), `अंततः` (finally), and `फेंक` (throw):

```sanskrit
कार्य भाग(क, ख) {
    यदि (ख === ०) {
        फेंक "शून्य से विभाजन वर्जित है";
    }
    प्रत्यागम क / ख;
}

प्रयत्न {
    मुद्रण(भाग(१०, ०));
} पकड़ (त्रुटि) {
    मुद्रण("त्रुटि:", त्रुटि);
} अंततः {
    मुद्रण("प्रक्रिया समाप्त");
}
```

---

---

## Pythonic Advanced Concepts

### Sequence Slicing (`[start:stop:step]`)

Arrays and strings support complete Pythonic slicing:

```sanskrit
चर सूची = [१०, २०, ३०, ४०, ५०, ६०];
मुद्रण(सूची[१:४]);   // [२०, ३०, ४०]
मुद्रण(सूची[:३]);    // [१०, २०, ३०]
मुद्रण(सूची[२:]);    // [३०, ४०, ५०, ६०]
मुद्रण(सूची[::२]);   // [१०, ३०, ५०]
मुद्रण(सूची[::-१]);  // [६०, ५०, ४०, ३०, २०, १०] (उलटा क्रम)

चर पाठ = "संस्कृतभाषा";
मुद्रण(पाठ[०:७]);    // संस्कृत
```

### List Comprehensions

Declarative list filtering and transformation using `[expr पुनः (var में coll) यदि (cond)]`:

```sanskrit
चर मूल = [१, २, ३, ४, ५, ६];
चर वर्ग = [x * x पुनः (x में मूल)];
मुद्रण(वर्ग); // [१, ४, ९, १६, २५, ३६]

चर सम_संख्याएं = [x पुनः (x में मूल) यदि (x % २ === ०)];
मुद्रण(सम_संख्याएं); // [२, ४, ६]
```

### Arrow Functions & Lambdas

Concise lambda syntax using `=>` or `->`:

```sanskrit
चर द्वि = x => x * २;
चर योग = (क, ख) => क + ख;
चर बहु_पंक्ति = (क, ख) => {
    चर योग = क + ख;
    प्रत्यागम योग * १०;
};

मुद्रण(द्वि(७)); // १४
मुद्रण(योग(५, १०)); // १५
```

### Conditional Expressions (Pythonic Ternary)

```sanskrit
चर आयु = १८;
चर स्थिति = "वयस्क" यदि (आयु >= १८) अन्यथा "नाबालिग";
मुद्रण(स्थिति); // वयस्क
```

---

## Built-in Standard Functions

- `मुद्रण(...args)`: Prints formatted output to console
- `लंबाई(obj)`: Returns length of string, array, or object
- `प्रकार(val)`: Returns type of value (`'संख्या'`, `'स्ट्रिंग'`, `'बूलियन'`, `'सूची'`, `'वस्तु'`, `'कार्य'`, `'वर्ग'`, etc.)
- `पार्स_संख्या(str)`: Parses a string into a number
- `संख्या(val)`: Converts value to number
- `स्ट्रिंग(val)`: Converts value to string
- `बूलियन(val)`: Converts value to boolean
- `गणित_वर्ग(x)`: Square root
- `गणित_शक्ति(base, exp)`: Power function
- `गणित_न्यूनतम(...args)`: Minimum value or integer floor
- `गणित_अधिकतम(...args)`: Maximum value
- `गणित_पूर्णांक(x)`: Integer floor
- `समय()`: Current Unix epoch timestamp
- `श्रेणी(stop)` / `श्रेणी(start, stop, step)`: Sequence range generator
- `मानचित्रण(coll, fn)`: Map collection using higher-order function
- `शोधन(coll, fn)`: Filter collection using predicate
- `संक्षिप्त(fn, coll, init)`: Reduce collection to single accumulated value
- `योग(coll)`: Calculate sum of numeric elements
- `सभी(coll)`: Returns `सत्य` if every element is truthy
- `कोई(coll)`: Returns `सत्य` if any element is truthy
- `उलटा(coll)`: Returns reversed copy of collection or string
- `क्रमबद्ध(coll, keyFn)`: Returns sorted copy of collection
- `संयोजन(...colls)`: Parallel iteration (zip) of multiple collections
- `क्रमांकन(coll)`: Pairs elements with 0-based indices `[idx, item]`

---

## Bytecode Virtual Machine (VM)

For compute-heavy algorithms and tight loops, Sanskrit includes a high-speed stack-based Bytecode Virtual Machine providing a **15x - 30x speedup** over AST tree-walking:

```bash
# Execute using Bytecode VM
sanskrit run --vm script.sns

# Disassemble bytecode instructions
sanskrit run --vm --disasm script.sns
```
