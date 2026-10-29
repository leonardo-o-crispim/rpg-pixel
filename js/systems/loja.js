/**
 * systems/loja.js - Estoque da loja e compras.
 *
 * O estoque de equipamentos renova a cada expedicao concluida e fica salvo
 * no save (estado.loja), entao fechar e abrir o jogo nao troca as ofertas.
 * Pocoes estao sempre a venda.
 */

import { B, precoPocao } from '../data/balanceamento.js';
import { ESPACOS } from '../data/itens.js';
import { criarRng } from '../core/rng.js';
import { gerarItem, sortearRaridade, precoCompra } from './itens.js';
import { ganharOuro } from './progressao.js';
import { novoUid, mochilaCheia } from './inventario.js';

function gerarEstoque(estado) {
  const h = estado.heroi;
  const marca = estado.estatisticas.expedicoes;
  const rng = criarRng(((estado.criadoEm % 100000) * 7919 + marca * 104729) >>> 0);
  // sempre uma arma da classe; o resto em espacos diferentes, sorteados
  const outros = ESPACOS.map((e) => e.id).filter((id) => id !== 'arma');
  for (let i = outros.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [outros[i], outros[j]] = [outros[j], outros[i]];
  }
  const espacos = ['arma', ...outros].slice(0, B.ITENS_NA_LOJA);
  const itens = espacos.map((espaco) => ({
    ...gerarItem(rng, {
      uid: novoUid(estado),
      nivel: Math.max(1, h.nivel + rng.int(-1, 0)), // nunca acima do heroi: o melhor vem de lutar
      classe: h.classe,
      raridade: sortearRaridade(rng, 'pesoLoja'),
      espaco,
    }),
    novo: false,
  }));
  estado.loja = { geradoEm: marca, itens };
}

export function estoque(estado) {
  if (estado.loja?.geradoEm !== estado.estatisticas.expedicoes) gerarEstoque(estado);
  return estado.loja.itens;
}

/** Preco unitario da pocao no nivel atual do heroi. */
export const precoDaPocao = (estado) => precoPocao(estado.heroi.nivel);

/** @returns {{ok: boolean, motivo?: string, item?: object}} */
export function comprarItem(estado, uid) {
  const lista = estoque(estado);
  const i = lista.findIndex((it) => it.uid === uid);
  if (i < 0) return { ok: false, motivo: 'Item não está mais à venda.' };
  const item = lista[i];
  const preco = precoCompra(item);
  if (estado.ouro < preco) return { ok: false, motivo: 'Ouro insuficiente.' };
  if (mochilaCheia(estado)) return { ok: false, motivo: 'Mochila cheia. Venda algo antes.' };
  ganharOuro(estado, -preco);
  lista.splice(i, 1);
  item.novo = true;
  estado.inventario.push(item);
  return { ok: true, item };
}

export function comprarPocao(estado, id, qtd = 1) {
  const preco = precoDaPocao(estado) * qtd;
  if (estado.ouro < preco) return { ok: false, motivo: 'Ouro insuficiente.' };
  ganharOuro(estado, -preco);
  estado.consumiveis[id] = (estado.consumiveis[id] ?? 0) + qtd;
  return { ok: true, preco };
}
