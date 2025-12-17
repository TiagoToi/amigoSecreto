const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const JSONBIN_API_KEY = "$2a$10$.RkVFdVYCuJtkUHLJWmkhOcFMXCp5teibNwwkbvVIsKl5UEN.o1Rq";
const JSONBIN_BIN_ID = "6942bae3ae596e708fa05291";

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Função para fazer requisição ao JSONBin
function jsonBinRequest(method, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.jsonbin.io',
            path: `/v3/b/${JSONBIN_BIN_ID}`,
            method: method,
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        if (method === 'GET') {
            options.path += '/latest';
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Endpoint principal - HTML
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
    // CSS
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
    // JavaScript
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
    // API - GET dados do jogo
    else if (req.url === '/api/game-data' && req.method === 'GET') {
        try {
            const response = await jsonBinRequest('GET');
            let gameData = response.record;
            
            // Se a lista embaralhada estiver vazia, embaralha
            if (!gameData.shuffledList || gameData.shuffledList.length === 0) {
                const names = gameData.participants.map(p => p.name);
                gameData.shuffledList = shuffleArray(names);
                await jsonBinRequest('PUT', gameData);
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(gameData));
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro ao buscar dados' }));
        }
    }
    // API - POST salvar dados do jogo
    else if (req.url === '/api/game-data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const gameData = JSON.parse(body);
                await jsonBinRequest('PUT', gameData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Erro ao salvar dados:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro ao salvar dados' }));
            }
        });
    }
    // 404
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Página não encontrada');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
        console.warn('⚠️  ATENÇÃO: Configure as variáveis JSONBIN_API_KEY e JSONBIN_BIN_ID');
    } else {
        console.log('✅ JSONBin configurado corretamente');
    }
});