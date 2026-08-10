const produtos = [
    {
        id: 1,
        nome: "Morango",
        emoji: "🍓",
        preco: 5.00
    },

    {
        id: 2,
        nome: "Chocolate",
        emoji: "🍫",
        preco: 5.00
    },

    {
        id: 3,
        nome: "Ninho",
        emoji: "🥛",
        preco: 5.50
    },

    {
        id: 4,
        nome: "Amendoim",
        emoji: "🥜",
        preco: 5.00
    },

    {
        id: 5,
        nome: "Nutella",
        emoji: "🌰",
        preco: 6.00
    }
];

function encontrarProduto(nome) {

    return produtos.find(produto =>
        produto.nome.toLowerCase() === nome.toLowerCase()
    );

}