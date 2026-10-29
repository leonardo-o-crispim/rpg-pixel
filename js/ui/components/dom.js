/**
 * ui/components/dom.js - Construcao de elementos sem framework.
 *
 *   h('button', { class: 'btn', onClick: fn }, 'Texto', filho2)
 *
 * Atributos `on*` viram addEventListener; `class` aceita string ou lista
 * (itens falsos sao ignorados); `style` aceita objeto; `dataset` aceita
 * objeto. Filhos nulos/false sao ignorados, o que permite `cond && h(...)`.
 */

export function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') {
      el.className = Array.isArray(v) ? v.filter(Boolean).join(' ') : v;
    } else if (k === 'style' && typeof v === 'object') {
      for (const [prop, valor] of Object.entries(v)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, valor); // variavel CSS
        else el.style[prop] = valor;
      }
    } else if (k === 'dataset') {
      Object.assign(el.dataset, v);
    } else if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'html') {
      el.innerHTML = v;
    } else if (v === true) {
      el.setAttribute(k, '');
    } else {
      el.setAttribute(k, v);
    }
  }
  anexar(el, filhos);
  return el;
}

function anexar(el, filhos) {
  for (const f of filhos) {
    if (f == null || f === false) continue;
    if (Array.isArray(f)) anexar(el, f);
    else el.append(f instanceof Node ? f : String(f));
  }
}

/** Troca todo o conteudo de um elemento. */
export function trocar(el, ...filhos) {
  el.replaceChildren();
  anexar(el, filhos);
  return el;
}

/** 1234567 -> "1.234.567" */
export const fmt = (n) => Math.round(n).toLocaleString('pt-BR');

/** Vibra curto se o aparelho suportar e o jogador nao desligou. */
export function vibrar(ms, permitido = true) {
  // o navegador bloqueia (e reclama no console) antes do primeiro toque na pagina
  if (!permitido || navigator.userActivation?.hasBeenActive === false) return;
  try { navigator.vibrate?.(ms); } catch { /* sem suporte */ }
}
