document.addEventListener('DOMContentLoaded', () => {
  // Fazendo a requisição para obter os dados dos clientes
  fetch('/dados')
    .then(response => response.json())
    .then(data => {
      const clientesDiv = document.getElementById('clientes-ativos');

      // Acessando o campo correto do JSON
      const totalClientes = data.total; // Supondo que o total está no campo "total"
      
      clientesDiv.innerHTML = `Clientes ativos: ${totalClientes !== undefined ? totalClientes : 'Nenhum cliente encontrado'}`;
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
});
