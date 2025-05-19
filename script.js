// Elementos do DOM
const btnDashboard = document.getElementById('btnDashboard');
const btnLancamentos = document.getElementById('btnLancamentos');

const lancamentosSection = document.getElementById('lancamentosSection');
const dashboardSection = document.getElementById('dashboardSection');

const formLancamento = document.getElementById('formLancamento');
const inputData = document.getElementById('inputData');
const inputDescricao = document.getElementById('inputDescricao');
const inputCategoria = document.getElementById('inputCategoria');
const inputValor = document.getElementById('inputValor');
const inputTipo = document.getElementById('inputTipo');
const inputPago = document.getElementById('inputPago');
const inputId = document.getElementById('inputId');

const tabelaLancamentosBody = document.querySelector('#tabelaLancamentos tbody');

const filtroMesLista = document.getElementById('filtroMesLista');
const filtroMesDashboard = document.getElementById('filtroMesDashboard');

const totalEntradasEl = document.getElementById('totalEntradas');
const totalSaidasEl = document.getElementById('totalSaidas');
const totalSaldoEl = document.getElementById('totalSaldo');

let lancamentos = [];

// Trocar entre telas
btnDashboard.addEventListener('click', () => {
  lancamentosSection.classList.remove('active');
  dashboardSection.classList.add('active');
  atualizarDashboard();
});

btnLancamentos.addEventListener('click', () => {
  dashboardSection.classList.remove('active');
  lancamentosSection.classList.add('active');
  atualizarTabela();
});

// Salvar no localStorage
function salvarLancamentos() {
  localStorage.setItem('lancamentosFinanceiro', JSON.stringify(lancamentos));
}

// Carregar do localStorage
function carregarLancamentos() {
  const dados = localStorage.getItem('lancamentosFinanceiro');
  if (dados) lancamentos = JSON.parse(dados);
}

// Gerar ID simples
function gerarId() {
  return Date.now().toString();
}

// Atualizar tabela na tela
function atualizarTabela() {
  tabelaLancamentosBody.innerHTML = '';

  let filtroMes = filtroMesLista.value;
  let lancamentosFiltrados = lancamentos;

  if (filtroMes) {
    lancamentosFiltrados = lancamentos.filter(l => l.data.startsWith(filtroMes));
  }

  lancamentosFiltrados.forEach(l => {
    const tr = document.createElement('tr');

tr.innerHTML = `
  <td>${formatarDataBR(l.data)}</td>
  <td>${l.descricao}</td>
  <td>${l.categoria}</td>
  <td>R$ ${Number(l.valor).toFixed(2).replace('.', ',')}</td>
  <td>${l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
  <td>${l.pago === 'sim' ? 'Sim' : 'Não'}</td>
  <td>
    <button class="action-btn" onclick="editarLancamento('${l.id}')">Editar</button>
    <button class="action-btn" onclick="excluirLancamento('${l.id}')">Excluir</button>
  </td>
`;
tabelaLancamentosBody.appendChild(tr);});
}
function editarLancamento(id) {
  const lanc = lancamentos.find(l => l.id === id);
  if (!lanc) return;

  inputId.value = lanc.id;
  inputData.value = lanc.data;
  inputDescricao.value = lanc.descricao;
  inputCategoria.value = lanc.categoria;
  inputValor.value = lanc.valor;
  inputTipo.value = lanc.tipo;
  inputPago.value = lanc.pago;

  btnSalvar.textContent = 'Atualizar';
}

// Excluir lançamento
function excluirLancamento(id) {
  if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

  lancamentos = lancamentos.filter(l => l.id !== id);
  salvarLancamentos();
  atualizarTabela();
  atualizarDashboard();
}

// Cancelar edição
document.getElementById('btnCancelar').addEventListener('click', e => {
  e.preventDefault();
  limparFormulario();
});

// Limpar formulário
function limparFormulario() {
  inputId.value = '';
  formLancamento.reset();
  btnSalvar.textContent = 'Salvar';
}

