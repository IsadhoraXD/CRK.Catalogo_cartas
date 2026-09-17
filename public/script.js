const catalogo = document.getElementById("catalogo");
const campoPesquisa = document.getElementById("campoPesquisa");
const botaoPesquisa = document.getElementById("botaoPesquisa");
const tipoFiltro = document.getElementById("tipoFiltro");
const raridadeFiltro = document.getElementById("raridadeFiltro");
const btnFiltroFavoritos = document.getElementById("btnFiltroFavoritos");
const limparFiltros = document.getElementById("limparFiltros");
const contador = document.getElementById("contador");
const semResultados = document.getElementById("semResultados");
const btnDeletarCarta = document.getElementById("btnDeletarCarta");
const btnFavoritarCarta = document.getElementById("btnFavoritarCarta");
const modalConfirmarExclusao = document.getElementById("modalConfirmarExclusao");
const btnConfirmarSim = document.getElementById("btnConfirmarSim");

// Elementos da Animação de Intro
const introOverlay = document.getElementById("introOverlay");
const introScreen = document.getElementById("introScreen");
const btnAbrirCatalogo = document.getElementById("btnAbrirCatalogo");
const videoForno = document.getElementById("videoForno");
const fadeWhite = document.getElementById("fadeWhite");

const URL_BASE = "http://localhost:3000";
let cartas = [];
let cartaSelecionadaId = null;
let fadeFinalIniciado = false;
let cartaArrastadaIndex = null;
let apenasFavoritosAtivo = false;

// ESTADO GLOBAL: Controla se o usuário já passou da tela de abertura
let introConcluida = false;

// Função para garantir que a tela de abertura permaneça oculta se o usuário já entrou no catálogo
function fecharIntroDefinitivamente() {
    introConcluida = true;
    if (introOverlay) {
        introOverlay.style.display = "none";
        introOverlay.style.pointerEvents = "none";
    }
}

// Verifica se o catálogo já foi aberto nesta sessão do navegador
if (sessionStorage.getItem("catalogoAberto") === "true") {
    if (introOverlay) {
        introOverlay.style.display = "none";
        introOverlay.style.pointerEvents = "none";
    }
}

// Animação inicial ao clicar em "Abrir Catálogo"
btnAbrirCatalogo?.addEventListener("click", () => {
    btnAbrirCatalogo.classList.add("brilhando");
    fadeFinalIniciado = false;

    videoForno.style.display = "block";
    fadeWhite.style.opacity = "1";
    videoForno.currentTime = 0;

    videoForno.play().then(() => {
        introScreen.style.display = "none";

        setTimeout(() => {
            fadeWhite.style.opacity = "0";
        }, 100);
    }).catch(erro => {
        console.error("Erro ao reproduzir o vídeo:", erro);
        ocultarIntroEGravarSessao();
    });
});

// Animação de encerramento do vídeo com Fade Out Suave
videoForno?.addEventListener("timeupdate", () => {
    if (videoForno.duration && videoForno.currentTime >= videoForno.duration - 0.8 && !fadeFinalIniciado) {
        fadeFinalIniciado = true;

        // 1. Ativa a tela branca com fade suave
        fadeWhite.style.opacity = "1";

        // 2. Quando o fade pra branco estiver completo, inicia o sumiço do overlay inteiro
        setTimeout(() => {
            videoForno.pause();
            videoForno.style.display = "none";
            
            // Suplica um efeito suave de esmaecimento no overlay completo
            introOverlay.style.transition = "opacity 0.6s ease";
            introOverlay.style.opacity = "0";
            fadeWhite.style.opacity = "0";

            // 3. Aguarda o tempo da transição de 0.6s terminar antes de aplicar display: none
            setTimeout(() => {
                ocultarIntroEGravarSessao();
            }, 600);

        }, 800);
    }
});

function ocultarIntroEGravarSessao() {
    sessionStorage.setItem("catalogoAberto", "true");
    if (introOverlay) {
        introOverlay.style.display = "none";
        introOverlay.style.pointerEvents = "none";
    }
}
// Animação do vídeo
videoForno?.addEventListener("timeupdate", () => {
    if (videoForno.duration && videoForno.currentTime >= videoForno.duration - 0.8 && !fadeFinalIniciado) {
        fadeFinalIniciado = true;
        fadeWhite.style.opacity = "1";

        setTimeout(() => {
            videoForno.pause();
            videoForno.style.display = "none";
            introScreen.style.display = "none";
            fadeWhite.style.opacity = "0";

            ocultarIntroEGravarSessao();
        }, 800);
    }
});

function ocultarIntroEGravarSessao() {
    // Salva na memória do navegador que o catálogo foi aberto
    sessionStorage.setItem("catalogoAberto", "true");
    if (introOverlay) {
        introOverlay.style.display = "none";
        introOverlay.style.pointerEvents = "none";
    }
}

// Animação inicial ao clicar em "Abrir Catálogo"
btnAbrirCatalogo.addEventListener("click", () => {
    btnAbrirCatalogo.classList.add("brilhando");
    fadeFinalIniciado = false;

    videoForno.style.display = "block";
    fadeWhite.style.opacity = "1";
    videoForno.currentTime = 0;

    videoForno.play().then(() => {
        introScreen.style.display = "none";

        setTimeout(() => {
            fadeWhite.style.opacity = "0";
        }, 100);
    }).catch(erro => {
        console.error("Erro ao reproduzir o vídeo:", erro);
        fecharIntroDefinitivamente();
    });
});

