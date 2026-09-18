/**
 * Sanskrit Next Phonetic Roman-to-Devanagari Transliteration Engine
 * Enables seamless typing of Sanskrit using Latin / QWERTY keyboard (e.g. mudran -> मुद्रण)
 */

export interface TransliterationEntry {
  devanagari: string;
  latin: string;
  category: 'keyword' | 'builtin' | 'type' | 'module' | 'general';
  detail: string;
  documentation: string;
  snippet?: string;
  aliases: string[];
}

export const PHONETIC_ENTRIES: TransliterationEntry[] = [
  // 1. Core Keywords
  {
    devanagari: 'कार्य',
    latin: 'karya',
    category: 'keyword',
    detail: '(keyword) कार्य [fn]',
    documentation: 'Declares a function in Sanskrit.\n\n```sanskrit\nकार्य मुख्य(): शून्यम्:\n    मुद्रण("नमस्ते")\n```',
    snippet: 'कार्य ${1:नाम}(${2:मापदण्ड}): ${3:सूत्र} :\n\t${0}',
    aliases: ['karya', 'kary', 'karyam', 'fn', 'function']
  },
  {
    devanagari: 'मान',
    latin: 'maan',
    category: 'keyword',
    detail: '(keyword) मान [let]',
    documentation: 'Declares a local variable binding with type inference.',
    snippet: 'मान ${1:चर} = ${2:मूल्य}',
    aliases: ['maan', 'man', 'let', 'var']
  },
  {
    devanagari: 'स्थिर',
    latin: 'sthir',
    category: 'keyword',
    detail: '(keyword) स्थिर [const]',
    documentation: 'Declares an immutable constant value.',
    snippet: 'स्थिर ${1:स्थिराङ्क} = ${2:मूल्य}',
    aliases: ['sthir', 'sthira', 'const']
  },
  {
    devanagari: 'यदि',
    latin: 'yadi',
    category: 'keyword',
    detail: '(keyword) यदि [if]',
    documentation: 'Conditional branch statement.\n\n```sanskrit\nयदि x > 0:\n    मुद्रण("धनात्मक")\n```',
    snippet: 'यदि ${1:प्रतिबन्ध}:\n\t${0}',
    aliases: ['yadi', 'yad', 'if']
  },
  {
    devanagari: 'अन्यथा',
    latin: 'anyatha',
    category: 'keyword',
    detail: '(keyword) अन्यथा [else]',
    documentation: 'Alternative branch for `यदि` conditional.',
    snippet: 'अन्यथा:\n\t${0}',
    aliases: ['anyatha', 'else']
  },
  {
    devanagari: 'यावत्',
    latin: 'yaavat',
    category: 'keyword',
    detail: '(keyword) यावत् [while]',
    documentation: 'Loop running while condition evaluates to true.',
    snippet: 'यावत् ${1:प्रतिबन्ध}:\n\t${0}',
    aliases: ['yaavat', 'yavat', 'while']
  },
  {
    devanagari: 'प्रत्यागम',
    latin: 'pratyagama',
    category: 'keyword',
    detail: '(keyword) प्रत्यागम [return]',
    documentation: 'Returns value from enclosing function.',
    snippet: 'प्रत्यागम ${0}',
    aliases: ['pratyagama', 'pratyagam', 'return', 'ret']
  },
  {
    devanagari: 'आयात',
    latin: 'aayaat',
    category: 'keyword',
    detail: '(keyword) आयात [import]',
    documentation: 'Imports standard library modules or external packages.',
    snippet: 'आयात ${1:std.core}',
    aliases: ['aayaat', 'aayat', 'import']
  },
  {
    devanagari: 'चर',
    latin: 'chal',
    category: 'keyword',
    detail: '(keyword) चर [variable]',
    documentation: 'Declares a variable.',
    snippet: 'चर ${1:नाम} = ${2:मूल्य};',
    aliases: ['chal', 'char', 'var']
  },
  {
    devanagari: 'वर्ग',
    latin: 'varga',
    category: 'keyword',
    detail: '(keyword) वर्ग [class]',
    documentation: 'Declares an object-oriented class structure.',
    snippet: 'वर्ग ${1:नाम} {\n\t${0}\n}',
    aliases: ['varg', 'varga', 'class']
  },
  {
    devanagari: 'निर्माण',
    latin: 'nirman',
    category: 'keyword',
    detail: '(keyword) निर्माण [constructor]',
    documentation: 'Class constructor method.',
    snippet: 'निर्माण(${1:मापदण्ड}) {\n\t${0}\n}',
    aliases: ['nirman', 'nirmana', 'constructor']
  },
  {
    devanagari: 'स्व',
    latin: 'swa',
    category: 'keyword',
    detail: '(keyword) स्व [self / this]',
    documentation: 'Reference to current object instance.',
    snippet: 'स्व.${1:गुण}',
    aliases: ['swa', 'svah', 'self', 'this']
  },
  {
    devanagari: 'प्रयत्न',
    latin: 'prayatna',
    category: 'keyword',
    detail: '(keyword) प्रयत्न [try]',
    documentation: 'Exception handling try block.',
    snippet: 'प्रयत्न {\n\t${1}\n} पकड़ (${2:दोष}) {\n\t${3}\n}',
    aliases: ['prayatna', 'try']
  },
  {
    devanagari: 'पकड़',
    latin: 'pakad',
    category: 'keyword',
    detail: '(keyword) पकड़ [catch]',
    documentation: 'Exception handling catch block.',
    snippet: 'पकड़ (${1:दोष}) {\n\t${0}\n}',
    aliases: ['pakad', 'catch']
  },
  {
    devanagari: 'अंततः',
    latin: 'antatah',
    category: 'keyword',
    detail: '(keyword) अंततः [finally]',
    documentation: 'Exception handling finally block.',
    snippet: 'अंततः {\n\t${0}\n}',
    aliases: ['antatah', 'antata', 'finally']
  },
  {
    devanagari: 'फेंक',
    latin: 'phek',
    category: 'keyword',
    detail: '(keyword) फेंक [throw]',
    documentation: 'Throws a runtime exception.',
    snippet: 'फेंक "${1:त्रुटि}";',
    aliases: ['phek', 'phenk', 'throw']
  },

  // 2. Built-in Functions & Logging
  {
    devanagari: 'मुद्रण',
    latin: 'mudran',
    category: 'builtin',
    detail: '(builtin) मुद्रण(...args) [print]',
    documentation: 'Prints formatted values to standard output with an automatic newline.\n\n```sanskrit\nमुद्रण("नमस्ते, विश्वम्!")\n```',
    snippet: 'मुद्रण(${1:सन्देश})',
    aliases: ['mudran', 'mudra', 'mud', 'print']
  },
  {
    devanagari: 'विफल',
    latin: 'vifal',
    category: 'builtin',
    detail: '(builtin) विफल(सन्देश: सूत्र) [panic]',
    documentation: 'Aborts execution immediately with a diagnostic panic message.',
    snippet: 'विफल("${1:सन्देश}")',
    aliases: ['vifal', 'vifala', 'viphal', 'viphala', 'panic']
  },
  {
    devanagari: 'निश्चय',
    latin: 'nishchay',
    category: 'builtin',
    detail: '(builtin) निश्चय(शर्त: तर्क, सन्देश: सूत्र) [assert]',
    documentation: 'Validates an invariant condition; panics if condition is false.',
    snippet: 'निश्चय(${1:शर्त}, "${2:सन्देश}")',
    aliases: ['nishchay', 'nishchaya', 'nischay', 'assert']
  },
  {
    devanagari: 'अवकलन',
    latin: 'avakalana',
    category: 'builtin',
    detail: '(builtin) अवकलन(f, x) [diff]',
    documentation: 'Calculates exact derivative df/dx at point x via automatic differentiation.',
    snippet: 'अवकलन(${1:फलन}, ${2:बिन्दु})',
    aliases: ['avakalana', 'avakalan', 'diff', 'derivative']
  },
  {
    devanagari: 'प्रवणता',
    latin: 'pravanata',
    category: 'builtin',
    detail: '(builtin) प्रवणता(f, x) [grad]',
    documentation: 'Calculates full gradient vector ∇f at multi-dimensional point x.',
    snippet: 'प्रवणता(${1:फलन}, ${2:दिश})',
    aliases: ['pravanata', 'pravanatha', 'grad', 'gradient']
  },
  {
    devanagari: 'श्रेणी',
    latin: 'sreni',
    category: 'builtin',
    detail: '(builtin) श्रेणी(आरम्भ, अन्त) [range]',
    documentation: 'Generates an integer sequence range [start, end).',
    snippet: 'श्रेणी(${1:१}, ${2:१०})',
    aliases: ['sreni', 'shreni', 'range']
  },
  {
    devanagari: 'मानचित्रण',
    latin: 'manchitran',
    category: 'builtin',
    detail: '(builtin) मानचित्रण(सूची, फलन) [map]',
    documentation: 'Applies transformation function across sequence items.',
    snippet: 'मानचित्रण(${1:सूची}, ${2:n => n * २})',
    aliases: ['manchitran', 'manchitranam', 'map']
  },
  {
    devanagari: 'शोधन',
    latin: 'shodhan',
    category: 'builtin',
    detail: '(builtin) शोधन(सूची, शर्त) [filter]',
    documentation: 'Filters sequence keeping only elements satisfying condition.',
    snippet: 'शोधन(${1:सूची}, ${2:n => n % २ === ०})',
    aliases: ['shodhan', 'shodhanam', 'filter']
  },
  {
    devanagari: 'संक्षिप्त',
    latin: 'sankshep',
    category: 'builtin',
    detail: '(builtin) संक्षिप्त(सूची, फलन) [reduce]',
    documentation: 'Reduces sequence to single accumulated value.',
    snippet: 'संक्षिप्त(${1:सूची}, ${2:(acc, x) => acc + x})',
    aliases: ['sankshep', 'sankshept', 'reduce']
  },
  {
    devanagari: 'योग',
    latin: 'yog',
    category: 'builtin',
    detail: '(builtin) योग(सूची) [sum]',
    documentation: 'Computes arithmetic sum of sequence elements.',
    snippet: 'योग(${1:सूची})',
    aliases: ['yog', 'yoga', 'sum']
  },
  {
    devanagari: 'संयोजन',
    latin: 'samyojan',
    category: 'builtin',
    detail: '(builtin) संयोजन(क, ख) [zip]',
    documentation: 'Zips multiple lists into array of pairs.',
    snippet: 'संयोजन(${1:सूची१}, ${2:सूची२})',
    aliases: ['samyojan', 'zip']
  },
  {
    devanagari: 'क्रमांकन',
    latin: 'kramankan',
    category: 'builtin',
    detail: '(builtin) क्रमांकन(सूची) [enumerate]',
    documentation: 'Yields tuples of [index, element] across sequence.',
    snippet: 'क्रमांकन(${1:सूची})',
    aliases: ['kramankan', 'enumerate']
  },
  {
    devanagari: 'क्रमबद्ध',
    latin: 'krambaddh',
    category: 'builtin',
    detail: '(builtin) क्रमबद्ध(सूची) [sort]',
    documentation: 'Sorts array elements in ascending order.',
    snippet: 'क्रमबद्ध(${1:सूची})',
    aliases: ['krambaddh', 'sort', 'sorted']
  },

  // 3. Types
  {
    devanagari: 'सूत्र',
    latin: 'sutra',
    category: 'type',
    detail: '(type) सूत्र [String]',
    documentation: 'UTF-8 immutable zero-copy string slice primitive.',
    aliases: ['sutra', 'sutr', 'str', 'string']
  },
  {
    devanagari: 'तर्क',
    latin: 'tarka',
    category: 'type',
    detail: '(type) तर्क [bool]',
    documentation: 'Boolean logical type (`सत्यम्` / `true`, `असत्यम्` / `false`).',
    aliases: ['tarka', 'tark', 'bool', 'boolean']
  },
  {
    devanagari: 'पूर्णाङ्क',
    latin: 'purnank',
    category: 'type',
    detail: '(type) पूर्णाङ्क [i32]',
    documentation: '32-bit signed two\'s complement integer.',
    aliases: ['purnank', 'poornank', 'purnanka', 'int', 'i32', 'i64']
  },
  {
    devanagari: 'दशमलव',
    latin: 'dashamalav',
    category: 'type',
    detail: '(type) दशमलव [f64]',
    documentation: '64-bit IEEE-754 double precision floating point.',
    aliases: ['dashamalav', 'dashamlav', 'float', 'f64', 'f32']
  },
  {
    devanagari: 'दिश',
    latin: 'dish',
    category: 'type',
    detail: '(type) दिश[dtype, shape] [Tensor]',
    documentation: 'First-class strided tensor with hardware acceleration.',
    snippet: 'दिश[${1:f32}, ${2:1024}, ${3:1024}]',
    aliases: ['dish', 'disha', 'tensor', 'array']
  },
  {
    devanagari: 'मानचित्र',
    latin: 'manachitra',
    category: 'type',
    detail: '(type) मानचित्र[K, V] [Map]',
    documentation: 'Hash map key-value association container.',
    snippet: 'मानचित्र[${1:सूत्र}, ${2:पूर्णाङ्क}]',
    aliases: ['manachitra', 'manachitram', 'map', 'dict']
  },
  {
    devanagari: 'अक्षर',
    latin: 'akshar',
    category: 'type',
    detail: '(type) अक्षर [char]',
    documentation: 'Single Unicode scalar value character.',
    aliases: ['akshar', 'akshara', 'char']
  },
  {
    devanagari: 'शून्यम्',
    latin: 'shunyam',
    category: 'type',
    detail: '(type) शून्यम् [void]',
    documentation: 'Unit or empty return type.',
    aliases: ['shunyam', 'shunya', 'void', 'null']
  },

  // 4. Common Literals & Values
  {
    devanagari: 'सत्यम्',
    latin: 'satyam',
    category: 'general',
    detail: '(literal) सत्यम् [true]',
    documentation: 'Boolean true value.',
    aliases: ['satyam', 'satya', 'true']
  },
  {
    devanagari: 'असत्यम्',
    latin: 'asatyam',
    category: 'general',
    detail: '(literal) असत्यम् [false]',
    documentation: 'Boolean false value.',
    aliases: ['asatyam', 'asatya', 'false']
  },
  {
    devanagari: 'नमस्ते',
    latin: 'namaste',
    category: 'general',
    detail: '(greeting) नमस्ते [hello]',
    documentation: 'Traditional Sanskrit greeting.',
    aliases: ['namaste', 'namaskar', 'hello']
  }
];

