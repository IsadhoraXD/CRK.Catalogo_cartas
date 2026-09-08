const express = require("express");
const mysql = require("mysql2/promise"); // Alterado para /promise
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Servir arquivos estáticos do Frontend e Public
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use(express.static(path.join(__dirname, "../public")));

// Disponibiliza as imagens publicamente no caminho http://localhost:3000/imagens/
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

// Configuração da conexão com o Banco de Dados
const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "catalogo_cartas_CRK",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar se o banco está respondendo no arranque do servidor
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Conectado ao MySQL com sucesso!");
        connection.release();
    } catch (err) {
        console.error("❌ ERRO AO CONECTAR NO MYSQL:", err.message);
    }
})();

app.get("/api/catalogo", async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT id, 
            nome, 
            tipo, 
            raridade, 
            custo, 
            imagem 
            FROM catalogo 
            ORDER BY id ASC
        `);
        res.json(results);
    } catch (err) {
       
        console.error("❌ Erro detalhado da consulta SQL:", err);
        res.status(500).json({ erro: err.message });
    }
});

app.post("/api/catalogo", async (req, res) => {
    try {
        const { nome, tipo, raridade, custo, imagem } = req.body;
        
        const sql = `
            INSERT INTO catalogo (nome, tipo, raridade, custo, imagem) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(sql, [nome, tipo, raridade, custo, imagem || '1.png']);
        res.status(201).json({ id: result.insertId, nome, tipo, raridade, custo, imagem });
    } catch (err) {
        console.error("Erro ao salvar carta:", err);
        res.status(500).json({ erro: "Erro ao cadastrar carta." });
    }
});

app.get("/api/catalogo/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await db.query(`
            SELECT id, nome, tipo, raridade, custo, imagem 
            FROM catalogo 
            WHERE id = ?
        `, [id]);

        if (results.length === 0) {
            return res.status(404).json({ erro: "Carta não encontrada." });
        }

        res.json(results[0]);
    } catch (err) {
        console.error("Erro ao buscar carta:", err);
        res.status(500).json({ erro: "Erro ao consultar carta." });
    }
});

// Servir a página HTML principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});