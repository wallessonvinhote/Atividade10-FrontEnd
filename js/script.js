/* =========================================================
   Tech Commerce Solutions – script.js
   - Dark mode (com preferência salva)
   - Integração com o CMS (API REST do WordPress) + reserva local
   - Carrossel de produtos
   - Botão "Comprar" com feedback (contador + toast)
   - Formulário de contato (validação)
   ========================================================= */

'use strict';

/* ---------- Configuração do CMS (WordPress.com) ---------- */
const WP_SITE = 'cesar0969.wordpress.com';
const WP_CATEGORIA_PRODUTOS = 7040; // categoria "Produtos" criada no WordPress
const API_PRODUTOS =
  `https://public-api.wordpress.com/wp/v2/sites/${WP_SITE}/posts` +
  `?categories=${WP_CATEGORIA_PRODUTOS}&per_page=4&order=asc&orderby=date&_embed`;

/* Imagens locais por slug do post (usadas quando o post não tem imagem destacada) */
const IMAGENS_POR_SLUG = {
  'notebook-pro-15': 'img/notebook.svg',
  'pc-gamer-titan': 'img/pc-gamer.svg',
  'mouse-gamer-pulse-rgb': 'img/mouse.svg',
  'teclado-mecanico-nova': 'img/teclado.svg'
};

/* Reserva: usada se a API estiver offline ou sem posts publicados */
const PRODUTOS_RESERVA = [
  { id: 1, slug: 'notebook-pro-15', nome: 'Notebook Pro 15', preco: 'R$ 4.299,90',
    descricao: 'Tela Full HD de 15,6", 16 GB de RAM e SSD de 512 GB. Ideal para trabalho, estudo e criação.',
    imagem: 'img/notebook.svg' },
  { id: 2, slug: 'pc-gamer-titan', nome: 'PC Gamer Titan', preco: 'R$ 7.899,00',
    descricao: 'Placa de vídeo dedicada, 32 GB de RAM, SSD NVMe de 1 TB e gabinete com iluminação RGB.',
    imagem: 'img/pc-gamer.svg' },
  { id: 3, slug: 'mouse-gamer-pulse-rgb', nome: 'Mouse Gamer Pulse RGB', preco: 'R$ 189,90',
    descricao: 'Sensor óptico de 16.000 DPI, 7 botões programáveis e iluminação RGB personalizável.',
    imagem: 'img/mouse.svg' },
  { id: 4, slug: 'teclado-mecanico-nova', nome: 'Teclado Mecânico Nova', preco: 'R$ 349,90',
    descricao: 'Switches responsivos, layout ABNT2, retroiluminação e estrutura reforçada em metal.',
    imagem: 'img/teclado.svg' }
];

/* ---------- Utilidades ---------- */
const $ = (seletor, raiz = document) => raiz.querySelector(seletor);

function guardar(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (e) { /* armazenamento indisponível */ }
}

function textoLimpo(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || '').trim();
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/* =========================================================
   1. DARK MODE
   ========================================================= */
const btnTema = $('#btn-tema');

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-bs-theme', tema);
  const icone = $('i', btnTema);
  icone.className = tema === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
  btnTema.setAttribute('aria-label', tema === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
  btnTema.title = btnTema.getAttribute('aria-label');
}

aplicarTema(document.documentElement.getAttribute('data-bs-theme') || 'light');

btnTema.addEventListener('click', () => {
  const novo = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
  aplicarTema(novo);
  guardar('tcs-theme', novo);
});

/* =========================================================
   2. INTEGRAÇÃO COM O CMS (API REST do WordPress)
   ========================================================= */
function converterPost(post) {
  const textoConteudo = textoLimpo(post.content && post.content.rendered);
  const textoResumo = textoLimpo(post.excerpt && post.excerpt.rendered);
  const preco = (textoResumo + ' ' + textoConteudo).match(/R\$\s?[\d.]+,\d{2}/);
  const midia = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
  const primeiroParagrafo = textoConteudo.split(/\n+/)[0] || '';

  return {
    id: post.id,
    slug: post.slug,
    nome: textoLimpo(post.title && post.title.rendered) || 'Produto',
    preco: preco ? preco[0] : 'Consulte',
    descricao: primeiroParagrafo.replace(/Preço:.*$/i, '').trim(),
    imagem: (midia && midia.source_url) || IMAGENS_POR_SLUG[post.slug] || 'img/produto-generico.svg'
  };
}

async function carregarProdutos() {
  try {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 6000);
    const resposta = await fetch(API_PRODUTOS, { signal: controle.signal });
    clearTimeout(limite);
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);

    const posts = await resposta.json();
    if (!Array.isArray(posts) || posts.length === 0) throw new Error('Nenhum post publicado');

    console.info('Produtos carregados do WordPress (API REST)');
    return posts.map(converterPost);
  } catch (erro) {
    console.info('API do WordPress indisponível, usando dados locais:', erro.message);
    return PRODUTOS_RESERVA;
  }
}

/* =========================================================
   3. CARROSSEL DE PRODUTOS
   ========================================================= */
const carrinho = { itens: 0 };
const toastCompra = new bootstrap.Toast($('#toast-compra'), { delay: 2500 });

function comprar(nome) {
  carrinho.itens += 1;
  const badge = $('#cart-count');
  badge.textContent = carrinho.itens;
  badge.classList.remove('bump');
  void badge.offsetWidth; // reinicia a animação
  badge.classList.add('bump');
  $('#toast-texto').textContent = `${nome} adicionado ao carrinho!`;
  toastCompra.show();
}

