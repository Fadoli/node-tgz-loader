const fs = require('fs');
const path = require('path');

const tgz = require('./tgz');

const fakeFiles = {};
const registry = {};

// Prefix for files in the .tgz archive
const filePrefix = 'package/';
// Path to the node_modules directory
const nodeModules = path.resolve('node_modules');


/**
 * @description Scans the specified directory for files with a .tgz extension.
 * @param {string} directory - The path to the directory to scan.
 * @returns {string[]} An array of filenames with a .tgz extension found in the directory.
 */
function scanForTgzFiles(directory) {
    const files = fs.readdirSync(directory);
    const tgzFiles = files.filter(file => path.extname(file) === '.tgz');
    return tgzFiles.map(file => path.join(directory, file));
}

/**
 * @description Extracts package information from a .tgz file and updates the registry.
 * @param {string} tgzFileName - The path to the .tgz file.
 * @returns {Promise<Object>} A promise that resolves to the package information.
 * @throws {Error} If no package.json is found in the .tgz file.
 */
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

module.exports = {
    scanForTgzFiles,
    getPackageInfo,
    fakeFiles
};