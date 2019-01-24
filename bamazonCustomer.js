// NPM Packages for mysql and inquirer
const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('cli-table');

// mySQL connection function
const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "root",
    database: "bamazon_db"
});

// call connection function
connection.connect(function (err) {
    //throw out of function if error
    if (err) throw err;
    console.log("Connection Made on Port 3306");
    //Call displayItems fucntion upon connection
    displayInventory();
    //Display Shop CLI
    setTimeout(displayShop,3000);
});

function displayInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        // Create table with cli-table
        var table = new Table({
            head: ['Item ID', 'Product Name', 'Price'],
            colWidths: [4, 18, 7]
        });
        //loop over results to format
        for (var i = 0; i < res.length; i++) {
            var rowData = [];
            rowData.push(res[i].item_id)
            rowData.push(res[i].product_name)
            rowData.push(res[i].price)
            table.push(rowData);
        }
        //display table
        console.log(table.toString());
    });
};

function displayShop() {
    connection.query("SELECT * FROM products", function (err, res) {
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].item_id.toString());
                        }
                        return choiceArray;
                    },
                    message: "What item were you interested in(Select by ID#)?"
                },
                {
                    name: "quantity",
                    type: "list",
                    choices: ["1", "2", "3", "4", "5"],
                    message: "How many would you like?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].item_id === parseInt(answer.choice)) {
                        chosenItem = res[i];
                    }
                }

                var totalPaid = chosenItem.price * answer.quantity;

                if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
                    connection.query(
                        "Update products Set ? Where ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity - answer.quantity
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Thank you for shopping with us today. Your total is $" + totalPaid.toFixed(2));
                            setTimeout(displayInventory, 3000);
                            setTimeout(displayShop, 3000);
                        }
                    )} else {
                            console.log("Insufficient quantity, please select a lesser amount or check back later.");
                            setTimeout(displayInventory, 3000);
                            setTimeout(displayShop, 3000);
                        }
            });
    });
};