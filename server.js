const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'crls23@', 
    database: 'sistema_db'
});

db.connect(err => {
    if (err) console.error('Erro no MySQL:', err);
    else console.log('Conectado ao MySQL com sucesso!');
});


app.post('/api/clientes', async (req, res) => {
    const { nome, email, cpf, senha } = req.body;
    
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const sql = 'INSERT INTO clientes (nome, email, cpf, senha) VALUES (?, ?, ?, ?)';
        
        db.query(sql, [nome, email, cpf, senhaHash], (err) => {
            if (err) return res.status(500).json({ erro: 'Erro ao cadastrar cliente (e-mail ou CPF já existem)' });
            res.json({ mensagem: 'Cliente cadastrado com sucesso!' });
        });
    } catch (e) {
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});


app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT * FROM clientes WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ erro: 'Utilizador não encontrado' });

        const cliente = results[0];
        const senhaValida = await bcrypt.compare(senha, cliente.senha);

        if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta' });

        const token = jwt.sign({ id: cliente.id, email: cliente.email }, 'secreta_jwt', { expiresIn: '1h' });
        res.json({ mensagem: 'Login efetuado com sucesso!', token });
    });
});

app.listen(3000, () => console.log('Servidor a funcionar na porta 3000 🚀'));