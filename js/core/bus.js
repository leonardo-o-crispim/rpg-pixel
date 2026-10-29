/**
 * core/bus.js - Barramento de eventos global.
 *
 * Sistemas avisam o que aconteceu (subiu de nivel, salvou, liberou area) sem
 * saber quem esta ouvindo. As telas escutam e reagem. Assim nenhum sistema
 * importa codigo de interface.
 */

export const EV = {
  TELA: 'tela',               // {nome, params}
  SALVO: 'salvo',             // {quando}
  NIVEL: 'nivel',             // {nivel, ganhos}
  OURO: 'ouro',               // {total, delta}
  XP: 'xp',                   // {xp, proximo, nivel}
  DESBLOQUEIO: 'desbloqueio', // {tipo:'mapa'|'regiao', id, nome}
};

const ouvintes = new Map();

export const bus = {
  /** Retorna a funcao que cancela a inscricao. */
  on(ev, fn) {
    if (!ouvintes.has(ev)) ouvintes.set(ev, new Set());
    ouvintes.get(ev).add(fn);
    return () => ouvintes.get(ev)?.delete(fn);
  },
  emit(ev, dados) {
    const lista = ouvintes.get(ev);
    if (!lista) return;
    for (const fn of [...lista]) {
      try { fn(dados); } catch (e) { console.error(`[bus] ${ev}`, e); }
    }
  },
};
