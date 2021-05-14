

module.exports = function(opts = {}) {

    let accounts = opts.db || {};
    let key = opts.key || 'credentials';

    function authenticate(req, res, next) {

        if (req.headers.authorization) {
            let authorization = req.headers.authorization;
            let credentials = authorization.split(/\s+/)[1];

            let buff = new Buffer.from(credentials, 'base64');
            let text = buff.toString('ascii');

            let [username, password] = text.split(':');

            if (accounts[username] === password) {
                req[key] = {username, password};

                next();
                return;
            }
        }

        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', "Basic realm=\"Access to website\", charset=\"UTF-8\"");
        res.end('<h1>401 Unauthorized</h1>');
    }

    return authenticate;
}
