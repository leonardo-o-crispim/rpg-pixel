/**
 * ui/screens/criacao.js - Criacao do personagem: nome e classe.
 */

import { h } from '../components/dom.js';
import { toast } from '../components/overlays.js';
import { iconeSprite } from '../../render/pixel.js';
import { CLASSES, ORDEM_CLASSES } from '../../data/classes.js';
import { SIGLAS_ATRIBUTOS } from '../../systems/progressao.js';
import { Jogo } from '../../systems/estado.js';
import { Router } from '../../core/router.js';

const NOMES = [
  'Afonso', 'Beatriz', 'Duarte', 'Leonor', 'Tristão', 'Inês', 'Gonçalo', 'Mécia',
  'Aldric', 'Isolde', 'Garrick', 'Elowen', 'Osric', 'Rowena', 'Theron', 'Brenna',
];
const MAX_NOME = 14;

export function telaCriacao() {
  let classe = 'cavaleiro';
  const campo = h('input', {
    class: 'campo', maxlength: MAX_NOME, placeholder: 'Nome do herói',
    autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Nome do herói',
  });
  campo.value = NOMES[Math.floor(Math.random() * NOMES.length)];

  const cartoes = ORDEM_CLASSES.map((id) => {
    const c = CLASSES[id];
    const el = h('button', {
      class: ['cartao-classe', 'painel', !c.disponivel && 'cartao-classe--bloqueado'],
      disabled: !c.disponivel,
      'aria-pressed': String(id === classe),
      onClick: () => escolher(id),
    },
    h('div', { class: 'cartao-classe__sprite' }, iconeSprite(c.sprite, 4)),
    h('div', { class: 'cartao-classe__info' },
      h('div', { class: 'cartao-classe__nome' }, c.nome, !c.disponivel && h('span', { class: 'selo-inline' }, `chega no ${c.chegaEm}`)),
      h('div', { class: 'cartao-classe__papel' }, c.papel),
      h('p', { class: 'cartao-classe__desc' }, c.descricao),
      h('div', { class: 'cartao-classe__attrs' },
        Object.entries(c.base).map(([k, v]) => h('span', {}, h('b', {}, SIGLAS_ATRIBUTOS[k]), ` ${v}`))),
    ));
    el.dataset.classe = id;
    return el;
  });

  function escolher(id) {
    classe = id;
    for (const el of cartoes) {
      el.classList.toggle('cartao-classe--ativo', el.dataset.classe === id);
      el.setAttribute('aria-pressed', String(el.dataset.classe === id));
    }
  }

  function comecar() {
    const nome = campo.value.trim().replace(/\s+/g, ' ').slice(0, MAX_NOME);
    if (nome.length < 2) { toast('Dê um nome com pelo menos 2 letras.'); campo.focus(); return; }
    Jogo.novoHeroi(nome, classe);
    Router.limparPilha();
    Router.go('hub', {}, { substituir: true });
  }

  return {
    mount() {
      const tela = h('section', { class: 'tela-criacao' },
        h('div', { class: 'rolavel' },
          h('h1', { class: 'logo contornado' }, h('span', { class: 'l1' }, 'RPG'), h('span', { class: 'l2' }, 'PIXEL')),
          h('p', { class: 'centro mudo' }, 'Monte seu herói. Ele luta sozinho. Você decide o caminho.'),
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Nome'),
            h('div', { class: 'linha' },
              campo,
              h('button', {
                class: 'btn btn--pequeno', onClick: () => { campo.value = NOMES[Math.floor(Math.random() * NOMES.length)]; },
              }, 'Sortear'),
            ),
          ),
          h('h2', { class: 'titulo-secao titulo-secao--fora' }, 'Classe'),
          cartoes,
        ),
        h('div', { class: 'rodape' },
          h('button', { class: 'btn btn--primario btn--grande btn--bloco', onClick: comecar }, 'Começar aventura'),
        ),
      );
      escolher(classe);
      campo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') comecar(); });
      return tela;
    },
  };
}
