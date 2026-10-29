/**
 * audio/som.js - Sintetizador de efeitos e musica (Web Audio API).
 *
 * Toca os DADOS de data/sons.js; nenhum arquivo de audio entra no projeto
 * (o APK fica leve e funciona offline). O contexto so nasce no primeiro
 * toque/tecla (politica dos navegadores) e e suspenso quando o app vai para
 * segundo plano.
 *
 * A musica e agendada alguns decimos de segundo a frente (lookahead), para
 * nao depender da precisao de setTimeout.
 */

import { EFEITOS, MUSICAS, VINHETAS } from '../data/sons.js';

const ADIANTE = 0.25;        // segundos de musica agendados a frente
const INTERVALO_AGENDA = 60; // ms entre agendamentos
const INTERVALO_MIN_EFEITO = 0.045; // o mesmo efeito nao repete mais rapido que isso

const NOTAS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

/** "A#4" -> Hz (A4 = 440). */
function hz(nome) {
  const m = /^([A-G]#?)(-?\d)$/.exec(nome);
  if (!m) return 0;
  const semitom = NOTAS[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * 2 ** ((semitom - 69) / 12);
}

/** "C5 E5:2 - G5:4" -> [{ hz, colcheias }] (hz 0 = pausa). */
function lerNotas(texto) {
  return texto.split(/\s+/).filter((t) => t && t !== '|').map((t) => {
    const [n, d] = t.split(':');
    return { hz: n === '-' ? 0 : hz(n), colcheias: Number(d ?? 1) };
  });
}

class Som {
  constructor() {
    this.ctx = null;
    this.mestreEfeitos = null;
    this.mestreMusica = null;
    this.ruido = null;
    this.config = { musica: true, efeitos: true, volMusica: 0.6, volEfeitos: 0.8 };
    this.ultimos = new Map();     // efeito -> currentTime da ultima vez
    this.musicaAtual = null;      // { id, faixas: [{notas, i, proximo}], bateria, colcheia, timer }
    this.pendente = null;         // musica pedida antes do primeiro gesto
  }

  // ------------------------------------------------------------ ciclo de vida

  /** Liga o audio no primeiro gesto e o pausa/retoma com a visibilidade do app. */
  ligarNoPrimeiroGesto() {
    const acordar = () => {
      this._criar();
      document.removeEventListener('pointerdown', acordar);
      document.removeEventListener('keydown', acordar);
    };
    document.addEventListener('pointerdown', acordar);
    document.addEventListener('keydown', acordar);
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend().catch(() => {});
      else this.ctx.resume().catch(() => {});
    });
  }

  _criar() {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      // compressor na saida: em 4x varios golpes se somam e estourariam
      const limite = this.ctx.createDynamicsCompressor();
      limite.threshold.value = -14;
      limite.ratio.value = 8;
      limite.connect(this.ctx.destination);
      this.mestreEfeitos = this.ctx.createGain();
      this.mestreMusica = this.ctx.createGain();
      this.mestreEfeitos.connect(limite);
      this.mestreMusica.connect(limite);
      // 1 s de ruido branco, reaproveitado por todos os efeitos de ruido
      this.ruido = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.aplicarConfig(this.config);
      if (this.pendente) { const p = this.pendente; this.pendente = null; this.musica(p); }
      return true;
    } catch (e) {
      console.warn('[som] indisponivel', e);
      return false;
    }
  }

  /** config: { musica, efeitos, volMusica, volEfeitos } */
  aplicarConfig(config) {
    this.config = { ...this.config, ...config };
    if (!this.ctx) return;
    this.mestreEfeitos.gain.value = this.config.efeitos ? this.config.volEfeitos : 0;
    this.mestreMusica.gain.value = this.config.musica ? this.config.volMusica : 0;
    if (!this.config.musica) this._pararAgenda();
    else if (this.musicaAtual && !this.musicaAtual.timer) this._retomarAgenda();
  }

  // ----------------------------------------------------------------- efeitos

  tocar(id, { volume = 1 } = {}) {
    const def = EFEITOS[id];
    if (!def || !this.ctx || !this.config.efeitos) return;
    const agora = this.ctx.currentTime;
    if (agora - (this.ultimos.get(id) ?? -1) < INTERVALO_MIN_EFEITO) return;
    this.ultimos.set(id, agora);
    for (const c of def.camadas) this._camada(c, agora + (c.atraso ?? 0), volume, this.mestreEfeitos);
  }

  _camada(c, t0, volume, destino) {
    const ctx = this.ctx;
    const ganho = ctx.createGain();
    ganho.connect(destino);
    const vol = (c.vol ?? 0.1) * volume;

    if (c.onda === 'ruido') {
      const fonte = ctx.createBufferSource();
      fonte.buffer = this.ruido;
      let saida = fonte;
      if (c.filtro) {
        const f = ctx.createBiquadFilter();
        f.type = c.filtro[0];
        f.frequency.value = c.filtro[1];
        fonte.connect(f);
        saida = f;
      }
      saida.connect(ganho);
      this._envelope(ganho, t0, c.dur, vol);
      fonte.start(t0, Math.random() * 0.5);
      fonte.stop(t0 + c.dur + 0.05);
      return;
    }

    const osc = ctx.createOscillator();
    osc.type = c.onda;
    osc.connect(ganho);
    if (c.notas) {
      let t = t0;
      for (const [f, d] of c.notas) { osc.frequency.setValueAtTime(f, t); t += d; }
      this._envelope(ganho, t0, t - t0, vol);
      osc.start(t0);
      osc.stop(t + 0.05);
      return;
    }
    osc.frequency.setValueAtTime(c.de, t0);
    if (c.para) osc.frequency.exponentialRampToValueAtTime(Math.max(1, c.para), t0 + c.dur);
    this._envelope(ganho, t0, c.dur, vol);
    osc.start(t0);
    osc.stop(t0 + c.dur + 0.05);
  }

  _envelope(ganho, t0, dur, vol) {
    const g = ganho.gain;
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.006);
    g.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.02, dur));
  }

  // ------------------------------------------------------------------ musica

  /** Troca a musica de fundo (repetir o id atual nao reinicia). */
  musica(id) {
    if (!this.ctx) { this.pendente = id; return; }
    if (this.musicaAtual?.id === id) return;
    this.pararMusica();
    const def = MUSICAS[id];
    if (!def) return;
    const colcheia = 60 / def.bpm / 2;
    this.musicaAtual = {
      id, colcheia,
      faixas: def.vozes.map((v) => ({ ...v, notas: lerNotas(v.notas), i: 0, proximo: 0 })),
      bateria: def.bateria ?? '', passoBateria: 0, proximoBateria: 0,
      timer: null,
    };
    if (this.config.musica) this._retomarAgenda();
  }

  pararMusica() {
    this._pararAgenda();
    this.musicaAtual = null;
  }

  /** Vinheta curta (vitoria, derrota, nivel); para a musica. */
  vinheta(id) {
    const def = VINHETAS[id];
    if (!def || !this.ctx || !this.config.efeitos) return;
    this.pararMusica();
    const colcheia = 60 / def.bpm / 2;
    const t0 = this.ctx.currentTime + 0.05;
    for (const v of def.vozes) {
      let t = t0;
      for (const n of lerNotas(v.notas)) {
        if (n.hz) this._camada({ onda: v.onda, de: n.hz, dur: n.colcheias * colcheia * 0.95, vol: v.vol * 1.6 }, t, 1, this.mestreEfeitos);
        t += n.colcheias * colcheia;
      }
    }
  }

  _retomarAgenda() {
    const m = this.musicaAtual;
    if (!m || m.timer) return;
    const inicio = this.ctx.currentTime + 0.08;
    for (const f of m.faixas) f.proximo = Math.max(f.proximo, inicio);
    m.proximoBateria = Math.max(m.proximoBateria, inicio);
    const agendar = () => {
      const limite = this.ctx.currentTime + ADIANTE;
      for (const f of m.faixas) {
        while (f.proximo < limite) {
          const n = f.notas[f.i];
          const dur = n.colcheias * m.colcheia;
          if (n.hz) this._camada({ onda: f.onda, de: n.hz, dur: dur * 0.9, vol: f.vol }, f.proximo, 1, this.mestreMusica);
          f.proximo += dur;
          f.i = (f.i + 1) % f.notas.length;
        }
      }
      if (m.bateria) {
        while (m.proximoBateria < limite) {
          this._batida(m.bateria[m.passoBateria], m.proximoBateria);
          m.proximoBateria += m.colcheia;
          m.passoBateria = (m.passoBateria + 1) % m.bateria.length;
        }
      }
    };
    agendar();
    m.timer = setInterval(agendar, INTERVALO_AGENDA);
  }

  _pararAgenda() {
    if (this.musicaAtual?.timer) {
      clearInterval(this.musicaAtual.timer);
      this.musicaAtual.timer = null;
    }
  }

  _batida(tipo, t) {
    if (tipo === 'k') {
      this._camada({ onda: 'sine', de: 140, para: 45, dur: 0.12, vol: 0.12 }, t, 1, this.mestreMusica);
    } else if (tipo === 's') {
      this._camada({ onda: 'ruido', dur: 0.08, vol: 0.05, filtro: ['bandpass', 1800] }, t, 1, this.mestreMusica);
    } else if (tipo === 'h') {
      this._camada({ onda: 'ruido', dur: 0.025, vol: 0.025, filtro: ['highpass', 7000] }, t, 1, this.mestreMusica);
    }
  }
}

export const Sons = new Som();
