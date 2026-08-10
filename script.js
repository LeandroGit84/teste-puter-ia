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