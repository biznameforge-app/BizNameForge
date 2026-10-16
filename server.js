// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mockKey12345');

const app = express();
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-token-key-12345';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';

const stats = {
    views: 0,
    downloads: 0,
    purchases: { free: 0, premium: 0, enterprise: 0 }
};
const messages = []; 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, error: 'סיסמה שגויה' });
});

const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
    res.json({ stats, messages });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 השרת פועל בהצלחה בכתובת http://localhost:${PORT}`));
