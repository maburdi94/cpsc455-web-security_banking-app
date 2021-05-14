'use strict';

const http = require('http');

const Router = require('./router');
const router = Router();

const accounts = require('./accounts');

const cookies = require('./cookies');
const sessions = require('./sessions');
const authenticate = require('./authenticate');

const PORT = +process.env.PORT || 3000;


const server = http.createServer(router);


// Middleware
router.use(cookies());
router.use(sessions());
router.use(authenticate({
    db: require('./accounts.json')
}));



// Accounts sub-router
router.get('/accounts', accounts);



router.get('/favicon.ico', (request, response) => {
    response.setHeader('Content-type', 'image/jpeg');
    response.sendFile(__dirname + "/favicon.jpeg");
});


// Default page
router.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html')
});

// Catch all GET
router.get('', (request, response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});



