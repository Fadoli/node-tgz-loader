const loader = require('./src/loader');
const path = require('path');
const virtualFs = require('./src/virtualFs');

const from = path.join(__dirname, 'modules');
const to = path.join(__dirname, 'node_modules');

async function main() {
    const tgzFiles = loader.scanForTgzFiles(from);
    const promises = tgzFiles.map(tgzFile => loader.getPackageInfo(tgzFile));
    await Promise.all(promises);

    console.log(loader.registry);
    console.log(loader.fakeFiles);
    const virt = new virtualFs(to, loader.fakeFiles);
    virt.enableInterception();
    const content = require('@fadoli/tgz-loader/package.json');
    console.log(content);
    const other = require('@fadoli/node-fast-running-stats');
    console.log(other);
    virt.disableInterception();
}
main();