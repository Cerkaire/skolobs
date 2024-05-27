const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/api/save', (req, res) => {
    const { firstName, lastName } = req.body;

    const data = {
        firstName,
        lastName,
        timestamp: new Date().toISOString(),
    };

    const filePath = path.join(__dirname, 'data.json');

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing file', err);
            return res.status(500).json({ message: 'Error saving data' });
        }

        res.status(200).json({ message: 'Data saved successfully' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
