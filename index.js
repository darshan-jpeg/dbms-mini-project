// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like your index.html and style.css)
app.use(express.static('public'));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost', // Replace with your MySQL host (usually 'localhost')
    user: 'root',      // Replace with your MySQL username
    password: 'dbms123',      // Replace with your MySQL password
    database: 'dbmsmini' // Replace with your actual database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

// Handle the form submission
app.post('/submit', (req, res) => {
    const { tableNumber, userName } = req.body;

    // Insert customer data into the customer table using the tableNumber as cid
    const query = `INSERT INTO customer (cid, biriyani, porotabeef, pasta, cheesecake, lavacake, payasam, total) 
                   VALUES (?, '', '', '', '', '', '', 0)`;

    // Use tableNumber as cid
    db.query(query, [tableNumber], (err, result) => {
        if (err) {
            console.error('Error inserting into customer table:', err);
            return res.status(500).send('Error while inserting customer data');
        }

        // Return a response confirming the customer addition
        res.send(`<h1>Thank you, ${userName}!</h1>
                  <p>Your table number is ${tableNumber}. Your customer ID is ${tableNumber}.</p>
                  <p><a href="menu.html">Go to Menu</a></p>`);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
