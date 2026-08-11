// ==========================================
// VARIÁVEIS
// ==========================================

const catalogo = document.getElementById("catalogo");

const campoPesquisa = document.getElementById("campoPesquisa");

const botaoPesquisa = document.getElementById("botaoPesquisa");

const tipoFiltro = document.getElementById("tipoFiltro");

const raridadeFiltro = document.getElementById("raridadeFiltro");

const limparFiltros = document.getElementById("limparFiltros");

const contador = document.getElementById("contador");

const semResultados = document.getElementById("semResultados");


// Guarda todas as cartas vindas do banco
let cartas = [];


// ==========================================
// BUSCAR DADOS DO BACKEND
// ==========================================

async function carregarCartas() {

    try {

        contador.textContent = "Carregando cartas...";

        const resposta = await fetch("/api/catalogo");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados.");
        }

        cartas = await resposta.json();

        console.log("Cartas recebidas:", cartas);

        renderizarCartas(cartas);

    } catch (erro) {

        console.error(erro);

        contador.textContent = "Não foi possível carregar o catálogo.";

        catalogo.innerHTML = `
            <div class="erro">
                <h2>Erro ao carregar cartas</h2>
                <p>
                    Verifique se o servidor e o banco de dados
                    estão funcionando.
                </p>
            </div>
        `;
    }
}


// ==========================================
// RENDERIZAR CARTAS
// ==========================================

function renderizarCartas(lista) {

    catalogo.innerHTML = "";

    contador.textContent =
        `${lista.length} carta${lista.length !== 1 ? "s" : ""} encontrada${lista.length !== 1 ? "s" : ""}`;


    // Nenhum resultado
    if (lista.length === 0) {

        semResultados.classList.add("ativo");

        return;
    }

    semResultados.classList.remove("ativo");


    lista.forEach(carta => {

        const elemento = criarCarta(carta);

        catalogo.appendChild(elemento);

    });
}


// ==========================================
// CRIAR ELEMENTO DE CARTA
// ==========================================

function criarCarta(carta) {

    const div = document.createElement("article");

    // Classe baseada na raridade
    const classeRaridade = normalizarClasse(carta.raridade);

    div.className = `carta ${classeRaridade}`;


    // Caminho da imagem
    const imagem = `imagens/${carta.id}.png`;


    div.innerHTML = `

        <div class="carta-imagem">

            <img
                src="${imagem}"
                alt="${carta.nome}"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=&quot;carta-sem-imagem&quot;>🍪</span>';"
            >

        </div>


        <h3>
            ${carta.nome}
        </h3>


        <div class="carta-info">

            <span class="badge">
                ${carta.tipo}
            </span>

            <span class="badge">
                ${carta.raridade}
            </span>

            <span class="badge">
                Custo: ${carta.custo}
            </span>

        </div>

    `;


    // Clique na carta
    div.addEventListener("click", () => {

        mostrarDetalhes(carta);

    });


    return div;
}


// ==========================================
// NORMALIZAR NOME DA RARIDADE
// ==========================================

function normalizarClasse(texto) {

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s/g, "");
}


// ==========================================
// FILTRAR CARTAS
// ==========================================

function filtrarCartas() {

    const pesquisa =
        campoPesquisa.value
            .toLowerCase()
            .trim();


    const tipo =
        tipoFiltro.value;


    const raridade =
        raridadeFiltro.value;


    const resultado = cartas.filter(carta => {

        const correspondePesquisa =
            carta.nome
                .toLowerCase()
                .includes(pesquisa);


        const correspondeTipo =
            tipo === "" ||
            carta.tipo === tipo;


        const correspondeRaridade =
            raridade === "" ||
            carta.raridade === raridade;


        return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeRaridade
        );

    });


    renderizarCartas(resultado);
}


// ==========================================
// EVENTOS
// ==========================================

campoPesquisa.addEventListener(
    "input",
    filtrarCartas
);


botaoPesquisa.addEventListener(
    "click",
    filtrarCartas
);


tipoFiltro.addEventListener(
    "change",
    filtrarCartas
);


raridadeFiltro.addEventListener(
    "change",
    filtrarCartas
);


limparFiltros.addEventListener(
    "click",
    () => {

        campoPesquisa.value = "";

        tipoFiltro.value = "";

        raridadeFiltro.value = "";

        renderizarCartas(cartas);

    }
);


// ==========================================
// DETALHES DA CARTA
// ==========================================

function mostrarDetalhes(carta) {

    alert(
        `🍪 ${carta.nome}\n\n` +

        `Tipo: ${carta.tipo}\n` +

        `Raridade: ${carta.raridade}\n` +

        `Custo: ${carta.custo}`
    );

}


// ==========================================
// INICIAR
// ==========================================

carregarCartas();