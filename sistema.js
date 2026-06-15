const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 8000;

// Configuração do template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração da conexão com MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Ajuste conforme sua configuração
    password: 'Deltina04@@',        // Ajuste conforme sua configuração
    database: 'teste'
});

// Conexão com o banco de dados
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL com sucesso!');
});

// ROTA GET / - Tela de cadastro inicial
app.get('/', (req, res) => {
    res.render('formulario');
});

// ROTA POST /cadastro - Inserir novo usuário
app.post('/cadastro', (req, res) => {
    const { email, senha } = req.body;
    
    //linha de log para debug
    console.log('Tentando cadastrar:', { email, senha });
    
    const query = 'INSERT INTO usuario (email, senha) VALUES (?, ?)';
    connection.query(query, [email, senha], (err, result) => {
        if (err) {
            console.error('Erro ao inserir usuário:', err);
            res.send('Erro ao cadastrar usuário');
            return;
        }

        //linha de log para debug
        console.log('Usuário inserido com ID:', result.insertId); 

        res.send(`Usuário cadastrado com sucesso! ID: ${result.insertId}`);
    });
});

// ROTA GET /consulta - Listar todos os usuários
app.get('/consulta', (req, res) => {
    const query = 'SELECT * FROM usuario';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao consultar usuários:', err);
            res.send('Erro ao consultar usuários');
            return;
        }
        res.render('relatorio', { usuarios: results });
    });
});

// ROTA POST /alterar - Buscar usuário para edição
app.post('/alterar', (req, res) => {
    const { alterar } = req.body;
    
    const query = 'SELECT * FROM usuario WHERE id = ?';
    connection.query(query, [alterar], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            res.send('Erro ao buscar usuário');
            return;
        }
        if (results.length > 0) {
            res.render('alterar', { usuario: results[0] });
        } else {
            res.send('Usuário não encontrado');
        }
    });
});

// ROTA POST /cadastro/alterar - Processar edição (SEM redirect)
app.post('/cadastro/alterar', (req, res) => {
    const { id, email, senha } = req.body;
    
    const query = 'UPDATE usuario SET email = ?, senha = ? WHERE id = ?';
    connection.query(query, [email, senha, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            res.send('Erro ao atualizar usuário');
            return;
        }
        
        // Após UPDATE, faz SELECT e renderiza relatorio
        const selectQuery = 'SELECT * FROM usuario';
        connection.query(selectQuery, (err, results) => {
            if (err) {
                console.error('Erro ao consultar usuários:', err);
                res.send('Erro ao consultar usuários');
                return;
            }
            res.render('relatorio', { usuarios: results });
        });
    });
});

// ROTA POST /excluir - Deletar usuário (SEM redirect)
app.post('/excluir', (req, res) => {
    const { excluir } = req.body;
    
    const query = 'DELETE FROM usuario WHERE id = ?';
    connection.query(query, [excluir], (err, result) => {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            res.send('Erro ao excluir usuário');
            return;
        }
        
        // Após DELETE, faz SELECT e renderiza relatorio
        const selectQuery = 'SELECT * FROM usuario';
        connection.query(selectQuery, (err, results) => {
            if (err) {
                console.error('Erro ao consultar usuários:', err);
                res.send('Erro ao consultar usuários');
                return;
            }
            res.render('relatorio', { usuarios: results });
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse: http://localhost:${port}`);
});