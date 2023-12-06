const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const port = 3000;

app.use(express.json());

const secretKey = '123QWEasz@!098POIlkm()';

let items = [
    { id: 1, username: 'user1'},
    { id: 2, username: 'user2'}
];

app.get('/items', (req, res) => {
    res.json(items);
});

app.get('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = items.find((item) => item.id === itemId);

    if (item) {
        res.json(item);
    } else {
        res.status(404).json({meesage: 'Item tidak ditemukan'});
    }
});

app.post('/items', (req, res) => {
    const newItem = req.body;
    items.push(newItem);
    res.status(201).json(newItem);
});

app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const updateItem = req.body;
    const index = items.findIndex((item) => item.id === itemId);

    if (index !== -1) {
        items[index] = updateItem;
        res.json(updateItem);
    } else {
        res.status(404).json({ message: 'Item tidak di temukan' });
    }
});

app.delete('/items/:id', (req, res) => { 
    const itemId = parseInt(req.params.id);
    items = items.filter((item) => item.id !== itemId);
    res.json({message : 'Item berhasil di hapus'})
});


//////API LOGIN/////////////////

const users = [
    { username: "user1", password: "pass1" },
    { username: "user2", password: "pass2" }
];
const kunciRahasia = process.env.JWT_SECRET || 'kunci-rahasia-default';

function generateToken(user) {
    return jwt.sign(user, kunciRahasia, { expiresIn: '1h' });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username);

    if (user && user.password === password) {

        const token = generateToken({ username: user.username})
        res.json({ message: 'Login Berhasil', token });
    } else {
        res.status(401).json({message: 'Login gagal. cek kembali username dan password'})
    }
});

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: 'Token tidak tersedia.' });
    }

    jwt.verify(token, kunciRahasia, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token tidak valid.' });
        }

        req.user = user;
        next();
    });
}

app.get('/secure-data', verifyToken, (req, res) => {
    res.json({ message: 'Data ini hanya dapat diakses dengan token JWT yang valid' });
});

app.listen(port, () => {
    console.log(`server berjalaan di http://localhost: ${port}`);
})
