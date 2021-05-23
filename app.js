'use strict';

const http = require('http');

const Router = require('./router');
const router = Router();

// Routes
const accounts = require('./routes/accounts');

// Middleware
const cookies = require('./middleware/cookies');
const sessions = require('./middleware/sessions');
const serveStatic = require('./middleware/serveStatic');


// Server
const server = http.createServer(router);

// Config
const PORT = +process.env.PORT || 3000;

// Services
const Bank = require('./services/bank');


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
router.use(serveStatic('public'));




// Public routes
router.get('/login', (request, response) => {
    response.sendFile(__dirname + "/public/login.html");
});

router.post('/login', async (request, response) => {
    let {username, password} = await request.body;

    let customer = Bank.getCustomer({username, password});

    if (customer) {
        let session = sessions.create();
        session.customer = customer;
        response.cookie('sessionId', session.id, {httpOnly: true});
    }

    response.redirect('/');
});

router.post('/logout', async (request, response) => {
    sessions.delete(request.session.id);
    response.removeCookie('sessionId');
    response.redirect('/');
});

router.get('/register', (request, response) => {
   response.sendFile(__dirname + '/public/register.html');
});

router.post('/register', async (request, response) => {
    let {username, password} = await request.body; // await promise
    await Bank.addCustomer(username, password);
    response.redirect('/login');
});



// Protected routes
router.use((req, res, next) => {
    if (req.session) next();
    else res.redirect('/login');
});


router.use('/accounts', accounts);


// Default page
router.get('/', {strict: true}, (request, response) => {
    response.sendFile(__dirname + '/public/index.html');
});

// Catch all GET
router.get('', (request, response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});



