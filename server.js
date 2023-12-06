const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const secretKey = '123QWEasz@!098POIlkm()';

const users = [
    { id: 1, username: 'user1', password: '123456' },
    { id: 2, username: 'user2', password: '123456' }
];

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Akses ditolak.');

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).send('Token tidak valid.');
        req.user = user;
        next();
    });
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).send('Username atau password tidak valid.');
    }

    const accessToken = jwt.sign({
        username: user.username,
        id: user.id
    }, secretKey);
    res.json({ accessToken });
});

app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Selamat datang di dashboard, ' + req.user.username + '!' });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}/`);
});
