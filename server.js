const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Dados de autenticação e URL da API
const username = '2';
const password = '21052150281fa58932b09dab1ee0afce9577828cfd8839c276005168940a0b33';
const token = Buffer.from(`${username}:${password}`).toString('base64');
const url = 'https://ixc.maxfibraltda.com.br/webservice/v1/cliente';

// Função para garantir que o diretório exista
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Função para executar o script watchAndCalculate.js
function runWatchAndCalculateScript() {
  const scriptPath = path.join(__dirname, 'Data', 'watchAndCalculate.js');
  exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Erro ao executar o script watchAndCalculate.js:', err);
      return;
    }
    if (stderr) {
      console.error('stderr:', stderr);
      return;
    }
    console.log('stdout:', stdout);
  });
}

// Rota para o index.html
app.get('/', (req, res) => {
  // Opções para a requisição
  const options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + token,
      'ixcsoft': 'listar'
    },
    form: {
      qtype: 'cliente.id',
      query: '0',
      oper: '>',
      page: '1',
      rp: '1000',
      sortname: 'cliente.id',
      sortorder: 'asc'
    }
  };

  // Fazendo a requisição à API
  request(options, (error, response, body) => {
    if (error) {
      return res.status(500).send('Erro na requisição à API.');
    }

    const dados = JSON.parse(body);

    // Debug: Exibindo os dados retornados no console
    console.log('Dados retornados pela API:', dados);

    // Salvando os dados em um arquivo JSON dentro da pasta 'Data'
    const filePath = path.join(__dirname, 'Data', 'clientesAtivos.json');
    ensureDirectoryExistence(filePath);

    fs.writeFile(filePath, JSON.stringify(dados, null, 2), (err) => {
      if (err) {
        console.error('Erro ao salvar o arquivo JSON:', err);
      } else {
        console.log('Arquivo JSON salvo com sucesso em:', filePath);
        
        // Executa o script watchAndCalculate.js após salvar o arquivo
        runWatchAndCalculateScript();
      }
    });

    // Renderizando o index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// Rota para fornecer o resultado JSON
app.get('/resultado', (req, res) => {
  const resultFilePath = path.join(__dirname, 'Data', 'resultado.json');
  fs.readFile(resultFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler o arquivo JSON de resultado.');
    }
    res.json(JSON.parse(data));
  });
});

// Servindo arquivos estáticos
app.use(express.static('public'));

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
