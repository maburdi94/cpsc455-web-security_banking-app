
const Router = require('./router');
const router = Router();


// Remove prefix
router.use((request, response, next) => {
    request.url = request.url.slice('/accounts'.length) || '/';
    next();
});

router.get('/', (request, response) => {
    response.sendFile(__dirname + '/accounts.html')
});

module.exports = router;
