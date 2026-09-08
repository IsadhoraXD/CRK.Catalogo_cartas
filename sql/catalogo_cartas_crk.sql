CREATE DATABASE IF NOT EXISTS catalogo_cartas_CRK;
USE catalogo_cartas_CRK;

DROP TABLE IF EXISTS catalogo;

CREATE TABLE catalogo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    raridade VARCHAR(30) NOT NULL,
    custo INT NOT NULL,
    imagem VARCHAR(255)
);

INSERT INTO catalogo (nome, tipo, raridade, custo, imagem)
VALUES
('Pure Vanilla Cookie', 'Suporte', 'Ancestral', 1, '1.png'),
('Hollyberry Cookie', 'Defesa', 'Ancestral', 2, '2.png'),
('Sea Fairy Cookie', 'Magia', 'Lendária', 3, '3.png'),
('Espresso Cookie', 'Magia', 'Épica', 4, '4.png'),
('Knight Cookie', 'Defesa', 'Comum', 5, '5.png');