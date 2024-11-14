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
		saveUninitialized: true
	})
);

// Serve static files (like your HTML and CSS files)
app.use(express.static('public'));

// MySQL connection setup
const db = mysql.createConnection({
	host: 'localhost', // Replace with your MySQL host (usually 'localhost')
	user: 'root',      // Replace with your MySQL username
	password: 'dbms123', // Replace with your MySQL password
	database: 'dbmsmini'   // Replace with your actual database name
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
	const { tableNumber, userName, reservationDate } = req.body;

	// Check if the reservation date exists for any customer
	const checkQuery = 'SELECT * FROM reservations WHERE resdt = ?';

	db.query(checkQuery, [reservationDate], (err, results) => {
		if (err) {
			console.error('Error checking reservation date:', err);
			return res.status(500).json({ error: 'Error while checking reservation date' });
		}

		if (results.length > 0) {
			// Reservation date already exists
			return res.json({ error: 'This reservation date is already booked. Please choose another date.' });
		} else {
			// Insert customer data and reservation date
			const customerQuery = `
				INSERT INTO customer (cid, biriyani, porotabeef, pasta, cheesecake, lavacake, payasam, total)
				VALUES (?, '', '', '', '', '', '', 0)
			`;
			db.query(customerQuery, [tableNumber], (err, result) => {
				if (err) {
					console.error('Error inserting into customer table:', err);
					return res.status(500).send('Error while inserting customer data');
				}

				// Insert reservation entry
				const reservationQuery = 'INSERT INTO reservations (cid, resdt) VALUES (?, ?)';
				db.query(reservationQuery, [tableNumber, reservationDate], (err) => {
					if (err) {
						console.error('Error inserting reservation date:', err);
						return res.status(500).send('Error while inserting reservation');
					}

					req.session.cid = tableNumber;
					res.json({ success: true });
				});
			});
		}
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
		WHERE cid = ?`;

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
		WHERE cid = ?`;

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
		SELECT 
			customer.biriyani, customer.porotabeef, customer.pasta,
			customer.cheesecake, customer.lavacake, customer.payasam,
			food.price AS unit_price, food.name
		FROM customer
		JOIN food ON (
			(food.name = 'Biriyani' AND customer.biriyani > 0) OR
			(food.name = 'Porotabeef' AND customer.porotabeef > 0) OR
			(food.name = 'Pasta' AND customer.pasta > 0) OR
			(food.name = 'Cheesecake' AND customer.cheesecake > 0) OR
			(food.name = 'Lavacake' AND customer.lavacake > 0) OR
			(food.name = 'Payasam' AND customer.payasam > 0)
		)
		WHERE customer.cid = ?`;

	db.query(query, [cid], (err, results) => {
		if (err) {
			console.error('Error fetching billing details:', err);
			return res.status(500).send('Error fetching billing details');
		}

		const items = results.map(row => {
			const quantity = row[row.name.toLowerCase()];
			const price = quantity * row.unit_price;
			return { name: row.name, quantity, price };
		});

		res.json({ items });
	});
});

app.post('/checkout', (req, res) => {
	const cid = req.session.cid;

	if (!cid) {
		return res.status(400).send('Customer ID not available.');
	}

	const deleteCustomerQuery = 'DELETE FROM customer WHERE cid = ?';
	db.query(deleteCustomerQuery, [cid], (err) => {
		if (err) {
			console.error('Error deleting customer record:', err);
			return res.status(500).send('Error while deleting customer record');
		}

		res.send('Checkout successful and customer record deleted.');
	});
});




// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
