'use strict';

const http = require('http');
const fs = require('fs');

const Router = require('./router');
const router = Router();

const cookies = require('./cookies');
const sessions = require('./sessions');
const authenticate = require('./authenticate');

const PORT = +process.env.PORT || 3000;


const server = http.createServer(router);

router.use(cookies());
router.use(sessions());

// Mock authentication
router.use((request, response, next) => {
    let buff = new Buffer.from("usernameFake:password", "utf8");
    let base64data = buff.toString('base64');

    request.headers.authorization = "Basic " + base64data;
    next();
});

router.use(authenticate(require('./accounts.json')));


router.get('/favicon.ico', (/*IncomingMessage*/request, /*ServerResponse*/response) => {
    response.setHeader('Content-type', 'image/jpeg');
    response.end(fs.readFileSync(__dirname + "/favicon.jpeg"));
});

// Default page
router.get('/', (/*IncomingMessage*/request, /*ServerResponse*/response) => {
    response.end("<h1>Welcome!</h1>");
});

// Catch all GET
router.get('', (/*IncomingMessage*/request, /*ServerResponse*/response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});

