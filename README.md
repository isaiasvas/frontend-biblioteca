# Usuários · Darkone Admin

Documentação técnica completa do módulo de **Listagem de Usuários**, construído com **HTML5, CSS3 e JavaScript puro (ES6)**, consumindo uma API REST via `fetch()`.

---

## Sumário

1. [Visão geral do projeto](#1-visão-geral-do-projeto)
2. [Objetivo da página](#2-objetivo-da-página)
3. [Tecnologias utilizadas](#3-tecnologias-utilizadas)
4. [Estrutura de pastas e arquivos](#4-estrutura-de-pastas-e-arquivos)
5. [Explicação de cada arquivo](#5-explicação-de-cada-arquivo)
6. [Estrutura HTML](#6-estrutura-html)
7. [Explicação detalhada do CSS](#7-explicação-detalhada-do-css)
8. [Explicação detalhada de cada função JavaScript](#8-explicação-detalhada-de-cada-função-javascript)
9. [Fluxo completo de funcionamento](#9-fluxo-completo-de-funcionamento)
10. [Comunicação com a API](#10-comunicação-com-a-api)
11. [Carregamento de dados com Fetch API](#11-carregamento-de-dados-com-fetch-api)
12. [Sistema de filtros](#12-sistema-de-filtros)
13. [Pesquisa em memória](#13-pesquisa-em-memória)
14. [Paginação](#14-paginação)
15. [Cálculo dos cards](#15-cálculo-dos-cards)
16. [Badges (Tipo e Status)](#16-badges-tipo-e-status)
17. [Geração do Avatar](#17-geração-do-avatar)
18. [Skeleton Loading](#18-skeleton-loading)
19. [Tratamento de erros](#19-tratamento-de-erros)
20. [Responsividade](#20-responsividade)
21. [Guia para manutenção futura](#21-guia-para-manutenção-futura)
22. [Sugestões de melhorias](#22-sugestões-de-melhorias)
23. [Próximos passos (Cadastro, Edição, Exclusão)](#23-próximos-passos-cadastro-edição-exclusão)
24. [Boas práticas adotadas](#24-boas-práticas-adotadas)

---

## 1. Visão geral do projeto

Este projeto implementa a tela de **Listagem de Usuários** de um painel administrativo no estilo *Darkone Admin* (dark theme, cards, sidebar fixa, navbar superior). A página consome o endpoint `GET /api/v1/usuarios/` de uma API REST local e apresenta os dados em uma tabela moderna, com cards de resumo, busca, filtros, paginação, skeleton loading e tratamento de erros — tudo isso usando **apenas HTML, CSS, Bootstrap 5, Font Awesome e JavaScript Vanilla (ES6)**. Não há frameworks como React, Vue, Angular, nem bibliotecas como jQuery ou Axios.

## 2. Objetivo da página

Fornecer a uma equipe administrativa (ex.: secretaria de uma instituição de ensino) uma visão rápida e organizada de todos os usuários cadastrados — alunos, funcionários e convidados — permitindo localizar, filtrar e entender rapidamente o status de cada um, servindo como base para futuras telas de cadastro, edição e exclusão.

## 3. Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica da página |
| **CSS3** | Estilização, dark theme, animações, responsividade |
| **Bootstrap 5.3** | Grid, modal, toast e utilitários (via CDN) |
| **Font Awesome 6** | Ícones |
| **Google Fonts** (Sora, Inter, JetBrains Mono) | Tipografia |
| **JavaScript ES6 (Vanilla)** | Toda a lógica da aplicação |
| **Fetch API** | Comunicação com a API REST |

Nenhuma dependência de build (webpack, npm, bundlers) é necessária — o projeto roda abrindo o `index.html` diretamente ou via um servidor estático simples.

## 4. Estrutura de pastas e arquivos

```
/usuarios
│
├── index.html          # Estrutura da página (HTML semântico)
├── css/
│   └── usuarios.css    # Todo o CSS do projeto
├── js/
│   └── usuarios.js     # Toda a lógica JavaScript
└── README.md           # Esta documentação
```

## 5. Explicação de cada arquivo

### `index.html`
Contém a estrutura semântica completa: sidebar (`<aside>`), topbar (`<header>`), conteúdo principal (`<main>`), cards de estatísticas, card da tabela (com estados de loading/erro/vazio/tabela), modal de cadastro/edição e container de toasts. Não possui nenhum CSS ou JS inline — apenas referencia `css/usuarios.css` e `js/usuarios.js`.

### `css/usuarios.css`
Organizado em 15 blocos numerados por comentários (`/* ---------- N. Seção ---------- */`), cobrindo: tokens de design (`:root`), reset, sidebar, topbar, cards, tabela, skeleton, estados de erro/vazio, paginação, modal, toasts e media queries de responsividade.

### `js/usuarios.js`
Organizado em 14 blocos: configuração, estado global (`state`), referências de elementos (`els`), utilitários (formatação, avatar, badges), renderização de estados, cards, tabela, filtros, paginação, comunicação com a API, modal, sidebar responsiva, listeners e inicialização.

### `README.md`
Este arquivo — documentação técnica do projeto.

## 6. Estrutura HTML

A página é dividida em três grandes regiões:

- **`.sidebar`** — menu lateral fixo com marca, navegação e um indicativo do total de usuários (badge dinâmico atualizado via JS).
- **`.main-wrapper`** — contém a `.topbar` (busca global, notificações, usuário logado) e o `.page-content`, que é onde vive toda a listagem de usuários:
  - `.page-header`: título, breadcrumb, botão "Atualizar" e botão "+ Novo Usuário".
  - `.stats-grid`: os 4 cards (Total, Alunos, Funcionários, Convidados).
  - `.table-card`: barra de busca + filtros, os 4 estados possíveis (`#loadingState`, `#errorState`, `#emptyState`, `#tableWrap`) e o rodapé com contagem de resultados e paginação.
- **`#usuarioModal`** — modal Bootstrap `modal-lg`, reutilizável para futuras telas de cadastro/edição.

Todos os elementos que precisam ser manipulados via JavaScript possuem `id`, evitando seletores frágeis por classe.

## 7. Explicação detalhada do CSS

### Variáveis CSS (`:root`)
Centralizam cores de superfície (`--bg-app`, `--surface-card`...), texto (`--text-primary`, `--text-muted`...), acentos semânticos (`--accent-violet`, `--accent-cyan`, `--accent-green`, `--accent-red`, `--accent-slate`), tipografia (`--font-display`, `--font-body`, `--font-mono`) e medidas de layout (`--sidebar-w`, `--radius-lg`, `--shadow-elevated`). Alterar o tema todo é uma questão de editar essas variáveis.

### Organização
O arquivo segue uma ordem lógica: reset → sidebar → topbar → conteúdo → cards → tabela → skeleton → estados vazios/erro → paginação → modal → toasts → responsividade. Cada bloco é isolado e comentado.

### Componentes
- **Glass effect**: aplicado na `.topbar` via `backdrop-filter: blur(14px)` sobre `--surface-glass` (cor semitransparente).
- **Cards modernos**: `.stat-card` e `.table-card` usam `border-radius` grande, sombra suave (`--shadow-soft`/`--shadow-elevated`) e transições de `transform` no hover.
- **Badges**: `.badge-pill` com uma bolinha (`::before`) da cor do texto, criando o efeito de "status dot".
- **Scrollbar personalizada**: estilizada via `::-webkit-scrollbar*`.

### Animações
- `shimmer`: efeito de brilho deslizante usado no skeleton loading.
- `row-in`: fade + slide sutil quando as linhas da tabela são inseridas.
- `spin-once`: gira o ícone do botão "Atualizar" ao ser clicado.
- Hover nos `.stat-card` eleva o card (`translateY`) e aplica leve rotação no ícone.
- `@media (prefers-reduced-motion: reduce)` desativa todas as animações para usuários que preferem menos movimento.

### Responsividade
Definida com três breakpoints principais (`991px`, `768px`, `480px`):
- Abaixo de `991px`, a sidebar vira um drawer deslizante (`transform: translateX(-100%)`) acionado pelo botão hambúrguer, com um overlay escurecido.
- Abaixo de `768px`, os cards passam para 2 colunas, os filtros empilham verticalmente e o cabeçalho da página quebra em coluna.
- Abaixo de `480px`, os cards passam para 1 coluna.
- A tabela sempre possui `overflow-x: auto` em `.table-responsive-wrap`, com `min-width: 1080px` na própria tabela, garantindo rolagem horizontal suave em telas pequenas sem quebrar o layout das colunas.

## 8. Explicação detalhada de cada função JavaScript

| Função | Responsabilidade |
|---|---|
| `formatDate(isoDate)` | Converte uma data ISO (`2026-06-11T20:21:54`) para `dd/mm/aaaa`. Retorna `—` se a data for inválida ou nula. |
| `getInitials(nomeCompleto)` | Extrai a primeira letra do primeiro e do último nome (ex.: "Norberto Reprovado" → "NR"). |
| `stringToColor(texto)` | Gera uma cor `hsl()` determinística a partir de um hash simples da string, garantindo que o mesmo nome sempre produza a mesma cor. |
| `getAvatar(nomeCompleto)` | Combina `getInitials` + `stringToColor` para montar o HTML do avatar circular/quadrado com iniciais. |
| `getTipoBadge(tipo, tipoDisplay)` | Retorna o HTML do badge de tipo de usuário, mapeando `aluno` → azul/ciano, `funcionario` → verde, `convidado` → cinza. |
| `getStatusBadge(ehAtivo)` | Retorna o HTML do badge de status: verde para `Ativo`, vermelho para `Inativo`. |
| `escapeHtml(valor)` | Sanitiza valores antes de interpolá-los no HTML, prevenindo XSS a partir de dados vindos da API. |
| `showToast(tipo, titulo, mensagem)` | Cria dinamicamente um elemento `.toast` e o exibe usando o componente `bootstrap.Toast`. |
| `setViewState(estado)` | Alterna a visibilidade entre os 4 possíveis estados da área de listagem: `loading`, `error`, `empty`, `table`. |
| `renderLoading()` | Monta o skeleton (6 linhas fake) e o exibe, além de colocar os cards em estado de "carregando". |
| `renderError()` | Exibe o card de erro centralizado e restaura os cards para um estado neutro (`–`). |
| `renderCards()` | Calcula as quantidades de alunos, funcionários e convidados da página atual e atualiza os 4 cards, além do total geral (`count`) vindo da API. |
| `buildRow(usuario)` | Monta o HTML de uma única linha `<tr>` da tabela a partir do objeto de usuário. |
| `renderTable()` | Renderiza todas as linhas da lista já filtrada (`state.filtered`) ou exibe o estado vazio se não houver resultados. |
| `filterUsuarios()` | Aplica busca textual + filtros de tipo/status sobre `state.usuarios` (em memória) e chama `renderTable()`. |
| `renderPagination()` | Habilita/desabilita os botões "Anterior"/"Próxima" com base em `state.previous` e `state.next`. |
| `loadUsuarios(url)` | Função principal: dispara o `fetch()`, trata sucesso/erro e orquestra a atualização de cards, paginação e tabela. |
| `openModal()` | Abre o modal Bootstrap reutilizável de cadastro/edição. |
| `toggleSidebar()` / `closeSidebar()` | Controlam a exibição da sidebar em telas menores que `991px`. |
| `initEventListeners()` | Centraliza todo o binding de eventos da página (cliques, inputs, mudanças de select). |
| `init()` | Ponto de entrada: registra os listeners e dispara o primeiro `loadUsuarios()`. |

## 9. Fluxo completo de funcionamento

1. O DOM é carregado → `DOMContentLoaded` dispara `init()`.
2. `init()` registra todos os event listeners e chama `loadUsuarios()`.
3. `loadUsuarios()` exibe o skeleton loading (`renderLoading()`) e faz o `fetch()` para a API.
4. **Sucesso**: os dados são salvos no `state`, e são chamadas `renderCards()`, `renderPagination()` e `filterUsuarios()` (que internamente chama `renderTable()`).
5. **Erro**: `renderError()` exibe o card de erro com o botão "Tentar novamente".
6. O usuário pode digitar na busca ou trocar os selects de filtro → `filterUsuarios()` é reexecutada **sem nova chamada à API**, apenas filtrando `state.usuarios` (os dados já carregados) e re-renderizando a tabela.
7. Ao clicar em "Atualizar", "Próxima" ou "Anterior", uma nova chamada `fetch()` é feita (para a URL base, para `state.next` ou para `state.previous`, respectivamente), reiniciando o ciclo a partir do passo 3.
8. O botão "+ Novo Usuário" apenas chama `openModal()`, exibindo o modal placeholder.

## 10. Comunicação com a API

A comunicação é feita exclusivamente via `fetch()` nativo do navegador, sem qualquer header de autenticação (a API não exige `Authorization`). A URL base fica centralizada na constante `API_BASE_URL`, facilitando a troca de ambiente (desenvolvimento/produção) em um único ponto do código:

```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1/';
const USUARIOS_ENDPOINT = `${API_BASE_URL}usuarios/`;
```

## 11. Carregamento de dados com Fetch API

A função `loadUsuarios(url)` aceita uma URL opcional (usada pela paginação) e por padrão consome `USUARIOS_ENDPOINT`:

```javascript
const loadUsuarios = async (url = USUARIOS_ENDPOINT) => {
  renderLoading();
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    const data = await response.json();
    // ...atualiza o state e renderiza
  } catch (erro) {
    renderError();
  }
};
```

O uso de `async/await` com `try/catch` garante um fluxo linear e legível, cobrindo tanto falhas de rede (API fora do ar) quanto respostas HTTP de erro (4xx/5xx).

## 12. Sistema de filtros

Os dois `<select>` (`#filterTipo` e `#filterStatus`) atualizam `state.tipoFiltro` e `state.statusFiltro` a cada `change`, chamando `filterUsuarios()`. Dentro dela, cada usuário é validado contra os três critérios (busca, tipo e status) simultaneamente — todos precisam ser verdadeiros para o usuário aparecer na tabela.

## 13. Pesquisa em memória

O campo `#searchInput` dispara `filterUsuarios()` a cada evento `input`. A busca compara o termo digitado (normalizado para minúsculas) contra `nome_completo`, `documento` e `email` de cada usuário já carregado em `state.usuarios` — **nenhuma nova requisição é feita**, tornando a busca instantânea.

## 14. Paginação

A API retorna `count`, `next` e `previous`. O front-end **não calcula páginas manualmente**: os botões "Anterior" e "Próxima" simplesmente chamam `loadUsuarios(state.previous)` ou `loadUsuarios(state.next)`, usando exatamente a URL fornecida pela API. Quando `next`/`previous` são `null`, o respectivo botão fica desabilitado (`renderPagination()`).

## 15. Cálculo dos cards

- **Total de usuários**: exibe diretamente o campo `count` da API (total geral, não apenas da página atual).
- **Alunos / Funcionários / Convidados**: calculados em `renderCards()` filtrando `state.usuarios` (os usuários da página atualmente carregada) por `tipo_usuario`.

## 16. Badges (Tipo e Status)

`getTipoBadge()` mapeia o campo `tipo_usuario` para uma classe CSS (`badge-aluno`, `badge-funcionario`, `badge-convidado`), cada uma com uma cor de acento diferente definida via variáveis CSS. `getStatusBadge()` faz o mesmo com base no booleano `eh_ativo`, retornando `badge-ativo` (verde) ou `badge-inativo` (vermelho).

## 17. Geração do Avatar

`getAvatar()` combina duas funções puras:
- `getInitials()`: pega a primeira letra do primeiro nome e a primeira letra do último sobrenome.
- `stringToColor()`: gera um hash numérico simples a partir dos caracteres do nome e o converte em uma cor `hsl()`. Como o hash é determinístico, **o mesmo nome sempre gera a mesma cor**, mantendo consistência visual em toda a aplicação.

## 18. Skeleton Loading

Implementado sem nenhuma biblioteca externa: `renderLoading()` injeta 6 `.skeleton-row` (uma "linha falsa" da tabela) dentro de `#loadingState`. Cada bloco `.sk` possui um `background-size: 400% 100%` animado via `@keyframes shimmer`, criando o efeito de brilho deslizante característico de skeletons modernos. Os cards de estatística também recebem a classe `.is-skeleton` enquanto os dados não chegam.

## 19. Tratamento de erros

Caso o `fetch()` rejeite (rede indisponível) ou a resposta não seja `response.ok`, o `catch` do `loadUsuarios()` chama `renderError()`, que exibe um card centralizado (`.error-card`) com ícone, a mensagem obrigatória **"Não foi possível carregar os usuários."** e o botão **"Tentar novamente"**, que reexecuta `loadUsuarios()`.

## 20. Responsividade

Veja a seção [7. Explicação detalhada do CSS → Responsividade](#7-explicação-detalhada-do-css) para os detalhes de breakpoints. Em resumo: sidebar vira drawer, cards reorganizam de 4 → 2 → 1 colunas, filtros empilham e a tabela sempre rola horizontalmente em vez de quebrar.

## 21. Guia para manutenção futura

- **Trocar a URL da API**: edite apenas `API_BASE_URL` em `js/usuarios.js`.
- **Adicionar uma nova coluna na tabela**: adicione o `<th>` correspondente em `index.html` e o `<td>` em `buildRow()`.
- **Adicionar um novo tipo de usuário**: inclua uma nova opção no `<select id="filterTipo">`, um novo `case` em `getTipoBadge()` (mapa `mapa`) e a cor correspondente em `usuarios.css` (`--accent-*` + classe `.badge-*`).
- **Alterar o tema visual**: ajuste as variáveis em `:root` no topo de `usuarios.css` — cores, raios de borda e sombras se propagam automaticamente.
- **Adicionar uma nova ação na tabela**: inclua um novo `.action-btn` dentro de `.action-buttons` em `buildRow()`.

## 22. Sugestões de melhorias

- Persistir os filtros/busca na URL (query string) para permitir compartilhar links filtrados.
- Adicionar ordenação por coluna (nome, data de criação etc.) clicando no cabeçalho da tabela.
- Implementar *debounce* no campo de busca para grandes volumes de dados.
- Adicionar exportação da listagem filtrada para CSV/Excel.
- Cachear a resposta da API em memória para evitar chamadas repetidas ao alternar entre páginas já visitadas.
- Adicionar testes automatizados (ex.: Playwright) cobrindo os fluxos de busca, filtro e paginação.

## 23. Próximos passos (Cadastro, Edição, Exclusão)

O projeto já está preparado para essas evoluções:

- **Cadastro**: substituir o conteúdo de `.modal-placeholder` por um formulário real, implementar `submitUsuario()` fazendo `POST` para `USUARIOS_ENDPOINT`, e chamar `loadUsuarios()` ao final para atualizar a listagem.
- **Edição**: reaproveitar o mesmo `#usuarioModal`, pré-preenchendo os campos com os dados do usuário clicado (`action-btn edit`) e enviando `PUT`/`PATCH` para `${USUARIOS_ENDPOINT}{id}/`.
- **Exclusão**: no clique do `action-btn delete`, exibir uma confirmação (pode ser outro modal Bootstrap) e, ao confirmar, enviar `DELETE` para `${USUARIOS_ENDPOINT}{id}/`, removendo o item do `state.usuarios` e re-renderizando.
- **Autenticação**: quando a API exigir token, adicionar o header `Authorization` dentro de um objeto de opções compartilhado (`buildFetchOptions()`), aplicado a todas as chamadas.

## 24. Boas práticas adotadas

- HTML semântico (`<aside>`, `<header>`, `<main>`, `<nav>`, `<table>`, `<footer>`).
- Separação total de responsabilidades: estrutura (HTML), apresentação (CSS) e comportamento (JS) em arquivos distintos, sem inline.
- JavaScript modular, organizado por seções numeradas, com funções pequenas e nomeadas de forma clara.
- Uso consistente de `const`/`let`, arrow functions, template literals e `async/await`.
- Sanitização de dados vindos da API (`escapeHtml`) antes de interpolar no DOM.
- Estado centralizado em um único objeto (`state`), evitando variáveis soltas e facilitando o rastreamento de mudanças.
- CSS orientado a variáveis (Design Tokens), evitando valores mágicos espalhados pelo código.
- Acessibilidade básica: `aria-label`, `alt` implícito em ícones decorativos, foco visível padrão do Bootstrap e respeito a `prefers-reduced-motion`.
- Código pronto para extensão (cadastro, edição, exclusão, autenticação) sem necessidade de refatoração estrutural.
