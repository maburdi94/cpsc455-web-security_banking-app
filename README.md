# Light-weight pure Node Express-like request router.

- Express-like middleware
- Handles url parameters
- Handles querystring parameters
- Handles all HTTP methods defined in Node http.METHODS
- Support async/await
- Support ES6 template string view rendering
- Support using nested routers as middleware
- Built-in JSON and FormData parsing of request body
- Some basic middleware (authenticate, cookies, serveStatic, sessions)


## Example
```javascript
const http = require('http');

const Router = require('./router');
const router = Router();

// A sub-router
const accounts = require('./routes/accounts');

const PORT = +process.env.PORT || 3000;


const server = http.createServer(router);

router.use((request, response) => {
    console.log(request.method, request.url);
});

router.use('/test', (request, response) => {
    console.log('This should only print on /test');
});

router.use((request, response) => {
    return new Promise((resolve, reject) => {
       setTimeout(function () {
           console.log('It even works with async');
           resolve();
       }, 5000);
    });
});


// All requests beginning with /accounts get directed through this sub-router
router.use('/accounts', accounts);


router.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});


// Using url and query params (e.g. /color/blue?animal=cat&items=apples&items=oranges&items=eggs)
router.get('/color/:favoriteColor', (request, response) => {
    let color = request.params.favoriteColor;
    let animal = request.query.get('animal');   // query is a URLSearchParams object (https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
    let items = request.query.getAll('items');
    
    response.end(`
        <h1><span style='color: ${color}'>${color}</span> <span>${animal}</span></h1>
        <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
    `);
    
    // or using template views
    // response.render('favorite_color');
});

router.post('/action', async (request, response) => {
    response.sendFile(__dirname + '/result.html');
});


// Catch all GET
router.get('', (request, response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
```
