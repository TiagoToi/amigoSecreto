const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'game-data.json');

// Função para inicializar o arquivo de dados se não existir
function initializeDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            participants: [
                { name: "Brunão", hasViewed: false },
                { name: "Buzziol", hasViewed: false },
                { name: "Be", hasViewed: false },
                { name: "Pipe", hasViewed: false },
                { name: "Duda", hasViewed: false },
                { name: "Gica", hasViewed: false },
                { name: "Rameco", hasViewed: false },
                { name: "Sassi", hasViewed: false },
                { name: "Sergio", hasViewed: false },
                { name: "Batata", hasViewed: false },
                { name: "Doce", hasViewed: false },
                { name: "Gar", hasViewed: false },
                { name: "Japonegro", hasViewed: false }
            ],
            shuffledList: []
        };
        
        // Embaralha a lista inicial
        const names = initialData.participants.map(p => p.name);
        initialData.shuffledList = shuffleArray(names);
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const server = http.createServer((req, res) => {
    // Endpoint principal que retorna o HTML
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erro ao carregar a página');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    // Endpoint para servir o CSS
    else if (req.url === '/style.css') {
        fs.readFile(path.join(__dirname, 'style.css'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('CSS não encontrado');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    }
    // Endpoint para servir o JavaScript
    else if (req.url === '/script.js') {
        fs.readFile(path.join(__dirname, 'script.js'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('JavaScript não encontrado');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    }
    // Endpoint para obter os dados do jogo
    else if (req.url === '/api/game-data' && req.method === 'GET') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro ao ler dados' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }
    // Endpoint para salvar os dados do jogo
    else if (req.url === '/api/game-data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const gameData = JSON.parse(body);
                fs.writeFileSync(DATA_FILE, JSON.stringify(gameData, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro ao salvar dados' }));
            }
        });
    }
    // Rota não encontrada
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Página não encontrada');
    }
});

// Inicializa o arquivo de dados
initializeDataFile();

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse http://localhost:${PORT} para ver o Amigo Secreto`);
});