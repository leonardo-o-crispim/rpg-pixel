/**
 * render/cena.js - A cena de combate desenhada em canvas de baixa resolucao.
 *
 * So desenha: recebe ordens ("este atacou aquele", "aquele levou 12") e
 * anima. Nao conhece regras, formulas nem o estado do jogo. Todo o tempo
 * aqui e TEMPO DE CENA (ms), que a tela avanca ja multiplicado pela
 * velocidade escolhida (1x/2x/4x).
 *
 * Entre ondas o heroi CAMINHA: o cenario rola em parallax e os inimigos
 * chegam presos ao chao, como se o heroi fosse ate eles.
 */

import { dimensoes, desenharSprite, sprite } from './pixel.js';
import { gerarCamadas, desenharCenario } from './cenario.js';
import { desenharTexto } from './fonte.js';
import { STATUS, ELEMENTOS } from '../data/habilidades.js';

export const ALTURA_CENA = 100;
export const LARGURA_MIN = 120; // largura logica minima; define a escala inteira

const DUR_ATAQUE = 300;     // ida, golpe e volta
const IMPACTO = 0.42;       // fracao da animacao em que o golpe acerta
const DUR_PROJETIL = 170;
const DUR_MORTE = 520;
export const DUR_ANDAR = 800;
const DUR_BAU = 900;
const VEL_ANDAR = 72;       // px de cena por segundo enquanto caminha

const COR_DANO_HEROI = '#ff5a5a';
const COR_DANO_INIMIGO = '#ffffff';
const COR_CRITICO = '#ffd23a';
const COR_CURA = '#7aff6a';
const CONTORNO = '#2a1830';

const ease = (p) => 1 - (1 - p) * (1 - p);

export class CenaCombate {
  constructor(canvas, tema, { numeros = true } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tema = tema;
    this.numeros = numeros;
    this.t = 0;
    this.W = 125;
    this.H = ALTURA_CENA;
    this.escala = 3;
    this.cen = null;
    this.peY = 86;
    this.andado = 0;
    this.andarFim = 0;
    this.atores = new Map();
    this.textos = [];
    this.particulas = [];
    this.projeteis = [];
    this.avisos = [];
    this.baus = [];
    this.tremorAte = 0;
    this.chefeUid = null;
    this.ultimaLargura = 0;
  }

