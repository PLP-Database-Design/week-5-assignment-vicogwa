const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Access the environment variables correctly
const DB_USERNAME = process.env.DB_USERNAME;
const DB_HOST = process.env.DB_HOST;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT || 3000;

// Create a connection pool to the database
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection to the database
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
  connection.release(); // Release the connection back to the pool
});

// Define the root route
app.get("/", (req, res) => {
  res.send("Welcome to the API! Use /patients or /providers to access data.");
});

// Define the GET endpoint to retrieve all patients
app.get("/patients", (req, res) => {
  const query =
    "SELECT patient_id, first_name, last_name, date_of_birth FROM patients";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json({
      message: "Successful",
      data: results,
    });
  });
});

// GET all providers
app.get("/providers", (req, res) => {
  const query =
    "SELECT first_name, last_name, provider_speciality FROM providers";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);

      res.status(500).send("Server error");
      return;
    }
    res.status(200).json({
      message: "Successful",
      data: results,
    });
  });
});

// GET patients by first name
app.get("/patients/search", (req, res) => {
  const firstName = req.query.first_name; // Get first name from query params
  const query = 'SELECT patient_id, first_name FROM patients WHERE first_name IS NOT NULL';

  pool.query(query, [firstName], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json({
      message: "Successful",
      data: results,
    });
  });
});

// GET providers by specialty
app.get('/providers/search', (req, res) => {
  const specialty = req.query.specialty;  // Get specialty from query params
  const query = 'SELECT provider_id, provider_speciality FROM providers WHERE provider_speciality  IS NOT NULL';
  
  pool.query(query, [specialty], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No providers found for this specialty.' });
    }
    res.status(200).json({
      message: "Successful",
      data: results,
    });
  });
});

// Listen to the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
