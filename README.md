# Tech Commerce Solutions – Portal Institucional

Atividade Prática 10 – Desenvolvimento Front End (Prof. Jean Holguim)
Aluno: Wallesson Cesar Vinhote

Portal institucional responsivo para a empresa fictícia **Tech Commerce Solutions** (comércio eletrônico e informática), com integração a um CMS (WordPress) pela API REST.

## Tecnologias

- HTML5 e CSS3
- Bootstrap 5.3 (via CDN) e Bootstrap Icons
- JavaScript (ES6+, sem dependências além do Bootstrap)
- WordPress.com como CMS, consumido pela API REST

## Estrutura

```
/projeto
├── index.html
├── /css
│   └── style.css
├── /js
│   └── script.js
└── /img
    ├── logo.svg, hero.svg
    └── notebook.svg, pc-gamer.svg, mouse.svg, teclado.svg, produto-generico.svg
```

## Como executar

Abra o `index.html` no navegador (é necessário internet para carregar o Bootstrap pelo CDN).

## Requisitos da atividade

| Requisito | Onde está |
| --- | --- |
| Cabeçalho com logo, menu e botão de contato | `<header>` em `index.html` (botão "Fale conosco" abre um formulário) |
| Banner principal com nome, frase de impacto e botão "Conheça nossos produtos" | seção `#inicio` |
| Serviços em cards (computadores, assistência, gamer, infraestrutura de TI) | seção `#servicos` |
| 4 produtos com imagem, nome, preço e botão "Comprar" | seção `#produtos` |
| Sobre: missão, visão e valores | seção `#sobre` |
| Rodapé: redes sociais, endereço, contato e direitos autorais | `<footer id="contato">` |
| Layout responsivo (grid do Bootstrap) | mobile, tablet e desktop |
| Menu mobile | `navbar-toggler` do Bootstrap |
| Dark mode | botão no cabeçalho; a escolha fica salva no navegador |
| Carrossel de produtos | `js/script.js`, função `iniciarCarrossel` (botões, indicadores, setas do teclado e gesto de arrastar) |
| Integração com API/CMS | `js/script.js`, função `carregarProdutos` |

## UX/UI aplicado

- Hierarquia visual (título, subtítulo, chamada para ação) e paleta azul escuro + ciano.
- Navegação intuitiva: menu fixo no topo com destaque da seção atual.
- Feedback visual nos botões: hover, foco visível, clique e aviso (toast) com contador no carrinho ao comprar.
- Acessibilidade: link "pular para o conteúdo", textos alternativos, rótulos ARIA e respeito a `prefers-reduced-motion`.

## Integração com o CMS (WordPress)

Os produtos são posts da categoria **Produtos** no site `cesar0969.wordpress.com`. O portal busca os dados em:

```
https://public-api.wordpress.com/wp/v2/sites/cesar0969.wordpress.com/posts?categories=7040&per_page=4&_embed
```

- O título do post vira o nome do produto e o preço vem do resumo (excerpt).
- Se a API não responder ou não houver posts publicados, o portal usa os produtos locais definidos em `PRODUTOS_RESERVA`. O console do navegador (F12) informa qual fonte está em uso.
- Os posts foram criados como **rascunho**. Para o portal passar a ler a API, publique os posts no WordPress.
