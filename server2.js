const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: '1q2w3e4r5t',
  database: 'students',
});

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Load data from the database
let data = [];

db.query('SELECT * FROM daftar_pd', (err, results) => {
  if (!err) {
    data = results;
  }
});

app.use((req, res, next) => {
  req.data = data;
  next();
});

// Function to get current timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

app.get('/', (req, res) => {
  if (req.data.length > 0) {
    res.render('data', { data: req.data });
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});

app.get('/data/:NISN', (req, res) => {
  const requestedNISN = req.params.NISN;
  const item = req.data.find(entry => entry.NISN === requestedNISN);

  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});

app.get('/edit/:NISN', (req, res) => {
  const requestedNISN = req.params.NISN;
  const item = req.data.find(entry => entry.NISN === requestedNISN);

  if (item) {
    res.render('edit', { data: item });
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});

app.get('/updatedData/:NISN', (req, res) => {
  const requestedNISN = req.params.NISN;
  const item = req.data.find(entry => entry.NISN === requestedNISN);

  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});

app.post('/updateData/:NISN', (req, res) => {
  const requestedNISN = req.params.NISN;
  const newData = req.body;

  const dataIndex = req.data.findIndex(entry => entry.NISN === requestedNISN);

  if (dataIndex !== -1) {
    req.data[dataIndex] = newData;

    db.query('UPDATE daftar_pd SET ? WHERE NISN = ?', [newData, requestedNISN], (err) => {
      if (err) {
        console.error('Error updating data in the database:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ message: 'Data updated successfully' });
      }
    });
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
