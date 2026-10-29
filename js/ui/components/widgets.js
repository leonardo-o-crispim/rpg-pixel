/**
 * ui/components/widgets.js - Pecas de interface reaproveitadas pelas telas:
 * barra de progresso, cabecalho com voltar, botao com icone e moeda.
 */

import { h, fmt } from './dom.js';
import { Router } from '../../core/router.js';
import { iconeSprite } from '../../render/pixel.js';

/**
 * Barra com rotulo. tipo: 'vida' | 'mana' | 'xp'.
 * Retorna o elemento com o metodo `atualizar(valor, max, rotulo?)`.
 */
export function barra(tipo, { alta = false } = {}) {
  const fill = h('div', { class: 'barra__fill' });
  const rotulo = h('div', { class: 'barra__rotulo num' });
  const el = h('div', { class: ['barra', `barra--${tipo}`, alta && 'barra--alta'] },
    h('div', { class: 'barra__fundo' }), fill, rotulo);
  el.atualizar = (valor, max, texto) => {
    const p = max > 0 ? Math.max(0, Math.min(1, valor / max)) : 0;
    fill.style.width = `${(p * 100).toFixed(1)}%`;
    rotulo.textContent = texto ?? `${fmt(valor)} / ${fmt(max)}`;
  };
  return el;
}

/** Cabecalho padrao: botao voltar + titulo + conteudo extra a direita. */
export function cabecalho(titulo, { extra = null, aoVoltar = () => Router.voltar() } = {}) {
  return h('header', { class: 'cabecalho' },
    h('button', { class: 'btn btn--fantasma btn-voltar', 'aria-label': 'Voltar', onClick: aoVoltar }, '‹'),
    h('h1', { class: 'cabecalho__titulo' }, titulo),
    extra,
  );
}

/** Quantidade de ouro com o icone da moeda. */
export function moeda(valor) {
  const el = h('span', { class: 'moeda' }, iconeSprite('moeda', 2), h('span', { class: 'num' }, fmt(valor)));
  el.atualizar = (v) => { el.lastChild.textContent = fmt(v); };
  return el;
}

/** Botao com icone pixel em cima e texto embaixo (grade do Hub). */
export function botaoIcone({ icone, texto, onClick, selo = null, seloDestaque = false, desabilitado = false }) {
  return h('button', { class: 'btn btn-icone', onClick, disabled: desabilitado },
    iconeSprite(icone, 3),
    h('span', {}, texto),
    selo && h('span', { class: ['selo', seloDestaque && 'selo--destaque'] }, selo),
  );
}
