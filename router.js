
const {methods, pathToRegex, Request, Response, compose} = require('./utils');


let proto = module.exports = function(options = {}) {

    function router(req, res) {
        router.handler(Request(req),Response(res));
    }

    Object.setPrototypeOf(router, proto);

    router.stack = [];
    router.strict = options.strict || false;

    return router;
}


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
