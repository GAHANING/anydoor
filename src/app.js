const fs = require('fs');
const chalk = require('chalk');
const http = require('http');
const path = require('path');
const conf = require('./config/defaultConfig');
const route = require('./helper/route');
const openUrl = require('./helper/openUrl');

class Server {
    constructor(config) {
        this.conf = Object.assign({}, conf, config);
    }

    start() {
        const res = http.createServer((req,res) => {
            const filePath = path.join(this.conf.root, req.url);
            route(req, res, filePath, this.conf);
            console.info(filePath)
            console.info(this.conf.root)
            console.info(req.url)
        
        });
        
        res.listen(this.conf.port, this.conf.hostname, () => {
            const addr = `http://${this.conf.hostname}:${this.conf.port}`;
            console.info(`Server starts at ${chalk.green(addr)}`);
            openUrl(addr);
        });
    }
}

module.exports = Server;