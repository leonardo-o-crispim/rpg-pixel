/**
 * systems/itens.js - Gera itens e drops; le nome, preco e atributos.
 *
 * Funcoes puras: recebem rng e parametros, nao tocam no estado do jogo.
 * Formato de um item no save:
 *   { uid, base, raridade, nivel, stats: { ataque: 7, critico: 0.021 }, titulo?, novo? }
 * `stats` guarda os valores JA sorteados: mudar o balanceamento depois nao
 * altera o que o jogador tem.
 */

import { BASES, RARIDADES, AFIXOS, TITULOS, ESPACOS, CONSUMIVEIS, STATS_PERCENTUAIS, materialDoNivel } from '../data/itens.js';
import { CLASSES } from '../data/classes.js';
import { B, valorStatItem, precoItem, precoVenda } from '../data/balanceamento.js';

/** Escolha ponderada: pares [valor, peso]. */
function sortear(rng, pares) {
  const total = pares.reduce((s, [, p]) => s + p, 0);
  let r = rng.next() * total;
  for (const [v, p] of pares) { r -= p; if (r < 0) return v; }
  return pares[pares.length - 1][0];
}

const arredondar = (stat, v) => (STATS_PERCENTUAIS.has(stat) ? Math.round(v * 1000) / 1000 : Math.max(1, Math.round(v)));

export function sortearRaridade(rng, campo = 'peso') {
  return sortear(rng, Object.entries(RARIDADES).map(([id, r]) => [id, r[campo]]).filter(([, p]) => p > 0));
}

/** Bases que a classe pode usar, opcionalmente so de um espaco. */
export function basesPara(classeId, espaco = null) {
  return Object.entries(BASES)
    .filter(([, b]) => (!b.classes || b.classes.includes(classeId)) && (!espaco || b.espaco === espaco))
    .map(([id]) => id);
}

/**
 * Cria um item.
 * @param {object} o { uid, nivel, classe, raridade?, espaco?, base?, semAfixos? }
 */
export function gerarItem(rng, { uid, nivel, classe, raridade, espaco, base, semAfixos = false }) {
  const rar = raridade ?? sortearRaridade(rng);
  const R = RARIDADES[rar];
  const esp = espaco ?? rng.escolher(ESPACOS).id;
  const idBase = base ?? rng.escolher(basesPara(classe, esp));
  const def = BASES[idBase];

  const stats = {};
  for (const p of def.primarios) {
    stats[p.stat] = arredondar(p.stat, rng.variar(valorStatItem(p, nivel, R.mult), B.VARIACAO_PRIMARIO));
  }
  if (!semAfixos) {
    const afinidades = new Set(CLASSES[classe]?.afinidades ?? []);
    let livres = Object.keys(AFIXOS).filter((k) => !(k in stats));
    for (let i = 0; i < R.afixos && livres.length; i++) {
      const stat = sortear(rng, livres.map((k) => [k, afinidades.has(k) ? 3 : 1]));
      stats[stat] = arredondar(stat, rng.variar(valorStatItem(AFIXOS[stat], nivel), B.VARIACAO_AFIXO));
      livres = livres.filter((k) => k !== stat);
    }
  }
  const item = { uid, base: idBase, raridade: rar, nivel, stats, novo: true };
  if (TITULOS[rar]) item.titulo = rng.escolher(TITULOS[rar]);
  return item;
}

/** Arma comum de nivel 1 com que todo heroi comeca. */
export function itemInicial(classeId, uid) {
  const base = basesPara(classeId, 'arma')[0];
  const def = BASES[base];
  const stats = {};
  for (const p of def.primarios) stats[p.stat] = arredondar(p.stat, valorStatItem(p, 1));
  return { uid, base, raridade: 'comum', nivel: 1, stats, novo: false };
}

/**
 * Itens deixados por um monstro. `novoUid()` fornece identificadores.
 * Chefe: sempre 1 (nunca comum) e chance de um 2o.
 */
export function gerarDrop(rng, { nivel, chefe, classe, novoUid }) {
  const itens = [];
  if (chefe) {
    itens.push(gerarItem(rng, { uid: novoUid(), nivel, classe, raridade: sortearRaridade(rng, 'pesoChefe') }));
    if (rng.chance(B.CHANCE_DROP_EXTRA_CHEFE)) itens.push(gerarItem(rng, { uid: novoUid(), nivel, classe }));
  } else if (rng.chance(B.CHANCE_DROP)) {
    itens.push(gerarItem(rng, { uid: novoUid(), nivel, classe }));
  }
  return itens;
}

// ------------------------------------------------------------------ leitura

export const defBase = (item) => BASES[item.base];
export const espacoDo = (item) => BASES[item.base].espaco;

export function nomeDoItem(item) {
  const nome = `${BASES[item.base].nome} de ${materialDoNivel(item.nivel).nome}`;
  return item.titulo ? `${nome} ${item.titulo}` : nome;
}

/** Cores para tingir o icone: metal pelo material, gema pela raridade. */
export function tintaDoItem(item) {
  return { ...materialDoNivel(item.nivel).cores, g: RARIDADES[item.raridade].cor };
}

export const precoCompra = (item) => precoItem(item.nivel, RARIDADES[item.raridade].preco);
export const valorVenda = (item) => precoVenda(precoCompra(item));

/** Soma os atributos de varios itens num unico objeto de bonus. */
export function somarStats(itens) {
  const total = {};
  for (const it of itens) {
    if (!it) continue;
    for (const [k, v] of Object.entries(it.stats)) total[k] = (total[k] ?? 0) + v;
  }
  return total;
}

export const consumivel = (id) => CONSUMIVEIS[id];
