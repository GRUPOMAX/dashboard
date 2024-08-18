const express = require('express');
const fs = require('fs');
const path = require('path');
const request = require('request');
const { exec } = require('child_process'); // Adicionado para executar o script externo

const app = express();
const port = 3001;

// Middleware para servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter a contagem filtrada
app.get('/data', (req, res) => {
  fs.readFile(path.join(__dirname, 'Data', 'filtered_count.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      res.status(500).send('Erro ao ler o arquivo JSON');
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('Erro ao parsear o arquivo JSON:', parseError);
      res.status(500).send('Erro ao parsear o arquivo JSON');
      return;
    }

    res.json(jsonData);
  });
});

// Rota para obter o resultado
app.get('/resultado', (req, res) => {
  const resultadoPath = path.join(__dirname, 'public', 'resultado.json');
  res.sendFile(resultadoPath, err => {
    if (err) {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(err.status).end();
    }
  });
});

// Rota para obter o bairros_count
app.get('/bairros', (req, res) => {
  const bairrosPath = path.join(__dirname, 'public', 'bairros_count.json');
  res.sendFile(bairrosPath, err => {
    if (err) {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(err.status).end();
    }
  });
});

// Rota para obter clientesAtivos.json
app.get('/clientesAtivos', (req, res) => {
  const clientesAtivosPath = path.join(__dirname, 'Data', 'clientesAtivos.json');
  res.sendFile(clientesAtivosPath, err => {
    if (err) {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(err.status).end();
    }
  });
});

// Rota para obter filtered_count.json
app.get('/filtered_count', (req, res) => {
  const filteredCountPath = path.join(__dirname, 'Data', 'filtered_count.json');
  res.sendFile(filteredCountPath, err => {
    if (err) {
      console.error('Erro ao enviar o arquivo:', err);
      res.status(err.status).end();
    }
  });
});

// Função para atualizar o arquivo JSON com a contagem filtrada
function updateData() {
  // Opções para a primeira requisição à API
  const options1 = {
    method: 'POST',
    url: 'https://ixc.maxfibraltda.com.br/webservice/v1/cliente',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from('2:21052150281fa58932b09dab1ee0afce9577828cfd8839c276005168940a0b33').toString('base64'),
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

  // Opções para a segunda requisição à API
  const options2 = {
    method: 'POST',
    url: 'https://ixc.maxfibraltda.com.br/webservice/v1/cliente_contrato',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'ixcsoft': 'listar'
    },
    form: {
      qtype: 'cliente_contrato.id',
      query: 'CA',
      oper: '>',
      page: '1',
      rp: '1100',
      sortname: 'cliente_contrato.id',
      sortorder: 'asc',
      grid_param: '[{"TB":"cliente_contrato.status", "OP" : "=", "P" : "A"}]'
    },
    auth: {
      user: '2',
      pass: '21052150281fa58932b09dab1ee0afce9577828cfd8839c276005168940a0b33'
    }
  };

  // Requisição para a primeira API
  request(options1, (error1, response1, body1) => {
    if (error1) {
      console.error('Erro na requisição à API de clientes:', error1);
      return;
    }

    let jsonResponse1;
    try {
      jsonResponse1 = JSON.parse(body1);
    } catch (parseError1) {
      console.error('Erro ao parsear a resposta da API de clientes:', parseError1);
      return;
    }

    // Requisição para a segunda API
    request(options2, (error2, response2, body2) => {
      if (error2) {
        console.error('Erro na requisição à API de contratos:', error2);
        return;
      }

      let jsonResponse2;
      try {
        jsonResponse2 = JSON.parse(body2);
      } catch (parseError2) {
        console.error('Erro ao parsear a resposta da API de contratos:', parseError2);
        return;
      }

      // Filtra os dados para a quantidade desejada
      let count = jsonResponse2.registros.filter(record => record.status_internet === 'CA').length;

      // Salva a contagem em um arquivo JSON
      const filePath = path.join(__dirname, 'Data', 'filtered_count.json');
      fs.writeFile(filePath, JSON.stringify({ count }, null, 2), (err) => {
        if (err) {
          console.error('Erro ao salvar o arquivo JSON:', err);
        } else {
          console.log('Arquivo JSON atualizado com sucesso.');
        }
      });
    });
  });
}

// Função para chamar o script analyzeBairros.js
function callAnalyzeBairros() {
  exec('node Data/analyzeBairros.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao executar o script: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

// Atualiza os dados imediatamente ao iniciar o servidor
updateData();

// Chama o script analyzeBairros.js
callAnalyzeBairros();

// Atualiza os dados a cada 1 minuto
setInterval(updateData, 1 * 60 * 1000);  // 1 minuto em milissegundos

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
