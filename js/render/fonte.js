/**
 * render/fonte.js - Fonte bitmap 3x5 para textos dentro do canvas (numeros
 * de dano, avisos de nivel). A interface HTML usa fontes do sistema; so a
 * cena de combate desenha texto pixel a pixel.
 *
 * Cada glifo: 15 bits em 5 linhas de 3. Acentos sao removidos antes de
 * desenhar ("NÍVEL" vira "NIVEL").
 */

const G = {
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111',
  4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001111',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  '+': '000010111010000', '-': '000000111000000', '!': '010010010000010', '.': '000000000000010',
  ':': '000010000010000', '/': '001001010100100', '%': '101001010100101', ' ': '000000000000000',
  'x': '000101010101000',
};

const LARG = 3;
const ALT = 5;
const ESPACO = 1;

const limpar = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/×/g, 'x');

export function larguraTexto(texto, escala = 1) {
  const n = limpar(texto).length;
  return n ? (n * (LARG + ESPACO) - ESPACO) * escala : 0;
}

/**
 * Desenha texto com contorno de 1px (legivel sobre qualquer fundo).
 * x,y = centro horizontal / topo.
 */
export function desenharTexto(ctx, texto, x, y, cor, { escala = 1, contorno = '#000', alinhar = 'centro' } = {}) {
  const t = limpar(texto);
  const w = larguraTexto(t, escala);
  let x0 = Math.round(alinhar === 'centro' ? x - w / 2 : alinhar === 'direita' ? x - w : x);
  const y0 = Math.round(y);

  const pintar = (cx, cy, c) => {
    ctx.fillStyle = c;
    let px = cx;
    for (const ch of t) {
      const g = G[ch] ?? G[' '];
      for (let i = 0; i < 15; i++) {
        if (g[i] === '1') ctx.fillRect(px + (i % 3) * escala, cy + Math.floor(i / 3) * escala, escala, escala);
      }
      px += (LARG + ESPACO) * escala;
    }
  };

  if (contorno) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) pintar(x0 + dx, y0 + dy, contorno);
  }
  pintar(x0, y0, cor);
  return w;
}

export const ALTURA_FONTE = ALT;
