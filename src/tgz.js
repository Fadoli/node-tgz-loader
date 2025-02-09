const zlib = require('zlib');

/**
 * @description Parses a tar archive buffer and creates a map of its content.
 * @param {Buffer} buffer - The buffer containing the tar archive.
 * @returns {{string: Buffer}} An object where keys are file names and values are file contents.
 */
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
        files[name] = buffer.subarray(fileStart, fileEnd);

        offset = fileEnd + (512 - (size % 512)) % 512;
    }

    return files;
}

/**
 * @description Decompresses a .tgz (tar.gz) buffer and extracts the files.
 * @param {Buffer} buffer - The buffer containing the .tgz file data.
 * @returns {Promise<Object[]>} A promise that resolves with an array of extracted files.
 * Each file object contains the file's metadata and content.
 * @throws {Error} If decompression or parsing fails.
 */
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

module.exports = {
    parseTar,
    decompressTgz
};
