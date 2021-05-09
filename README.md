# node-router
A simple Express-like router. The best part is there's no Express.

## Example
```javascript
const http = require('http');
const fs = require('fs');

const Router = require('./router');
const router = new Router();

const PORT = +process.env.PORT || 3000;


const server = http.createServer(router);

router.use((/*IncomingMessage*/request, /*ServerResponse*/ response) => {
    console.log(request.method, request.url);
});

router.use((/*IncomingMessage*/request, /*ServerResponse*/response) => {
   response.writeHead(200, {
       'Content-Type': 'text/html',
       'Set-Cookie': 'test=Hello World!'
   });
});

router.use('/test', (/*IncomingMessage*/request, /*ServerResponse*/ response) => {
    console.log('This should only print on /test');
});

router.get('/', (/*IncomingMessage*/request, /*ServerResponse*/response) => {
    response.end(fs.readFileSync(__dirname + '/index.html'));
});

router.post('/action', (/*IncomingMessage*/request, /*ServerResponse*/response) => {
    response.end(fs.readFileSync(__dirname + '/result.html'));
});

// Catch all GET
router.get('', (/*IncomingMessage*/request, /*ServerResponse*/response) => {
    response.end("<h1>404</h1>");
});

server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
```
