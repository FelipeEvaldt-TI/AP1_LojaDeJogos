/**
 * Catálogo de Jogos - Script da Interface de Demonstração
 * 
 * ATENÇÃO: Este script utiliza exclusivamente dados fictícios locais (em memória).
 * NÃO realiza nenhuma requisição HTTP (fetch/XMLHttpRequest) ou conexão com o backend.
 */

(function () {
  'use strict';

  // Dados iniciais fictícios baseados no catálogo da AP1
  const DADOS_PADRAO = [
    { id: 1, titulo: "Hollow Knight", disponivel: true },
    { id: 2, titulo: "Grand Theft Auto 6", disponivel: false },
    { id: 3, titulo: "Celeste", disponivel: true }
  ];

  // Estado da aplicação (em memória)
  let catalogoJogos = [...DADOS_PADRAO];
  let idEmEdicao = null;
  let timerAlerta = null;

  // Elementos do DOM
  const form = document.getElementById('jogo-form');
  const inputId = document.getElementById('jogo-id');
  const inputTitulo = document.getElementById('jogo-titulo');
  const checkDisponivel = document.getElementById('jogo-disponivel');
  const btnSalvar = document.getElementById('btn-salvar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnLimpar = document.getElementById('btn-limpar');
  const btnRestaurar = document.getElementById('btn-restaurar-dados');

  const formHeading = document.getElementById('form-heading');
  const formModeBadge = document.getElementById('form-mode-badge');
  const feedbackAlert = document.getElementById('feedback-alert');

  const containerLista = document.getElementById('lista-jogos');
  const emptyState = document.getElementById('empty-state');

  const statTotal = document.getElementById('stat-total');
  const statDisponiveis = document.getElementById('stat-disponiveis');
  const statIndisponiveis = document.getElementById('stat-indisponiveis');

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoArmazenamento();
    renderizarJogos();
    atualizarEstatisticas();
    configurarEventos();
  });

  /**
   * Configuração de ouvintes de eventos da interface
   */
  function configurarEventos() {
    form.addEventListener('submit', tratarSubmissaoFormulario);
    btnCancelar.addEventListener('click', cancelarEdicao);
    btnLimpar.addEventListener('click', limparFormulario);
    btnRestaurar.addEventListener('click', restaurarDadosPadrao);
  }

  /**
   * Tenta carregar dados do sessionStorage ou usa os dados padrão
   */
  function carregarDadosDoArmazenamento() {
    try {
      const salvos = sessionStorage.getItem('loja_jogos_demo_data');
      if (salvos) {
        catalogoJogos = JSON.parse(salvos);
        return;
      }
    } catch (e) {
      console.warn('Não foi possível ler do sessionStorage. Usando dados locais em memória.', e);
    }
    catalogoJogos = JSON.parse(JSON.stringify(DADOS_PADRAO));
  }

  /**
   * Salva estado na sessão (para manter durante a navegação/recarga)
   */
  function persistirDados() {
    try {
      sessionStorage.setItem('loja_jogos_demo_data', JSON.stringify(catalogoJogos));
    } catch (e) {
      console.warn('Não foi possível salvar no sessionStorage.', e);
    }
  }

  /**
   * Renderiza a lista de jogos na tela
   */
  function renderizarJogos() {
    containerLista.innerHTML = '';

    if (catalogoJogos.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    catalogoJogos.forEach((jogo) => {
      const card = document.createElement('article');
      card.className = `jogo-card ${idEmEdicao === jogo.id ? 'selected-for-edit' : ''}`;
      card.setAttribute('role', 'listitem');
      card.setAttribute('id', `jogo-card-${jogo.id}`);

      const infoDiv = document.createElement('div');
      infoDiv.className = 'jogo-info';

      const idTag = document.createElement('span');
      idTag.className = 'jogo-id-tag';
      idTag.textContent = `ID #${jogo.id}`;

      const titulo = document.createElement('h3');
      titulo.className = 'jogo-titulo';
      titulo.textContent = jogo.titulo;

      const badgeStatus = document.createElement('span');
      badgeStatus.className = `status-badge ${jogo.disponivel ? 'disponivel' : 'indisponivel'}`;
      badgeStatus.innerHTML = jogo.disponivel 
        ? '<span aria-hidden="true">●</span> Disponível' 
        : '<span aria-hidden="true">○</span> Indisponível';

      infoDiv.appendChild(idTag);
      infoDiv.appendChild(titulo);
      infoDiv.appendChild(badgeStatus);

      // Ações
      const acoesDiv = document.createElement('div');
      acoesDiv.className = 'jogo-acoes';

      // Botão Editar / Visualizar
      const btnEditar = document.createElement('button');
      btnEditar.type = 'button';
      btnEditar.className = 'btn btn-sm btn-outline';
      btnEditar.innerHTML = '<span aria-hidden="true">✏️</span> Editar';
      btnEditar.setAttribute('aria-label', `Editar jogo ${jogo.titulo} (ID ${jogo.id})`);
      btnEditar.addEventListener('click', () => carregarParaEdicao(jogo.id));

      // Botão Excluir
      const btnExcluir = document.createElement('button');
      btnExcluir.type = 'button';
      btnExcluir.className = 'btn btn-sm btn-danger';
      btnExcluir.innerHTML = '<span aria-hidden="true">🗑️</span> Excluir';
      btnExcluir.setAttribute('aria-label', `Excluir jogo ${jogo.titulo} (ID ${jogo.id})`);
      btnExcluir.addEventListener('click', () => excluirJogo(jogo.id, jogo.titulo));

      acoesDiv.appendChild(btnEditar);
      acoesDiv.appendChild(btnExcluir);

      card.appendChild(infoDiv);
      card.appendChild(acoesDiv);

      containerLista.appendChild(card);
    });
  }

  /**
   * Atualiza os contadores no painel de estatísticas
   */
  function atualizarEstatisticas() {
    const total = catalogoJogos.length;
    const disponiveis = catalogoJogos.filter(j => j.disponivel).length;
    const indisponiveis = total - disponiveis;

    statTotal.textContent = total;
    statDisponiveis.textContent = disponiveis;
    statIndisponiveis.textContent = indisponiveis;
  }

  /**
   * Trata o envio do formulário (Criação ou Atualização)
   */
  function tratarSubmissaoFormulario(evento) {
    evento.preventDefault();

    const titulo = inputTitulo.value.trim();
    const disponivel = checkDisponivel.checked;

    if (!titulo) {
      exibirAlerta('O título do jogo é obrigatório. Por favor, preencha o campo.', 'danger');
      inputTitulo.focus();
      return;
    }

    if (idEmEdicao !== null) {
      // Atualização
      const index = catalogoJogos.findIndex(j => j.id === idEmEdicao);
      if (index !== -1) {
        catalogoJogos[index] = {
          id: idEmEdicao,
          titulo: titulo,
          disponivel: disponivel
        };
        exibirAlerta(`Jogo "${titulo}" atualizado com sucesso no catálogo local!`, 'success');
      } else {
        exibirAlerta('Erro: Jogo não encontrado para atualização.', 'danger');
      }
      cancelarEdicao();
    } else {
      // Adição (Novo registro)
      const novoId = catalogoJogos.length > 0 
        ? Math.max(...catalogoJogos.map(j => j.id)) + 1 
        : 1;

      const novoJogo = {
        id: novoId,
        titulo: titulo,
        disponivel: disponivel
      };

      catalogoJogos.push(novoJogo);
      limparFormulario();
      exibirAlerta(`Jogo "${novoJogo.titulo}" (ID #${novoJogo.id}) adicionado com sucesso!`, 'success');
    }

    persistirDados();
    renderizarJogos();
    atualizarEstatisticas();
  }

  /**
   * Carrega os dados de um jogo selecionado no formulário para visualização/edição
   */
  function carregarParaEdicao(id) {
    const jogo = catalogoJogos.find(j => j.id === id);
    if (!jogo) {
      exibirAlerta('Jogo não encontrado.', 'danger');
      return;
    }

    idEmEdicao = jogo.id;
    inputId.value = jogo.id;
    inputTitulo.value = jogo.titulo;
    checkDisponivel.checked = jogo.disponivel;

    formHeading.textContent = `Editar Jogo #${jogo.id}`;
    formModeBadge.textContent = 'Modo Edição';
    formModeBadge.classList.add('editing');

    btnSalvar.innerHTML = '<span aria-hidden="true">💾</span> Salvar Alterações';
    btnCancelar.classList.remove('hidden');

    renderizarJogos();
    inputTitulo.focus();
    inputTitulo.select();

    exibirAlerta(`Visualizando detalhes do jogo #${jogo.id} no formulário para edição.`, 'info');
  }

  /**
   * Cancela a edição e retorna o formulário ao modo de adição
   */
  function cancelarEdicao() {
    idEmEdicao = null;
    limparFormulario();

    formHeading.textContent = 'Adicionar Jogo';
    formModeBadge.textContent = 'Novo Registro';
    formModeBadge.classList.remove('editing');

    btnSalvar.innerHTML = '<span aria-hidden="true">➕</span> Adicionar Jogo';
    btnCancelar.classList.add('hidden');

    renderizarJogos();
  }

  /**
   * Limpa os campos do formulário
   */
  function limparFormulario() {
    inputId.value = '';
    inputTitulo.value = '';
    checkDisponivel.checked = true;
    if (idEmEdicao !== null) {
      cancelarEdicao();
    }
  }

  /**
   * Exclui um jogo do catálogo local
   */
  function excluirJogo(id, titulo) {
    const confirmacao = window.confirm(`Deseja realmente remover o jogo "${titulo}" (ID #${id}) da lista de demonstração?`);
    if (!confirmacao) {
      return;
    }

    if (idEmEdicao === id) {
      cancelarEdicao();
    }

    catalogoJogos = catalogoJogos.filter(j => j.id !== id);
    persistirDados();
    renderizarJogos();
    atualizarEstatisticas();

    exibirAlerta(`Jogo "${titulo}" (ID #${id}) foi removido do catálogo local.`, 'success');
  }

  /**
   * Restaura os jogos padrão da demonstração
   */
  function restaurarDadosPadrao() {
    if (window.confirm('Deseja restaurar os dados iniciais de demonstração? Quaisquer alterações feitas localmente serão substituídas.')) {
      catalogoJogos = JSON.parse(JSON.stringify(DADOS_PADRAO));
      cancelarEdicao();
      persistirDados();
      renderizarJogos();
      atualizarEstatisticas();
      exibirAlerta('Dados de demonstração restaurados com sucesso!', 'info');
    }
  }

  /**
   * Exibe mensagens de alerta com temporizador para fechamento automático
   */
  function exibirAlerta(mensagem, tipo = 'info') {
    if (timerAlerta) {
      clearTimeout(timerAlerta);
    }

    feedbackAlert.className = `alert-box alert-${tipo}`;
    const icones = {
      success: '✅',
      danger: '⚠️',
      info: 'ℹ️'
    };

    feedbackAlert.innerHTML = `<span aria-hidden="true">${icones[tipo] || 'ℹ️'}</span> <span>${mensagem}</span>`;
    feedbackAlert.classList.remove('hidden');

    // Remove alerta após 4 segundos
    timerAlerta = setTimeout(() => {
      feedbackAlert.classList.add('hidden');
    }, 4500);
  }

})();
