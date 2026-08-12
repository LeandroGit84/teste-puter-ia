const pergunta = document.querySelector("#pergunta");
const botao = document.querySelector("#btnPerguntar");
const resposta = document.querySelector("#resposta");

botao.addEventListener("click", async () => {

    const texto = pergunta.value.trim();

    if (!texto) {
        resposta.textContent = "Digite alguma pergunta.";
        return;
    }

    resposta.textContent = "Pensando...";

    try {

        const resultado = await puter.ai.chat(texto);

        resposta.textContent = resultado.message.content;

    } catch (erro) {

        console.error(erro);

        resposta.textContent = "Erro ao consultar a IA.";

    }

});


const trufas = {
    morango: {
        nome: "Morango",
        preco: 5.00
    },

    chocolate: {
        nome: "Chocolate",
        preco: 5.00
    },

    ninho: {
        nome: "Ninho",
        preco: 5.50
    },

    amendoim: {
        nome: "Amendoim",
        preco: 5.00
    },

    nutella: {
        nome: "Nutella",
        preco: 6.00
    }
};

async function conversarComIA(mensagem) {

    const resposta = await puter.ai.chat(mensagem);

    return resposta.message.content;
}

