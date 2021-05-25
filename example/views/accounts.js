'use strict';


module.exports = ({accounts}) => `
    
<h1>Accounts</h1>

<ul>
${accounts.map(({name, type, amount, accountId}) => `
    <li><a href="/accounts/${accountId}">${name}</a></li>
`).join('')}
</ul>

<form id="new_account" action="/accounts" method="post">
    <h2>Create a new account:</h2>
    <label for="account_type">Account type: </label>
    <select id="account_type" name="type" required>
        <option value="" disabled selected></option>
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
    </select><br>
    <label for="account_name">Account name: </label>
    <input id="account_name" name="name" required/><br>
    <label for="initial_amount">Initial Amount: </label>
    <input id="initial_amount" name="amount" value="0" type="number" step="0.01"/><br>
    <button>Submit </button>
</form>

<hr>

<a href="/"><button>Return to homepage</button></a>

<form id="logout" action="/logout" method="post">
    <button>Logout</button>
</form>
`;