// Salvar novo lançamento ou atualizar existente
formLancamento.addEventListener('submit', e => {
  e.preventDefault();

  const id = inputId.value;
  const data = inputData.value;
  const descricao = inputDescricao.value.trim();
  const categoria = inputCategoria.value.trim();
  const valor = parseFloat(inputValor.value);
  const tipo = inputTipo.value;
  const pago = inputPago.value;

  if (!data || !descricao || !categoria || isNaN(valor) || !tipo || !pago) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  if (id) {
    // Atualizar
    const index = lancamentos.findIndex(l => l.id === id);
    if (index !== -1) {
      lancamentos[index] = { id, data, descricao, categoria, valor, tipo, pago };
    }
  } else {
    // Novo lançamento
    lancamentos.push({ id: gerarId(), data, descricao, categoria, valor, tipo, pago });
  }

  salvarLancamentos();
  limparFormulario();
  atualizarTabela();
  atualizarDashboard();
});

// Atualizar totais e gráfico
function atualizarDashboard() {
  let filtroMes = filtroMesDashboard.value;
  let lancamentosFiltrados = lancamentos;

  if (filtroMes) {
    lancamentosFiltrados = lancamentos.filter(l => l.data.startsWith(filtroMes));
  }

  let totalEntradas = 0;
  let totalSaidas = 0;

  lancamentosFiltrados.forEach(l => {
    if (l.tipo === 'entrada') totalEntradas += l.valor;
    else totalSaidas += l.valor;
  });

  const saldo = totalEntradas - totalSaidas;

  totalEntradasEl.textContent = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
  totalSaidasEl.textContent = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
  totalSaldoEl.textContent = `R$ ${saldo.toFixed(2).replace('.', ',')}`;

  // Atualiza gráfico
  if (window.grafico) window.grafico.destroy();

  const ctx = document.getElementById('graficoEntradasSaidas').getContext('2d');
  window.grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Entradas', 'Saídas'],
      datasets: [{
        label: 'Valores (R$)',
        data: [totalEntradas, totalSaidas],
        backgroundColor: ['#00509e', '#9f2239'],
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Eventos para filtros de mês
filtroMesLista.addEventListener('change', atualizarTabela);
filtroMesDashboard.addEventListener('change', atualizarDashboard);

// Inicialização
carregarLancamentos();
atualizarTabela();
atualizarDashboard();
lancamentosSection.classList.add('active');
function calcularResumoLancamentos() {
    let totalEntradas = 0;
    let totalSaidas = 0;

    const linhas = document.querySelectorAll("#tabela-lancamentos tbody tr");

    linhas.forEach(linha => {
        const tipo = linha.querySelector("td:nth-child(2)").textContent.trim().toLowerCase();
        const valorTexto = linha.querySelector("td:nth-child(3)").textContent.trim();
        const valor = parseFloat(valorTexto.replace("R$", "").replace(".", "").replace(",", "."));

        if (!isNaN(valor)) {
            if (tipo === "entrada") {
                totalEntradas += valor;
            } else if (tipo === "saída" || tipo === "saida") {
                totalSaidas += valor;
            }
        }
    });

    const saldo = totalEntradas - totalSaidas;

    // Atualizar o painel de resumo
    document.getElementById("resumo-entradas").textContent = 
        "R$ " + totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById("resumo-saidas").textContent = 
        "R$ " + totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById("resumo-saldo").textContent = 
        "R$ " + saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

// Executa ao carregar
window.addEventListener("load", calcularResumoLancamentos);

function enviarAlertaWhatsapp(nome, valor, descricao) {
  const numero = '5511999999999'; // Substitua pelo número de destino
  const mensagem = `Olá, ${nome}! Lembrete: você tem uma conta pendente de R$ ${valor} referente a "${descricao}". Por favor, verifique seu controle financeiro.`;
  const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(link, '_blank');
}
function formatarDataBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
