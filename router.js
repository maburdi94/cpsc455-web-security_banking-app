
const {methods, mimes, pathToRegex, compose} = require('./utils');


const http = require('http');
const querystring = require('querystring');
const {createReadStream} = require('fs');



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
        response.setHeader('Content-type', mimes[extname]);

        createReadStream(fileName)
            .on('error', reject)
            .on('finish', resolve)
            .pipe(this);
    });
}

Response.prototype.render = function (viewName, locals) {
    let response = this;

    response.setHeader('Content-type', 'text/html');
    response.end(require(`${proto.viewsDirectory}/` + viewName)(locals));
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









let proto = module.exports = function(options = {}) {

    function router(req, res) {
        router.handler(Request(req),Response(res));
    }

    Object.setPrototypeOf(router, proto);

    router.stack = [];
    router.strict = options.strict || false;

    return router;
}

proto.viewsDirectory = __dirname + '/views';


proto.handler = function(/*Request*/request, /*Response*/response) {
    let idx = 0;
    let stack = this.stack;

    next();

    function next() {
        let fn = stack[idx++];
        if (!fn) return;
        fn(request, response, next);
    }
}

proto.use = function(fn, ...args) {
    if (typeof fn !== 'function') {
        let re = pathToRegex(fn);
        fn = compose(args)
        this.stack.push(function (req, res, next) {
            let {pathname} = new URL(req.url, `http://${req.headers.host}`);
            let match = re.exec(pathname);

            if (match) {
                req.params = Object.assign({}, req.params, match.groups);  // set path params
                fn(req, res, next);   // call route handler
            } else {
                next();
            }
        });
    } else {
        fn = compose([fn, ...args]);
        this.stack.push(fn);
    }
}


methods.forEach(function (method) {
   proto[method] = function(path, ...args) {
       let options = {
           strict: proto.strict
       };

       // Second argument is options
       if (typeof args[0] !== 'function') {
           options = Object.assign(options, args.shift());
       }

       let re = pathToRegex(path, options.strict);
       let fn = compose(args);

       this.stack.push(function (req, res, next) {
           let {searchParams, pathname} = new URL(req.url, `http://${req.headers.host}`);
           let match = re.exec(pathname);

           if (match && req.method.toLowerCase() === method) {
               req.query = searchParams;    // set querystring param
               req.params = Object.assign({}, req.params, match.groups);  // set path params

               fn(req, res, next);   // call route handler
           } else {
               next();
           }
       });
   }
});


module.exports = proto;
