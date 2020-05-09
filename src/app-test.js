const fs = require('fs');
const http = require('http');
const chalk = require('chalk');
const conf = require('./config/defaultConfig');
const path = require('path');

const res = http.createServer((req, res) => {
    const filePath = path.join(conf.root, req.url);
    fs.stat(filePath, (err, stats) => {
        if(err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`FilePath: ${filePath}; this is not a directory or file`);
            return;
        }else if(stats.isFile()){
            res.statusCode = 202;
            res.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(filePath).pipe(res);
        }else{
            fs.readdir(filePath, (err, files) => {
                res.statusCode = 202;
                res.setHeader('Content-Type', 'text/plain');
                res.end(files.join(','));
            })
        }
    })
});

res.listen(conf.port, conf.hostname, () => {
    const addr = `http://${conf.hostname}:${conf.port}`;
    console.info(`Server start at ${chalk.green(addr)}`);
});