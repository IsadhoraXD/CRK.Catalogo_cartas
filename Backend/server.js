const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "catalogo_cartas_CRK",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Erro ao conectar ao banco:");
        console.error(err.message);
        return;
    }

    console.log("Banco de dados conectado com sucesso!");

    connection.release();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.get("/api/catalogo", (req, res) => {

    const sql = `
        SELECT 
            id,
            nome,
            tipo,
            raridade,
            custo,
            imagem
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

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});