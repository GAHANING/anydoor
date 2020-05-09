const {exec} = require('child_process');

module.exports = url => {
    switch (process.platform) {
        case 'darwin':
            console.info('darwin');
            exec(`open ${url}`);
            break;
        case 'win32':
            console.info('win32')
            exec(`start ${url}`);
    }
}