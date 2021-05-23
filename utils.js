
const http = require('http');
const querystring = require('querystring');
const {createReadStream} = require('fs');

module.exports.methods = require('http').METHODS.map(method => method.toLowerCase());
module.exports.pathToRegex = (path, exact = false) => new RegExp((exact ? "^" : "") + path.replace(/\//g, "\\/").replace(/:(\w+)/g, "(?<$1>[^/]+)") + (exact ? "$" : ""));



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
    let response = this;

    return new Promise((resolve, reject) => {

        let extname = fileName.slice(fileName.lastIndexOf('.'));
        response.setHeader('Content-type', MIMES[extname]);

        createReadStream(fileName)
            .on('error', reject)
            .on('finish', resolve)
            .pipe(this);
    });
}

Response.prototype.render = function (viewName, locals) {
    let response = this;

    response.setHeader('Content-type', 'text/html');
    response.end(require('./views/' + viewName)(locals));
}

Response.prototype.redirect = function (path) {
    let response = this;

    response.statusCode = 302;
    response.setHeader('Location', path);
    response.end();
}

Response.prototype.cookie = function (cookieName, value, options = {}) {
    let response = this;

    let cookie = `${cookieName}=${value}; `;
    cookie += Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ');

    response.setHeader('Set-Cookie', cookie);
}

Response.prototype.removeCookie = function (cookieName) {
    let response = this;

    response.setHeader('Set-Cookie', cookieName + '=\'\'; expires=' + new Date(0));
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






// Used to web-scrape MIME types from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
//
// let table = document.querySelector('.standard-table');
// let rows = Array.from(table.querySelectorAll('tr')).slice(1);
// rows.reduce((obj, row, i) => {
//     let exts = Array.from(row.children[0].children)
//         .filter(d => !(d instanceof HTMLBRElement))
//         .flatMap(d => d.innerText.split('\n'))
//
//     let mime = row.children[2].querySelector('code').innerText;
//     for (let ext of exts) {
//         obj['' + ext] = mime;
//     }
//     return obj;
// }, {});

const MIMES = {
    ".aac": "audio/aac",
    ".abw": "application/x-abiword",
    ".arc": "application/x-freearc",
    ".avi": "video/x-msvideo",
    ".azw": "application/vnd.amazon.ebook",
    ".bin": "application/octet-stream",
    ".bmp": "image/bmp",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".csh": "application/x-csh",
    ".css": "text/css",
    ".csv": "text/csv",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".eot": "application/vnd.ms-fontobject",
    ".epub": "application/epub+zip",
    ".gz": "application/gzip",
    ".gif": "image/gif",
    ".htm": "text/html",
    ".html": "text/html",
    ".ico": "image/vnd.microsoft.icon",
    ".ics": "text/calendar",
    ".jar": "application/java-archive",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".jsonld": "application/ld+json",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mjs": "text/javascript",
    ".mp3": "audio/mpeg",
    ".cda": "application/x-cdf",
    ".mp4": "video/mp4",
    ".mpeg": "video/mpeg",
    ".mpkg": "application/vnd.apple.installer+xml",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".oga": "audio/ogg",
    ".ogv": "video/ogg",
    ".ogx": "application/ogg",
    ".opus": "audio/opus",
    ".otf": "font/otf",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".php": "application/x-httpd-php",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar": "application/vnd.rar",
    ".rtf": "application/rtf",
    ".sh": "application/x-sh",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tar": "application/x-tar",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".ts": "video/mp2t",
    ".ttf": "font/ttf",
    ".txt": "text/plain",
    ".vsd": "application/vnd.visio",
    ".wav": "audio/wav",
    ".weba": "audio/webm",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xhtml": "application/xhtml+xml",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xml": "application/xml ",
    ".xul": "application/vnd.mozilla.xul+xml",
    ".zip": "application/zip",
    ".3gp": "video/3gpp",
    ".3g2": "video/3gpp2",
    ".7z": "application/x-7z-compressed"
};
module.exports.MIMES = MIMES;
