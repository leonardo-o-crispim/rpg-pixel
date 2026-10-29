/**
 * render/cenario.js - Cenarios em camadas (parallax) gerados a partir de um
 * TEMA, que e dado (data/regioes.js). A mesma funcao desenha bosque,
 * pantano, mina, picos ou a vila do Hub.
 *
 *   tema = {
 *     semente, ceu: ['#topo', ..., '#horizonte'], estrelas?, lua?, sol?,
 *     camadas: [{ tipo, cor, realce?, base, altura, vel, densidade?, neve?, janela? }],
 *     chao: { altura, cor, cor2, borda, trilha, trilha2, flores? },
 *   }
 *   base/altura: fracao da altura da cena.
 *   vel: quanto a camada anda em relacao ao chao (0 parada, 1 junto do chao).
 *
 * Toda camada e PERIODICA na largura W: o que sai por um lado entra pelo
 * outro, entao o cenario rola infinitamente sem emenda enquanto o heroi anda.
 */

import { criarRng } from '../core/rng.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

function hexParaRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
const rgbParaCss = ([r, g, b]) => `rgb(${r | 0},${g | 0},${b | 0})`;
const misturar = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function novoCanvas(w, h) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  return cv;
}

/** Desenha nas tres copias (x-W, x, x+W) para a camada emendar sozinha. */
const repetir = (W, fn) => { fn(-W); fn(0); fn(W); };

function disco(ctx, cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    const meia = Math.round(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(Math.round(cx - meia), Math.round(cy + dy), meia * 2 + 1, 1);
  }
}

/** Perfil periodico em W: soma de senos com frequencias inteiras. */
function perfil(W, rng, ondas = [1, 2, 3]) {
  const termos = ondas.map((k, i) => ({ k, fase: rng.next() * 6.28, a: 1 / (i + 1) }));
  const soma = termos.reduce((s, t) => s + t.a, 0);
  return (x) => termos.reduce((s, t) => s + Math.sin((x / W) * Math.PI * 2 * t.k + t.fase) * t.a, 0) / soma;
}

/** Brilho de 1px em todo pixel cheio que tem ar logo acima (topo da silhueta). */
function realcarTopo(cv, cor) {
  const ctx = cv.getContext('2d');
  const { width: w, height: h } = cv;
  const dados = ctx.getImageData(0, 0, w, h).data;
  ctx.fillStyle = cor;
  for (let y = 1; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (dados[(y * w + x) * 4 + 3] > 0 && dados[((y - 1) * w + x) * 4 + 3] === 0) ctx.fillRect(x, y, 1, 1);
    }
  }
}

// --------------------------------------------------------------------- ceu

