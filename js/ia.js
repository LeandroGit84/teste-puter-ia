const whatsappLoja = "5513999999999";

function gerarMensagemWhatsApp() {

    let mensagem = `🍫 *NOVO PEDIDO - TRUFAS PREMIUM*\n\n`;

    mensagem += `📋 *Pedido:* #${pedido.numero}\n\n`;

    mensagem += `👤 *Cliente:* ${pedido.cliente.nome}\n`;

    mensagem += `📍 *Endereço:* ${pedido.cliente.endereco}\n`;

    mensagem += `🚚 *Tipo:* ${pedido.entrega.tipo}\n`;

    mensagem += `💳 *Pagamento:* ${pedido.pagamento}\n\n`;

    mensagem += `🛒 *ITENS DO PEDIDO:*\n`;

    pedido.itens.forEach(item => {

        mensagem +=
            `${item.emoji} ${item.quantidade}x ${item.produto} - R$ ${item.subtotal
                .toFixed(2)
                .replace(".", ",")}\n`;

    });

    // ----------------------------------------------
    // VALORES
    // ----------------------------------------------

    const totalProdutos =
        pedido.total - pedido.entrega.taxa;

    mensagem += `\n💰 *Produtos:* R$ ${totalProdutos
        .toFixed(2)
        .replace(".", ",")}`;

    if (pedido.entrega.tipo === "Entrega") {

        mensagem +=
            `\n🚚 *Taxa de entrega:* R$ ${pedido.entrega.taxa
                .toFixed(2)
                .replace(".", ",")}`;

    } else {

        mensagem += `\n🏪 *Retirada:* Grátis`;

    }

    mensagem += `\n\n💵 *TOTAL:* R$ ${pedido.total
        .toFixed(2)
        .replace(".", ",")}`;

    return mensagem;
}

