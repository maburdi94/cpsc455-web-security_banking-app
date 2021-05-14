const parseCookie = (str) => str ?
    str.split(';')
        .map(v => v.split('='))
        .reduce((acc, v= ["", ""]) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {}) : "";


module.exports = function(options = {}) {

    function cookie(req, res, next) {
        req.cookie = parseCookie(req.headers['cookie']);
        next();
    }

    return cookie;
}
