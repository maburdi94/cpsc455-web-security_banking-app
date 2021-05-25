'use strict';

const {readFileSync, writeFile} = require('fs');

class Account {
    constructor({accountId, name, type, amount}) {
        this.accountId = accountId;
        this.name = name;
        this.type = type;
        this.amount = parseFloat(amount);
    }

    async withdraw(amount) {
        if (amount < 0) throw new Error("Amount cannot be less than 0 for withdrawal.");
        else if (amount > this.amount) throw new Error("Amount cannot exceed funds in account.");
        this.amount = (this.amount - amount).toFixed(2);

        await this.customer.bank.save();
    }

    async deposit(amount) {
        if (amount < 0) throw new Error("Amount cannot be less than 0 for withdrawal.");

        console.log(amount)
        this.amount = (this.amount + amount).toFixed(2);

        await this.customer.bank.save();
    }
}


class Customer {
    customerId;
    username;
    password;
    accounts;

    constructor({customerId, username, password, accounts = []}) {
        this.customerId = customerId;
        this.username = username;
        this.password = password;
        this.accounts = accounts;

        let next_account_id = (this.customerId * 1000) + 1;
        Object.defineProperty(this, 'next_account_id', {
            value: next_account_id,
            writable: true,
        });
    }


    async addAccount(name, type, initialAmount) {
        let account = new Account(this.next_account_id++, name, type, initialAmount);

        // get reference for saving
        Object.defineProperty(account, 'customer', {
            value: this,
        });

        this.accounts.push(account);

        await this.bank.save();
    }
}



class Bank {
    constructor() {
        this.customers = [];

        // Private static
        Object.defineProperty(Bank.prototype, 'next_customer_id', {
            value: 1,
            writable: true,
        })
    }

    async addCustomer(username, password) {
        if (!username) throw new Error("Customers must have a username.");

        let customer = new Customer(this.next_customer_id++, username, password, []);

        // get reference for saving
        Object.defineProperty(customer, 'bank', {
            value: this,
        });

        this.customers.push(customer);

        await this.save();

        return customer;
    }

    getCustomer(matching) {
        const props = Object.entries(matching);
        const match = customer => props.every(([k, v]) => customer[k] === v)
        return this.customers.find(match);
    }

    save() {
        return new Promise((resolve, reject) => {
            writeFile(__dirname + '/db.json', JSON.stringify(this.customers), 'utf-8', (err) => {
                if (err) reject(err);
                resolve();
            })
        });
    }
}



// Singleton
const bank = new Bank();

// Load database
Array.from(JSON.parse(readFileSync(__dirname + '/db.json', 'utf8')))
    .forEach((props) => {
        let customer = new Customer(props);

        customer.next_account_id = customer.customerId * 1000 + 1;

        customer.accounts.forEach(props => {
            let account = new Account(props);

            customer.next_account_id = Math.max(account.accountId + 1, customer.next_account_id);
        });

        bank.customers.push(customer);
        bank.next_customer_id = Math.max(bank.next_customer_id, customer.customerId) + 1;
    });


module.exports = bank;

