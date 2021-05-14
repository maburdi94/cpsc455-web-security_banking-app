

module.exports = function(accounts = {}) {

    function authenticate(req, res, next) {

        if (req.headers.authorization) {
            let authorization = req.headers.authorization;
            let credentials = authorization.split(/\s+/)[1];

            let buff = new Buffer.from(credentials, 'base64');
            let text = buff.toString('ascii');

            let [username, password] = text.split(':');

            console.log('authentication')

            if (accounts[username] === password) {
                next();
                return;
            }
        }

        res.setHeader('WWW-Authenticate', "Basic realm=\"Access to website\", charset=\"UTF-8\"");
        res.end('<h1>401 Unauthorized</h1>');
    }

    return authenticate;
}
