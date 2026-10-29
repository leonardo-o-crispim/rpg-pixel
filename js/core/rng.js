/**
 * core/rng.js - Gerador pseudoaleatorio com semente (mulberry32).
 *
 * O combate usa sempre um rng com semente: a mesma semente reproduz a mesma
 * luta. E isso que permite o simulador de balanceamento e reproduzir bugs.
 */

export function criarRng(semente = Date.now()) {
  let s = semente >>> 0;
  const next = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Inteiro em [min, max], inclusive. */
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    escolher: (lista) => lista[Math.floor(next() * lista.length)],
    /** v multiplicado por um fator em [1-pct, 1+pct]. */
    variar: (v, pct) => v * (1 - pct + next() * pct * 2),
  };
}

/** Semente nova, para quando nao importa reproduzir. */
export const sementeAleatoria = () => (Math.random() * 4294967296) >>> 0;
