# node-router
A simple Express-like router. The best part is there's no Express.

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

router.get('/color/:favoriteColor', (request, response) => {
    let color = request.params.favoriteColor;
    response.end("<h1 style='color: " + color + "'>" + color + "</h1>");
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
