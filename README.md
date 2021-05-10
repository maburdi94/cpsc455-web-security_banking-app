# Light-weight pure Node Express-like request router.

- Express-like middleware
- Handles url parameters
- Handles querystring parameters
- Handles all HTTP methods defined in Node http.METHODS
- Support async/await

Only 52 SLOC (1.89 KB). 
Compare to Express 857 SLOC (21.77KB) + dependencies!

## Example
```javascript
const http = require('http');
const fs = require('fs');

const Router = require('./router');
const router = Router();

const PORT = +process.env.PORT || 3000;


const server = http.createServer(router);

router.use((request, response) => {
    console.log(request.method, request.url);
});

router.use((request, response) => {
   response.writeHead(200, {'Content-Type': 'text/html'});
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

router.get('/', (request, response) => {
    response.end(fs.readFileSync(__dirname + '/index.html'));
});


// Using url and query params (e.g. /color/blue?animal=cat&items=apples&items=oranges&items=eggs)
router.get('/color/:favoriteColor', (request, response) => {
    let color = request.params.favoriteColor;
    let animal = request.query.get('animal');
    let items = request.query.getAll('items');
    
    response.end(`
        <h1><span style='color: ${color}'>${color}</span> <span>${animal}</span></h1>
        <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
    `);
});

router.post('/action', async (request, response) => {
    response.end(await fs.promises.readFile(__dirname + '/result.html'));
});

// Catch all GET
router.get('', (request, response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
```
