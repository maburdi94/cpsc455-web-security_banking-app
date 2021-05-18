
const http = require('http');
const querystring = require('querystring');
const {createReadStream} = require('fs');

module.exports.methods = require('http').METHODS.map(method => method.toLowerCase());
module.exports.pathToRegex = (path, exact = false) => new RegExp((exact ? "^" : "") + path.replace(/\//g, "\\/").replace(/:(\w+)/g, "(?<$1>.+)") + (exact ? "$" : ""));


module.exports.escapeHTML = str => str.replace(/[&<>'"]/g,
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));


/*
* Object wrapper around IncomingMessage.
*/
function Request(req) {
    Object.setPrototypeOf(req, Request.prototype);
    req.constructor = Request;
    return req;
}

module.exports.Request = Request;


/*
* Object wrapper around ServerResponse.
*/
function Response(res) {
    Object.setPrototypeOf(res, Response.prototype);
    res.constructor = Response;
    return res;
}

module.exports.Response = Response;


Object.setPrototypeOf(Request.prototype, http.IncomingMessage.prototype);
Object.setPrototypeOf(Response.prototype, http.ServerResponse.prototype);




Response.prototype.sendFile = function (fileName) {
    return new Promise((resolve, reject) => {
        createReadStream(fileName)
            .on('error', reject)
            .on('finish', resolve)
            .pipe(this);
    });
}

Object.defineProperty(Request.prototype, 'body', {
    get() {
        let req = this;
        let contentType = req.headers['content-type'];
        return new Promise((resolve, reject) => {
            let data = "";
            req
                .on('data', chunk => data += chunk)
                .on('end', () => {
                    if(contentType === 'application/x-www-form-urlencoded') {
                        resolve(querystring.parse(data));
                    } else if (contentType === 'application/json') {
                        resolve(JSON.parse(data));
                    }
                })
                .on('error', reject);
        });
    }
});



module.exports.compose = function compose(fns) {
    if (fns.length === 1) return fns[0];
    return function(req, res, next) {
        (function iter(req, res) {
            let fn = fns.shift();
            if(fn) fn(req, res, iter);
            else next();
        })(req, res);
    };
}

// compose([function (req, res, next) {
//     console.log('f1!')
//     next();
// }, function (req, res, next) {
//     console.log('f2!')
//     next()
// }, function (req, res, next) {
//     console.log('f3!')
//     next()
// }])({}, {}, (req, res, next) => console.log('Done!'))




