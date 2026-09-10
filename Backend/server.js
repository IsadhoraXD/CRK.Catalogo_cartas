const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Garante que a pasta 'imagens' existe no diretório Backend
const pastaImagens = path.join(__dirname, "imagens");
if (!fs.existsSync(pastaImagens)) {
    fs.mkdirSync(pastaImagens, { recursive: true });
}

// Configuração do Multer com nome seguro (evita quebra por emojis ou acentos no arquivo)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaImagens);
    },
    filename: (req, file, cb) => {
        // Pega a extensão (.jpg, .png)
        const extensao = path.extname(file.originalname).toLowerCase() || '.png';
        
        // Gera um nome puramente numérico e único
        const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extensao}`;
        
        cb(null, nomeUnico);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por imagem
});

app.use(express.json());
app.use(cors());

// Servir arquivos estáticos do Frontend e das Imagens
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/imagens", express.static(pastaImagens));

// Configuração da conexão com o MySQL
const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "catalogo_cartas_CRK",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão MySQL na inicialização
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Conectado ao MySQL com sucesso!");
        connection.release();
    } catch (err) {
        console.error("❌ ERRO AO CONECTAR NO MYSQL:", err.message);
    }
})();

// GET - Listar todas as cartas
app.get("/api/catalogo", async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT id, nome, tipo, raridade, custo, imagem 
            FROM catalogo 
            ORDER BY id ASC
        `);
        res.json(results);
    } catch (err) {
        console.error("❌ Erro na consulta SQL:", err);
        res.status(500).json({ erro: err.message });
    }
});

// POST - Criar nova carta com tratamento do Multer e MySQL
app.post("/api/catalogo", (req, res, next) => {
    upload.single("imagem")(req, res, (err) => {
        if (err) {
            console.error("❌ ERRO NO MULTER:", err);
            return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log("📥 Dados do form:", req.body);
        console.log("📁 Arquivo salvo:", req.file?.filename);

        const { nome, tipo, raridade, custo } = req.body;

        if (!nome || !tipo || !raridade || !custo) {
            return res.status(400).json({ erro: "Preencha todos os campos do formulário!" });
        }

        const nomeImagem = req.file ? req.file.filename : '1.png';

        const sql = `
            INSERT INTO catalogo (nome, tipo, raridade, custo, imagem) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            nome.trim(), 
            tipo.trim(), 
            raridade.trim(), 
            parseInt(custo), 
            nomeImagem
        ]);

        console.log("✅ Carta cadastrada com sucesso! ID:", result.insertId);

        res.status(201).json({ 
            id: result.insertId, 
            nome, 
            tipo, 
            raridade, 
            custo: parseInt(custo), 
            imagem: nomeImagem 
        });

    } catch (err) {
        console.error("❌ ERRO NO MYSQL:", err);
        res.status(500).json({ erro: `Erro MySQL (${err.code || 'SQL_ERROR'}): ${err.message}` });
    }
});

// GET - Buscar carta por ID
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

// Página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});