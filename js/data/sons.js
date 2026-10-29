/**
 * data/sons.js - Efeitos sonoros e musicas, como DADOS para o sintetizador
 * (audio/som.js). Nenhum arquivo de audio: tudo e gerado na hora.
 *
 * Efeito: { camadas: [camada, ...] }
 *   camada = { onda: 'square'|'triangle'|'sawtooth'|'sine'|'ruido',
 *              de, para?            frequencia inicial/final (Hz) - onda tonal
 *              notas?: [[hz, s]]    sequencia de notas (substitui de/para)
 *              filtro?: [tipo, hz]  so para ruido (lowpass, highpass, bandpass)
 *              dur, vol, atraso? }
 *
 * Musica: { bpm, vozes: [{ onda, vol, notas }], bateria? }
 *   notas: "C5 E5:2 - G5:4 | ..." - cada token e uma nota (ou '-' pausa) com
 *   duracao em COLCHEIAS depois de ':' (padrao 1). '|' so organiza a leitura.
 *   bateria: um caractere por colcheia: k bumbo, s caixa, h chimbal, - nada.
 * As melodias sao composicoes proprias do projeto.
 */

export const EFEITOS = {
  // ------------------------------------------------------------- interface
  clique: { camadas: [{ onda: 'square', de: 880, para: 620, dur: 0.045, vol: 0.05 }] },
  sucesso: { camadas: [{ onda: 'square', notas: [[784, 0.06], [1046, 0.1]], vol: 0.06 }] },
  moeda: { camadas: [{ onda: 'square', notas: [[1318, 0.05], [1760, 0.09]], vol: 0.06 }] },
  erro: { camadas: [{ onda: 'square', notas: [[220, 0.07], [180, 0.1]], vol: 0.06 }] },

  // --------------------------------------------------------------- combate
  golpe: {
    camadas: [
      { onda: 'ruido', dur: 0.06, vol: 0.18, filtro: ['lowpass', 1400] },
      { onda: 'square', de: 190, para: 90, dur: 0.07, vol: 0.07 },
    ],
  },
  dano_heroi: {
    camadas: [
      { onda: 'ruido', dur: 0.08, vol: 0.16, filtro: ['lowpass', 900] },
      { onda: 'square', de: 140, para: 70, dur: 0.1, vol: 0.08 },
    ],
  },
  critico: {
    camadas: [
      { onda: 'ruido', dur: 0.12, vol: 0.24, filtro: ['lowpass', 2400] },
      { onda: 'square', de: 320, para: 110, dur: 0.14, vol: 0.09 },
      { onda: 'square', de: 1200, para: 1600, dur: 0.06, vol: 0.04, atraso: 0.02 },
    ],
  },
  esquiva: { camadas: [{ onda: 'ruido', dur: 0.12, vol: 0.1, filtro: ['highpass', 3000] }] },
  bloqueio: {
    camadas: [
      { onda: 'triangle', de: 1500, para: 1400, dur: 0.12, vol: 0.08 },
      { onda: 'triangle', de: 2250, para: 2100, dur: 0.1, vol: 0.05 },
    ],
  },
  abate: {
    camadas: [
      { onda: 'square', de: 520, para: 130, dur: 0.16, vol: 0.07 },
      { onda: 'ruido', dur: 0.14, vol: 0.1, filtro: ['bandpass', 900], atraso: 0.04 },
    ],
  },
  especial: { camadas: [{ onda: 'square', notas: [[392, 0.05], [523, 0.05], [659, 0.07]], vol: 0.05 }] },
  fogo: {
    camadas: [
      { onda: 'ruido', dur: 0.28, vol: 0.16, filtro: ['lowpass', 700] },
      { onda: 'sawtooth', de: 240, para: 90, dur: 0.24, vol: 0.05 },
    ],
  },
  gelo: {
    camadas: [
      { onda: 'triangle', notas: [[1568, 0.05], [2093, 0.05], [1760, 0.08]], vol: 0.06 },
      { onda: 'ruido', dur: 0.18, vol: 0.06, filtro: ['highpass', 6000] },
    ],
  },
  raio: {
    camadas: [
      { onda: 'sawtooth', de: 1400, para: 120, dur: 0.16, vol: 0.06 },
      { onda: 'ruido', dur: 0.12, vol: 0.14, filtro: ['bandpass', 3000] },
    ],
  },
  arcano: { camadas: [{ onda: 'sine', de: 600, para: 1000, dur: 0.16, vol: 0.09 }] },
  natureza: { camadas: [{ onda: 'triangle', de: 300, para: 500, dur: 0.12, vol: 0.07 }] },
  sombra: { camadas: [{ onda: 'sawtooth', de: 160, para: 80, dur: 0.22, vol: 0.06 }] },
  flecha: { camadas: [{ onda: 'ruido', dur: 0.07, vol: 0.08, filtro: ['highpass', 2500] }, { onda: 'triangle', de: 900, para: 500, dur: 0.06, vol: 0.04 }] },
  pocao: { camadas: [{ onda: 'sine', notas: [[400, 0.06], [600, 0.06], [900, 0.09]], vol: 0.09 }] },
  item: { camadas: [{ onda: 'square', notas: [[1046, 0.05], [1318, 0.05], [1568, 0.08]], vol: 0.05 }] },
  item_raro: { camadas: [{ onda: 'square', notas: [[1046, 0.05], [1318, 0.05], [1568, 0.05], [2093, 0.14]], vol: 0.06 }] },
  invocacao: { camadas: [{ onda: 'square', notas: [[196, 0.08], [262, 0.08], [196, 0.08], [311, 0.14]], vol: 0.06 }] },
  chefe: {
    camadas: [
      { onda: 'sawtooth', de: 90, para: 60, dur: 0.6, vol: 0.08 },
      { onda: 'ruido', dur: 0.5, vol: 0.08, filtro: ['lowpass', 300] },
    ],
  },
  passo: { camadas: [{ onda: 'ruido', dur: 0.03, vol: 0.03, filtro: ['lowpass', 500] }] },
  nivel: { camadas: [{ onda: 'square', notas: [[523, 0.06], [659, 0.06], [784, 0.06], [1046, 0.06], [1318, 0.16]], vol: 0.06 }] },
};

