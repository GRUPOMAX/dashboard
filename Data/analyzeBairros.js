const fs = require('fs');
const path = require('path');

// Caminho do arquivo JSON salvo
const filePath = path.join(__dirname, 'clientesAtivos.json'); // Corrigido para o caminho correto do arquivo

// Função para contar e salvar os bairros
function analyzeBairros() {
  // Ler o arquivo JSON
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('Erro ao parsear o arquivo JSON:', parseError);
      return;
    }

    // Verifica a estrutura do JSON
    if (jsonData.registros && Array.isArray(jsonData.registros)) {
      const bairroCount = {};

      // Contar a quantidade de cada bairro
      jsonData.registros.forEach(item => {
        const bairro = item.bairro;
        if (bairro) {
          bairroCount[bairro] = (bairroCount[bairro] || 0) + 1;
        }
      });

      // Preparar dados para o gráfico
      const bairrosData = Object.entries(bairroCount).map(([bairro, count]) => ({
        bairro,
        count
      }));

      // Salvar os dados contados em um arquivo JSON
      const resultFilePath = path.join(__dirname, '..', 'public', 'bairros_count.json');
      fs.writeFile(resultFilePath, JSON.stringify(bairrosData, null, 2), (err) => {
        if (err) {
          console.error('Erro ao salvar o arquivo JSON de contagem de bairros:', err);
        } else {
          console.log('Arquivo JSON com contagem de bairros salvo com sucesso em:', resultFilePath);
        }
      });
    } else {
      console.error('O JSON não contém um array de registros. Verifique a estrutura dos dados.');
    }
  });
}

analyzeBairros();
