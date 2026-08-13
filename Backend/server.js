const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = 3000;

// Permite receber JSON
app.use(express.json());

// Permite comunicação entre frontend e backend
app.use(cors());

// Arquivos públicos
app.use(express.static(path.join(__dirname, "../public")));

// ==========================================
// CONEXÃO COM O BANCO DE DADOS
// ==========================================

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "catalogo_cartas_crk",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão
db.getConnection((err, connection) => {
    if (err) {
        console.error("Erro ao conectar ao banco:");
        console.error(err.message);
        return;
    }

    console.log("Banco de dados conectado com sucesso!");

    connection.release();
});

// ==========================================
// ROTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// ==========================================
// BUSCAR TODAS AS CARTAS
// ==========================================

app.get("/api/catalogo", (req, res) => {

    const sql = `
        SELECT 
            id,
            nome,
            tipo,
            raridade,
            custo
        FROM catalogo
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Erro ao buscar catálogo:", err);

            return res.status(500).json({
                erro: "Erro ao consultar o banco de dados."
            });
        }

        res.json(results);
    });
});

// ==========================================
// BUSCAR CARTA PELO ID
// ==========================================

app.get("/api/catalogo/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT 
            id,
            nome,
            tipo,
            raridade,
            custo
        FROM catalogo
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao consultar carta."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                erro: "Carta não encontrada."
            });
        }

        res.json(results[0]);
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});