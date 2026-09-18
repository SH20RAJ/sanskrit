// Build standalone browser bundle for docs interactive playground
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const filesToBundle = [
    'src/ast/node-types.js',
    'src/ast/nodes.js',
    'src/ast/index.js',
    'src/diagnostics/errors.js',
    'src/lexer/tokens.js',
    'src/lexer/lexer.js',
    'src/lexer/index.js',
    'src/parser/parser.js',
    'src/parser/index.js',
    'src/runtime/signals.js',
    'src/runtime/values.js',
    'src/runtime/environment.js',
    'src/runtime/builtins.js',
    'src/runtime/interpreter.js',
    'src/runtime/index.js',
    'src/vm/opcodes.js',
    'src/vm/chunk.js',
    'src/vm/compiler.js',
    'src/vm/vm.js',
    'src/vm/index.js',
    'src/compiler/index.js',
    'src/index.js'
];

let bundleCode = `// Sanskrit Browser Runtime Bundle (Self-contained)
(function(global) {
    const modules = {};
    const moduleCache = {};

    function define(id, factory) {
        modules[id] = factory;
    }

    function requireModule(currentPath, relativePath) {
        let target = relativePath;
        if (target.startsWith('.')) {
            const dir = pathDirname(currentPath);
            target = pathNormalize(dir + '/' + target);
        }

        const candidates = [
            target,
            target + '.js',
            target + '/index.js'
        ];

        let found = null;
        for (const cand of candidates) {
            if (modules[cand]) {
                found = cand;
                break;
            }
        }

        if (!found) {
            throw new Error('Cannot find module: ' + relativePath + ' from ' + currentPath);
        }

        if (moduleCache[found]) {
            return moduleCache[found].exports;
        }

        const module = { exports: {} };
        moduleCache[found] = module;
        modules[found](function(reqPath) {
            return requireModule(found, reqPath);
        }, module, module.exports);

        return module.exports;
    }

    function pathDirname(p) {
        const parts = p.split('/');
        parts.pop();
        return parts.join('/');
    }

    function pathNormalize(p) {
        const parts = p.split('/');
        const res = [];
        for (const part of parts) {
            if (part === '' || part === '.') continue;
            if (part === '..') {
                res.pop();
            } else {
                res.push(part);
            }
        }
        return res.join('/');
    }
\n`;

for (const relPath of filesToBundle) {
    const fullPath = path.join(rootDir, relPath);
    const content = fs.readFileSync(fullPath, 'utf8')
        .replace(/const fs = require\('fs'\);/g, 'const fs = { readFileSync: () => { throw new Error("fs not supported in browser"); } };');

    bundleCode += `    define('${relPath}', function(require, module, exports) {\n${content}\n    });\n\n`;
}

bundleCode += `
    // Export Sanskrit public interface to window
    const SanskritLang = requireModule('', 'src/index.js');
    global.Sanskrit = SanskritLang;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SanskritLang;
    }
})(typeof window !== 'undefined' ? window : globalThis);
`;

const outputPath = path.join(rootDir, 'docs', 'sanskrit-browser.js');
fs.writeFileSync(outputPath, bundleCode, 'utf8');
console.log('✓ Generated docs/sanskrit-browser.js (' + (bundleCode.length / 1024).toFixed(1) + ' KB)');
