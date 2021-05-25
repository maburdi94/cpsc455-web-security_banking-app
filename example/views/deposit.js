'use strict';


module.exports = ({account: {accountId, name, amount, type}}) => `
    
${  /* if */ name ? `
    <h1>Account ${accountId}</h1>
    <p>Name: ${name}</p>
    <p>Amount: ${amount}</p>
    <p>Type: ${type}</p>

    <form id="deposit" action="/accounts/${accountId}/deposit" method="post">
        <h2>How much do you want to deposit?</h2>
        <label for="amount">Amount: </label>
        <input id="amount" name="amount" type="number" step="0.01" required/><br>
        <button>Submit</button>
    </form>` :

    /* else */
    `<h1>Account ${accountId} does not exist.</h1>`
}

<hr>

<a href="/"><button>Return to homepage</button></a>

<form id="logout" action="/logout" method="post">
    <button>Logout</button>
</form>
`;
