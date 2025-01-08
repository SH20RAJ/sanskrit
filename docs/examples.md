---
layout: default
title: Examples
nav_order: 4
---

# Sanskrit Examples

## Basic Examples

### Hello World
```sanskrit
प्रिन्ट("नमस्ते विश्व");
```

### Calculator
```sanskrit
कार्य कैल्क(क, ख, क्रिया) {
    यदि (क्रिया == "+") {
        वापस क + ख;
    } यदि (क्रिया == "-") {
        वापस क - ख;
    }
    // More operations...
}
```

### Array Operations
```sanskrit
चर सूची = [1, 2, 3, 4, 5];
सूची.प्रत्येक((अंक) => {
    प्रिन्ट(अंक * 2);
});
```

## Advanced Examples

### File Operations
```sanskrit
फ़ाइल.पढ़("data.txt").तब((डेटा) => {
    प्रिन्ट(डेटा);
});
```

### Web Server
```sanskrit
सर्वर.शुरू(3000, () => {
    प्रिन्ट("सर्वर चल रहा है");
});
```

### Data Processing
```sanskrit
चर डेटा = [
    { नाम: "राम", उम्र: 25 },
    { नाम: "श्याम", उम्र: 30 }
];

डेटा.छान((व्यक्ति) => व्यक्ति.उम्र > 27);
```
