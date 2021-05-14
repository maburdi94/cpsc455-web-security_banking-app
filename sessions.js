
const crypto = require("crypto");


function SessionStore() {
    this.sessions = {};
}

SessionStore.prototype.create = function (value = {}) {
    let id = crypto.randomBytes(16).toString("base64");
    return this.sessions[id] = value;
};

SessionStore.prototype.set = function (id, value) {
    let session = this.sessions[id];
    Object.assign(session.value, value);
};

SessionStore.prototype.delete = function (id) {
    delete this.sessions[id];
};






module.exports = function(options = {}) {

    function session(req, res, next) {
        next();
    }

    return session;
}