/**
 * Lightweight rule-based transliterator for arbitrary Sanskrit words
 * Converts English phonetic / IAST to Devanagari Unicode
 */
export function transliterateToDevanagari(latin: string): string {
  if (!latin) return '';

  // Direct keyword match check first
  const lower = latin.toLowerCase().trim();
  const direct = PHONETIC_ENTRIES.find(e => e.aliases.includes(lower));
  if (direct) return direct.devanagari;

  // Rule-based syllable transliteration
  const CONSONANTS: Record<string, string> = {
    'ksh': 'क्ष', 'kSh': 'क्ष', 'tr': 'त्र', 'jny': 'ज्ञ', 'gy': 'ज्ञ', 'shr': 'श्र',
    'kh': 'ख', 'gh': 'घ', 'chh': 'छ', 'ch': 'च', 'jh': 'झ', 'th': 'थ', 'dh': 'ध',
    'ph': 'फ', 'bh': 'भ', 'sh': 'श', 'Sh': 'ष', 'k': 'क', 'g': 'ग', 'j': 'ज',
    't': 'त', 'd': 'द', 'n': 'न', 'p': 'प', 'f': 'फ', 'b': 'ब', 'm': 'म',
    'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह'
  };

  const VOWEL_INITIAL: Record<string, string> = {
    'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'ii': 'ई', 'i': 'इ',
    'oo': 'ऊ', 'uu': 'ऊ', 'u': 'उ', 'ai': 'ऐ', 'e': 'ए',
    'au': 'औ', 'o': 'ओ', 'ri': 'ऋ'
  };

  const VOWEL_MATRA: Record<string, string> = {
    'aa': 'ा', 'a': '', 'ee': 'ी', 'ii': 'ी', 'i': 'ि',
    'oo': 'ू', 'uu': 'ू', 'u': 'ु', 'ai': 'ै', 'e': 'े',
    'au': 'ौ', 'o': 'ो', 'ri': 'ृ'
  };

  let out = '';
  let i = 0;
  let prevIsConsonant = false;

  while (i < latin.length) {
    // Check 3-char, 2-char, 1-char consonants
    let matchedConsonant: string | null = null;
    let matchLen = 0;

    for (const len of [3, 2, 1]) {
      if (i + len <= latin.length) {
        const sub = latin.substring(i, i + len).toLowerCase();
        if (CONSONANTS[sub]) {
          matchedConsonant = CONSONANTS[sub];
          matchLen = len;
          break;
        }
      }
    }

    if (matchedConsonant) {
      if (prevIsConsonant) {
        // add halant for consonant clusters (e.g. kr -> क्र, pr -> प्र)
        out += '्';
      }
      out += matchedConsonant;
      i += matchLen;
      prevIsConsonant = true;
      continue;
    }

    // Check vowels (2-char or 1-char)
    let matchedVowel: string | null = null;
    let isMatra = prevIsConsonant;
    let vLen = 0;

    for (const len of [2, 1]) {
      if (i + len <= latin.length) {
        const sub = latin.substring(i, i + len).toLowerCase();
        if (isMatra ? VOWEL_MATRA[sub] !== undefined : VOWEL_INITIAL[sub] !== undefined) {
          matchedVowel = isMatra ? VOWEL_MATRA[sub] : VOWEL_INITIAL[sub];
          vLen = len;
          break;
        }
      }
    }

    if (matchedVowel !== null) {
      out += matchedVowel;
      i += vLen;
      prevIsConsonant = false;
      continue;
    }

    // Special Anusvara / Visarga
    const ch = latin[i].toLowerCase();
    if (ch === 'M' || (ch === 'm' && i === latin.length - 1 && prevIsConsonant)) {
      out += 'ं';
      i++;
      prevIsConsonant = false;
      continue;
    }
    if (ch === 'H' || (ch === 'h' && i === latin.length - 1 && prevIsConsonant)) {
      out += 'ः';
      i++;
      prevIsConsonant = false;
      continue;
    }

    // Default fallback: copy character
    out += latin[i];
    i++;
    prevIsConsonant = false;
  }

  return out;
}
