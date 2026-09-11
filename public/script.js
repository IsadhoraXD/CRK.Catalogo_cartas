const catalogo = document.getElementById("catalogo");
const campoPesquisa = document.getElementById("campoPesquisa");
const botaoPesquisa = document.getElementById("botaoPesquisa");
const tipoFiltro = document.getElementById("tipoFiltro");
const raridadeFiltro = document.getElementById("raridadeFiltro");
const limparFiltros = document.getElementById("limparFiltros");
const contador = document.getElementById("contador");
const semResultados = document.getElementById("semResultados");
const btnDeletarCarta = document.getElementById("btnDeletarCarta");
const modalConfirmarExclusao = document.getElementById("modalConfirmarExclusao");
const btnConfirmarSim = document.getElementById("btnConfirmarSim");

const URL_BASE = "http://localhost:3000";
let cartas = [];
let cartaSelecionadaId = null;

// Formata para exibição visual nos cards sempre bonita com acento
function formatarExibicaoRaridade(raridade) {
    if (!raridade) return "Comum";
    
    const texto = raridade.toString().toLowerCase().trim();

    if (texto.includes("pica") || texto.includes("pico")) return "Épica";
    if (texto.includes("dria") || texto.includes("drio")) return "Lendária";
    if (texto.includes("rar")) return "Rara";
    if (texto.includes("anc")) return "Ancestral";
    if (texto.includes("com")) return "Comum";

    return raridade;
}

// Normaliza para filtros e CSS sem quebrar por acento
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s/g, "")
        .trim();
}

async function carregarCartas() {
    try {
        contador.textContent = "Carregando cartas...";

        const resposta = await fetch(`${URL_BASE}/api/catalogo`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados.");
        }

        cartas = await resposta.json();
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
    } else {
        semResultados.classList.remove("ativo");
    }

    lista.forEach(carta => {
        const elemento = criarCarta(carta);
        catalogo.appendChild(elemento);
    });

    catalogo.appendChild(criarCartaEmBranco());
}

function criarCarta(carta) {
    const div = document.createElement("article");
    const raridadeFormatada = formatarExibicaoRaridade(carta.raridade);
    const classeCssRaridade = normalizarTexto(raridadeFormatada);

    div.className = `carta ${classeCssRaridade}`;
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
            <span class="badge">${raridadeFormatada}</span>
            <span class="badge">Custo: ${carta.custo}</span>
        </div>
    `;

    div.addEventListener("click", () => {
        mostrarDetalhes(carta, raridadeFormatada);
    });

    return div;
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

function filtrarCartas() {
    const pesquisa = campoPesquisa.value.toLowerCase().trim();
    const tipo = tipoFiltro.value;
    const raridadeFiltroNorm = normalizarTexto(raridadeFiltro.value);

    const resultado = cartas.filter(carta => {
        const correspondePesquisa = carta.nome.toLowerCase().includes(pesquisa);
        const correspondeTipo = tipo === "" || carta.tipo === tipo;
        
        const raridadeCartaNorm = normalizarTexto(carta.raridade);
        const correspondeRaridade = raridadeFiltroNorm === "" || raridadeCartaNorm.includes(raridadeFiltroNorm) || raridadeFiltroNorm.includes(raridadeCartaNorm);

        return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeRaridade
        );
    });

    renderizarCartas(resultado);
}

function mostrarDetalhes(carta, raridadeFormatada) {
    cartaSelecionadaId = carta.id;
    const container = document.getElementById("modalCartaContainer");
    const modal = document.getElementById("modalDetalhes");

    const cartaElemento = criarCarta(carta);
    cartaElemento.onclick = null;

    container.innerHTML = "";
    container.appendChild(cartaElemento);

    modal.style.display = "flex";
}

function fecharModalDetalhes(evento) {
    if (!evento || evento.target.id === "modalDetalhes" || evento.target.classList.contains("btn-fechar-detalhes")) {
        document.getElementById("modalDetalhes").style.display = "none";
        cartaSelecionadaId = null;
    }
}

function abrirModalConfirmacao() {
    modalConfirmarExclusao.style.display = "flex";
}

function fecharModalConfirmacao() {
    modalConfirmarExclusao.style.display = "none";
}

async function deletarCarta() {
    if (!cartaSelecionadaId) return;

    try {
        const resposta = await fetch(`${URL_BASE}/api/catalogo/${cartaSelecionadaId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (resposta.ok) {
            fecharModalConfirmacao();
            document.getElementById("modalDetalhes").style.display = "none";
            cartaSelecionadaId = null;
            carregarCartas();
        } else {
            const dados = await resposta.json();
            alert(`Erro ao deletar: ${dados.erro || "Tente novamente."}`);
        }
    } catch (erro) {
        console.error("Erro na requisição DELETE:", erro);
        alert("Erro ao se conectar com o servidor.");
    }
}

function abrirModal() {
    document.getElementById("modalCadastro").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modalCadastro").style.display = "none";
    document.getElementById("formCadastro").reset();
}

btnDeletarCarta.addEventListener("click", abrirModalConfirmacao);
btnConfirmarSim.addEventListener("click", deletarCarta);

window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.fecharModalDetalhes = fecharModalDetalhes;
window.fecharModalConfirmacao = fecharModalConfirmacao;

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

document.getElementById("formCadastro")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", document.getElementById("novoNome").value);
    formData.append("tipo", document.getElementById("novoTipo").value);
    formData.append("raridade", document.getElementById("novaRaridade").value);
    formData.append("custo", parseInt(document.getElementById("novoCusto").value));

    const arquivoImagem = document.getElementById("novaImagem").files[0];
    if (arquivoImagem) {
        formData.append("imagem", arquivoImagem);
    }

    try {
        const resposta = await fetch(`${URL_BASE}/api/catalogo`, {
            method: "POST",
            body: formData
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            fecharModal();
            carregarCartas();
        } else {
            alert(`Erro ao salvar: ${dados.erro || "Verifique os dados."}`);
        }
    } catch (erro) {
        console.error("Erro na requisição POST:", erro);
        alert("Erro ao se conectar com o servidor.");
    }
});

carregarCartas();