function enviarPedidoWhatsApp() {

  const mensagem = gerarMensagemWhatsApp();

  const url =
    `https://wa.me/${whatsappLoja}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}





// ==================================================
// ELEMENTOS DA INTERFACE
// ==================================================

const chat = document.querySelector("#chat");
const form = document.querySelector("#form-chat");
const input = document.querySelector("#mensagem");


// ==================================================
// ESTADO DA APLICAÇÃO
// ==================================================

let historico = [];

let pedido = {
  cliente: {
    nome: "",
    endereco: ""
  },

  entrega: {
    tipo: "",
    taxa: 0
  },

  pagamento: "",

  itens: [],
  total: 0
};

let etapa = "escolher-sabor";


// ==================================================
// ADICIONAR MENSAGEM NA INTERFACE
// ==================================================

function adicionarMensagem(texto, tipo) {

  const mensagem = document.createElement("div");

  mensagem.classList.add(
    "message",
    tipo
  );

  mensagem.textContent = texto;

  chat.appendChild(mensagem);

  chat.scrollTop = chat.scrollHeight;
}


// ==================================================
// INICIAR ATENDIMENTO
// ==================================================

function iniciarAtendimento() {

  adicionarMensagem(
    "🍫 Bem-vindo à Trufas Premium! Estou aqui para ajudar você a escolher suas trufas. Qual sabor você gostaria de experimentar?",
    "ia"
  );
}


// ==================================================
// IDENTIFICAR PRODUTO
// ==================================================

function identificarProduto(mensagem) {

  const mensagemNormalizada = mensagem.toLowerCase();

  const produto = produtos.find(produto =>
    mensagemNormalizada.includes(
      produto.nome.toLowerCase()
    )
  );

  return produto;
}


// ==================================================
// IDENTIFICAR QUANTIDADE
// ==================================================

function identificarQuantidade(mensagem) {

  const resultado = mensagem.match(/\d+/);

  if (!resultado) {
    return null;
  }

  const quantidade = parseInt(resultado[0]);

  if (quantidade <= 0) {
    return null;
  }

  return quantidade;
}

// ==================================================
// ADICIONAR PRODUTO AO PEDIDO
// ==================================================

function adicionarAoPedido(produto, quantidade) {

  // Procura se o produto já existe no pedido
  const itemExistente = pedido.itens.find(
    item => item.produtoId === produto.id
  );


  // ==============================================
  // PRODUTO JÁ EXISTE
  // ==============================================

  if (itemExistente) {

    itemExistente.quantidade += quantidade;

    itemExistente.subtotal =
      itemExistente.preco *
      itemExistente.quantidade;

    pedido.total +=
      produto.preco * quantidade;

    return itemExistente;
  }


  // ==============================================
  // NOVO PRODUTO
  // ==============================================

  const subtotal =
    produto.preco * quantidade;


  const item = {

    produtoId: produto.id,

    produto: produto.nome,

    emoji: produto.emoji,

    quantidade: quantidade,

    preco: produto.preco,

    subtotal: subtotal

  };


  pedido.itens.push(item);

  pedido.total += subtotal;


  return item;
}


function calcularTotalPedido() {

  const totalProdutos = pedido.itens.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  return totalProdutos + pedido.entrega.taxa;
}

// ==================================================
// LISTA DE SABORES PARA A IA
// ==================================================

const listaSabores = produtos
  .map(produto => `${produto.emoji} ${produto.nome}`)
  .join("\n");



// ==================================================
// PROMPT DA IA
// ==================================================

const promptSistema = `
Você é a atendente virtual da Trufas Premium.

Seu objetivo é atender clientes interessados em comprar
trufas de maneira simpática, clara e objetiva.

Os sabores disponíveis são:

${listaSabores}

Regras:

- Seja simpática e objetiva.
- Faça apenas uma pergunta por vez.
- Ajude o cliente a escolher um sabor.
- Não invente sabores.
- Não invente preços.
- Não invente promoções.
- Não invente informações sobre a empresa.
- Não calcule valores.
- Quando o cliente escolher um sabor, pergunte quantas trufas ele deseja.
- Quando o cliente informar a quantidade, confirme o pedido.
`;


// ==================================================
// CONVERSAR COM A IA
// ==================================================

async function perguntarIA(mensagem) {

  historico.push({
    role: "user",
    content: mensagem
  });


  const conversa = historico
    .map(mensagem => {
      return `${mensagem.role}: ${mensagem.content}`;
    })
    .join("\n");


  const resposta = await puter.ai.chat(`
${promptSistema}

Histórico da conversa:

${conversa}
`);


  const texto = resposta.message.content;


  historico.push({
    role: "assistant",
    content: texto
  });


  return texto;
}


// ==================================================
// ENVIO DA MENSAGEM
// ==================================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();
  const mensagem = input.value.trim();

  if (!mensagem) {
    return;
  }

  // ----------------------------------------------
  // PRIMEIRA ETAPA DA FINALIZAÇÃO: NOME
  // ----------------------------------------------

  if (etapa === "informar-nome") {

    pedido.cliente.nome = mensagem;

    adicionarMensagem(
      `Prazer, ${pedido.cliente.nome}! 😊`,
      "ia"
    );

    adicionarMensagem(
      "Agora, qual é o endereço para entrega?",
      "ia"
    );

    etapa = "informar-endereco";

    input.value = "";
    input.disabled = false;
    input.focus();

    console.log("Cliente:", pedido.cliente);

    return;
  }

  // ----------------------------------------------
  // SEGUNDA ETAPA DA FINALIZAÇÃO: ENDEREÇO
  // ----------------------------------------------

  if (etapa === "informar-endereco") {

    pedido.cliente.endereco = mensagem;

    adicionarMensagem(
      `Perfeito! Vou entregar seu pedido em: ${pedido.cliente.endereco} 📍`,
      "ia"
    );

    adicionarMensagem(
      "Você prefere receber o pedido por entrega ou retirar na loja? 🚚🏪",
      "ia"
    );

    etapa = "informar-tipo-entrega";

    input.value = "";
    input.disabled = false;
    input.focus();

    return;
  }

  // ----------------------------------------------
  // ENTREGA OU RETIRADA
  // ----------------------------------------------

  if (etapa === "informar-tipo-entrega") {

    const resposta = mensagem.toLowerCase();

    const escolheuEntrega =
      resposta.includes("entrega") ||
      resposta.includes("entregar");

    const escolheuRetirada =
      resposta.includes("retirada") ||
      resposta.includes("retirar") ||
      resposta.includes("loja");


    // ==========================================
    // ENTREGA
    // ==========================================

    if (escolheuEntrega) {

      pedido.entrega.tipo = "Entrega";
      pedido.entrega.taxa = 5;

      adicionarMensagem(
        "🚚 Entrega selecionada! A taxa de entrega é R$ 5,00.",
        "ia"
      );

      adicionarMensagem(
        "Agora, qual será a forma de pagamento? 💳\nPix, dinheiro ou cartão?",
        "ia"
      );

      etapa = "informar-pagamento";

      input.value = "";
      input.disabled = false;
      input.focus();

      return;
    }


    // ==========================================
    // RETIRADA
    // ==========================================

    if (escolheuRetirada) {

      pedido.entrega.tipo = "Retirada";
      pedido.entrega.taxa = 0;

      adicionarMensagem(
        "🏪 Retirada selecionada! Não há taxa de entrega.",
        "ia"
      );

      adicionarMensagem(
        "Agora, qual será a forma de pagamento? 💳\nPix, dinheiro ou cartão?",
        "ia"
      );

      etapa = "informar-pagamento";

      input.value = "";
      input.disabled = false;
      input.focus();

      return;
    }


    // ==========================================
    // RESPOSTA NÃO IDENTIFICADA
    // ==========================================

    adicionarMensagem(
      "Por favor, escolha entre entrega ou retirada. 🚚🏪",
      "ia"
    );

    input.value = "";
    input.disabled = false;
    input.focus();

    return;
  }


  if (etapa === "informar-pagamento") {

    pedido.pagamento = mensagem;

    pedido.total = calcularTotalPedido();

    adicionarMensagem(
      `Perfeito! Pagamento escolhido: ${pedido.pagamento}. 💳`,
      "ia"
    );

    etapa = "confirmar-pedido";

    mostrarResumoPedido();

    input.value = "";
    input.disabled = false;
    input.focus();

    console.log("Pedido completo:", pedido);

    return;
  }

  function gerarNumeroPedido() {

    return Math.floor(
      100000 + Math.random() * 900000
    );

  }

  // ==================================================
  // CONFIRMAR PEDIDO
  // ==================================================

  if (etapa === "confirmar-pedido") {

    const resposta = mensagem.toLowerCase();

    const confirmou =
      resposta.includes("sim") ||
      resposta.includes("confirmo") ||
      resposta.includes("confirmar") ||
      resposta.includes("correto");


    // ==============================================
    // PEDIDO CONFIRMADO
    // ==============================================

    if (confirmou) {

      pedido.numero = gerarNumeroPedido();

      etapa = "pedido-confirmado";

      adicionarMensagem(
        `🎉 Pedido confirmado com sucesso!

        Número do pedido: #${pedido.numero}

        Obrigado pela preferência, ${pedido.cliente.nome}! 🍫`,
        "ia"
      );

      console.log(
        "PEDIDO CONFIRMADO:",
        pedido
      );

      enviarPedidoWhatsApp();

      input.value = "";
      input.disabled = true;

      return;
    }

    // ==============================================
    // PEDIDO NÃO CONFIRMADO
    // ==============================================

    adicionarMensagem(
      "Tudo bem! O pedido não foi confirmado. Se quiser alterar alguma informação, me diga o que deseja corrigir.",
      "ia"
    );

    input.value = "";
    input.disabled = false;
    input.focus();

    return;
  }


  // ----------------------------------------------
  // MOSTRA MENSAGEM DO CLIENTE
  // ----------------------------------------------

  adicionarMensagem(
    mensagem,
    "cliente"
  );


  input.value = "";

  input.disabled = true;


  // ----------------------------------------------
  // IDENTIFICA PRODUTO
  // ----------------------------------------------

  const produto = identificarProduto(mensagem);


  if (produto) {
    produtoSelecionado = produto;
    etapa = "informar-quantidade";
    console.log(
      "Produto selecionado:",
      produto
    );

  }


  // ----------------------------------------------
  // IDENTIFICA QUANTIDADE
  // ----------------------------------------------

  const quantidade = identificarQuantidade(
    mensagem
  );


  if (quantidade) {

    console.log(
      "Quantidade identificada:",
      quantidade
    );

  }

  // ----------------------------------------------
  // ADICIONA AO PEDIDO
  // ----------------------------------------------

  if (
    quantidade &&
    etapa === "informar-quantidade" &&
    produtoSelecionado
  ) {

    const item = adicionarAoPedido(
      produtoSelecionado,
      quantidade
    );

    renderizarCarrinho();

    etapa = "pedido";


    console.log(
      "Item adicionado:",
      item
    );

    console.log(
      "Pedido:",
      pedido
    );


    // ------------------------------------------
    // RESPOSTA DO SISTEMA
    // ------------------------------------------

    adicionarMensagem(
      `Perfeito! Adicionei ${quantidade}x ${item.produto} ao seu pedido. 🛒`,
      "ia"
    );


    // Limpa o produto selecionado
    produtoSelecionado = null;


    input.disabled = false;
    input.focus();

    return;
  }


  // ----------------------------------------------
  // CONVERSA COM A IA
  // ----------------------------------------------

  try {

    const resposta = await perguntarIA(
      mensagem
    );


    adicionarMensagem(
      resposta,
      "ia"
    );


  } catch (erro) {

    console.error(
      "Erro ao consultar a IA:",
      erro
    );


    adicionarMensagem(
      "Desculpe, não consegui responder agora. Tente novamente.",
      "ia"
    );


  } finally {

    input.disabled = false;

    input.focus();

  }

});

// --------------------------------------------------
// ELEMENTOS DO CARRINHO
// --------------------------------------------------

const btnCarrinho = document.querySelector("#btn-carrinho");
const painelCarrinho = document.querySelector("#painel-carrinho");
const fecharCarrinho = document.querySelector("#fechar-carrinho");

const listaCarrinho = document.querySelector("#lista-carrinho");
const contadorCarrinho = document.querySelector("#contador-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");

const finalizarPedido = document.querySelector("#finalizar-pedido");

// --------------------------------------------------
// ABRIR CARRINHO
// --------------------------------------------------

btnCarrinho.addEventListener("click", () => {

  painelCarrinho.classList.add("aberto");

  renderizarCarrinho();

});


// --------------------------------------------------
// FECHAR CARRINHO
// --------------------------------------------------

fecharCarrinho.addEventListener("click", () => {

  painelCarrinho.classList.remove("aberto");

});

// ==================================================
// INICIAR FINALIZAÇÃO
// ==================================================

finalizarPedido.addEventListener("click", () => {

  if (pedido.itens.length === 0) {
    adicionarMensagem(
      "Seu carrinho está vazio. Adicione pelo menos uma trufa antes de finalizar. 🛒",
      "ia"
    );

    return;
  }

  // Fecha o carrinho
  painelCarrinho.classList.remove("aberto");

  // Muda para a etapa de informar o nome
  etapa = "informar-nome";

  adicionarMensagem(
    "Perfeito! Para finalizar seu pedido, qual é o seu nome?",
    "ia"
  );

  input.disabled = false;
  input.focus();

});

// --------------------------------------------------
// RENDERIZA CARRINHO
// --------------------------------------------------

function renderizarCarrinho() {


  listaCarrinho.innerHTML = "";

  if (pedido.itens.length === 0) {

    listaCarrinho.innerHTML = `
            <div class="carrinho-vazio">
                <p>Seu carrinho está vazio 🛒</p>
            </div>
        `;

    contadorCarrinho.textContent = "0";
    totalCarrinho.textContent = "R$ 0,00";

    return;
  }

  let quantidadeTotal = 0;

  pedido.itens.forEach((item, index) => {

    quantidadeTotal += item.quantidade;

    const elemento = document.createElement("div");
    elemento.classList.add("item-carrinho");

    elemento.innerHTML = `

    <div class="item-emoji">
        ${item.emoji}
    </div>

    <div class="item-info">

        <h3>
            ${item.produto}
        </h3>

        <div class="controle-quantidade">

            <button
                class="btn-quantidade"
                data-index="${index}"
                data-acao="diminuir"
            >
                −
            </button>

            <span>
                ${item.quantidade}
            </span>

            <button
                class="btn-quantidade"
                data-index="${index}"
                data-acao="aumentar"
            >
                +
            </button>

        </div>

    </div>

    <div class="item-subtotal">

        R$ ${item.subtotal
        .toFixed(2)
        .replace(".", ",")}

    </div>

    <button
        class="btn-remover"
        data-index="${index}"
    >
        ✕
    </button>

`;

    listaCarrinho.appendChild(elemento);

  });

  contadorCarrinho.textContent = quantidadeTotal;
  totalCarrinho.textContent =
    `R$ ${pedido.total.toFixed(2).replace(".", ",")}`;



}

// ==================================================
// RESUMO DO PEDIDO
// ==================================================

function mostrarResumoPedido() {

  const mensagem = document.createElement("div");

  mensagem.classList.add(
    "message",
    "ia",
    "resumo-pedido"
  );

  let itensHTML = "";

  pedido.itens.forEach(item => {

    itensHTML += `
            <div class="resumo-item">

                <div class="resumo-item-info">

                    <span class="resumo-emoji">
                        ${item.emoji}
                    </span>

                    <div>
                        <strong>
                            ${item.produto}
                        </strong>

                        <small>
                            ${item.quantidade}x
                        </small>
                    </div>

                </div>

                <strong>
                    R$ ${item.subtotal
        .toFixed(2)
        .replace(".", ",")}
                </strong>

            </div>
        `;
  });

  mensagem.innerHTML = `

  <div class="resumo-header">
            <strong>📋 Resumo do pedido</strong>
        </div>

        <div class="resumo-itens">
            ${itensHTML}
        </div>

       <div class="resumo-valores">

        <div class="resumo-valor">
          <span>Produtos</span>

            <strong>
                R$ ${(pedido.total - pedido.entrega.taxa)
          .toFixed(2)
          .replace(".", ",")}
            </strong>
         </div>

    <div class="resumo-valor">

        <span>
            ${pedido.entrega.tipo === "Entrega"
      ? "🚚 Taxa de entrega"
      : "🏪 Retirada"}
        </span>

        <strong>
            ${pedido.entrega.taxa === 0
      ? "Grátis"
      : `R$ ${pedido.entrega.taxa
        .toFixed(2)
        .replace(".", ",")}`}
        </strong>

    </div>

    <div class="resumo-total">

        <span>Total</span>

        <strong>
            R$ ${pedido.total
      .toFixed(2)
      .replace(".", ",")}
        </strong>

    </div>

</div>

        <div class="resumo-dados">

            <div>
                <span>👤 Nome</span>
                <strong>${pedido.cliente.nome}</strong>
            </div>

            <div>
                <span>📍 Endereço</span>
                <strong>${pedido.cliente.endereco}</strong>
            </div>

            <div>
                <span>💳 Pagamento</span>
                <strong>${pedido.pagamento}</strong>
            </div>

        </div>

        <div class="resumo-confirmacao">
            <span>Está tudo correto?</span>
            <strong>Digite "sim" para confirmar.</strong>
        </div>

    `;

  chat.appendChild(mensagem);

  chat.scrollTop = chat.scrollHeight;
}

// ==================================================
// REMOVER ITEM
// ==================================================

function removerItem(index) {

  pedido.itens.splice(index, 1);


  pedido.total = pedido.itens.reduce(
    (total, item) => total + item.subtotal,
    0
  );


  renderizarCarrinho();

}

// ==================================================
// CONTROLES DO CARRINHO
// ==================================================

listaCarrinho.addEventListener("click", (event) => {

  const botao = event.target.closest("button");

  if (!botao) {
    return;
  }


  const index = Number(
    botao.dataset.index
  );


  // ==============================================
  // AUMENTAR / DIMINUIR
  // ==============================================

  const acao = botao.dataset.acao;


  if (acao === "aumentar") {

    alterarQuantidade(index, 1);

    return;
  }


  if (acao === "diminuir") {

    alterarQuantidade(index, -1);

    return;
  }


  // ==============================================
  // REMOVER
  // ==============================================

  if (botao.classList.contains("btn-remover")) {

    removerItem(index);

  }

});

// ==================================================
// ALTERAR QUANTIDADE
// ==================================================

function alterarQuantidade(index, variacao) {

  const item = pedido.itens[index];

  if (!item) {
    return;
  }


  item.quantidade += variacao;


  // ==============================================
  // QUANTIDADE CHEGOU A ZERO
  // ==============================================

  if (item.quantidade <= 0) {

    pedido.itens.splice(index, 1);

  } else {

    item.subtotal =
      item.preco *
      item.quantidade;

  }


  // ==============================================
  // RECALCULA TOTAL
  // ==============================================

  pedido.total = pedido.itens.reduce(
    (total, item) => total + item.subtotal,
    0
  );


  renderizarCarrinho();

}

// ==================================================
// INICIALIZAÇÃO
// ==================================================

iniciarAtendimento();

