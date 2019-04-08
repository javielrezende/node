const fs = require('fs');  
const path = require('path');

module.exports = app => {
    //Le o diretorio atual
    fs.readdirSync(__dirname)
    //Filtra arquivos que não comecem com o ponto na primeira posição (que nao começa com um ponto -> .config)
    //e filtra para que não pegue o arquivo atual
    .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
    //Percorre todos os arquivos com o foreach dando um require e passando o app para cada um deles
    .forEach(file => require(path.resolve(__dirname, file))(app));
};