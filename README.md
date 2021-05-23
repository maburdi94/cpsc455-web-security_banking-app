# CPSC 455 Assignment 2 Submission

## Members
Michael Burdi &emsp; <span style="color: rgb(90,180,255)">maburdi@csu.fullerton.edu</span>


## How to execute
1. In the terminal, in the project directory, run `npm start`
2. The server should be running on http://localhost:3000. If another process is running on port 3000 set PORT in environment variables before the script (i.e. PORT=3001 npm start)
3. There is a JSON /services/db.json in the project directory that has accounts. Use one to log in.

## Security Detail
* Using a custom function escapeHTML (located in /utils.js) which escape the string of HTML before it is used in the views (located in /views directory).
* CSP headers set in /app.js to protect against resources loading from different origins.
* Using session authentication with 3 minute inactive expiration for broken authentication exploits.
* Using httpOnly cookie values (see /app.js for example)
* Parsing user input and proper HTML input types (e.g. &lt;input type=number.../&gt;) to ensure values are not exploitable for XSS.


## Implementation Detail
* Using strict mode to catch common Javascript code mistakes.
* Login and registration pages
* Accounts withdraw and deposit and create new accounts
* A singleton is created for the Bank service which handles the banking logic


## Unfinished
* Transfer money between accounts
* Delete accounts and customers
* Implement bank customers and accounts in a real database

