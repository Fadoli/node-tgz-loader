const loader = require('./src/loader');
const path = require('path');

async function main() {
    const tgzFiles = loader.scanForTgzFiles(path.join(__dirname, 'modules'));
    const promises = tgzFiles.map(tgzFile => loader.getPackageInfo(tgzFile));
    await Promise.all(promises);
    console.log('Registry:', loader.fakeFiles);
}
main();