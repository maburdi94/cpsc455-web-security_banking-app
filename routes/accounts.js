'use strict';

const Bank = require('./../services/bank');
const {escapeHTML} = require('./../utils');

const Router = require('./../router');
const router = Router();


// Remove prefix
router.use((request, response, next) => {
    request.url = request.url.slice('/accounts'.length);
    next();
});


router.use('/:id', (request, response, next) => {
    let accountId = +request.params['id'];
    let customer = request.session.customer;

    let account = customer.accounts.find(account => account.accountId === accountId);

    request.locals = {account};

    next();
})

router.get('/:id/withdraw', (request, response) => {
    response.render('withdraw', request.locals);
});

router.post('/:id/withdraw', async (request, response) => {
    let {amount} = await request.body; // promise

    let /*Account*/account = request.locals.account;
    await account.withdraw(parseFloat(amount));

    response.redirect('/accounts');
});



router.get('/:id/deposit', (request, response) => {
    response.render('deposit', request.locals);
});

router.post('/:id/deposit', async (request, response) => {
    let {amount} = await request.body; // promise

    let /*Account*/account = request.locals.account;
    await account.deposit(parseFloat(amount));

    response.redirect('/accounts');
});



router.get('/:id', (request, response) => {
    response.render('account', request.locals);
});

router.get('/', (request, response) => {
    let customer = request.session.customer;
    let accounts = customer.accounts;

    response.render('accounts', {accounts});
});

router.post('/', async (request, response) => {
    let {name, type, amount} = await request.body;

    let customer = request.session.customer;

    await customer.addAccount(name, type, parseFloat(amount));

    response.end(`
        <h1>Account created: ${escapeHTML(name)}</h1>
        <a href="/accounts">Go back to accounts</a>.
    `);
});


module.exports = router;
