/**
 * ui/components/overlays.js - Avisos curtos (toast) e janelas modais.
 */

import { h } from './dom.js';
import { Sons } from '../../audio/som.js';

const DURACAO_TOAST = 2200;
const MAX_TOASTS = 3;

const SOM_DO_AVISO = { ouro: 'moeda', sucesso: 'sucesso' };

/** Janelas abertas (a do topo fecha com o "voltar" do Android). */
const abertas = [];

/** Fecha a janela do topo; diz se havia alguma. */
export function fecharJanelaDoTopo() {
  const fechar = abertas.pop();
  if (!fechar) return false;
  fechar(null);
  return true;
}

/** Aviso que some sozinho. variante: '', 'ouro', 'sucesso'. */
export function toast(texto, variante = '', { som = true } = {}) {
  const raiz = document.getElementById('toast-root');
  if (!raiz) return;
  if (som && SOM_DO_AVISO[variante]) Sons.tocar(SOM_DO_AVISO[variante]);
  while (raiz.children.length >= MAX_TOASTS) raiz.firstElementChild.remove();
  const el = h('div', { class: ['toast', 'px', variante && `toast--${variante}`] }, texto);
  raiz.append(el);
  setTimeout(() => {
    el.classList.add('toast--saindo');
    setTimeout(() => el.remove(), 200);
  }, DURACAO_TOAST);
}

/**
 * Janela modal generica. `conteudo` e um no, lista de nos, ou uma funcao
 * (fechar) => no - para listas de escolha que fecham a janela sozinhas.
 * acoes: [{ texto, variante, valor, desabilitado? }] - o clique fecha e
 * resolve com `valor` (se for funcao, com o que ela devolver).
 * Tocar fora ou Esc resolve com null.
 */
export function modal({ titulo, texto, conteudo, acoes = [{ texto: 'OK', valor: true }], classe = '' }) {
  return new Promise((resolver) => {
    const raiz = document.getElementById('overlay-root');
    let fechado = false;
    const fechar = (valor) => {
      if (fechado) return;
      fechado = true;
      const i = abertas.indexOf(fechar);
      if (i >= 0) abertas.splice(i, 1);
      document.removeEventListener('keydown', aoTeclar);
      fundo.remove();
      resolver(valor);
    };
    const aoTeclar = (ev) => { if (ev.key === 'Escape') fechar(null); };

    const caixa = h('div', { class: ['modal', 'painel', classe], role: 'dialog', 'aria-modal': 'true' },
      titulo && h('h2', {}, titulo),
      texto && h('p', {}, texto),
      typeof conteudo === 'function' ? conteudo(fechar) : conteudo,
      acoes.length > 0 && h('div', { class: 'modal__acoes' },
        acoes.map((a) => h('button', {
          class: ['btn', a.variante && `btn--${a.variante}`],
          disabled: !!a.desabilitado,
          onClick: () => fechar(typeof a.valor === 'function' ? a.valor() : a.valor),
        }, a.texto)),
      ),
    );
    const fundo = h('div', { class: 'modal-fundo', onClick: (ev) => { if (ev.target === fundo) fechar(null); } }, caixa);
    raiz.append(fundo);
    abertas.push(fechar);
    document.addEventListener('keydown', aoTeclar);
    caixa.querySelector('.modal__acoes .btn:last-child')?.focus();
  });
}

/** Pergunta sim/nao. Resolve true so se o jogador confirmar. */
export async function confirmar({ titulo, texto, sim = 'Confirmar', nao = 'Cancelar', perigo = false }) {
  const r = await modal({
    titulo, texto,
    acoes: [
      { texto: nao, valor: false },
      { texto: sim, valor: true, variante: perigo ? 'perigo' : 'primario' },
    ],
  });
  return r === true;
}
