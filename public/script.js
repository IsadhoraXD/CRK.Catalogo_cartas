const catalogo = document.getElementById("catalogo");
const campoPesquisa = document.getElementById("campoPesquisa");
const botaoPesquisa = document.getElementById("botaoPesquisa");
const tipoFiltro = document.getElementById("tipoFiltro");
const raridadeFiltro = document.getElementById("raridadeFiltro");
const limparFiltros = document.getElementById("limparFiltros");
const contador = document.getElementById("contador");
const semResultados = document.getElementById("semResultados");

const URL_BASE = "http://localhost:3000";
let cartas = [];

async function carregarCartas() {
    try {
        contador.textContent = "Carregando cartas...";

        const resposta = await fetch(`${URL_BASE}/api/catalogo`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados.");
        }

        cartas = await resposta.json();
        console.log("Cartas recebidas do backend:", cartas);

        renderizarCartas(cartas);

    } catch (erro) {
        console.error(erro);
        contador.textContent = "Não foi possível carregar o catálogo.";

        catalogo.innerHTML = `
            <div class="erro">
                <h2>Erro ao carregar cartas</h2>
                <p>Verifique se o servidor Node e o MySQL estão ativos.</p>
            </div>
        `;
    }
}

function renderizarCartas(lista) {
    catalogo.innerHTML = "";

    contador.textContent = `${lista.length} carta${lista.length !== 1 ? "s" : ""} encontrada${lista.length !== 1 ? "s" : ""}`;

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

function criarCarta(carta) {
    const div = document.createElement("article");
    const classeRaridade = normalizarClasse(carta.raridade);

    div.className = `carta ${classeRaridade}`;
    const nomeImagem = carta.imagem || `${carta.id}.png`;
    const caminhoImagem = `${URL_BASE}/imagens/${nomeImagem}`;

    div.innerHTML = `
        <div class="carta-imagem">
            <img
                src="${caminhoImagem}"
                alt="${carta.nome}"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=&quot;carta-sem-imagem&quot;>🍪</span>';"
            >
        </div>

        <h3>${carta.nome}</h3>

        <div class="carta-info">
            <span class="badge">${carta.tipo}</span>
            <span class="badge">${carta.raridade}</span>
            <span class="badge">Custo: ${carta.custo}</span>
        </div>
    `;

    div.addEventListener("click", () => {
        mostrarDetalhes(carta);
    });

    return div;
}

function normalizarClasse(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s/g, "");
}

function filtrarCartas() {
    const pesquisa = campoPesquisa.value.toLowerCase().trim();
    const tipo = tipoFiltro.value;
    const raridade = raridadeFiltro.value;

    const resultado = cartas.filter(carta => {
        const correspondePesquisa = carta.nome.toLowerCase().includes(pesquisa);
        const correspondeTipo = tipo === "" || carta.tipo === tipo;
        const correspondeRaridade = raridade === "" || carta.raridade === raridade;

        return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeRaridade
        );
    });

    renderizarCartas(resultado);
}

campoPesquisa.addEventListener("input", filtrarCartas);
botaoPesquisa.addEventListener("click", filtrarCartas);
tipoFiltro.addEventListener("change", filtrarCartas);
raridadeFiltro.addEventListener("change", filtrarCartas);

limparFiltros.addEventListener("click", () => {
    campoPesquisa.value = "";
    tipoFiltro.value = "";
    raridadeFiltro.value = "";
    renderizarCartas(cartas);
});

function mostrarDetalhes(carta) {
    alert(
        `🍪 ${carta.nome}\n\n` +
        `Tipo: ${carta.tipo}\n` +
        `Raridade: ${carta.raridade}\n` +
        `Custo: ${carta.custo}`
    );
}

function renderizarCartas(lista) {
    catalogo.innerHTML = "";
    contador.textContent = `${lista.length} carta${lista.length !== 1 ? "s" : ""} encontrada${lista.length !== 1 ? "s" : ""}`;

    lista.forEach(carta => {
        const elemento = criarCarta(carta);
        catalogo.appendChild(elemento);
    });

    catalogo.appendChild(criarCartaEmBranco());
}

function criarCartaEmBranco() {
    const div = document.createElement("article");
    div.className = "carta carta-adicionar";
    div.innerHTML = `
        <div class="conteudo-adicionar">
            <span class="icone-mais">+</span>
        </div>
    `;
    div.addEventListener("click", abrirModal);
    return div;
}

function abrirModal() {
    document.getElementById("modalCadastro").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modalCadastro").style.display = "none";
    document.getElementById("formCadastro").reset();
}

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const novaCarta = {
        nome: document.getElementById("novoNome").value,
        tipo: document.getElementById("novoTipo").value,
        raridade: document.getElementById("novaRaridade").value,
        custo: parseInt(document.getElementById("novoCusto").value),
        imagem: document.getElementById("novaImagem").value || "1.png"
    };

    try {
        const resposta = await fetch(`${URL_BASE}/api/catalogo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaCarta)
        });

        if (resposta.ok) {
            fecharModal();
            carregarCartas();
        } else {
            alert("Erro ao salvar carta!");
        }
    } catch (erro) {
        console.error("Erro na requisição POST:", erro);
    }
});

carregarCartas();