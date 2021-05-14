
const methods = require('http').METHODS.map(method => method.toLowerCase());
const pathToRegex = (path, exact = true) => new RegExp((exact ? "^" : "") + path.replace(/\//g, "\\/").replace(/:(\w+)/g, "(?<$1>.+)") + (exact ? "$" : ""));


let proto = module.exports = function(options = {}) {

    function router(req, res) {
        router.handler(req,res);
    }

    router.__proto__ = proto;
    router.stack = [];

    return router;
}


proto.handler = async function(/*IncomingMessage*/request, /*ServerResponse*/response) {
    let idx = 0;
    let stack = this.stack;

    next();

    function next() {
        let fn = stack[idx++];
        if (!fn) return;
        fn(request, response, next);
    }
}

proto.use = function(fn) {
    if (typeof fn !== 'function') {
        let re = pathToRegex(fn);
        fn = [].slice.call(arguments, 1)[0];
        this.stack.push(function (req, res, next) {
            let {pathname} = new URL(req.url, `http://${req.headers.host}`);
            if (re.exec(pathname)) {
                fn(req, res, next);   // call route handler
            }
        });
    } else {
        this.stack.push(fn);
    }
}

methods.forEach(function (method) {
   proto[method] = function(path, fn) {
       let re = pathToRegex(path, path);
       this.stack.push(function (req, res, next) {
           let {searchParams, pathname} = new URL(req.url, `http://${req.headers.host}`);
           let match = re.exec(pathname);
           if (match && req.method.toLowerCase() === method) {
               req.query = searchParams;    // set querystring param
               req.params = Object.assign({}, req.params, match.groups);  // set path params

               fn(req, res);   // call route handler
           }
           else {
               next();
           }
       });
   }
});


module.exports = proto;
