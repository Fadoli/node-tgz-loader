const path = require('path');
const zlib = require('zlib');

const Module = require('module');
const originalRequire = Module.prototype.require;

const fs = require('fs');
const originalReadFileSync = fs.readFileSync;

Module.prototype.require = function() {
    const moduleName = arguments[0];
    console.log(`Requiring module: ${moduleName}`);
    return originalRequire.apply(this, arguments);
};

fs.readFileSync = function(path, options) {
    console.log(`Reading file: ${path}`);
    return originalReadFileSync.apply(this, arguments);
};

function scanForTgzFiles(directory) {
    const files = fs.readdirSync(directory);
    const tgzFiles = files.filter(file => path.extname(file) === '.tgz');
    return tgzFiles;
}

function parseTar(buffer) {
    const files = {};
    let offset = 0;

    while (offset < buffer.length) {
        const header = buffer.slice(offset, offset + 512);
        const name = header.toString('utf8', 0, 100).replace(/\0/g, '');
        const size = parseInt(header.toString('utf8', 124, 136).replace(/\0/g, '').trim(), 8);

        if (!name) break;

        const fileStart = offset + 512;
        const fileEnd = fileStart + size;
        files[name] = buffer.slice(fileStart, fileEnd);

        offset = fileEnd + (512 - (size % 512)) % 512;
    }

    return files;
}

function decompressTgz(buffer) {
    return new Promise((resolve, reject) => {
        zlib.gunzip(buffer, (err, decompressed) => {
            if (err) return reject(err);
            try {
                const files = parseTar(decompressed);
                resolve(files);
            } catch (e) {
                reject(e);
            }
        });
    });
}


// Example usage:
const tgzFiles = scanForTgzFiles('./');
console.log('TGZ files:', tgzFiles);

tgzFiles.forEach(file => {
    const buffer = fs.readFileSync(file);
    decompressTgz(buffer).then(files => {
        console.log(`Contents of ${file}:`, files);
    }).catch(err => {
        console.error(`Error decompressing ${file}:`, err);
    });
});