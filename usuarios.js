/* ==========================================================================
   USUARIOS.JS — Darkone Admin · Listagem de Usuários
   JavaScript puro (ES6) consumindo API REST via fetch().
   ========================================================================== */

'use strict';

/* ---------- 1. Configuração ---------- */
const API_BASE_URL = 'http://localhost:8000/api/v1/';
const USUARIOS_ENDPOINT = `${API_BASE_URL}usuarios/`;
//const __TOKEN__ = '';

/* ---------- 2. Estado da aplicação ---------- */
const state = {
  usuarios: [],       // usuários da página atual, vindos da API (sem alteração)
  filtered: [],        // usuários após busca + filtros (o que é renderizado)
  count: 0,             // total geral retornado pela API (count)
  next: null,            // URL da próxima página
  previous: null,         // URL da página anterior
  isLoading: false,
  hasError: false,
  searchTerm: '',
  tipoFiltro: 'todos',
  statusFiltro: 'todos',
};

/* ---------- 3. Referências de elementos ---------- */
const els = {
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  sidebarUserCount: document.getElementById('sidebarUserCount'),

  btnRefresh: document.getElementById('btnRefresh'),
  btnRetry: document.getElementById('btnRetry'),
  btnNovoUsuario: document.getElementById('btnNovoUsuario'),

  statTotal: document.getElementById('statTotal'),
  statAlunos: document.getElementById('statAlunos'),
  statFuncionarios: document.getElementById('statFuncionarios'),
  statConvidados: document.getElementById('statConvidados'),

  searchInput: document.getElementById('searchInput'),
  filterTipo: document.getElementById('filterTipo'),
  filterStatus: document.getElementById('filterStatus'),

  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  emptyState: document.getElementById('emptyState'),
  tableWrap: document.getElementById('tableWrap'),
  tableBody: document.getElementById('tableBody'),
  tableFooter: document.getElementById('tableFooter'),
  resultsCount: document.getElementById('resultsCount'),

  pagPrev: document.getElementById('pagPrev'),
  pagNext: document.getElementById('pagNext'),

  toastContainer: document.getElementById('toastContainer'),
};

const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));

/* ---------- 4. Utilitários ---------- */

/**
 * Formata uma data ISO (YYYY-MM-DDTHH:mm:ss) para o padrão dd/mm/aaaa.
 * @param {string} isoDate
 * @returns {string}
 */
const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Extrai as iniciais de um nome completo (ex: "Norberto Reprovado" -> "NR").
 * @param {string} nomeCompleto
 * @returns {string}
 */
const getInitials = (nomeCompleto) => {
  if (!nomeCompleto) return '?';
  const partes = nomeCompleto.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return `${primeira}${ultima}`.toUpperCase();
};

/**
 * Gera uma cor HSL determinística a partir de uma string (nome do usuário),
 * garantindo que o mesmo nome sempre produza a mesma cor de avatar.
 * @param {string} texto
 * @returns {string} cor no formato hsl()
 */