/** Vinhetas curtas (tocadas uma vez, por cima da musica parada). */
export const VINHETAS = {
  vitoria: { bpm: 160, vozes: [{ onda: 'square', vol: 0.07, notas: 'C5 E5 G5 C6:3 G5 C6:4' }, { onda: 'triangle', vol: 0.1, notas: 'C3:2 G3:2 C4:6' }] },
  derrota: { bpm: 90, vozes: [{ onda: 'square', vol: 0.06, notas: 'E4:2 D#4:2 D4:2 C#4:6' }, { onda: 'triangle', vol: 0.1, notas: 'A2:4 G#2:4 A2:6' }] },
  nivel: { bpm: 200, vozes: [{ onda: 'square', vol: 0.06, notas: 'C5 E5 G5 C6 E6:3' }] },
};

export const MUSICAS = {
  // Hub e menus: alegre, sem pressa
  vila: {
    bpm: 104,
    vozes: [
      {
        onda: 'square', vol: 0.035,
        notas: 'E5 G5 C6 G5 A5:2 G5:2 | F5 A5 C6 A5 G5:4 | E5 G5 C6 E6 D6:2 C6:2 | A5 B5 C6 D6 C6:4 | '
          + 'E5 G5 C6 G5 A5:2 G5:2 | F5 E5 D5 F5 E5:4 | D5 E5 F5 A5 G5:2 F5:2 | E5 D5 E5 D5 C5:4',
      },
      {
        onda: 'triangle', vol: 0.08,
        notas: 'C3:4 G2:4 | F2:4 C3:4 | C3:4 G2:4 | F2:4 G2:4 | C3:4 G2:4 | D3:4 A2:4 | G2:4 D3:4 | G2:4 C3:4',
      },
    ],
    bateria: 'k-h-s-h-'.repeat(8),
  },
  // Expedicao: energica
  aventura: {
    bpm: 138,
    vozes: [
      {
        onda: 'square', vol: 0.03,
        notas: 'A4 C5 E5 A5 G5 E5 C5 E5 | F5 A5 C6 A5 G5:2 E5:2 | D5 F5 A5 F5 E5 G5 B5 G5 | A5:2 E5:2 A5:4 | '
          + 'A4 C5 E5 A5 B5 A5 G5 E5 | F5 E5 D5 C5 D5:2 E5:2 | F5 G5 A5 B5 C6:2 B5:2 | A5:4 -:4',
      },
      {
        onda: 'triangle', vol: 0.08,
        notas: 'A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 F2 F2 F3 F2 | D2 D2 D3 D2 E2 E2 E3 E2 | A2 A2 A3 A2 A2 A2 A3 A2 | '
          + 'A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 F2 F2 F3 F2 | F2 F2 F3 F2 G2 G2 G3 G2 | A2 A2 A3 A2 E2 E2 E3 E2',
      },
    ],
    bateria: 'k-hsk-hs'.repeat(8),
  },
  // Onda do chefe: tensa
  chefe: {
    bpm: 150,
    vozes: [
      {
        onda: 'square', vol: 0.03,
        notas: 'D5 D5 F5 D5 G#5:2 A5:2 | D5 D5 F5 D5 C6:2 A5:2 | A#5 A5 G5 F5 E5:2 C#5:2 | D5:4 A4:4 | '
          + 'F5 F5 A5 F5 B5:2 C6:2 | F5 F5 A5 F5 D6:2 C6:2 | A#5 A5 G5 F5 E5 F5 G5 E5 | D5:4 -:4',
      },
      {
        onda: 'sawtooth', vol: 0.03,
        notas: 'D2 D2 D2 D2 D2 D2 C2 C2 | D2 D2 D2 D2 D2 D2 C2 C2 | A#1 A#1 A#1 A#1 A1 A1 A1 A1 | D2 D2 D2 D2 A1 A1 A1 A1 | '
          + 'F2 F2 F2 F2 F2 F2 E2 E2 | F2 F2 F2 F2 F2 F2 E2 E2 | A#1 A#1 A#1 A#1 A1 A1 A1 A1 | D2 D2 D2 D2 D2 D2 D2 D2',
      },
    ],
    bateria: 'k-skk-sk'.repeat(8),
  },
};
