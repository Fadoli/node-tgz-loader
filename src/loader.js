const fs = require('fs');
const path = require('path');

const tgz = require('./tgz');

const filePrefix = 'package/';
const nodeModules = path.resolve('node_modules');
const fakeFiles = {};
const registry = {};


/**
 * @description Scans the specified directory for files with a .tgz extension.
 * @param {string} directory - The path to the directory to scan.
 * @returns {string[]} An array of filenames with a .tgz extension found in the directory.
 */
function scanForTgzFiles(directory) {
    const files = fs.readdirSync(directory);
    const tgzFiles = files.filter(file => path.extname(file) === '.tgz');
    return tgzFiles;
}

function getPackageInfo(tgzFileName) {
    const buffer = fs.readFileSync(tgzFileName);
    return tgz.decompressTgz(buffer).then(files => {
        const packageJson = files['package/package.json'];
        if (!packageJson) throw new Error('No package.json found in .tgz file');
        const json = JSON.parse(packageJson);
        registry[json.name] = {
            name: json.name,
            version: json.version,
            files: files
        };
        const modulePath = path.join(nodeModules, json.name);
        for (const filename in files) {
            const file = files[filename];
            fakeFiles[path.join(modulePath, filename.substring(filePrefix.length))] = file;
        }
        return registry[json.name];
    });
}



const tgzFiles = scanForTgzFiles('./');
getPackageInfo(tgzFiles[0]).then(info => {
    console.log('Package info:', info);
    console.log(fakeFiles);
}).catch(err => {
    console.error('Error:', err);
});

module.exports = {
    scanForTgzFiles,
};