const stringToColor = (texto) => {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 62%, 46%)`;
};

/**
 * Monta o HTML do avatar de iniciais com cor consistente baseada no nome.
 * @param {string} nomeCompleto
 * @returns {string} HTML do avatar
 */
const getAvatar = (nomeCompleto) => {
  const iniciais = getInitials(nomeCompleto);
  const cor = stringToColor(nomeCompleto || '?');
  return `<span class="avatar-initials" style="background:${cor}">${iniciais}</span>`;
};

/**
 * Retorna o HTML do badge de tipo de usuário (Aluno / Funcionário / Convidado).
 * @param {string} tipo
 * @param {string} tipoDisplay
 * @returns {string}
 */
const getTipoBadge = (tipo, tipoDisplay) => {
  const mapa = {
    aluno: 'badge-aluno',
    funcionario: 'badge-funcionario',
    convidado: 'badge-convidado',
  };
  const classe = mapa[tipo] || 'badge-convidado';
  return `<span class="badge-pill ${classe}">${tipoDisplay || tipo || '—'}</span>`;
};

/**
 * Retorna o HTML do badge de status (Ativo / Inativo).
 * @param {boolean} ehAtivo
 * @returns {string}
 */
const getStatusBadge = (ehAtivo) => {
  return ehAtivo
    ? '<span class="badge-pill badge-ativo">Ativo</span>'
    : '<span class="badge-pill badge-inativo">Inativo</span>';
};

/**
 * Escapa caracteres HTML para evitar injeção ao interpolar dados da API.
 * @param {string} valor
 * @returns {string}
 */
const escapeHtml = (valor) => {
  if (valor === null || valor === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(valor);
  return div.innerHTML;
};

/**
 * Exibe uma notificação toast utilizando os componentes do Bootstrap 5.
 * @param {'success'|'error'|'info'} tipo
 * @param {string} titulo
 * @param {string} mensagem
 */
const showToast = (tipo, titulo, mensagem) => {
  const icones = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info',
  };

  const toastEl = document.createElement('div');
  toastEl.className = `toast app-toast toast-${tipo}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="toast-header-custom">
      <span class="toast-icon"><i class="fa-solid ${icones[tipo]}"></i></span>
      <div>
        <strong>${escapeHtml(titulo)}</strong>
        <span>${escapeHtml(mensagem)}</span>
      </div>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  `;

  els.toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

/* ---------- 5. Renderização de estados (loading / erro / vazio) ---------- */

/**
 * Alterna a exibição entre os estados: loading, erro, vazio e tabela.
 * @param {'loading'|'error'|'empty'|'table'} estado
 */
const setViewState = (estado) => {
  els.loadingState.hidden = estado !== 'loading';
  els.errorState.hidden = estado !== 'error';
  els.emptyState.hidden = estado !== 'empty';
  els.tableWrap.hidden = estado !== 'table';
  els.tableFooter.hidden = estado !== 'table';
};

/**
 * Constrói e exibe o Skeleton Loading enquanto a API responde.
 * Não utiliza spinner, apenas placeholders animados que imitam a tabela.
 */
const renderLoading = () => {
  state.isLoading = true;
  state.hasError = false;
  setViewState('loading');

  const linhas = Array.from({ length: 6 }, () => `
    <div class="skeleton-row">
      <div class="sk sk-circle"></div>
      <div class="sk" style="width:80%"></div>
      <div class="sk" style="width:70%"></div>
      <div class="sk" style="width:60%"></div>
      <div class="sk" style="width:65%"></div>
      <div class="sk" style="width:75%"></div>
      <div class="sk" style="width:55%"></div>
      <div class="sk" style="width:50%"></div>
      <div class="sk" style="width:50%"></div>
      <div class="sk" style="width:60%"></div>
      <div class="sk" style="width:70%"></div>
    </div>
  `).join('');

  els.loadingState.innerHTML = linhas;

  // Placeholders animados nos cards enquanto os números carregam
  [els.statTotal, els.statAlunos, els.statFuncionarios, els.statConvidados].forEach((el) => {
    el.textContent = '';
    el.classList.add('is-skeleton');
  });
};

/**
 * Exibe o card de erro centralizado quando a API está indisponível.
 */
const renderError = () => {
  state.isLoading = false;
  state.hasError = true;
  setViewState('error');

  [els.statTotal, els.statAlunos, els.statFuncionarios, els.statConvidados].forEach((el) => {
    el.classList.remove('is-skeleton');
    el.textContent = '–';
  });
};

/* ---------- 6. Cards de resumo ---------- */

/**
 * Calcula e renderiza os quatro cards de resumo com base nos usuários
 * atualmente carregados (page atual da API) e no total geral (count).
 */
const renderCards = () => {
  const alunos = state.usuarios.filter((u) => u.tipo_usuario === 'aluno').length;
  const funcionarios = state.usuarios.filter((u) => u.tipo_usuario === 'funcionario').length;
  const convidados = state.usuarios.filter((u) => u.tipo_usuario === 'convidado').length;

  [els.statTotal, els.statAlunos, els.statFuncionarios, els.statConvidados].forEach((el) => {
    el.classList.remove('is-skeleton');
  });

  els.statTotal.textContent = state.count;
  els.statAlunos.textContent = alunos;
  els.statFuncionarios.textContent = funcionarios;
  els.statConvidados.textContent = convidados;

  els.sidebarUserCount.textContent = state.count;
};

/* ---------- 7. Tabela ---------- */

/**
 * Constrói o HTML de uma linha da tabela para um usuário.
 * @param {object} usuario
 * @returns {string}
 */
const buildRow = (usuario) => {
  const endereco = usuario.enderecos_info && usuario.enderecos_info.length > 0
    ? usuario.enderecos_info[0]
    : null;

  const cidade = endereco?.cidade || '—';
  const uf = endereco?.estado || '—';
  const telefone = usuario.telefone || '—';
  const email = usuario.email || '—';

  return `
    <tr>
      <td>${getAvatar(usuario.nome_completo)}</td>
      <td>
        <div class="cell-user">
          <div>
            <strong>${escapeHtml(usuario.nome_completo)}</strong>
            <small>#${escapeHtml(usuario.id)}</small>
          </div>
        </div>
      </td>
      <td class="mono">${escapeHtml(usuario.documento) || '—'}</td>
      <td>${getTipoBadge(usuario.tipo_usuario, usuario.tipo_usuario_display)}</td>
      <td>${escapeHtml(telefone)}</td>
      <td>${escapeHtml(email)}</td>
      <td>${escapeHtml(cidade)}</td>
      <td>${escapeHtml(uf)}</td>
      <td>${getStatusBadge(usuario.eh_ativo)}</td>
      <td>${formatDate(usuario.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view" title="Visualizar" data-bs-toggle="tooltip" aria-label="Visualizar usuário">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="action-btn edit" id="btnEditarUsuario" onClick="openModal(${usuario.id})" title="Editar" data-bs-toggle="tooltip" aria-label="Editar usuário">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn delete" title="Excluir" data-bs-toggle="tooltip" aria-label="Excluir usuário">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
};

/**
 * Renderiza a tabela com a lista atualmente filtrada (state.filtered).
 * Exibe o estado vazio caso não haja resultados após os filtros.
 */
const renderTable = () => {
  if (state.filtered.length === 0) {
    setViewState('empty');
    els.resultsCount.textContent = '';
    return;
  }

  setViewState('table');
  els.tableBody.innerHTML = state.filtered.map(buildRow).join('');

  els.resultsCount.innerHTML =
    `Exibindo <strong>${state.filtered.length}</strong> de <strong>${state.usuarios.length}</strong> usuários desta página · <strong>${state.count}</strong> no total`;
};

/* ---------- 8. Busca e filtros (em memória) ---------- */

/**
 * Aplica a busca textual (nome, documento, email) e os filtros de tipo/status
 * sobre a lista de usuários já carregada, sem nova chamada à API.
 */
const filterUsuarios = () => {
  const termo = state.searchTerm.trim().toLowerCase();

  state.filtered = state.usuarios.filter((usuario) => {
    const correspondeTermo = !termo || [usuario.nome_completo, usuario.documento, usuario.email]
      .some((campo) => (campo || '').toLowerCase().includes(termo));

    const correspondeTipo = state.tipoFiltro === 'todos' || usuario.tipo_usuario === state.tipoFiltro;

    const correspondeStatus =
      state.statusFiltro === 'todos' ||
      (state.statusFiltro === 'ativos' && usuario.eh_ativo) ||
      (state.statusFiltro === 'inativos' && !usuario.eh_ativo);

    return correspondeTermo && correspondeTipo && correspondeStatus;
  });

  renderTable();
};

/* ---------- 9. Paginação ---------- */

/**
 * Atualiza o estado habilitado/desabilitado dos botões de paginação
 * com base nas URLs next/previous retornadas pela API.
 */
const renderPagination = () => {
  const btnPrev = els.pagPrev.querySelector('button');
  const btnNext = els.pagNext.querySelector('button');

  btnPrev.disabled = !state.previous;
  btnNext.disabled = !state.next;
};

/* ---------- 10. Comunicação com a API ---------- */

/**
 * Busca usuários na API. Por padrão utiliza o endpoint base, mas aceita
 * uma URL específica (next/previous) para navegação entre páginas.
 * @param {string} url
 */
const loadUsuarios = async (url = USUARIOS_ENDPOINT) => {
  renderLoading();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();

    state.usuarios = data.results || [];
    state.count = data.count ?? state.usuarios.length;
    state.next = data.next;
    state.previous = data.previous;
    state.isLoading = false;
    state.hasError = false;
    renderCards();
    renderPagination();
    filterUsuarios();
  } catch (erro) {
    console.error('Falha ao carregar usuários:', erro);
    renderError();
  }
};

