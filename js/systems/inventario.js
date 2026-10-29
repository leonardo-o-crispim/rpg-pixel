/**
 * systems/inventario.js - Mochila e equipamento: guardar, equipar, comparar
 * e vender.
 *
 * Equipar MOVE o item da mochila para o espaco (e o antigo volta para a
 * mochila). "Melhor" e decidido pelos numeros finais do heroi com e sem o
 * item, ponderados pelos `pesos` da classe: assim um anel de Forca e
 * comparado pelo ataque e defesa que ele realmente da.
 */

import { B } from '../data/balanceamento.js';
import { ESPACOS, ORDEM_RARIDADES } from '../data/itens.js';
import { statsHeroi, classeDoHeroi, ganharOuro } from './progressao.js';
import { espacoDo, valorVenda } from './itens.js';

/** Identificador novo e unico dentro do save. */
export const novoUid = (estado) => `i${++estado.seqItem}`;

export function pontuacao(stats, classe) {
  return Object.entries(classe.pesos).reduce((s, [k, peso]) => s + (stats[k] ?? 0) * peso, 0);
}

const MARGEM_MELHOR = 0.5; // abaixo disso a diferenca e ruido

/**
 * Compara o heroi como esta com o heroi usando `item`.
 * Se o item ja esta equipado, compara com o espaco vazio.
 */
export function comparar(estado, item) {
  const espaco = espacoDo(item);
  const equipado = estado.equipado[espaco] ?? null;
  const classe = classeDoHeroi(estado);
  const jaEquipado = equipado?.uid === item.uid;
  const semItem = { ...estado.equipado };
  delete semItem[espaco];
  const antes = jaEquipado ? statsHeroi(estado, semItem) : statsHeroi(estado);
  const depois = statsHeroi(estado, { ...estado.equipado, [espaco]: item });
  return { espaco, equipado: jaEquipado ? null : equipado, antes, depois, ganho: pontuacao(depois, classe) - pontuacao(antes, classe), jaEquipado };
}

export const ehMelhor = (estado, item) => comparar(estado, item).ganho > MARGEM_MELHOR;

export const mochilaCheia = (estado) => estado.inventario.length >= B.CAPACIDADE_MOCHILA;

/** Guarda na mochila; cheia, o item e vendido na hora. */
export function adicionar(estado, item) {
  if (mochilaCheia(estado)) {
    const valor = valorVenda(item);
    ganharOuro(estado, valor);
    return { guardado: false, vendidoPor: valor };
  }
  estado.inventario.push(item);
  return { guardado: true };
}

export function equipar(estado, uid) {
  const i = estado.inventario.findIndex((it) => it.uid === uid);
  if (i < 0) return false;
  const item = estado.inventario[i];
  const espaco = espacoDo(item);
  const atual = estado.equipado[espaco];
  estado.inventario.splice(i, 1);
  if (atual) estado.inventario.push(atual);
  item.novo = false;
  estado.equipado[espaco] = item;
  return true;
}

export function desequipar(estado, espaco) {
  const atual = estado.equipado[espaco];
  if (!atual || mochilaCheia(estado)) return false;
  delete estado.equipado[espaco];
  estado.inventario.push(atual);
  return true;
}

export function vender(estado, uid) {
  const i = estado.inventario.findIndex((it) => it.uid === uid);
  if (i < 0) return 0;
  const [item] = estado.inventario.splice(i, 1);
  const valor = valorVenda(item);
  ganharOuro(estado, valor);
  return valor;
}

/**
 * Vende tudo ate a raridade `ate` (inclusive), poupando o que seria melhor
 * que o equipado atual.
 */
export function venderLote(estado, ate) {
  const limite = ORDEM_RARIDADES.indexOf(ate);
  const alvos = estado.inventario.filter((it) => ORDEM_RARIDADES.indexOf(it.raridade) <= limite && !ehMelhor(estado, it));
  let ouro = 0;
  for (const it of alvos) ouro += vender(estado, it.uid);
  return { qtd: alvos.length, ouro };
}

/** Para cada espaco, equipa o item da mochila que mais melhora o heroi. */
export function equiparMelhores(estado) {
  let trocas = 0;
  for (let volta = 0; volta < 3; volta++) {
    let mudou = false;
    for (const { id } of ESPACOS) {
      let melhor = null;
      let ganhoMelhor = MARGEM_MELHOR;
      for (const it of estado.inventario) {
        if (espacoDo(it) !== id) continue;
        const { ganho } = comparar(estado, it);
        if (ganho > ganhoMelhor) { melhor = it; ganhoMelhor = ganho; }
      }
      if (melhor) { equipar(estado, melhor.uid); trocas++; mudou = true; }
    }
    if (!mudou) break; // atributos mudam pesos entre espacos: repete ate estabilizar
  }
  return trocas;
}

export const contarNovos = (estado) => estado.inventario.filter((it) => it.novo).length;
export function marcarVistos(estado) { for (const it of estado.inventario) it.novo = false; }

/** Ordem de exibicao: raridade, nivel, espaco. */
export function ordenar(lista) {
  const ordemEspaco = Object.fromEntries(ESPACOS.map((e, i) => [e.id, i]));
  return [...lista].sort((a, b) =>
    ORDEM_RARIDADES.indexOf(b.raridade) - ORDEM_RARIDADES.indexOf(a.raridade)
    || b.nivel - a.nivel
    || ordemEspaco[espacoDo(a)] - ordemEspaco[espacoDo(b)]);
}

/** "Poder" do heroi: um numero so para comparar forca (convencao do genero). */
export const poderDoHeroi = (estado, equipado = estado.equipado) =>
  Math.round(pontuacao(statsHeroi(estado, equipado), classeDoHeroi(estado)));
