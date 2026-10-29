/**
 * ui/components/itens.js - Pecas de interface de itens, usadas pelo
 * Inventario, Equipamentos, Loja e Resultado: celula com icone, lista de
 * atributos, comparacao com o equipado e a janela de detalhe.
 */

import { h } from './dom.js';
import { modal } from './overlays.js';
import { iconeSprite } from '../../render/pixel.js';
import { RARIDADES, NOMES_STATS, NOME_ESPACO, formatarStat } from '../../data/itens.js';
import { nomeDoItem, tintaDoItem, defBase, espacoDo } from '../../systems/itens.js';

/** Numeros de combate que aparecem na comparacao, nesta ordem. */
export const COMPARAVEIS = ['vidaMax', 'ataque', 'defesa', 'velocidade', 'critico', 'esquiva', 'poder', 'resistencia', 'manaMax'];

export function iconeItem(item, escala = 3) {
  return iconeSprite(defBase(item).sprite, escala, { tinta: tintaDoItem(item) });
}

/** Quadradinho do item: icone, nivel, marcas de "novo" e "melhor". */
export function celulaItem(item, { onClick, melhor = false, rotulo = null, tag = 'button' } = {}) {
  const r = RARIDADES[item.raridade];
  return h(tag, {
    class: ['item-celula', `rar-${item.raridade}`],
    style: { '--rar': r.cor },
    onClick,
    'aria-label': `${nomeDoItem(item)}, ${r.nome}, nível ${item.nivel}${melhor ? ', melhor que o equipado' : ''}`,
  },
  iconeItem(item, 3),
  h('span', { class: 'item-celula__nivel num' }, item.nivel),
  melhor && h('span', { class: 'item-celula__melhor', 'aria-hidden': 'true' }, '▲'),
  item.novo && h('span', { class: 'item-celula__novo', 'aria-hidden': 'true' }),
  rotulo && h('span', { class: 'item-celula__rotulo num' }, rotulo),
  );
}

export function nomeColorido(item) {
  return h('span', { class: 'nome-item', style: { color: RARIDADES[item.raridade].texto } }, nomeDoItem(item));
}

export function metaDoItem(item) {
  return `${RARIDADES[item.raridade].nome} · Nível ${item.nivel} · ${NOME_ESPACO[espacoDo(item)]}`;
}

export function listaStats(stats) {
  return h('ul', { class: 'stats-item' },
    Object.entries(stats).map(([k, v]) => h('li', {},
      h('span', {}, NOMES_STATS[k] ?? k),
      h('b', { class: 'num' }, `+${formatarStat(k, v)}`),
    )));
}

/** Diferenca nos numeros finais do heroi: ▲ verde sobe, ▼ vermelho desce. */
export function blocoComparacao({ antes, depois }) {
  const linhas = COMPARAVEIS
    .map((k) => [k, (depois[k] ?? 0) - (antes[k] ?? 0)])
    .filter(([, d]) => Math.abs(d) > 1e-6);
  if (!linhas.length) return h('p', { class: 'mudo pequeno' }, 'Não muda nenhum número do herói.');
  return h('ul', { class: 'comparacao' },
    linhas.map(([k, d]) => h('li', { class: d > 0 ? 'sobe' : 'desce' },
      h('span', {}, NOMES_STATS[k]),
      h('b', { class: 'num' }, `${d > 0 ? '▲ +' : '▼ −'}${formatarStat(k, Math.abs(d))}`),
    )));
}

/** Selo de ganho de poder (+12 / −3). */
export function seloGanho(ganho) {
  const g = Math.round(ganho);
  if (Math.abs(ganho) < 0.5) return h('span', { class: 'ganho-poder ganho-poder--igual num' }, '=');
  return h('span', { class: ['ganho-poder', 'num', g > 0 ? 'ganho-poder--sobe' : 'ganho-poder--desce'] }, g > 0 ? `▲ ${g}` : `▼ ${Math.abs(g)}`);
}

/**
 * Janela de detalhe do item.
 * comparacao: resultado de inventario.comparar() (opcional).
 * acoes: como em modal(); resolve com o valor da acao escolhida.
 */
export function abrirItem(item, { comparacao = null, acoes = [{ texto: 'Fechar', valor: null }], extra = null } = {}) {
  const r = RARIDADES[item.raridade];
  let tituloComp = null;
  if (comparacao) {
    tituloComp = comparacao.jaEquipado ? 'Equipado: o que ele dá'
      : comparacao.equipado ? 'Trocando pelo equipado' : 'Se equipar (espaço vazio)';
  }
  return modal({
    classe: `modal-item rar-${item.raridade}`,
    acoes,
    conteudo: h('div', { class: 'detalhe-item', style: { '--rar': r.cor } },
      h('div', { class: 'detalhe-item__topo' },
        h('div', { class: 'detalhe-item__icone' }, iconeItem(item, 5)),
        h('div', {},
          h('h2', { class: 'detalhe-item__nome', style: { color: r.texto } }, nomeDoItem(item)),
          h('span', { class: 'detalhe-item__meta' }, metaDoItem(item)),
        ),
      ),
      h('h3', { class: 'titulo-secao' }, 'Atributos'),
      listaStats(item.stats),
      comparacao && h('div', { class: 'detalhe-item__comp' },
        h('h3', { class: 'titulo-secao' }, tituloComp, ' ', seloGanho(comparacao.ganho)),
        comparacao.equipado && h('p', { class: 'mudo pequeno' }, 'Equipado: ', nomeColorido(comparacao.equipado)),
        blocoComparacao(comparacao),
      ),
      extra,
    ),
  });
}
