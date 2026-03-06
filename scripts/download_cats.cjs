const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const urlsFile = 'C:/tmp/urls.txt';
const dir = 'C:/tmp/bloodbowl_cats/';

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const urls = fs.readFileSync(urlsFile, 'utf8').split('\n').map(l => l.trim()).filter(l => l.length > 10);

console.log(`Iniciando descarga con CURL de ${urls.length} archivos...`);

for (const url of urls) {
    const filename = url.split('/').pop();
    const dest = path.join(dir, filename).replace(/\//g, '\\');
    console.log(`Descargando: ${filename}`);
    try {
        execSync(`curl.exe -L "${url}" -o "${dest}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Error descargando ${filename}: ${e.message}`);
    }
}

console.log('Proceso de descarga finalizado.');
