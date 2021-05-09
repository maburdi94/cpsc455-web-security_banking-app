
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
    let done;

    while (!done && idx < stack.length) {
        let fn = stack[idx++];
        await fn(request, response, (err) => {
            if (err) throw err;
            else done = true;
        });
    }
}

proto.use = function(fn) {
    if (typeof fn !== 'function') {
        let re = pathToRegex(fn);
        fn = [].slice.call(arguments, 1)[0];
        this.stack.push(function (req, res) {
            if (re.exec(req.url)) {
                fn(req, res);   // call route handler
            }
        });
    } else {
        this.stack.push(fn);
    }
}

methods.forEach(function (method) {
   proto[method] = function(path, fn) {
       let re = pathToRegex(path, path);
       this.stack.push(function (req, res, done) {
           let match = re.exec(req.url);
           if (match && req.method.toLowerCase() === method) {
               req.params = Object.assign({}, req.params, match.groups);  // set params from RegExp match
               fn(req, res);   // call route handler
               done();         // route match should end call chain
           }
       });
   }
});


module.exports = proto;
