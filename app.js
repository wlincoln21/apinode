const express = require('express');
const path = require('path');

const app = express();

// Servir arquivos estáticos do build React
app.use(express.static(path.join(__dirname, 'build')));

// Configurar rota padrão para servir o arquivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Inicie o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
