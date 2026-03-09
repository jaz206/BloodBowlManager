
/**
 * fix_encoding.cjs
 * Fixes mojibake (corrupted UTF-8 read as Latin-1) in teams.ts
 * Pattern: strings in the file contain Latin-1 sequences that should be UTF-8 accented chars.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/teams.ts');

// Read as binary buffer, then decode as latin1 to expose the raw bytes
let content = fs.readFileSync(filePath, 'utf8');

// Map of mojibake patterns -> correct UTF-8 characters
// These are the result of UTF-8 bytes misread as Latin-1
const replacements = [
    // á = 0xC3 0xA1  -> ​Ã¡
    ['Ã¡', 'á'],
    // é = 0xC3 0xA9 -> Ã©
    ['Ã©', 'é'],
    // í = 0xC3 0xAD -> Ã­
    ['Ã­', 'í'],
    // ó = 0xC3 0xB3 -> Ã³
    ['Ã³', 'ó'],
    // ú = 0xC3 0xBA -> Ãº
    ['Ãº', 'ú'],
    // Á = 0xC3 0x81 -> Ã
    ['Ã\x81', 'Á'],
    // É = 0xC3 0x89 -> Ã‰
    ['Ã\x89', 'É'],
    ['Ã‰', 'É'],
    // Í = 0xC3 0x8D -> Ã
    ['Ã\x8D', 'Í'],
    // Ó = 0xC3 0x93
    ['Ã\x93', 'Ó'],
    // Ú = 0xC3 0x9A
    ['Ã\x9A', 'Ú'],
    // ñ = 0xC3 0xB1 -> Ã±
    ['Ã±', 'ñ'],
    // Ñ = 0xC3 0x91
    ['Ã\x91', 'Ñ'],
    // ü = 0xC3 0xBC -> Ã¼
    ['Ã¼', 'ü'],
    // ï = 0xC3 0xAF -> Ã¯
    ['Ã¯', 'ï'],
    // à = 0xC3 0xA0 -> Ã 
    ['Ã\xA0', 'à'],
    // ¿ = 0xC2 0xBF -> Â¿
    ['Â¿', '¿'],
    // ¡ = 0xC2 0xA1 -> Â¡
    ['Â¡', '¡'],
    // « »
    ['Â«', '«'],
    ['Â»', '»'],
    // Sí
    ['SÃ­', 'Sí'],
    // Gestión
    ['GestiÃ³n', 'Gestión'],
    // LÃ­nea
    ['LÃ­nea', 'Línea'],
    // catch-all for remaining Ã sequences
];

let fixed = content;
for (const [bad, good] of replacements) {
    fixed = fixed.split(bad).join(good);
}

// Check for residual Ã
const remaining = (fixed.match(/Ã/g) || []).length;
if (remaining > 0) {
    console.warn(`⚠️  ${remaining} remaining 'Ã' sequences after replacement. Manual review needed.`);
    // Find them
    const lines = fixed.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('Ã')) {
            console.warn(`  Line ${i + 1}: ${line.trim()}`);
        }
    });
}

// Write back as UTF-8 without BOM
fs.writeFileSync(filePath, fixed, 'utf8');
console.log(`✅ Encoding fixed in teams.ts. Residual Ã sequences: ${remaining}`);
