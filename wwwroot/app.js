/**
 * Catálogo de Jogos - Script Frontend Integrado com API REST
 * 
 * Endpoints consumidos:
 * - GET    /api/jogos         -> Listar jogos
 * - GET    /api/jogos/{id}    -> Obter jogo por ID
 * - POST   /api/jogos         -> Cadastrar novo jogo
 * - PUT    /api/jogos/{id}    -> Atualizar jogo existente
 * - DELETE /api/jogos/{id}    -> Remover jogo
 */

(function () {
  'use strict';

  // Configuração da URL da API (usa mesma origem se na porta 5214, ou aponta explicitamente para http://localhost:5214)
  const API_BASE_URL = window.location.origin === 'http://localhost:5214'
    ? '/api/jogos'
    : 'http://localhost:5214/api/jogos';

  // Estado da aplicação
  let catalogoJogos = [];
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
  const btnRecarregar = document.getElementById('btn-recarregar');

  const formHeading = document.getElementById('form-heading');
  const formModeBadge = document.getElementById('form-mode-badge');
  const feedbackAlert = document.getElementById('feedback-alert');

  const containerLista = document.getElementById('lista-jogos');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');

  const statTotal = document.getElementById('stat-total');
  const statDisponiveis = document.getElementById('stat-disponiveis');
  const statIndisponiveis = document.getElementById('stat-indisponiveis');

  // Inicialização ao carregar a página
  document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    carregarJogos();
  });

  /**
   * Configura os ouvintes de eventos da interface
   */
  function configurarEventos() {
    form.addEventListener('submit', tratarSubmissaoFormulario);
    btnCancelar.addEventListener('click', cancelarEdicao);
    btnLimpar.addEventListener('click', limparFormulario);
    if (btnRecarregar) {
      btnRecarregar.addEventListener('click', () => {
        carregarJogos();
        exibirAlerta('Atualizando lista de jogos...', 'info');
      });
    }
  }

  /**
   * Controla a visibilidade do indicador de carregamento
   */
  function alternarCarregamento(ativo) {
    if (ativo) {
      loadingState.classList.remove('hidden');
      emptyState.classList.add('hidden');
      containerLista.classList.add('hidden');
    } else {
      loadingState.classList.add('hidden');
      containerLista.classList.remove('hidden');
    }
  }

  /**
   * Obtém a lista de jogos da API (GET /api/jogos)
   */
  async function carregarJogos() {
    alternarCarregamento(true);

    try {
      const resposta = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao obter jogos (HTTP ${resposta.status}: ${resposta.statusText || 'Erro no servidor'})`);
      }

      const dados = await resposta.json();
      catalogoJogos = Array.isArray(dados) ? dados : (dados.value || []);

      renderizarJogos();
      atualizarEstatisticas();
    } catch (erro) {
      console.error('Erro na requisição GET /api/jogos:', erro);
      catalogoJogos = [];
      renderizarJogos();
      atualizarEstatisticas();
      exibirAlerta(`Não foi possível carregar os jogos da API: ${erro.message}`, 'danger');
    } finally {
      alternarCarregamento(false);
    }
  }

  /**
   * Renderiza a lista de jogos na tela inserindo valores estritamente via textContent
   */
  function renderizarJogos() {
    containerLista.innerHTML = '';

    if (!catalogoJogos || catalogoJogos.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    catalogoJogos.forEach((jogo) => {
      const id = jogo.id;
      const titulo = jogo.nome || jogo.titulo || '(Sem título)';
      const disponivel = Boolean(jogo.disponivel);

      const card = document.createElement('article');
      card.className = `jogo-card ${idEmEdicao === id ? 'selected-for-edit' : ''}`;
      card.setAttribute('role', 'listitem');
      card.setAttribute('id', `jogo-card-${id}`);

      // Informações do jogo
      const infoDiv = document.createElement('div');
      infoDiv.className = 'jogo-info';

      const idTag = document.createElement('span');
      idTag.className = 'jogo-id-tag';
      idTag.textContent = `ID #${id}`;

      const tituloEl = document.createElement('h3');
      tituloEl.className = 'jogo-titulo';
      tituloEl.textContent = titulo;

      const badgeStatus = document.createElement('span');
      badgeStatus.className = `status-badge ${disponivel ? 'disponivel' : 'indisponivel'}`;

      const iconStatus = document.createElement('span');
      iconStatus.setAttribute('aria-hidden', 'true');
      iconStatus.textContent = disponivel ? '● ' : '○ ';

      const labelStatus = document.createElement('span');
      labelStatus.textContent = disponivel ? 'Disponível' : 'Indisponível';

      badgeStatus.appendChild(iconStatus);
      badgeStatus.appendChild(labelStatus);

      infoDiv.appendChild(idTag);
      infoDiv.appendChild(tituloEl);
      infoDiv.appendChild(badgeStatus);

      // Botões de ação
      const acoesDiv = document.createElement('div');
      acoesDiv.className = 'jogo-acoes';

      // Botão Editar
      const btnEditar = document.createElement('button');
      btnEditar.type = 'button';
      btnEditar.className = 'btn btn-sm btn-outline';
      btnEditar.textContent = '✏️ Editar';
      btnEditar.setAttribute('aria-label', `Editar jogo ${titulo} (ID ${id})`);
      btnEditar.addEventListener('click', () => carregarParaEdicao(jogo));

      // Botão Excluir
      const btnExcluir = document.createElement('button');
      btnExcluir.type = 'button';
      btnExcluir.className = 'btn btn-sm btn-danger';
      btnExcluir.textContent = '🗑️ Excluir';
      btnExcluir.setAttribute('aria-label', `Excluir jogo ${titulo} (ID ${id})`);
      btnExcluir.addEventListener('click', () => excluirJogo(id, titulo));

      acoesDiv.appendChild(btnEditar);
      acoesDiv.appendChild(btnExcluir);

      card.appendChild(infoDiv);
      card.appendChild(acoesDiv);

      containerLista.appendChild(card);
    });
  }

  /**
   * Atualiza os contadores numéricos de estatísticas
   */
  function atualizarEstatisticas() {
    const total = catalogoJogos.length;
    const disponiveis = catalogoJogos.filter(j => j.disponivel).length;
    const indisponiveis = total - disponiveis;

    statTotal.textContent = String(total);
    statDisponiveis.textContent = String(disponiveis);
    statIndisponiveis.textContent = String(indisponiveis);
  }

  /**
   * Trata a submissão do formulário (Criação ou Edição)
   */
  async function tratarSubmissaoFormulario(evento) {
    evento.preventDefault();

    const titulo = inputTitulo.value.trim();
    const disponivel = checkDisponivel.checked;

    if (!titulo) {
      exibirAlerta('O título do jogo é obrigatório. Por favor, preencha o campo.', 'danger');
      inputTitulo.focus();
      return;
    }

    if (idEmEdicao !== null) {
      await atualizarJogo(idEmEdicao, titulo, disponivel);
    } else {
      await criarJogo(titulo, disponivel);
    }
  }

  /**
   * Cria um novo jogo via POST /api/jogos
   */
  async function criarJogo(titulo, disponivel) {
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Gravando...';

    // Envia propriedades compatíveis tanto com a collection Bruno ("titulo") quanto com a entidade backend ("nome")
    const payload = {
      nome: titulo,
      titulo: titulo,
      disponivel: disponivel
    };

    try {
      const resposta = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}: ${resposta.statusText || 'Erro ao criar'}`);
      }

      const criado = await resposta.json();
      const novoId = criado.id ? `#${criado.id}` : '';

      limparFormulario();
      exibirAlerta(`Jogo "${titulo}" ${novoId} cadastrado com sucesso!`, 'success');
      await carregarJogos();
    } catch (erro) {
      console.error('Erro no POST /api/jogos:', erro);
      exibirAlerta(`Erro ao cadastrar jogo na API: ${erro.message}`, 'danger');
    } finally {
      btnSalvar.disabled = false;
      btnSalvar.textContent = '➕ Adicionar Jogo';
    }
  }

  /**
   * Atualiza um jogo existente via PUT /api/jogos/{id}
   */
  async function atualizarJogo(id, titulo, disponivel) {
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Atualizando...';

    const payload = {
      id: id,
      nome: titulo,
      titulo: titulo,
      disponivel: disponivel
    };

    try {
      const resposta = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}: ${resposta.statusText || 'Erro ao atualizar'}`);
      }

      cancelarEdicao();
      exibirAlerta(`Jogo "${titulo}" (ID #${id}) atualizado com sucesso!`, 'success');
      await carregarJogos();
    } catch (erro) {
      console.error(`Erro no PUT /api/jogos/${id}:`, erro);
      exibirAlerta(`Erro ao atualizar o jogo na API: ${erro.message}`, 'danger');
    } finally {
      btnSalvar.disabled = false;
      if (idEmEdicao !== null) {
        btnSalvar.textContent = '💾 Salvar Alterações';
      } else {
        btnSalvar.textContent = '➕ Adicionar Jogo';
      }
    }
  }

  /**
   * Remove um jogo via DELETE /api/jogos/{id}
   */
  async function excluirJogo(id, titulo) {
    const confirmou = window.confirm(`Deseja realmente remover o jogo "${titulo}" (ID #${id}) do catálogo?`);
    if (!confirmou) {
      return;
    }

    try {
      const resposta = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}: ${resposta.statusText || 'Erro ao remover'}`);
      }

      if (idEmEdicao === id) {
        cancelarEdicao();
      }

      exibirAlerta(`Jogo "${titulo}" (ID #${id}) removido com sucesso!`, 'success');
      await carregarJogos();
    } catch (erro) {
      console.error(`Erro no DELETE /api/jogos/${id}:`, erro);
      exibirAlerta(`Erro ao remover o jogo da API: ${erro.message}`, 'danger');
    }
  }

  /**
   * Preenche o formulário para edição com os dados do jogo selecionado
   */
  function carregarParaEdicao(jogo) {
    const id = jogo.id;
    const titulo = jogo.nome || jogo.titulo || '';
    const disponivel = Boolean(jogo.disponivel);

    idEmEdicao = id;
    inputId.value = String(id);
    inputTitulo.value = titulo;
    checkDisponivel.checked = disponivel;

    formHeading.textContent = `Editar Jogo #${id}`;
    formModeBadge.textContent = 'Modo Edição';
    formModeBadge.classList.add('editing');

    btnSalvar.textContent = '💾 Salvar Alterações';
    btnCancelar.classList.remove('hidden');

    renderizarJogos();
    inputTitulo.focus();
    inputTitulo.select();

    exibirAlerta(`Editando jogo #${id}. Altere os campos e clique em Salvar Alterações.`, 'info');
  }

  /**
   * Cancela o modo de edição e retorna o formulário ao estado inicial
   */
  function cancelarEdicao() {
    idEmEdicao = null;
    limparFormulario();

    formHeading.textContent = 'Adicionar Jogo';
    formModeBadge.textContent = 'Novo Registro';
    formModeBadge.classList.remove('editing');

    btnSalvar.textContent = '➕ Adicionar Jogo';
    btnCancelar.classList.add('hidden');

    renderizarJogos();
  }

  /**
   * Limpa os valores dos campos do formulário
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
   * Exibe mensagens de alerta com temporizador para auto-fechamento.
   * Insere o texto com segurança via textContent.
   */
  function exibirAlerta(mensagem, tipo = 'info') {
    if (timerAlerta) {
      clearTimeout(timerAlerta);
    }

    feedbackAlert.className = `alert-box alert-${tipo}`;
    feedbackAlert.innerHTML = '';

    const icones = {
      success: '✅',
      danger: '⚠️',
      info: 'ℹ️'
    };

    const spanIcone = document.createElement('span');
    spanIcone.setAttribute('aria-hidden', 'true');
    spanIcone.textContent = icones[tipo] || 'ℹ️';

    const spanTexto = document.createElement('span');
    spanTexto.textContent = ` ${mensagem}`;

    feedbackAlert.appendChild(spanIcone);
    feedbackAlert.appendChild(spanTexto);
    feedbackAlert.classList.remove('hidden');

    timerAlerta = setTimeout(() => {
      feedbackAlert.classList.add('hidden');
    }, 4500);
  }

})();
