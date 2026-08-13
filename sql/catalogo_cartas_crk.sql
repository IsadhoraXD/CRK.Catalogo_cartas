USE catalogo_cartas_crk;

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