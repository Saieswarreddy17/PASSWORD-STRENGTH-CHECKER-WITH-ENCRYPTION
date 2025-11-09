const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CryptoJS = require('crypto-js');

const app = express(); // ✅ Define `app` BEFORE using it
app.use(cors());
app.use(express.json());

// Serve static files (if needed)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// API to check if the server is working
app.get('/', (req, res) => {
    res.send('🚀 Server is running!');
});

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/DB';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Password Schema
const passwordSchema = new mongoose.Schema({
    encryptedPassword: String,
    strength: String,
    score: Number,
});

const Password = mongoose.model('Password', passwordSchema);

// Save password to MongoDB
app.post('/save-password', async (req, res) => {
    const { password, strength, score } = req.body;
    const encryptedPassword = CryptoJS.AES.encrypt(password, 'secret-key').toString();

    try {
        const newPassword = new Password({ encryptedPassword, strength, score });
        await newPassword.save();
        res.json({ message: '✅ Password saved successfully' });
    } catch (error) {
        res.status(500).json({ error: '❌ Error saving password' });
    }
});

// Retrieve saved passwords
app.get('/get-passwords', async (req, res) => {
    try {
        const passwords = await Password.find();
        res.json(passwords);
    } catch (error) {
        res.status(500).json({ error: '❌ Error fetching passwords' });
    }
});

// Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