function desenharCeu(ctx, w, h, cores, bandas = 8) {
  const rgb = cores.map(hexParaRgb);
  const paleta = [];
  for (let i = 0; i < bandas; i++) {
    const pos = (i / (bandas - 1)) * (rgb.length - 1);
    const j = Math.min(rgb.length - 2, Math.floor(pos));
    paleta.push(rgbParaCss(misturar(rgb[j], rgb[j + 1], pos - j)));
  }
  for (let y = 0; y < h; y++) {
    const pos = (y / Math.max(1, h - 1)) * (bandas - 1);
    const j = Math.floor(pos);
    const f = pos - j;
    for (let x = 0; x < w; x++) {
      ctx.fillStyle = paleta[f > BAYER[(y % 4) * 4 + (x % 4)] ? Math.min(bandas - 1, j + 1) : j];
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

// ----------------------------------------------------------------- camadas

const CAMADAS = {
  nuvens(ctx, W, H, c, rng) {
    const n = c.densidade ?? 4;
    for (let i = 0; i < n; i++) {
      const x0 = (i / n) * W + rng.int(0, Math.round(W / n / 2));
      const y0 = Math.round(H * (0.08 + rng.next() * 0.22));
      const bolhas = rng.int(3, 5);
      const r0 = rng.int(3, 5);
      repetir(W, (dx) => {
        ctx.fillStyle = c.cor;
        for (let b = 0; b < bolhas; b++) disco(ctx, x0 + dx + b * r0 * 1.3, y0 - (b % 2) * r0 * 0.6, r0 + (b === 1 ? 2 : 0));
        ctx.fillStyle = c.sombra ?? c.cor;
        ctx.fillRect(Math.round(x0 + dx - r0), y0 + r0 - 1, Math.round(bolhas * r0 * 1.3 + r0), 2);
      });
    }
  },
  montanhas(ctx, W, H, c, rng) {
    const p = perfil(W, rng, [2, 3, 5]);
    const base = Math.round(H * c.base);
    for (let x = 0; x < W; x++) {
      const topo = Math.round(base - H * c.altura * (0.55 + 0.45 * p(x)));
      ctx.fillStyle = c.cor;
      ctx.fillRect(x, topo, 1, H - topo);
      if (c.neve) {
        ctx.fillStyle = c.neve;
        ctx.fillRect(x, topo, 1, Math.max(1, Math.round((base - topo) * 0.22)));
      }
    }
  },
  colinas(ctx, W, H, c, rng) {
    const p = perfil(W, rng, [1, 2]);
    const base = Math.round(H * c.base);
    ctx.fillStyle = c.cor;
    for (let x = 0; x < W; x++) {
      const topo = Math.round(base - H * c.altura * (0.5 + 0.5 * p(x)));
      ctx.fillRect(x, topo, 1, H - topo);
    }
  },
  arvores(ctx, W, H, c, rng) {
    const base = Math.round(H * c.base);
    ctx.fillStyle = c.cor;
    ctx.fillRect(0, base - 1, W, H);
    const passo = c.densidade ?? 12;
    for (let x = rng.int(0, passo); x < W; x += Math.round(passo * (0.7 + rng.next() * 0.6))) {
      const r = Math.max(3, Math.round(H * c.altura * (0.22 + rng.next() * 0.12)));
      const cy = base - Math.round(H * c.altura * 0.62);
      repetir(W, (dx) => {
        ctx.fillStyle = c.tronco ?? c.cor;
        ctx.fillRect(x + dx - 1, cy, 3, base - cy);
        ctx.fillStyle = c.cor;
        disco(ctx, x + dx, cy, r);
        disco(ctx, x + dx - r * 0.7, cy + r * 0.45, Math.round(r * 0.72));
        disco(ctx, x + dx + r * 0.7, cy + r * 0.45, Math.round(r * 0.72));
      });
    }
  },
  pinheiros(ctx, W, H, c, rng) {
    const base = Math.round(H * c.base);
    ctx.fillStyle = c.cor;
    ctx.fillRect(0, base - 1, W, H);
    const passo = c.densidade ?? 8;
    for (let x = rng.int(0, passo); x < W; x += Math.round(passo * (0.7 + rng.next() * 0.6))) {
      const alt = Math.round(H * c.altura * (0.6 + rng.next() * 0.4));
      repetir(W, (dx) => {
        for (let y = 0; y < alt; y++) {
          const meia = Math.floor((y / alt) * alt * 0.3) + (y % 4 === 3 ? 1 : 0);
          ctx.fillRect(x + dx - meia, base - alt + y, meia * 2 + 1, 1);
        }
      });
    }
  },
  arbustos(ctx, W, H, c, rng) {
    const base = Math.round(H * c.base);
    ctx.fillStyle = c.cor;
    const passo = c.densidade ?? 14;
    for (let x = rng.int(0, passo); x < W; x += Math.round(passo * (0.6 + rng.next() * 0.8))) {
      const r = rng.int(2, Math.max(3, Math.round(H * c.altura)));
      repetir(W, (dx) => {
        disco(ctx, x + dx, base - r * 0.4, r);
        disco(ctx, x + dx + r, base - r * 0.2, Math.round(r * 0.7));
        ctx.fillRect(x + dx - r, base - Math.round(r * 0.4), r * 2 + 2, Math.round(r * 0.4) + 1);
      });
    }
  },
  casas(ctx, W, H, c, rng) {
    const base = Math.round(H * c.base);
    let x = rng.int(0, 6);
    while (x < W - 8) {
      const larg = rng.int(10, 16);
      const alt = Math.round(H * c.altura * (0.5 + rng.next() * 0.5));
      const janelas = [];
      for (let jy = base - alt + 3; jy < base - 3; jy += 5) janelas.push([jy, rng.chance(0.7), larg > 12 && rng.chance(0.6)]);
      const x0 = x;
      repetir(W, (dx) => {
        ctx.fillStyle = c.cor;
        ctx.fillRect(x0 + dx, base - alt, larg, H);
        ctx.fillStyle = c.telhado ?? c.cor;
        const meia = Math.ceil(larg / 2) + 1;
        for (let i = 0; i < meia; i++) ctx.fillRect(x0 + dx - 1 + i, base - alt - i, larg + 2 - i * 2, 1);
        if (c.janela) {
          ctx.fillStyle = c.janela;
          for (const [jy, a, b] of janelas) {
            if (a) ctx.fillRect(x0 + dx + 3, jy, 2, 2);
            if (b) ctx.fillRect(x0 + dx + larg - 5, jy, 2, 2);
          }
        }
      });
      x += larg + rng.int(3, 9);
    }
  },
  juncos(ctx, W, H, c, rng) {
    const base = Math.round(H * c.base);
    ctx.fillStyle = c.cor;
    for (let x = 0; x < W; x += rng.int(1, 3)) {
      const alt = Math.round(H * c.altura * (0.3 + rng.next() * 0.7));
      ctx.fillRect(x, base - alt, 1, H);
      if (c.ponta && rng.chance(0.3)) { ctx.fillStyle = c.ponta; ctx.fillRect(x, base - alt, 1, 2); ctx.fillStyle = c.cor; }
    }
  },
  estalactites(ctx, W, H, c, rng) {
    const topo = Math.round(H * c.base);
    ctx.fillStyle = c.cor;
    ctx.fillRect(0, 0, W, topo);
    let x = 0;
    while (x < W) {
      const larg = rng.int(3, 7);
      const alt = Math.round(H * c.altura * (0.3 + rng.next() * 0.7));
      for (let y = 0; y < alt; y++) {
        const meia = Math.max(0, Math.round((larg / 2) * (1 - y / alt)));
        ctx.fillRect(x + Math.floor(larg / 2) - meia, topo + y, meia * 2 || 1, 1);
      }
      x += larg + rng.int(0, 4);
    }
  },
  cristais(ctx, W, H, c, rng) {
    const base = Math.round(H * c.base);
    const passo = c.densidade ?? 18;
    for (let x = rng.int(0, passo); x < W; x += Math.round(passo * (0.6 + rng.next() * 0.8))) {
      const alt = rng.int(4, Math.round(H * c.altura));
      repetir(W, (dx) => {
        for (let y = 0; y < alt; y++) {
          const meia = Math.round(2 * (1 - Math.abs(y - alt * 0.6) / alt));
          ctx.fillStyle = y < alt * 0.3 ? (c.realce ?? c.cor) : c.cor;
          ctx.fillRect(x + dx - meia, base - alt + y, meia * 2 + 1, 1);
        }
      });
    }
  },
};

// -------------------------------------------------------------------- chao

/** Chao com grama atras, trilha de terra no meio (onde se pisa) e grama na frente. */
function desenharChao(ctx, W, H, chao, rng) {
  const topo = Math.round(H * (1 - chao.altura));
  const iniTrilha = topo + 4;
  const fimTrilha = H - 6;

  ctx.fillStyle = chao.cor;
  ctx.fillRect(0, topo, W, H - topo);
  // faixas verticais na grama: e o que deixa o movimento visivel ao rolar
  ctx.fillStyle = chao.cor2;
  for (let x = 0; x < W; x += 8) {
    ctx.fillRect(x, topo + 1, 4, iniTrilha - topo - 1);
    ctx.fillRect(x + 4, fimTrilha, 4, H - fimTrilha);
  }
  // borda de cima com tufos
  ctx.fillStyle = chao.borda;
  ctx.fillRect(0, topo, W, 1);
  for (let x = 0; x < W; x += rng.int(2, 4)) ctx.fillRect(x, topo - 1, 1, 1);

  // trilha
  ctx.fillStyle = chao.trilha;
  ctx.fillRect(0, iniTrilha, W, fimTrilha - iniTrilha);
  ctx.fillStyle = chao.trilha2;
  ctx.fillRect(0, iniTrilha, W, 1);
  for (let i = 0; i < W / 3; i++) {
    const x = rng.int(0, W - 1);
    const y = rng.int(iniTrilha + 2, fimTrilha - 2);
    ctx.fillRect(x, y, rng.chance(0.3) ? 2 : 1, 1);
  }
  // pedrinhas com brilho
  for (let i = 0; i < W / 22; i++) {
    const x = rng.int(0, W - 4);
    const y = rng.int(iniTrilha + 3, fimTrilha - 3);
    ctx.fillStyle = chao.trilha2;
    ctx.fillRect(x, y, 3, 2);
    ctx.fillStyle = chao.pedra ?? '#ffffff';
    ctx.fillRect(x, y, 2, 1);
  }
  // grama da frente invadindo a trilha
  ctx.fillStyle = chao.cor;
  for (let x = 0; x < W; x += rng.int(1, 3)) ctx.fillRect(x, fimTrilha - rng.int(1, 2), 1, 3);
  // flores
  const flores = chao.flores ?? [];
  for (let i = 0; flores.length && i < W / 10; i++) {
    const x = rng.int(0, W - 1);
    const y = rng.chance(0.5) ? rng.int(topo + 1, iniTrilha - 2) : rng.int(fimTrilha + 1, H - 2);
    ctx.fillStyle = chao.borda;
    ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillStyle = flores[i % flores.length];
    ctx.fillRect(x, y, 1, 1);
  }
  return { chaoY: topo, peY: Math.round((iniTrilha + fimTrilha) / 2) + 3 };
}

// ------------------------------------------------------------------ montagem

/** Gera o ceu fixo e cada camada separada (para o parallax). */
export function gerarCamadas(W, H, tema) {
  const rng = criarRng(tema.semente ?? 1);
  const ceu = novoCanvas(W, H);
  const cctx = ceu.getContext('2d');
  desenharCeu(cctx, W, H, tema.ceu);
  if (tema.estrelas) {
    for (let i = 0; i < tema.estrelas; i++) {
      cctx.fillStyle = rng.chance(0.3) ? '#ffffff' : 'rgba(255,255,255,0.55)';
      cctx.fillRect(rng.int(0, W - 1), rng.int(0, Math.floor(H * 0.5)), 1, 1);
    }
  }
  for (const [cor, fx, fy, r] of [[tema.lua, 0.8, 0.16, 5], [tema.sol, 0.82, 0.18, 6]]) {
    if (!cor) continue;
    cctx.fillStyle = cor;
    disco(cctx, Math.round(W * fx), Math.round(H * fy), r);
  }

  const camadas = (tema.camadas ?? []).map((c) => {
    const cv = novoCanvas(W, H);
    CAMADAS[c.tipo]?.(cv.getContext('2d'), W, H, c, rng);
    if (c.realce && c.tipo !== 'nuvens' && c.tipo !== 'cristais') realcarTopo(cv, c.realce);
    return { canvas: cv, vel: c.vel ?? 0.3, deriva: c.deriva ?? (c.tipo === 'nuvens' ? 3 : 0) };
  });

  const chaoCv = novoCanvas(W, H);
  const medidas = desenharChao(chaoCv.getContext('2d'), W, H, tema.chao, rng);
  camadas.push({ canvas: chaoCv, vel: 1, deriva: 0 });
  return { W, H, ceu, camadas, ...medidas };
}

/**
 * Desenha o cenario com o chao deslocado `andado` pixels.
 * `t` (ms) move as camadas com deriva propria (nuvens) mesmo parado.
 */
export function desenharCenario(ctx, cen, andado = 0, t = 0) {
  ctx.drawImage(cen.ceu, 0, 0);
  for (const c of cen.camadas) {
    const desloc = andado * c.vel + (t / 1000) * c.deriva;
    const x = -Math.round(((desloc % cen.W) + cen.W) % cen.W);
    ctx.drawImage(c.canvas, x, 0);
    ctx.drawImage(c.canvas, x + cen.W, 0);
  }
}

/** Cenario "achatado" num canvas so (miniaturas do Mapa). */
export function gerarCenario(W, H, tema) {
  const cen = gerarCamadas(W, H, tema);
  const cv = novoCanvas(W, H);
  desenharCenario(cv.getContext('2d'), cen, 0, 0);
  return { canvas: cv, chaoY: cen.chaoY, peY: cen.peY };
}
