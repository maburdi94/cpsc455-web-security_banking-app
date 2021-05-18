
const Router = require('../router');
const router = Router();

const accounts = require('./accounts');

// Remove prefix
router.use((request, response, next) => {
    request.url = request.url.slice('/api'.length) || '/';
    next();
});

router.use('/accounts', accounts);

module.exports = router;
