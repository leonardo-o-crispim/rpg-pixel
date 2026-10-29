/**
 * systems/progressao.js - Nivel, XP, ouro e os numeros do heroi.
 *
 * Recebe o estado como parametro (nao importa Jogo) para que o simulador
 * de balanceamento use exatamente o mesmo codigo do jogo.
 */

import { CLASSES } from '../data/classes.js';
import { B, xpParaProximo, derivados, atributosNoNivel, ATRIBUTOS } from '../data/balanceamento.js';
import { bus, EV } from '../core/bus.js';
import { somarStats } from './itens.js';
import { bonusPassivas } from './habilidades.js';

export const classeDoHeroi = (estado) => CLASSES[estado.heroi.classe];

/**
 * Numeros de combate do heroi: atributos da classe + equipamento + passivas.
 * `equipado` alternativo permite simular uma troca antes de faze-la.
 */
export function statsHeroi(estado, equipado = estado.equipado) {
  const h = estado.heroi;
  const passivas = bonusPassivas(estado);
  const plano = somarStats(Object.values(equipado ?? {}));
  for (const [k, v] of Object.entries(passivas.plano)) plano[k] = (plano[k] ?? 0) + v;
  return derivados(CLASSES[h.classe], h.nivel, plano, passivas.pct);
}

/**
 * Soma XP e sobe quantos niveis couberem.
 * Retorna a lista de niveis ganhos: [{ nivel, ganhos: {for:+2, ...} }].
 */
export function ganharXp(estado, qtd) {
  const h = estado.heroi;
  const classe = CLASSES[h.classe];
  const niveis = [];
  h.xp += qtd;
  estado.estatisticas.xpTotal += qtd;
  while (h.nivel < B.NIVEL_MAX && h.xp >= xpParaProximo(h.nivel)) {
    h.xp -= xpParaProximo(h.nivel);
    const antes = atributosNoNivel(classe, h.nivel);
    h.nivel += 1;
    const depois = atributosNoNivel(classe, h.nivel);
    const ganhos = {};
    for (const k of ATRIBUTOS) if (depois[k] !== antes[k]) ganhos[k] = depois[k] - antes[k];
    niveis.push({ nivel: h.nivel, ganhos });
    bus.emit(EV.NIVEL, { nivel: h.nivel, ganhos });
  }
  if (h.nivel >= B.NIVEL_MAX) h.xp = 0;
  bus.emit(EV.XP, { xp: h.xp, proximo: xpParaProximo(h.nivel), nivel: h.nivel });
  return niveis;
}

export function ganharOuro(estado, qtd) {
  estado.ouro += qtd;
  if (qtd > 0) estado.estatisticas.ouroTotal += qtd;
  bus.emit(EV.OURO, { total: estado.ouro, delta: qtd });
}

export const NOMES_ATRIBUTOS = { for: 'Força', int: 'Inteligência', agi: 'Agilidade', vit: 'Vitalidade' };
export const SIGLAS_ATRIBUTOS = { for: 'FOR', int: 'INT', agi: 'AGI', vit: 'VIT' };
