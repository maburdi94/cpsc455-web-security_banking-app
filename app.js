'use strict';

const http = require('http');

const Router = require('./router');
const router = Router();

const api = require('./api');

const cookies = require('./cookies');
const sessions = require('./sessions');


const {escapeHTML} = require('./utils');

const db = require('./passwords.json');

const PORT = +process.env.PORT || 3000;


const server = http.createServer(router);


// Middleware
router.use(function csp(req, res, next) {
    res.setHeader('Content-Security-Policy', '' +
        'default-src \'self\';' +
        'style-src \'unsafe-inline\';' +
        'script-src \'unsafe-inline\';'
    );
    next();
});


router.use(cookies());
router.use(sessions());


// Public routes
router.get('/favicon.ico', (request, response) => {
    response.setHeader('Content-type', 'image/jpeg');
    response.sendFile(__dirname + "/favicon.jpeg");
});

router.get('/login', (request, response) => {
    response.setHeader('Content-type', 'text/html');
    response.sendFile(__dirname + "/login.html");
});

router.post('/login', async (request, response) => {

    let {username, password} = await request.body;

    if (db[username] === password) {
        let session = sessions.create();
        session.credentials = {username, password};
        response.setHeader('Set-Cookie', 'sessionId=' + session.id);
    }

    response.statusCode = 302;
    response.setHeader('Location', '/');
    response.end();
});

router.post('/logout', async (request, response) => {

    sessions.delete(request.session.id);
    response.setHeader('Set-Cookie', 'sessionId=\'\'; expires=' + new Date(0));

    response.statusCode = 302;
    response.setHeader('Location', '/');
    response.end();
});


// Protected routes
router.use((req, res, next) => {
    if (req.session) next();
    else {
        res.statusCode = 302;
        res.setHeader('Location', '/login');
        res.end();
    }
});


router.use('/api', api);

router.get('/accounts/:id', (request, response) => {
    response.setHeader('Content-type', 'text/html');
    response.end("<h1>Account #" + escapeHTML(request.params.id) + "</h1>");
});

router.get('/accounts', (request, response) => {
    response.setHeader('Content-type', 'text/html');
    response.sendFile(__dirname + '/accounts.html');
});

// Default page
router.get('/', {strict: true}, (request, response) => {
    response.sendFile(__dirname + '/index.html');
});

// Catch all GET
router.get('', (request, response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});