  /** Ajusta a resolucao logica a largura disponivel (escala inteira). */
  ajustar(larguraCss) {
    if (larguraCss === this.ultimaLargura) return;
    this.ultimaLargura = larguraCss;
    this.escala = Math.max(2, Math.floor(larguraCss / LARGURA_MIN));
    this.W = Math.floor(larguraCss / this.escala);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.canvas.style.width = `${this.W * this.escala}px`;
    this.canvas.style.height = `${this.H * this.escala}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.cen = gerarCamadas(this.W, this.H, this.tema);
    this.peY = this.cen.peY;
    this._reposicionar();
  }

  get andando() { return this.t < this.andarFim; }

  atualizar(dt) {
    this.t += dt;
    const s = dt / 1000;
    if (this.andando) {
      this.andado += VEL_ANDAR * s;
      const h = this.atores.get('h');
      if (h && Math.random() < dt / 90) {
        this.particulas.push({ x: h.x - 4, y: this.peY - 1, vx: -20 - Math.random() * 20, vy: -12, g: 30, cor: 'rgba(255,255,255,0.7)', tam: 1, fim: this.t + 300 });
      }
    }
    for (const p of this.particulas) {
      p.vx *= 0.98;
      p.vy += p.g * s;
      p.x += p.vx * s;
      p.y += p.vy * s;
    }
    this.particulas = this.particulas.filter((p) => this.t < p.fim);
    this.textos = this.textos.filter((x) => this.t < x.t0 + x.dur);
    this.avisos = this.avisos.filter((a) => this.t < a.t0 + a.dur);
    this.projeteis = this.projeteis.filter((pr) => this.t < pr.t0 + pr.dur);
    this.baus = this.baus.filter((b) => this.t < b.t0 + DUR_BAU);
    for (const [uid, a] of this.atores) if (a.morto && this.t > a.morteT0 + DUR_MORTE) this.atores.delete(uid);
  }

  // -------------------------------------------------------------- ordens

  definirHeroi(r) {
    const { w, h } = dimensoes(r.sprite);
    this.atores.set(r.uid, this._ator(r, w, h));
    this._reposicionar();
  }

  /** O heroi caminha ate a proxima onda; os inimigos chegam com o chao. */
  entrarOnda(retratos, chefe) {
    for (const [uid, a] of this.atores) if (a.lado !== 'heroi') this.atores.delete(uid);
    this.chefeUid = null;
    this.andarFim = this.t + DUR_ANDAR;
    retratos.forEach((r, i) => {
      const { w, h } = dimensoes(r.sprite);
      const a = this._ator(r, w, h);
      a.slot = i;
      this.atores.set(r.uid, a);
      if (r.chefe) this.chefeUid = r.uid;
    });
    this._reposicionar();
    if (chefe) this.tremorAte = this.andarFim + 350;
  }

  /**
   * Comeca a animacao de acao e devolve em quantos ms o golpe acerta.
   * A distancia: um projetil por alvo, na cor do elemento (magia vira orbe).
   */
  acao({ ator: uid, alvos, alcance, especial, nome, elemento, magico }) {
    const a = this.atores.get(uid);
    if (!a) return 0;
    const alvo = this.atores.get(alvos[0]);
    const cor = elemento && elemento !== 'fisico' ? (ELEMENTOS[elemento]?.cor ?? '#fff4d8') : '#fff4d8';
    if (especial && nome) this.texto(uid, nome.toUpperCase(), '#ffe08a', { cima: true, dur: 800 });
    if (alcance === 'distancia' && alvo && alvo !== a) {
      a.anim = { tipo: 'recuo', t0: this.t, dur: 220, dx: a.lado === 'heroi' ? -3 : 3 };
      const orbe = magico || a.id === 'mago';
      if (orbe) this._faiscas(a.x + (a.lado === 'heroi' ? 6 : -6), a.pesY - a.h * 0.6, 6, [cor, '#ffffff'], -30);
      alvos.forEach((id, i) => {
        this.projeteis.push({ de: uid, para: id, t0: this.t + 60 + i * 40, dur: DUR_PROJETIL, cor, orbe });
      });
      return 60 + DUR_PROJETIL;
    }
    if (!alvo || alvo === a) {
      a.anim = { tipo: 'pulo', t0: this.t, dur: 260 };
      this._faiscas(a.x, a.pesY - a.h * 0.5, 10, [cor === '#fff4d8' ? '#ffe08a' : cor, '#ffffff'], -50);
      return 140;
    }
    const lado = a.lado === 'heroi' ? 1 : -1;
    const distancia = Math.abs(alvo.x - a.x) - (alvo.w + a.w) / 2 + 3;
    a.anim = { tipo: 'avanco', t0: this.t, dur: DUR_ATAQUE, dx: lado * Math.max(4, distancia * 0.9) };
    return DUR_ATAQUE * IMPACTO;
  }

  dano({ alvo: uid, valor, critico, fraco, resistido, bloqueado, elemento, status, vida }) {
    const a = this.atores.get(uid);
    if (!a) return;
    if (vida != null) a.vida = vida;
    a.flashAte = this.t + 90;
    a.tremor = { t0: this.t, dur: critico ? 220 : 150, forca: critico ? 2 : 1 };
    a.empurrao = { t0: this.t, dx: a.lado === 'heroi' ? -2 : 2 };
    if (critico) { this.tremorAte = this.t + 160; this.clarao('#ffffff', 80, 0.18); }
    const cor = status ? STATUS[status]?.cor
      : critico ? COR_CRITICO
        : a.lado === 'heroi' ? COR_DANO_HEROI : COR_DANO_INIMIGO;
    if (this.numeros) {
      this.texto(uid, critico ? `${valor}!` : String(valor), cor, { escala: critico ? 2 : 1, pulo: true });
      if (bloqueado) this.texto(uid, 'BLOQUEIO', '#9ad8ff', { atraso: 80, deslocY: -8 });
      else if (fraco) this.texto(uid, 'FRACO', '#ffa040', { atraso: 120, deslocY: -8 });
      else if (resistido) this.texto(uid, 'RESISTE', '#c8c8d8', { atraso: 120, deslocY: -8 });
    }
    const corParticula = status ? STATUS[status]?.cor : (ELEMENTOS[elemento]?.cor ?? '#ffffff');
    this._faiscas(a.x, a.pesY - a.h * 0.55, critico ? 12 : 7, [corParticula, '#ffe08a', '#ffffff']);
  }

  esquiva(uid) {
    const a = this.atores.get(uid);
    if (!a) return;
    a.anim = { tipo: 'esquiva', t0: this.t, dur: 260, dx: a.lado === 'heroi' ? -6 : 6 };
    if (this.numeros) this.texto(uid, 'ESQUIVA', '#e0e8ff');
  }

  cura(uid, valor, vida) {
    const a = this.atores.get(uid);
    if (!a) return;
    if (vida != null) a.vida = vida;
    if (valor > 0 && this.numeros) this.texto(uid, `+${valor}`, COR_CURA, { pulo: true });
    this._faiscas(a.x, a.pesY - a.h * 0.5, 8, [COR_CURA, '#d8ffd0'], -40);
  }

  statusLigado(uid, id) { this.atores.get(uid)?.status.add(id); }
  statusDesligado(uid, id) { this.atores.get(uid)?.status.delete(id); }
  limparStatus(uid) { this.atores.get(uid)?.status.clear(); }

  morte(uid, { ouro = 0 } = {}) {
    const a = this.atores.get(uid);
    if (!a) return;
    a.morto = true;
    a.morteT0 = this.t;
    a.vida = 0;
    if (a.lado === 'heroi') return;
    if (a.slot < 0) this._reposicionar(); // lacaio caiu: a frente se reorganiza
    // fumacinha
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      this.particulas.push({
        x: a.x, y: a.pesY - a.h * 0.45, vx: Math.cos(ang) * 40, vy: Math.sin(ang) * 30 - 10,
        g: -20, cor: i % 2 ? '#ffffff' : '#e8e0f0', tam: 2, fim: this.t + 380,
      });
    }
    // moedas saltando
    for (let i = 0; i < Math.min(8, 2 + Math.floor(ouro / 4)); i++) {
      this.particulas.push({
        x: a.x, y: a.pesY - a.h * 0.5, vx: (Math.random() - 0.5) * 70, vy: -70 - Math.random() * 60,
        g: 280, cor: i % 2 ? '#ffcf3f' : '#fff0a0', tam: 2, fim: this.t + 700,
      });
    }
  }

  /** Bau que salta do monstro derrotado, com brilho na cor da raridade. */
  drop(uid, cor) {
    const a = this.atores.get(uid);
    if (!a) return;
    this.baus.push({ x: a.x, y: a.pesY, t0: this.t, cor });
    this.texto(uid, 'ITEM!', cor, { cima: true, dur: 900, pulo: true });
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      this.particulas.push({
        x: a.x, y: a.pesY - 8, vx: Math.cos(ang) * 45, vy: Math.sin(ang) * 45 - 25,
        g: 40, cor: i % 2 ? cor : '#ffffff', tam: 1, fim: this.t + 600,
      });
    }
  }

  /** Atualiza os numeros de um ator sem animar (ex.: subiu de nivel). */
  retrato(r) {
    const a = this.atores.get(r.uid);
    if (a) { a.vida = r.vida; a.vidaMax = r.vidaMax; }
  }

  nivelSubiu(uid, nivel) {
    const a = this.atores.get(uid);
    if (!a) return;
    this.clarao('#ffe08a', 260, 0.35);
    this.texto(uid, `NIVEL ${nivel}!`, '#ffe08a', { cima: true, dur: 1200, pulo: true });
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      this.particulas.push({
        x: a.x, y: a.pesY - a.h * 0.5, vx: Math.cos(ang) * 55, vy: Math.sin(ang) * 55 - 20,
        g: 0, cor: i % 2 ? '#ffe08a' : '#ffffff', tam: 1, fim: this.t + 650,
      });
    }
  }

  /** Faixa de texto grande no meio da cena (ONDA 2/4, CHEFE!, VITORIA). */
  aviso(texto, cor = '#ffffff', dur = 900, { linha = 0 } = {}) {
    this.avisos.push({ texto, cor, t0: this.t, dur, linha });
  }

  /** Clarao rapido da tela inteira (critico, nivel). */
  clarao(cor = '#ffffff', dur = 90, forca = 0.3) {
    this.flash = { cor, t0: this.t, dur, forca };
  }

  texto(uid, texto, cor, { escala = 1, cima = false, dur = 700, atraso = 0, deslocY = 0, pulo = false } = {}) {
    const a = this.atores.get(uid);
    if (!a) return;
    this.textos.push({
      x: a.x + (cima ? 0 : (Math.random() - 0.5) * 8),
      y: a.pesY - a.h - (cima ? 10 : 0) + deslocY,
      texto, cor, escala, t0: this.t + atraso, dur, pulo,
    });
  }

  // -------------------------------------------------------------- desenho

  desenhar() {
    const { ctx, W, H } = this;
    if (!this.cen) return;
    ctx.save();
    if (this.t < this.tremorAte && !this.andando) {
      ctx.translate(Math.round((Math.random() - 0.5) * 3), Math.round((Math.random() - 0.5) * 2));
    }
    desenharCenario(ctx, this.cen, this.andado, this.t);

    const lista = [...this.atores.values()].sort((a, b) => a.pesY - b.pesY);
    for (const a of lista) this._desenharAtor(a);
    for (const pr of this.projeteis) this._desenharProjetil(pr);
    for (const b of this.baus) this._desenharBau(b);
    for (const p of this.particulas) {
      ctx.fillStyle = p.cor;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
    }
    if (!this.andando) {
      for (const a of lista) if (a.lado !== 'heroi' && !a.morto && a.uid !== this.chefeUid) this._barraVida(a);
    }
    for (const x of this.textos) {
      if (this.t < x.t0) continue;
      const p = (this.t - x.t0) / x.dur;
      const y = x.y - ease(Math.min(1, p * 1.6)) * 12;
      if (p > 0.8 && Math.floor(this.t / 60) % 2) continue; // pisca antes de sumir
      const escala = x.pulo && p < 0.12 ? x.escala + 1 : x.escala; // "pop" ao aparecer
      desenharTexto(ctx, x.texto, x.x, y, x.cor, { escala, contorno: CONTORNO });
    }
    this._barraChefe();
    for (const av of this.avisos) {
      const p = (this.t - av.t0) / av.dur;
      const y = Math.round(H * 0.3 + av.linha * 17 - (p < 0.15 ? (1 - p / 0.15) * 8 : 0));
      if (p > 0.85 && Math.floor(this.t / 60) % 2) continue;
      ctx.fillStyle = 'rgba(42,24,48,0.55)';
      ctx.fillRect(0, y - 3, W, av.linha ? 11 : 16);
      desenharTexto(ctx, av.texto, W / 2, y, av.cor, { escala: av.linha ? 1 : 2, contorno: CONTORNO });
    }
    if (this.flash) {
      const p = (this.t - this.flash.t0) / this.flash.dur;
      if (p >= 1) this.flash = null;
      else {
        ctx.globalAlpha = this.flash.forca * (1 - p);
        ctx.fillStyle = this.flash.cor;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  // -------------------------------------------------------------- internos

  _ator(r, w, h) {
    return {
      uid: r.uid, id: r.id, lado: r.lado, sprite: r.sprite, chefe: r.chefe, nome: r.nome, nivel: r.nivel,
      elastico: !!r.visual?.elastico,
      flutuar: !!r.visual?.flutuar,
      tinta: r.visual?.tinta ?? null,
      vida: r.vida, vidaMax: r.vidaMax, w, h, x: 0, pesY: 0, slot: 0,
      fase: Math.random() * 800, anim: null, tremor: null, empurrao: null, flashAte: 0,
      morto: false, morteT0: 0, status: new Set(),
    };
  }

  _reposicionar() {
    const pe = this.peY;
    const vivos = [...this.atores.values()].filter((a) => a.lado !== 'heroi' && !a.morto);
    const comChefe = vivos.some((a) => a.chefe);
    const comuns = vivos.filter((a) => !a.chefe).sort((a, b) => a.slot - b.slot);
    for (const a of this.atores.values()) {
      if (a.lado === 'heroi') { a.x = Math.round(this.W * 0.24); a.pesY = pe; continue; }
      if (a.chefe) { a.x = Math.round(this.W * 0.74); a.pesY = pe + 1; continue; }
      if (a.morto) continue;
      const n = comuns.length;
      const i = comuns.indexOf(a);
      // com chefe: lacaios/escolta ficam entre o heroi e ele
      const centro = comChefe ? this.W * 0.5 : this.W * 0.72;
      const largura = comChefe ? this.W * 0.22 : this.W * 0.44;
      const passo = Math.min(24, largura / Math.max(1, n));
      a.x = Math.round(centro - ((n - 1) * passo) / 2 + i * passo);
      a.pesY = pe + [0, 4, -3][i % 3];
    }
  }

  /** Lacaios invocados no meio da luta: surgem numa nuvem de fumaca. */
  adicionarInimigos(retratos) {
    const slotBase = Math.min(-1, ...[...this.atores.values()].map((a) => a.slot ?? 0)) - retratos.length;
    retratos.forEach((r, i) => {
      const { w, h } = dimensoes(r.sprite);
      const a = this._ator(r, w, h);
      a.slot = slotBase + i; // menor slot = mais perto do heroi
      a.anim = { tipo: 'pulo', t0: this.t, dur: 320 };
      this.atores.set(r.uid, a);
    });
    this._reposicionar();
    for (const r of retratos) {
      const a = this.atores.get(r.uid);
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2;
        this.particulas.push({
          x: a.x, y: a.pesY - a.h * 0.4, vx: Math.cos(ang) * 45, vy: Math.sin(ang) * 30 - 10,
          g: -10, cor: k % 2 ? '#e8e0f0' : '#b88aff', tam: 2, fim: this.t + 420,
        });
      }
    }
  }

  _deslocamento(a) {
    let dx = 0, dy = 0;
    // inimigos presos ao chao enquanto o heroi caminha
    if (a.lado !== 'heroi' && this.andando) dx += VEL_ANDAR * ((this.andarFim - this.t) / 1000) + a.slot * 6;
    const an = a.anim;
    if (an) {
      const p = (this.t - an.t0) / an.dur;
      if (p >= 1) a.anim = null;
      else if (an.tipo === 'avanco') {
        const f = p < IMPACTO ? ease(p / IMPACTO) : p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
        dx += an.dx * f;
        dy -= Math.sin(Math.min(1, p / IMPACTO) * Math.PI) * 3;
      } else if (an.tipo === 'recuo' || an.tipo === 'esquiva') {
        dx += an.dx * Math.sin(p * Math.PI);
        if (an.tipo === 'esquiva') dy -= Math.sin(p * Math.PI) * 4;
      } else if (an.tipo === 'pulo') {
        dy -= Math.sin(p * Math.PI) * 6;
      }
    }
    if (a.tremor) {
      const p = (this.t - a.tremor.t0) / a.tremor.dur;
      if (p >= 1) a.tremor = null;
      else dx += (Math.floor(this.t / 30) % 2 ? 1 : -1) * a.tremor.forca;
    }
    if (a.empurrao) {
      const p = (this.t - a.empurrao.t0) / 180;
      if (p >= 1) a.empurrao = null;
      else dx += a.empurrao.dx * (1 - p);
    }
    if (!a.morto && !a.anim) {
      if (a.lado === 'heroi' && this.andando) dy -= Math.floor((this.t + a.fase) / 110) % 2; // passo
      else if (a.flutuar) dy -= 4 + Math.round(Math.sin((this.t + a.fase) / 160) * 2);  // voo
      else if (!a.elastico && Math.floor((this.t + a.fase) / 420) % 2) dy -= 1;      // respiracao
    }
    return { dx, dy };
  }

  _desenharAtor(a) {
    const { ctx } = this;
    const { dx, dy } = this._deslocamento(a);
    let alpha = 1;
    if (a.morto) {
      if (a.lado !== 'heroi') return; // monstro some na fumaca
      const p = (this.t - a.morteT0) / DUR_MORTE;
      if (p < 0.6 && Math.floor(this.t / 50) % 2) return;
      alpha = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.4);
    }
    // elastico (gosmas): achata e estica no ritmo
    let w = a.w, h = a.h;
    if (a.elastico && !a.anim) {
      const f = Math.floor((this.t + a.fase) / 260) % 4;
      if (f === 1) { w += 2; h -= 2; } else if (f === 3) { w -= 1; h += 1; }
    }
    const x = Math.round(a.x + dx - w / 2);
    const y = Math.round(a.pesY + dy - h);

    // sombra no chao
    ctx.fillStyle = 'rgba(42,24,48,0.25)';
    const sw = Math.round(a.w * (a.flutuar ? 0.45 : 0.7));
    ctx.fillRect(Math.round(a.x + dx - sw / 2), a.pesY - 1, sw, 2);
    ctx.fillRect(Math.round(a.x + dx - sw / 2 + 2), a.pesY + 1, sw - 4, 1);

    const espelhar = a.lado !== 'heroi';
    const pintar = (flags, alfa) => {
      if (w === a.w && h === a.h) { desenharSprite(ctx, a.sprite, x, y, { ...flags, espelhar, tinta: a.tinta, alpha: alfa }); return; }
      ctx.globalAlpha = alfa;
      ctx.drawImage(sprite(a.sprite, { ...flags, espelhar, tinta: a.tinta }), x, y, w, h);
      ctx.globalAlpha = 1;
    };
    pintar({}, alpha);
    if (this.t < a.flashAte) pintar({ flash: true }, 0.85);
    if (a.status.has('furia') && Math.floor(this.t / 120) % 2) {
      ctx.globalCompositeOperation = 'lighter';
      pintar({}, 0.35);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (a.status.has('escudo')) this._anel(a, x, y, w, h, '#9ad8ff');
    if (a.status.has('atordoado')) {
      for (let k = 0; k < 3; k++) {
        const ang = this.t / 180 + (k * Math.PI * 2) / 3;
        ctx.fillStyle = k % 2 ? '#ffffff' : '#ffe14a';
        ctx.fillRect(Math.round(a.x + Math.cos(ang) * 6), Math.round(y - 4 + Math.sin(ang) * 2), 2, 2);
      }
    }
    // marcadores de status acima da cabeca
    let i = 0;
    for (const st of a.status) {
      ctx.fillStyle = CONTORNO;
      ctx.fillRect(Math.round(a.x - 6 + i * 5), Math.round(y - 8), 4, 4);
      ctx.fillStyle = STATUS[st]?.cor ?? '#fff';
      ctx.fillRect(Math.round(a.x - 5 + i * 5), Math.round(y - 7), 2, 2);
      i++;
    }
  }

  /** Anel pontilhado em volta do ator (escudo). */
  _anel(a, x, y, w, h, cor) {
    const { ctx } = this;
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = cor;
    for (let k = 0; k < 16; k++) {
      if ((k + Math.floor(this.t / 90)) % 3 === 0) continue;
      const ang = (k / 16) * Math.PI * 2;
      ctx.fillRect(Math.round(cx + Math.cos(ang) * (w / 2 + 2)), Math.round(cy + Math.sin(ang) * (h / 2 + 1)), 1, 1);
    }
  }

  _barraVida(a) {
    const { ctx } = this;
    const { dx } = this._deslocamento(a);
    const w = Math.max(14, Math.round(a.w * 0.8));
    const x = Math.round(a.x + dx - w / 2);
    const y = Math.round(a.pesY - a.h - 3);
    ctx.fillStyle = CONTORNO;
    ctx.fillRect(x - 1, y - 1, w + 2, 4);
    ctx.fillStyle = '#5a2a3a';
    ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = '#ff4f5a';
    ctx.fillRect(x, y, Math.round(w * Math.max(0, a.vida / a.vidaMax)), 2);
  }

  _barraChefe() {
    const a = this.atores.get(this.chefeUid);
    if (!a || a.morto || this.andando) return;
    const { ctx, W } = this;
    const w = Math.round(W * 0.74);
    const x = Math.round((W - w) / 2);
    const y = 5;
    desenharTexto(ctx, a.nome, W / 2, y, '#ffe08a', { contorno: CONTORNO });
    ctx.fillStyle = CONTORNO;
    ctx.fillRect(x - 1, y + 7, w + 2, 6);
    ctx.fillStyle = '#5a2a3a';
    ctx.fillRect(x, y + 8, w, 4);
    const v = Math.round(w * Math.max(0, a.vida / a.vidaMax));
    ctx.fillStyle = '#ff4f5a';
    ctx.fillRect(x, y + 8, v, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x, y + 8, v, 1);
  }

  _desenharBau(b) {
    const p = (this.t - b.t0) / DUR_BAU;
    const { w, h } = dimensoes('bau');
    const salto = Math.sin(Math.min(1, p / 0.45) * Math.PI) * 10; // pula e cai
    const y = b.y - h - salto;
    const alpha = p < 0.7 ? 1 : Math.max(0, 1 - (p - 0.7) / 0.3);
    // brilho da raridade atras do bau
    this.ctx.globalAlpha = alpha * (0.5 + 0.3 * Math.sin(this.t / 60));
    this.ctx.fillStyle = b.cor;
    this.ctx.fillRect(Math.round(b.x - w / 2 - 2), Math.round(y - 2), w + 4, h + 4);
    this.ctx.globalAlpha = 1;
    desenharSprite(this.ctx, 'bau', b.x - w / 2, y, { alpha });
  }

  _desenharProjetil(pr) {
    const de = this.atores.get(pr.de);
    const para = this.atores.get(pr.para);
    if (!de || !para || this.t < pr.t0) return;
    const p = Math.min(1, (this.t - pr.t0) / pr.dur);
    const x0 = de.x, y0 = de.pesY - de.h * 0.55;
    const x1 = para.x, y1 = para.pesY - para.h * 0.55;
    const x = x0 + (x1 - x0) * p;
    const y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * (pr.orbe ? 3 : 6);
    const { ctx } = this;
    if (pr.orbe) {
      ctx.fillStyle = CONTORNO;
      ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
      ctx.fillStyle = pr.cor;
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 3, 5);
      ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 5, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 1, 1);
      if (Math.random() < 0.6) {
        this.particulas.push({ x, y, vx: (x0 - x1) * 0.3, vy: (Math.random() - 0.5) * 20, g: 0, cor: pr.cor, tam: 1, fim: this.t + 180 });
      }
      return;
    }
    ctx.fillStyle = CONTORNO;
    ctx.fillRect(Math.round(x) - 3, Math.round(y) - 1, 7, 3);
    ctx.fillStyle = pr.cor;
    ctx.fillRect(Math.round(x) - 2, Math.round(y), 5, 1);
  }

  _faiscas(x, y, n, cores, vyBase = 0) {
    for (let i = 0; i < n; i++) {
      this.particulas.push({
        x, y,
        vx: (Math.random() - 0.5) * 120,
        vy: vyBase - Math.random() * 80,
        g: vyBase < 0 ? 0 : 220,
        cor: cores[i % cores.length],
        tam: 1,
        fim: this.t + 280 + Math.random() * 200,
      });
    }
  }
}