function criarCard(produto) {
  const item = document.createElement('div');
  item.className = 'carousel-item-prod';
  item.setAttribute('role', 'group');
  item.setAttribute('aria-roledescription', 'slide');
  item.innerHTML = `
    <article class="product-card">
      <div class="product-img">
        <img src="${escapar(produto.imagem)}" alt="${escapar(produto.nome)}" loading="lazy" width="320" height="240">
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapar(produto.nome)}</h3>
        <p class="product-desc">${escapar(produto.descricao)}</p>
        <p class="product-price">${escapar(produto.preco)}</p>
        <button type="button" class="btn btn-accent w-100">
          <i class="bi bi-bag-plus me-2" aria-hidden="true"></i>Comprar
        </button>
      </div>
    </article>`;
  $('button', item).addEventListener('click', () => comprar(produto.nome));
  return item;
}

function iniciarCarrossel(produtos) {
  const raiz = $('#carrossel');
  const track = $('#produtos-track');
  const viewport = $('.carousel-viewport', raiz);
  const btnAnterior = $('.prev', raiz);
  const btnProximo = $('.next', raiz);
  const dots = $('#carrossel-dots');

  track.innerHTML = '';
  produtos.forEach((p, i) => {
    const card = criarCard(p);
    card.setAttribute('aria-label', `${i + 1} de ${produtos.length}`);
    track.appendChild(card);
  });

  let indice = 0;
  let porVista = 1;
  let timer = null;
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const calcularPorVista = () => (window.innerWidth >= 992 ? 3 : window.innerWidth >= 576 ? 2 : 1);
  const maxIndice = () => Math.max(0, produtos.length - porVista);

  function desenharDots() {
    dots.innerHTML = '';
    for (let i = 0; i <= maxIndice(); i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Ir para o grupo ${i + 1}`);
      b.addEventListener('click', () => { irPara(i); reiniciarAuto(); });
      dots.appendChild(b);
    }
  }

  function irPara(novo) {
    const max = maxIndice();
    indice = novo > max ? 0 : novo < 0 ? max : novo; // volta ao início/fim (loop)
    track.style.transform = `translateX(-${(indice * 100) / porVista}%)`;
    [...dots.children].forEach((d, i) => d.classList.toggle('active', i === indice));
    const semRolagem = max === 0;
    btnAnterior.disabled = semRolagem;
    btnProximo.disabled = semRolagem;
  }

  function reiniciarAuto() {
    clearInterval(timer);
    if (reduzMovimento || maxIndice() === 0) return;
    timer = setInterval(() => irPara(indice + 1), 5000);
  }

  function recalcular() {
    porVista = calcularPorVista();
    desenharDots();
    irPara(Math.min(indice, maxIndice()));
    reiniciarAuto();
  }

  btnAnterior.addEventListener('click', () => { irPara(indice - 1); reiniciarAuto(); });
  btnProximo.addEventListener('click', () => { irPara(indice + 1); reiniciarAuto(); });

  // Pausa o avanço automático ao passar o mouse ou focar
  raiz.addEventListener('mouseenter', () => clearInterval(timer));
  raiz.addEventListener('mouseleave', reiniciarAuto);
  raiz.addEventListener('focusin', () => clearInterval(timer));
  raiz.addEventListener('focusout', reiniciarAuto);

  // Navegação por teclado (setas)
  raiz.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { irPara(indice - 1); reiniciarAuto(); }
    if (e.key === 'ArrowRight') { irPara(indice + 1); reiniciarAuto(); }
  });

  // Gesto de arrastar no celular
  let inicioX = null;
  viewport.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (inicioX === null) return;
    const delta = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(delta) > 40) { irPara(indice + (delta < 0 ? 1 : -1)); reiniciarAuto(); }
    inicioX = null;
  });

  let redimensionar;
  window.addEventListener('resize', () => {
    clearTimeout(redimensionar);
    redimensionar = setTimeout(recalcular, 150);
  });

  recalcular();
}

/* =========================================================
   4. FORMULÁRIO DE CONTATO
   ========================================================= */
const formContato = $('#form-contato');
formContato.addEventListener('submit', (e) => {
  e.preventDefault();
  const sucesso = $('#form-sucesso');
  if (!formContato.checkValidity()) {
    formContato.classList.add('was-validated');
    sucesso.classList.add('d-none');
    return;
  }
  sucesso.classList.remove('d-none');
  formContato.reset();
  formContato.classList.remove('was-validated');
});
$('#modal-contato').addEventListener('hidden.bs.modal', () => {
  formContato.classList.remove('was-validated');
  $('#form-sucesso').classList.add('d-none');
});

/* =========================================================
   5. DETALHES DE INTERFACE
   ========================================================= */
// Sombra no cabeçalho ao rolar
const cabecalho = $('.site-header');
const aoRolar = () => cabecalho.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

// Fecha o menu mobile ao clicar em um link
document.querySelectorAll('#menu-principal .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    const menu = $('#menu-principal');
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  });
});

// Carrinho: leva à seção de produtos
$('#btn-carrinho').addEventListener('click', () => {
  $('#produtos').scrollIntoView({ behavior: 'smooth' });
});

$('#ano').textContent = new Date().getFullYear();

/* ---------- Inicialização ---------- */
carregarProdutos().then(iniciarCarrossel);
