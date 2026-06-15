const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config(); // Carregar variáveis de ambiente
const mysql = require('mysql2');

const app = express();
const port = 8000;

// Configuração do template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração da conexão com MySQL (Aiven)
const connection = mysql.createConnection(process.env.DATABASE_URL);


// Conexão com o banco de dados
connection.connect((err) => {
    if (err) {
        console.error('❌Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('✅Conectado ao MySQL com sucesso!');
});

// Criar tabela se não existir - ADICIONAR ESTA PARTE
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

connection.query(createTableSQL, (err) => {
    if (err) {
        console.error('❌ Erro ao criar tabela:', err);
    } else {
        console.log('✅ Tabela "usuarios" verificada/criada');
    }
});

// ROTA GET / - Tela de cadastro
app.get('/', (req, res) => {
    res.render('formulario');
});

// ROTA POST /cadastro
app.post('/cadastro', (req, res) => {
    const { email, senha } = req.body;
    
    // CORRIGIDO: tabela 'usuarios' (plural)
    const query = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
    connection.query(query, [email, senha], (err, result) => {
        if (err) {
            console.error('Erro:', err);
            return res.send('Erro ao cadastrar');
        }
        res.send(`Usuário cadastrado! ID: ${result.insertId}`);
    });
});

// ROTA GET /consulta - CORRIGIDO
app.get('/consulta', (req, res) => {
    // CORRIGIDO: tabela 'usuarios'
    const query = 'SELECT * FROM usuarios';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro:', err);
            return res.send('Erro ao consultar');
        }
        res.render('relatorio', { usuarios: results });
    });
});

// ROTA POST /alterar - CORRIGIDO
app.post('/alterar', (req, res) => {
    const { alterar } = req.body;
    
    // CORRIGIDO: tabela 'usuarios'
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    connection.query(query, [alterar], (err, results) => {
        if (err) return res.send('Erro');
        res.render('alterar', { usuarios: results[0] });
    });
});

// ROTA POST /cadastro/alterar - CORRIGIDO
app.post('/cadastro/alterar', (req, res) => {
    const { id, email, senha } = req.body;
    
    // CORRIGIDO: tabela 'usuarios'
    const query = 'UPDATE usuarios SET email = ?, senha = ? WHERE id = ?';
    connection.query(query, [email, senha, id], (err) => {
        if (err) return res.send('Erro ao atualizar');
        
        // Recarrega a lista
        connection.query('SELECT * FROM usuarios', (err, results) => {
            res.render('relatorio', { usuarios: results });
        });
    });
});

// ROTA POST /excluir - CORRIGIDO
app.post('/excluir', (req, res) => {
    const { excluir } = req.body;
    
    // CORRIGIDO: tabela 'usuarios'
    const query = 'DELETE FROM usuarios WHERE id = ?';
    connection.query(query, [excluir], (err) => {
        if (err) return res.send('Erro ao excluir');
        
        // Recarrega a lista
        connection.query('SELECT * FROM usuarios', (err, results) => {
            res.render('relatorio', { usuarios: results });
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse: http://localhost:${port}`);
});