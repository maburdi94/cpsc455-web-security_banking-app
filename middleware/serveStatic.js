'use strict';

const {MIMES} = require('./../utils');
const {createReadStream, statSync} = require('fs');


module.exports = function(dir) {

    function serveStatic(req, res, next) {

        let {pathname} = new URL(req.url, `http://${req.headers.host}`);

        let fileName = pathname.slice(pathname.lastIndexOf('/') + 1);

        try {
            let stats = statSync(`./${dir}/${fileName}`);
            if (stats.isFile()) {
                let extname = fileName.slice(fileName.lastIndexOf('.'));
                res.setHeader('Content-type', MIMES[extname]);
                createReadStream(`./${dir}${pathname}`).pipe(res);
                return;
            }
            next();
        }
        catch (e) {
            // console.log('\'' + filePath + '\' is not a file.');
            next();
        }
    }

    return serveStatic;
}

