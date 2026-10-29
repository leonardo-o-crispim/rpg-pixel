/**
 * systems/habilidades.js - Pontos, ranks, ativas equipadas e passivas.
 *
 * Estado no save: estado.habilidades = { ranks: { id: n }, ativas: [id, ...] }
 * Pontos: 1 por nivel (no nivel 1 ja ha 1). Livres = nivel - soma dos ranks.
 * As ativas ficam em ORDEM DE PRIORIDADE: no combate o heroi usa a primeira
 * que estiver pronta (sem recarga e com mana).
 */

import { ARVORES, ATIVAS_MAX } from '../data/arvores.js';
import { custoRedistribuir } from '../data/balanceamento.js';

export const defHabilidade = (id) => ARVORES[id];
export const rankDe = (estado, id) => estado.habilidades.ranks[id] ?? 0;

export const pontosTotais = (estado) => estado.heroi.nivel;
export const pontosGastos = (estado) => Object.values(estado.habilidades.ranks).reduce((s, n) => s + n, 0);
export const pontosLivres = (estado) => Math.max(0, pontosTotais(estado) - pontosGastos(estado));

/** @returns {{ok: boolean, motivo?: string}} */
export function podeAprender(estado, id) {
  const h = ARVORES[id];
  if (!h || h.classe !== estado.heroi.classe) return { ok: false, motivo: 'Não é da sua classe.' };
  if (estado.heroi.nivel < h.nivelMin) return { ok: false, motivo: `Libera no nível ${h.nivelMin}.` };
  if (rankDe(estado, id) >= h.maxRank) return { ok: false, motivo: 'Já está no máximo.' };
  if (pontosLivres(estado) <= 0) return { ok: false, motivo: 'Sem pontos livres. Ganhe um nível.' };
  return { ok: true };
}

/** Sobe um rank. A primeira vez que aprende uma ativa, ela entra numa vaga livre. */
export function aprender(estado, id) {
  if (!podeAprender(estado, id).ok) return false;
  const hab = estado.habilidades;
  hab.ranks[id] = rankDe(estado, id) + 1;
  if (ARVORES[id].tipo === 'ativa' && !hab.ativas.includes(id) && hab.ativas.length < ATIVAS_MAX) hab.ativas.push(id);
  return true;
}

export function equiparAtiva(estado, id) {
  const hab = estado.habilidades;
  if (ARVORES[id]?.tipo !== 'ativa' || rankDe(estado, id) < 1 || hab.ativas.includes(id)) return false;
  if (hab.ativas.length >= ATIVAS_MAX) return false;
  hab.ativas.push(id);
  return true;
}

export function retirarAtiva(estado, id) {
  const hab = estado.habilidades;
  hab.ativas = hab.ativas.filter((a) => a !== id);
}

/** Move uma ativa na ordem de prioridade (delta -1 sobe, +1 desce). */
export function moverAtiva(estado, id, delta) {
  const lista = estado.habilidades.ativas;
  const i = lista.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
}

export const precoRedistribuir = (estado) => custoRedistribuir(estado.heroi.nivel);

/** Devolve todos os pontos em troca de ouro. */
export function redistribuir(estado) {
  const preco = precoRedistribuir(estado);
  if (estado.ouro < preco || pontosGastos(estado) === 0) return false;
  estado.ouro -= preco;
  estado.habilidades.ranks = {};
  estado.habilidades.ativas = [];
  return true;
}

/** Soma dos bonus das passivas aprendidas: { plano: {...}, pct: {...} }. */
export function bonusPassivas(estado) {
  const plano = {};
  const pct = {};
  if (!estado.heroi) return { plano, pct };
  for (const [id, r] of Object.entries(estado.habilidades?.ranks ?? {})) {
    const h = ARVORES[id];
    if (!h || h.tipo !== 'passiva' || r < 1 || h.classe !== estado.heroi.classe) continue;
    const b = h.bonus(r);
    for (const [k, v] of Object.entries(b.plano ?? {})) plano[k] = (plano[k] ?? 0) + v;
    for (const [k, v] of Object.entries(b.pct ?? {})) pct[k] = (pct[k] ?? 0) + v;
  }
  return { plano, pct };
}

/** Definicao da ativa resolvida num rank (o que o motor de combate recebe). */
export function ativaNoRank(id, rank) {
  const h = ARVORES[id];
  return {
    id,
    recarga: h.recarga,
    quandoVidaAbaixo: h.quandoVidaAbaixo,
    def: { nome: h.nome, alvo: h.alvo, custo: h.custo ?? 0, efeitos: h.efeitos(rank) },
  };
}

/** Ativas equipadas, em ordem, prontas para o combate. */
export function habilidadesParaCombate(estado) {
  return estado.habilidades.ativas
    .filter((id) => ARVORES[id]?.classe === estado.heroi.classe && rankDe(estado, id) > 0)
    .map((id) => ativaNoRank(id, rankDe(estado, id)));
}

/** A classe tem alguma ativa que gasta mana equipada? (mostra a barra de mana) */
export const usaMana = (estado) => estado.habilidades.ativas.some((id) => (ARVORES[id]?.custo ?? 0) > 0);
