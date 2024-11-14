// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');

// Create an Express app
const app = express();
const port = 3000;

// Middleware to parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session setup
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files (like your HTML and CSS files)
app.use(express.static('public'));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL host (usually 'localhost')
  user: 'root',      // Replace with your MySQL username
  password: 'dbms123', // Replace with your MySQL password
  database: 'dbmsmini',   // Replace with your actual database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});

// Endpoint to handle form submission and check for reservation date
app.post('/submit', (req, res) => {
  const { tableNumber, userName } = req.body;

  // Insert customer data with a NULL reservation date
  const customerQuery = `
    INSERT INTO customer (cid, biriyani, porotabeef, pasta, cheesecake, lavacake, payasam, total)
    VALUES (?, '', '', '', '', '', '', 0)
  `;

  db.query(customerQuery, [tableNumber], (err, result) => {
    if (err) {
      console.error('Error inserting into customer table:', err);
      return res.status(500).send('Error while inserting customer data');
    }

    // Insert reservation entry with NULL for reservationDate
    const reservationQuery = 'INSERT INTO reservations (cid, resdt) VALUES (?, NULL)';
    db.query(reservationQuery, [tableNumber], (err) => {
      if (err) {
        console.error('Error inserting reservation entry:', err);
        return res.status(500).send('Error while inserting reservation');
      }

      req.session.cid = tableNumber;  // Store the customer ID in the session
      res.json({ success: true });
    });
  });
});

// Endpoint to make a reservation date for the current customer in session
app.post('/make-reservation', (req, res) => {
  const { reservationDate } = req.body;
  const cid = req.session.cid;

  if (!cid) {
    return res.status(400).send('Customer ID is not available.');
  }

  // Update reservation date in the reservations table
  const reservationQuery = 'INSERT INTO reservations (cid, resdt) VALUES (?, ?) ON DUPLICATE KEY UPDATE resdt = ?';
  db.query(reservationQuery, [cid, reservationDate, reservationDate], (err) => {
    if (err) {
      console.error('Error making reservation:', err);
      return res.status(500).send('Error while making reservation');
    }

    res.send('Reservation made successfully for the date ' + reservationDate);
  });
});

// Endpoint to update only main course items in the customer table
app.post('/update-cart', (req, res) => {
  const { biriyani, porotabeef, pasta } = req.body;
  const cid = req.session.cid; // Use the stored cid from the session

  if (!cid) {
    return res.status(400).send('Customer ID is not available.');
  }

  const query = `
    UPDATE customer
    SET 
      biriyani = ?, 
      porotabeef = ?, 
      pasta = ?
    WHERE cid = ?
  `;

  // Execute the query with the provided data
  db.query(query, [biriyani, porotabeef, pasta, cid], (err, result) => {
    if (err) {
      console.error('Error updating main course items:', err);
      return res.status(500).send('Error updating cart items');
    }
    res.send('Cart updated successfully!');
  });
});

// Endpoint to update only dessert items in the customer table
app.post('/update-dessert-cart', (req, res) => {
  const { cheesecake, lavacake, payasam } = req.body;
  const cid = req.session.cid; // Use the stored cid from the session

  if (!cid) {
    return res.status(400).send('Customer ID is not available.');
  }

  const query = `
    UPDATE customer
    SET 
      cheesecake = ?, 
      lavacake = ?, 
      payasam = ?
    WHERE cid = ?
  `;

  // Execute the query with the provided data
  db.query(query, [cheesecake, lavacake, payasam, cid], (err, result) => {
    if (err) {
      console.error('Error updating dessert items:', err);
      return res.status(500).send('Error updating dessert items');
    }
    res.send('Dessert items updated successfully!');
  });
});

// Endpoint to fetch billing details for the current customer
app.get('/get-billing-details', (req, res) => {
  const cid = req.session.cid; // Use stored customer ID in the session

  if (!cid) {
    return res.status(400).send('Customer ID is not available.');
  }

  const query = `
    SELECT biriyani, porotabeef, pasta, cheesecake, lavacake, payasam, total
    FROM customer
    WHERE cid = ?
  `;

  db.query(query, [cid], (err, result) => {
    if (err) {
      console.error('Error fetching billing details:', err);
      return res.status(500).send('Error fetching billing details');
    }

    if (result.length === 0) {
      return res.status(404).send('Customer not found');
    }

    res.json(result[0]);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