// Animação de Fade Out do Forno
videoForno.addEventListener("timeupdate", () => {
    if (videoForno.duration && videoForno.currentTime >= videoForno.duration - 0.8 && !fadeFinalIniciado) {
        fadeFinalIniciado = true;
        fadeWhite.style.opacity = "1";

        setTimeout(() => {
            videoForno.pause();
            videoForno.style.display = "none";
            introScreen.style.display = "none";
            fadeWhite.style.opacity = "0";

            // Oculta a intro de forma permanente
            fecharIntroDefinitivamente();
        }, 800);
    }
});

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
        filtrarCartas();

        // Se a intro já foi concluída, garante que ela continue invisível
        if (introConcluida) {
            fecharIntroDefinitivamente();
        }

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

    lista.forEach((carta, index) => {
        const elemento = criarCarta(carta, index);
        catalogo.appendChild(elemento);
    });

    catalogo.appendChild(criarCartaEmBranco());
}

function criarCarta(carta, index) {
    const div = document.createElement("article");
    const raridadeFormatada = formatarExibicaoRaridade(carta.raridade);
    const classeCssRaridade = normalizarTexto(raridadeFormatada);

    div.className = `carta ${classeCssRaridade}`;
    div.draggable = true;
    div.dataset.index = index;

    const nomeImagem = carta.imagem || `${carta.id}.png`;
    const caminhoImagem = `${URL_BASE}/imagens/${nomeImagem}`;

    div.innerHTML = `
        ${carta.favorito ? '<span class="estrela-favorito" title="Favorita">⭐</span>' : ''}
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

    div.addEventListener("dragstart", (e) => {
        cartaArrastadaIndex = index;
        div.classList.add("arrastando");
    });

    div.addEventListener("dragend", () => {
        div.classList.remove("arrastando");
    });

    div.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    div.addEventListener("drop", (e) => {
        e.preventDefault();
        const indexDestino = parseInt(div.dataset.index);

        if (cartaArrastadaIndex !== null && cartaArrastadaIndex !== indexDestino) {
            const itemRemovido = cartas.splice(cartaArrastadaIndex, 1)[0];
            cartas.splice(indexDestino, 0, itemRemovido);
            filtrarCartas();
        }
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

        const correspondeFavorito = !apenasFavoritosAtivo || carta.favorito;

        return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeRaridade &&
            correspondeFavorito
        );
    });

    renderizarCartas(resultado);
}

function mostrarDetalhes(carta, raridadeFormatada) {
    cartaSelecionadaId = carta.id;
    const container = document.getElementById("modalCartaContainer");
    const modal = document.getElementById("modalDetalhes");

    btnFavoritarCarta.textContent = carta.favorito ? "⭐ Desfavoritar" : "⭐ Favoritar";

    const cartaElemento = criarCarta(carta, -1);
    cartaElemento.onclick = null;
    cartaElemento.draggable = false;

    container.innerHTML = "";
    container.appendChild(cartaElemento);

    modal.style.display = "flex";
}

function alternarFavorito() {
    if (!cartaSelecionadaId) return;

    const carta = cartas.find(c => c.id === cartaSelecionadaId);
    if (carta) {
        carta.favorito = !carta.favorito;
        btnFavoritarCarta.textContent = carta.favorito ? "⭐ Desfavoritar" : "⭐ Favoritar";
        filtrarCartas();

        const container = document.getElementById("modalCartaContainer");
        const cartaElemento = criarCarta(carta, -1);
        cartaElemento.onclick = null;
        cartaElemento.draggable = false;
        container.innerHTML = "";
        container.appendChild(cartaElemento);
    }
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
            await carregarCartas(); // Recarrega mantendo a tela principal ativa
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

btnFavoritarCarta.addEventListener("click", alternarFavorito);
btnDeletarCarta.addEventListener("click", abrirModalConfirmacao);
btnConfirmarSim.addEventListener("click", deletarCarta);

btnFiltroFavoritos.addEventListener("click", () => {
    apenasFavoritosAtivo = !apenasFavoritosAtivo;
    btnFiltroFavoritos.classList.toggle("ativo", apenasFavoritosAtivo);
    btnFiltroFavoritos.textContent = apenasFavoritosAtivo ? "⭐ Todos os Cookies" : "⭐ Apenas Favoritos";
    filtrarCartas();
});

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
    apenasFavoritosAtivo = false;
    btnFiltroFavoritos.classList.remove("ativo");
    btnFiltroFavoritos.textContent = "⭐ Apenas Favoritos";
    filtrarCartas();
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
            await carregarCartas(); // Recarrega mantendo a tela principal ativa
        } else {
            alert(`Erro ao salvar: ${dados.erro || "Verifique os dados."}`);
        }
    } catch (erro) {
        console.error("Erro na requisição POST:", erro);
        alert("Erro ao se conectar com o servidor.");
    }
});

carregarCartas();