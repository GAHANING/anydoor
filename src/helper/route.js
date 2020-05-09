const fs = require('fs');
const promisify = require('util').promisify;
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const handlebars = require('handlebars');
const path = require('path');
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = handlebars.compile(source.toString());

module.exports = async function  (req, res, filePath, conf) {
    try {
            const stats = await stat(filePath);
            if(stats.isFile()){
                const contentType = mime(filePath);                
                res.setHeader('Content-Type', contentType);
                let rs;
                const {code, start, end} = range(stats.size, req, res);

                if(isFresh(stats, req, res)){
                    res.statusCode = 304;
                    res.end();
                    return;
                }
                if(code == 200){
                    res.statusCode = 200;
                    rs = fs.createReadStream(filePath);
                }else {
                    res.statusCode = 206;
                    rs = fs.createReadStream(filePath, {start, end})
                }
                if(filePath.match(conf.compress)){
                    rs = compress(rs, req, res);
                }
                rs.pipe(res);
            }else{
                const files = await readdir(filePath);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                const dir = path.relative(conf.root, filePath);
                const data = {
                    files: files.map((file) => {
                        return {
                            file,
                            icon: mime(file)
                        }
                    }),
                    title: path.basename(filePath),
                    dir: dir ? `/${dir}` : ''
                };
                res.end(template(data));
            }
        
    } catch (error) {     
        console.error(error);   
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`filePath: ${filePath} , this is not a diretory or file,error: ${error}`);
    }
}