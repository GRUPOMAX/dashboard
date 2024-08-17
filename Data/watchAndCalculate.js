const fs = require('fs');
const path = require('path');

// Atualize o caminho para a pasta 'Data'
const filePath = path.join(__dirname, 'clientesAtivos.json');
const resultFilePath = path.join(__dirname, 'resultado.json');

// Função para garantir que o diretório exista
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Função para realizar o cálculo
function calcularTotal() {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return;
    }

    try {
      const clientesData = JSON.parse(data);

      if (clientesData.total !== undefined) {
        const total = clientesData.total;
        const resultado = total - 514;

        fs.writeFile(resultFilePath, JSON.stringify({ resultado }), (err) => {
          if (err) {
            console.error('Erro ao salvar o arquivo JSON de resultado:', err);
          } else {
            console.log('Arquivo de resultado salvo com sucesso em:', resultFilePath);
          }
        });
      } else {
        console.log('O campo "total" não foi encontrado no arquivo JSON.');
      }
    } catch (parseError) {
      console.error('Erro ao analisar o conteúdo do JSON:', parseError);
    }
  });
}

// Monitorando o arquivo para alterações
fs.watchFile(filePath, (curr, prev) => {
  console.log('Arquivo modificado, recalculando...');
  calcularTotal();
});

// Chama o cálculo na primeira execução
ensureDirectoryExistence(resultFilePath);
calcularTotal();
