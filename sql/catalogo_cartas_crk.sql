USE catalogo_cartas_CRK;

CREATE TABLE catalogo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    raridade VARCHAR(30) NOT NULL,
    custo INT NOT NULL
);

INSERT INTO catalogo (nome, tipo, raridade, custo)
VALUES
('Pure Vanilla Cookie', 'Suporte', 'Ancestral', 1),
('Hollyberry Cookie', 'Defesa', 'Ancestral', 2),
('Sea Fairy Cookie', 'Magia', 'Lendária', 3),
('Espresso Cookie', 'Magia', 'Épica', 4),
('Knight Cookie', 'Defesa', 'Comum', 5);

ALTER TABLE catalogo ADD COLUMN imagem VARCHAR(255);

UPDATE catalogo SET imagem = '1.png' WHERE id = 1;
UPDATE catalogo SET imagem = '2.png' WHERE id = 2;
UPDATE catalogo SET imagem = '3.png' WHERE id = 3;
UPDATE catalogo SET imagem = '4.png' WHERE id = 4;
UPDATE catalogo SET imagem = '5.png' WHERE id = 5;
