const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./app/config/auth.config')

const app = express();
const client = require('./connection'); 
const port = 3000;
const secretKey = '123QWEasz@!098POIlkm()';

app.use(bodyParser.json());



const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Akses ditolak.');

    jwt.verify(token, config.secret, (err, user) => {
        if (err){
            console.error('Error verifying token: ', err);
            return res.status(403).send('Token tidak valid.');
        }
        req.user = user;
        next();
    });
};

// Endpoint untuk registrasi
    app.post('/register', async (req, res) => {
        const { username, password } = req.body;
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Insert user into database
        client.query('INSERT INTO tbluser (username, password_hash) VALUES ($1, $2) RETURNING *', [username, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const user = result.rows[0];
            res.status(201).json({ id: user.id, username: user.username });
        }
        });
    });
    
    // Endpoint untuk login
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
    
        // Ambil data user dari database berdasarkan username
        client.query('SELECT * FROM tbluser WHERE username = $1', [username], async (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (result.rows.length === 0) {
            res.status(401).json({ error: 'Username atau password salah' });
        } else {
            const user = result.rows[0];
    
            // Bandingkan password yang dimasukkan dengan password di database
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
            if (passwordMatch) {
            // Generate token untuk autentikasi
            const token = jwt.sign({ id: user.id, username: user.username }, config.secret, { expiresIn: '1h' });
            res.status(200).json({ token });
            } else {
            res.status(401).json({ error: 'Username atau password salah' });
            }
        }
        });
    });


    app.get('/dashboard', authenticateToken, (req, res) => {
        res.json({ message: 'selamat datang di dashboard, ' + req.user.username + '!'});
    });
    
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });
    
    client.connect(err => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('connected');
        }
    });