const addUsuarios = async (url = USUARIOS_ENDPOINT) => {

  let payload = {
    nome_completo: document.getElementById('usuario_nome_completo').value,
    documento: document.getElementById('usuario_documento').value,
    nascimento: document.getElementById('usuario_nascimento').value,
    email: document.getElementById('usuario_email').value,
    telefone: document.getElementById('usuario_telefone').value,
    eh_ativo: document.getElementById('usuario_eh_ativo').value,
    tipo_usuario: document.getElementById('usuario_tipo_usuario').value
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

const editUsuarios = async (url = USUARIOS_ENDPOINT) => {
  url = url + document.getElementById('usuario_id').value + '/';

  let payload = {
    nome_completo: document.getElementById('usuario_nome_completo').value,
    documento: document.getElementById('usuario_documento').value,
    nascimento: document.getElementById('usuario_nascimento').value,
    email: document.getElementById('usuario_email').value,
    telefone: document.getElementById('usuario_telefone').value,
    eh_ativo: document.getElementById('usuario_eh_ativo').value,
    tipo_usuario: document.getElementById('usuario_tipo_usuario').value
  }
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

/* ---------- 11. Modal ---------- */

/**
 * Abre o modal reutilizável de cadastro/edição de usuário.
 * Por enquanto exibe apenas um placeholder, sem lógica de submissão.
 */
const openModal = (usuarioId = null) => {
  usuarioModal.show();

  const usuario = usuarioId != null
    ? state.usuarios.find((u) => u.id === usuarioId)
    : null;

  const form_usuario_id = document.getElementById('usuario_id');
  form_usuario_id.value = usuario?.id ?? '';

  document.getElementById('usuarioModalLabel').textContent =
    usuario ? 'Editar Usuario' : 'Cadastro de Usuário';

  document.getElementById('usuario_nome_completo').value = usuario?.nome_completo ?? '';
  document.getElementById('usuario_documento').value = usuario?.documento ?? '';
  document.getElementById('usuario_nascimento').value = usuario?.nascimento ?? '';
  document.getElementById('usuario_email').value = usuario?.email ?? '';
  document.getElementById('usuario_telefone').value = usuario?.telefone ?? '';
  document.getElementById('usuario_eh_ativo').value = String(usuario?.eh_ativo ?? true);
  document.getElementById('usuario_tipo_usuario').value = usuario?.tipo_usuario ?? 'convidado';
};

/* ---------- 12. Sidebar responsiva ---------- */

const toggleSidebar = () => {
  els.sidebar.classList.toggle('is-open');
  els.sidebarOverlay.classList.toggle('is-visible');
};

const closeSidebar = () => {
  els.sidebar.classList.remove('is-open');
  els.sidebarOverlay.classList.remove('is-visible');
};

/* ---------- 13. Listeners ---------- */

const initEventListeners = () => {
  els.btnRefresh.addEventListener('click', () => {
    els.btnRefresh.classList.add('is-spinning');
    loadUsuarios().finally(() => {
      setTimeout(() => els.btnRefresh.classList.remove('is-spinning'), 700);
    });
  });

  els.btnRetry.addEventListener('click', () => loadUsuarios());

  els.btnNovoUsuario.addEventListener('click', () => openModal());

  els.searchInput.addEventListener('input', (evento) => {
    state.searchTerm = evento.target.value;
    filterUsuarios();
  });

  els.filterTipo.addEventListener('change', (evento) => {
    state.tipoFiltro = evento.target.value;
    filterUsuarios();
  });

  els.filterStatus.addEventListener('change', (evento) => {
    state.statusFiltro = evento.target.value;
    filterUsuarios();
  });

  els.pagPrev.querySelector('button').addEventListener('click', () => {
    if (state.previous) loadUsuarios(state.previous);
  });

  els.pagNext.querySelector('button').addEventListener('click', () => {
    if (state.next) loadUsuarios(state.next);
  });

  els.sidebarToggle.addEventListener('click', toggleSidebar);
  els.sidebarOverlay.addEventListener('click', closeSidebar);

  document.getElementById('save_usuario')
    .addEventListener('click', () => {
      if (document.getElementById('usuario_id').value != null) {
        editUsuarios()
      } else {
        addUsuarios()
      }

    })
};

/* ---------- 14. Inicialização ---------- */

const init = () => {
  initEventListeners();
  loadUsuarios();

};

document.addEventListener('DOMContentLoaded', init);

