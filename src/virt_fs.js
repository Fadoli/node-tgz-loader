const fs = require('fs');

/**
 * @description A virtual file system that can intercept file system calls and fake load files from memory.
 * @class VirtualFS
 */
class VirtualFS {
    /**
     * Creates an instance of VirtualFS.
     * @param {string} mainDirectory
     * @param {{string: Buffer}} files
     * @memberof VirtualFS
     */
    constructor(mainDirectory, files) {
        this.mainDirectory = mainDirectory;
        this.files = files;

        // Save original methods
        this.originalReadFile = fs.readFile;
        this.originalReadFileSync = fs.readFileSync;
        this.originalReadDir = fs.readdir;
        this.originalReadDirSync = fs.readdirSync;
        this.originalStat = fs.stat;
        this.originalStatSync = fs.statSync;
    }

    /**
     * @description Checks if the given file path is present in the files object.
     * @param {string} filePath - The path of the file to check.
     * @returns {boolean} - Returns true if the file path starts with any key in the files object, otherwise false.
     */
    mightBeStubbed(filePath) {
        return filePath.startsWith(this.mainDirectory);
    }

    /**
     * @description Try intercepting file calls to fake load files from memory.
     * @method enableInterception
     * @memberof VirtualFS
     */
    enableInterception() {
        const self = this;

        function interceptMethod(originalMethod, methodName) {
            return function(filePath, ...args) {
            if (self.mightBeStubbed(filePath)) {
                console.log(`Intercepted fs.${methodName} call: ${filePath}`);
            }
            return originalMethod.apply(this, [filePath, ...args]);
            };
        }

        fs.readFile = interceptMethod(self.originalReadFile, 'readFile');
        fs.readFileSync = interceptMethod(self.originalReadFileSync, 'readFileSync');
        fs.readdir = interceptMethod(self.originalReadDir, 'readdir');
        fs.readdirSync = interceptMethod(self.originalReadDirSync, 'readdirSync');
        fs.stat = interceptMethod(self.originalStat, 'stat');
        fs.statSync = interceptMethod(self.originalStatSync, 'statSync');
    }

    /**
     * @description Stop intercepting file calls to fake load files from memory.
     * @method enableInterception
     * @memberof VirtualFS
     */
    disableInterception() {
        // Restore original methods
        fs.readFile = this.originalReadFile;
        fs.readFileSync = this.originalReadFileSync;
        fs.readdir = this.originalReadDir;
        fs.readdirSync = this.originalReadDirSync;
        fs.stat = this.originalStat;
        fs.statSync = this.originalStatSync;
    }
}

// Export the VirtualFS class
module.exports = VirtualFS;