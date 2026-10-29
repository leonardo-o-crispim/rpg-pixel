/**
 * render/pixel.js - Transforma as matrizes de data/sprites.js em canvas.
 *
 * Cada sprite e montado uma vez (1 pixel = 1 pixel) e guardado em cache,
 * junto com as variacoes usadas no combate: espelhado e "clarao" (silhueta
 * branca do golpe). Ampliar e trabalho de quem desenha, sempre com
 * imageSmoothing desligado.
 */

import { SPRITES } from '../data/sprites.js';
import { ICONES, PALETA_BASE } from '../data/icones.js';

const DEFS = { ...ICONES, ...SPRITES };
const cache = new Map();

function hexParaRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function linhasDe(def) {
  if (!def.simetrico) return def.linhas;
  return def.linhas.map((l) => l + [...l].reverse().join(''));
}

/**
 * Monta o sprite 1:1. Com `contorno`, ganha 1px de margem e todo pixel
 * transparente vizinho (em cruz) de um pixel cheio vira contorno: e o traco
 * grosso e arredondado do estilo chibi, sem precisar desenha-lo a mao.
 */
function montar(id, tinta = null) {
  const def = DEFS[id];
  if (!def) throw new Error(`[pixel] sprite desconhecido: ${id}`);
  const linhas = linhasDe(def);
  const w0 = Math.max(...linhas.map((l) => l.length));
  const h0 = linhas.length;
  if (linhas.some((l) => l.length !== w0)) console.warn(`[pixel] ${id}: linhas com larguras diferentes`);

  const cores = { ...PALETA_BASE, ...def.cores, ...(tinta ?? {}) };
  const rgb = Object.fromEntries(Object.entries(cores).map(([k, v]) => [k, hexParaRgb(v)]));
  const m = def.contorno ? 1 : 0;
  const w = w0 + m * 2;
  const h = h0 + m * 2;

  const cheio = new Uint8Array(w * h);
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  const pintar = (x, y, c) => {
    const i = (y * w + x) * 4;
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = 255;
  };
  linhas.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x++) {
      const c = rgb[linha[x]];
      if (!c) continue;
      pintar(x + m, y + m, c);
      cheio[(y + m) * w + x + m] = 1;
    }
  });
  if (def.contorno) {
    const c = hexParaRgb(def.contorno);
    const em = (x, y) => x >= 0 && y >= 0 && x < w && y < h && cheio[y * w + x];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!cheio[y * w + x] && (em(x - 1, y) || em(x + 1, y) || em(x, y - 1) || em(x, y + 1))) pintar(x, y, c);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/**
 * Variacao em cache. flags: espelhar, flash (silhueta branca), sombra
 * (silhueta escura), tinta ({ letra: '#cor' } que substitui cores do sprite;
 * e assim que um icone de item muda de material e de raridade).
 */
export function sprite(id, { espelhar = false, flash = false, sombra = false, tinta = null } = {}) {
  const chaveTinta = tinta ? JSON.stringify(tinta) : '';
  const chave = `${id}|${espelhar ? 1 : 0}${flash ? 1 : 0}${sombra ? 1 : 0}|${chaveTinta}`;
  let cv = cache.get(chave);
  if (cv) return cv;

  if (!espelhar && !flash && !sombra) {
    cv = montar(id, tinta);
  } else {
    const base = sprite(id, { tinta });
    cv = document.createElement('canvas');
    cv.width = base.width;
    cv.height = base.height;
    const ctx = cv.getContext('2d');
    if (espelhar) { ctx.translate(cv.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (flash || sombra) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = flash ? '#ffffff' : '#000000';
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
  }
  cache.set(chave, cv);
  return cv;
}

export function dimensoes(id) {
  const cv = sprite(id);
  return { w: cv.width, h: cv.height };
}

/** Desenha com o canto superior esquerdo em (x,y), arredondado ao pixel. */
export function desenharSprite(ctx, id, x, y, opcoes = {}) {
  const { alpha = 1, ...flags } = opcoes;
  const cv = sprite(id, flags);
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(cv, Math.round(x), Math.round(y));
  if (alpha < 1) ctx.globalAlpha = 1;
}

/** Canvas novo para usar no HTML, ampliado por CSS (nitido em qualquer DPI). */
export function iconeSprite(id, escala = 2, opcoes = {}) {
  const origem = sprite(id, opcoes);
  const cv = document.createElement('canvas');
  cv.width = origem.width;
  cv.height = origem.height;
  cv.getContext('2d').drawImage(origem, 0, 0);
  cv.className = 'sprite';
  cv.style.width = `${origem.width * escala}px`;
  cv.style.height = `${origem.height * escala}px`;
  cv.setAttribute('aria-hidden', 'true');
  return cv;
}
