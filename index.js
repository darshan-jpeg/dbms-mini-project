const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your database username
    password: '', // your database password
    database: 'restaurant_db', // your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Middleware to serve static files like images, CSS, JS
app.use(express.static(path.join(__dirname, 'public')));

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve Appetizers page
app.get('/appetizers', (req, res) => {
    const sql = "SELECT * FROM menu WHERE category = 'Appetizers'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching appetizers:', err);
            res.status(500).send('Server error');
            return;
        }

        let appetizersHTML = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Appetizers - Restaurant Database Management System</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header>
                    <h1>Appetizers</h1>
                    <p>Select your appetizer</p>
                </header>
                <div class="menu-page">
        `;

        results.forEach(dish => {
            appetizersHTML += `
                <section class="dish-card">
                    <img src="${dish.image_url}" alt="${dish.name}">
                    <h4>${dish.name}</h4>
                    <p>${dish.description}</p>
                    <p>Price: $${dish.price}</p>
                    <button>Add to Cart</button>
                </section>
            `;
        });

        appetizersHTML += `
                </div>
                <footer>
                    <p>&copy; 2024 Restaurant Database Management System. All rights reserved.</p>
                </footer>
            </body>
            </html>
        `;
        res.send(appetizersHTML);
    });
});

// Serve Main Course page
app.get('/main-course', (req, res) => {
    const sql = "SELECT * FROM menu WHERE category = 'Main Course'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching main course:', err);
            res.status(500).send('Server error');
            return;
        }

        let mainCourseHTML = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Main Course - Restaurant Database Management System</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header>
                    <h1>Main Course</h1>
                    <p>Select your main course</p>
                </header>
                <div class="menu-page">
        `;

        results.forEach(dish => {
            mainCourseHTML += `
                <section class="dish-card">
                    <img src="${dish.image_url}" alt="${dish.name}">
                    <h4>${dish.name}</h4>
                    <p>${dish.description}</p>
                    <p>Price: $${dish.price}</p>
                    <button>Add to Cart</button>
                </section>
            `;
        });

        mainCourseHTML += `
                </div>
                <footer>
                    <p>&copy; 2024 Restaurant Database Management System. All rights reserved.</p>
                </footer>
            </body>
            </html>
        `;
        res.send(mainCourseHTML);
    });
});

// Serve Desserts page
app.get('/desserts', (req, res) => {
    const sql = "SELECT * FROM menu WHERE category = 'Desserts'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching desserts:', err);
            res.status(500).send('Server error');
            return;
        }

        let dessertsHTML = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Desserts - Restaurant Database Management System</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header>
                    <h1>Desserts</h1>
                    <p>Select your dessert</p>
                </header>
                <div class="menu-page">
        `;

        results.forEach(dish => {
            dessertsHTML += `
                <section class="dish-card">
                    <img src="${dish.image_url}" alt="${dish.name}">
                    <h4>${dish.name}</h4>
                    <p>${dish.description}</p>
                    <p>Price: $${dish.price}</p>
                    <button>Add to Cart</button>
                </section>
            `;
        });

        dessertsHTML += `
                </div>
                <footer>
                    <p>&copy; 2024 Restaurant Database Management System. All rights reserved.</p>
                </footer>
            </body>
            </html>
        `;
        res.send(dessertsHTML);
    });
});

// Serve Beverages page
app.get('/beverages', (req, res) => {
    const sql = "SELECT * FROM menu WHERE category = 'Beverages'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching beverages:', err);
            res.status(500).send('Server error');
            return;
        }

        let beveragesHTML = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Beverages - Restaurant Database Management System</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header>
                    <h1>Beverages</h1>
                    <p>Select your beverage</p>
                </header>
                <div class="menu-page">
        `;

        results.forEach(dish => {
            beveragesHTML += `
                <section class="dish-card">
                    <img src="${dish.image_url}" alt="${dish.name}">
                    <h4>${dish.name}</h4>
                    <p>${dish.description}</p>
                    <p>Price: $${dish.price}</p>
                    <button>Add to Cart</button>
                </section>
            `;
        });

        beveragesHTML += `
                </div>
                <footer>
                    <p>&copy; 2024 Restaurant Database Management System. All rights reserved.</p>
                </footer>
            </body>
            </html>
        `;
        res.send(beveragesHTML);
    });
});

// Serve Specials page
app.get('/specials', (req, res) => {
    const sql = "SELECT * FROM menu WHERE category = 'Specials'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching specials:', err);
            res.status(500).send('Server error');
            return;
        }

        let specialsHTML = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Specials - Restaurant Database Management System</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header>
                    <h1>Specials</h1>
                    <p>Chef's selection of the best dishes</p>
                </header>
                <div class="menu-page">
        `;

        results.forEach(dish => {
            specialsHTML += `
                <section class="dish-card">
                    <img src="${dish.image_url}" alt="${dish.name}">
                    <h4>${dish.name}</h4>
                    <p>${dish.description}</p>
                    <p>Price: $${dish.price}</p>
                    <button>Add to Cart</button>
                </section>
            `;
        });

        specialsHTML += `
                </div>
                <footer>
                    <p>&copy; 2024 Restaurant Database Management System. All rights reserved.</p>
                </footer>
            </body>
            </html>
        `;
        res.send(specialsHTML);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
