const express = require('express');
const fs = require('fs');
const cors = require('cors');
const ejs = require('ejs');

const app = express();
const port = 3000;
const path = require('path');
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('public'));

app.use(express.json());

// Load data, editedNISN, and updateData from files
let data = [];
let editedNISN = [];
let updateData = [];
let updatedData = [];

fs.readFile('data.json', 'utf8', (err, jsonData) => {
  if (!err) {
    data = JSON.parse(jsonData);
  }
});

fs.readFile('editedNISN.json', 'utf8', (err, editedNISNData) => {
  if (!err) {
    editedNISN = JSON.parse(editedNISNData);
  }
});

fs.readFile('updateData.json', 'utf8', (err, updateDataJson) => {
  if (!err) {
    updateData = JSON.parse(updateDataJson);
  }
});

fs.readFile('updatedData.json', 'utf8', (err, updatedDataJson) => {
    if (!err) {
      updatedData = JSON.parse(updatedDataJson);
    }
  });

app.use((req, res, next) => {
  req.data = data;
  req.editedNISN = editedNISN;
  req.updateData = updateData;
  req.updatedData = updatedData;
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
    //const item = req.data.find(entry => entry.NISN === requestedNISN);
    const item = req.updatedData.find(entry => entry.NISN === requestedNISN);

    if (item) {
      res.render('edit', { data: item });
    } else {
      res.status(404).json({ error: 'Data not found' });
    }
  });

app.get('/updatedData/:NISN', (req, res) => {
    const requestedNISN = req.params.NISN;
    const item = req.updatedData.find(entry => entry.NISN === requestedNISN);
  
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

    // Add the edited NISN with timestamp to the array
    if (!req.editedNISN.some(entry => entry.NISN === requestedNISN)) {
      req.editedNISN.push({ NISN: requestedNISN, timestamp: getTimestamp() });
      fs.writeFile('editedNISN.json', JSON.stringify(req.editedNISN), 'utf8', err => {
        if (err) {
          console.error('Error writing edited NISN to file:', err);
        }
      });
    }

    // Add the update details to the array
    const updateDetails = {
      NISN: requestedNISN,
      timestamp: getTimestamp(),
      updatedFields: Object.keys(newData),
    };

    req.updateData.push(updateDetails);
    fs.writeFile('updateData.json', JSON.stringify(req.updateData), 'utf8', err => {
      if (err) {
        console.error('Error writing update data to file:', err);
      }
    });

    fs.writeFile('updatedData.json', JSON.stringify(req.data), 'utf8', err => {
      if (err) {
        console.error('Error writing updated data to file:', err);
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
