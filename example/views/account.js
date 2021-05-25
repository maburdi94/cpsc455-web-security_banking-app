'use strict';

const {escapeHTML} = require('../../utils');

module.exports = ({account: {accountId, name, amount, type}}) => `
    
${  /* if */ name ? `
    <h1>Account ${accountId}</h1>
    <p>Name: ${escapeHTML(name)}</p>
    <p>Amount: ${amount}</p>
    <p>Type: ${escapeHTML(type)}</p>` :
    
    /* else */
    `<h1>Account ${escapeHTML(accountId)} does not exist.</h1>`
}

<h2>Actions</h2>
<a href="/accounts/${escapeHTML('' + accountId)}/withdraw"><button>Withdraw</button></a>
<a href="/accounts/${escapeHTML('' + accountId)}/deposit"><button>Deposit</button></a>
<hr>

<a href="/accounts"><button>Return to accounts</button></a>
`;
