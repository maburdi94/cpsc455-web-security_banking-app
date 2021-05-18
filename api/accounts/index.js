
const {escapeHTML} = require('./../../utils');

const Router = require('../../router');
const router = Router();


const customers = {
    // 'username': {
    //      accounts: [
    //          {
    //              name: 'Test Checking',
    //              type: 'checking',
    //              amount: 100.0
    //          },
    //          ...
    //      ]
    // }
};


function Customer(name, accounts = []) {
    if (!name) throw new Error("Customers must have a name.");

    this.name = name;
    this.accounts = accounts;
}


// Remove prefix
router.use((request, response, next) => {
    request.url = request.url.slice('/accounts'.length) || '/';

    next();
});

router.get('/', (request, response) => {
    let {username} = request.session.credentials;

    let customer = customers[username];

    let accounts = [];

    if (customer) {
        accounts = customer.accounts.map((acc, accountNumber) =>
            ({...acc, accountNumber: accountNumber + 1}));
    }

    response.setHeader('Content-type', 'application/json');
    response.end(JSON.stringify(accounts));
});

router.post('/', async (request, response) => {
    let account = await request.body;

    let {username} = request.session.credentials;

    let customer = customers[username];
    if (customer) {
        customer.accounts.push(account);
    } else {
        customers[username] = new Customer(username, [account]);
    }

    response.end(`
        <h1>Account created: ${escapeHTML(account.name)}</h1>
        <a href="/accounts">Go back to accounts</a>.
    `);
});


module.exports = router;
