/**
 * data/balanceamento.js - TODAS as formulas do jogo moram aqui.
 *
 * XP, atributos, dano, recompensas e defesa. Se uma conta de progressao
 * aparecer em outro arquivo, ela esta no lugar errado. Ajuste fino se faz
 * aqui e se confere com `node ferramentas/simular.mjs`.
 */

export const B = {
  NIVEL_MAX: 60,
  ATB_LIMIAR: 1000,          // a barra de acao enche ate isso e o combatente age
  CRIT_MULT: 1.75,
  CRIT_MAX: 0.5,
  ESQUIVA_MAX: 0.3,
  VARIACAO_DANO: 0.1,        // +-10%
  DESCANSO_VIDA: 0.35,       // cura entre ondas (fracao da vida maxima)
  DESCANSO_MANA: 0.5,
  MANA_POR_TURNO: 0.04,      // fracao da mana maxima recuperada a cada acao
  BARRA_INICIAL_MAX: 350,    // inimigos comecam com barra sorteada ate isso

  // itens (M2)
  CAPACIDADE_MOCHILA: 30,
  CHANCE_DROP: 0.1,          // por monstro comum
  CHANCE_DROP_EXTRA_CHEFE: 0.5, // chefe sempre deixa 1; esta e a chance do 2o
  VARIACAO_PRIMARIO: 0.1,    // +-10% nos atributos principais do item
  VARIACAO_AFIXO: 0.2,       // +-20% nos extras
  VENDA_FRACAO: 0.25,        // vender devolve esta fracao do preco de compra
  ITENS_NA_LOJA: 5,
  POCOES_POR_EXPEDICAO: 2,
  POCOES_INICIAIS: 2,
  LIMIAR_POCAO: 0.35,        // padrao; o jogador muda nos Ajustes
  LIMIAR_POCAO_MANA: 0.3,

  // habilidades (M3)
  BLOQUEIO_MAX: 0.4,
  BLOQUEIO_FRACAO: 0.5,      // bloquear tira esta fracao do golpe

  // chefes (M4)
  INIMIGOS_MAX: 4,           // invocacao nao passa deste total vivo
  CRESCIMENTO_MONSTRO: 0.025, // vida e ataque +2,5% por nivel acima do 6 (ver crescimentoMonstro)
  RECOMPENSA_INVOCADO: 0.5,  // XP e ouro de lacaio invocado
};

/** Ouro para apagar todos os pontos de habilidade e redistribuir. */
export const custoRedistribuir = (nivel) => 30 * nivel;

// ---------------------------------------------------------------- nivel / XP

/** XP necessario para sair de `nivel` e ir para o seguinte. */
export function xpParaProximo(nivel) {
  return Math.round(40 * Math.pow(nivel, 1.6));
}

/** XP reduzido quando o heroi e bem mais forte que o monstro (anti-farm). */
export function fatorXp(nivelHeroi, nivelMonstro) {
  const dif = nivelHeroi - nivelMonstro;
  if (dif <= 2) return 1;
  return Math.max(0.2, 1 - 0.15 * (dif - 2));
}

// ------------------------------------------------------------ heroi: atributos

export const ATRIBUTOS = ['for', 'int', 'agi', 'vit'];

/** Atributos crescem sozinhos conforme a classe (nao ha distribuicao manual). */
export function atributosNoNivel(classe, nivel) {
  const a = {};
  for (const k of ATRIBUTOS) a[k] = Math.floor(classe.base[k] + classe.crescimento[k] * (nivel - 1));
  return a;
}

/**
 * Atributos -> numeros de combate.
 * `bonus` soma valores planos (equipamento e passivas):
 *   { for, int, agi, vit, vidaMax, ataque, defesa, critico, bloqueio, ... }
 * `pct` multiplica o numero final (passivas): { defesa: 0.12 } = +12%.
 */
export function derivados(classe, nivel, bonus = {}, pct = {}) {
  const base = atributosNoNivel(classe, nivel);
  const a = {};
  for (const k of ATRIBUTOS) a[k] = base[k] + (bonus[k] ?? 0);

  const ataque = Object.entries(classe.ataque).reduce((s, [k, coef]) => s + coef * a[k], 0);
  const d = {
    vidaMax: Math.round(50 + a.vit * 10 + nivel * 8),
    manaMax: Math.round(10 + a.int * 4),
    ataque: Math.round(ataque),
    poder: Math.round(a.int * 2.5),
    defesa: Math.round(a.vit * 1.1 + a.for * 0.5),
    resistencia: Math.round(a.int * 0.6 + a.vit * 0.4 + a.agi * 0.25), // agilidade: reflexo contra magia
    velocidade: Math.round(100 + a.agi * 1.5), // 2,5 fazia o arqueiro agir 2,6x por acao do monstro no nivel 30
    critico: 0.05 + a.agi * 0.0022,
    esquiva: 0.02 + a.agi * 0.0012, // agilidade alta batia no teto de esquiva no nivel 30
  };
  for (const k of Object.keys(d)) if (bonus[k]) d[k] += bonus[k];
  for (const [k, v] of Object.entries(pct)) if (k in d) d[k] *= 1 + v;
  // tetos depois do bonus: equipamento e passivas nao furam o limite
  d.critico = Math.min(B.CRIT_MAX, d.critico);
  d.esquiva = Math.min(B.ESQUIVA_MAX, d.esquiva);
  d.bloqueio = Math.min(B.BLOQUEIO_MAX, bonus.bloqueio ?? 0);
  for (const k of ['vidaMax', 'manaMax', 'ataque', 'poder', 'defesa', 'resistencia', 'velocidade']) d[k] = Math.round(d[k]);
  return { atributos: a, ...d };
}

// ------------------------------------------------------------------- monstros

/**
 * Crescimento extra dos monstros depois da Regiao 1. O heroi cresce por
 * atributos, equipamento (drops do nivel do monstro) e passivas: a soma
 * passa de uma reta. Sem isto, o chefe final caia com o heroi 13 niveis abaixo.
 */
export const crescimentoMonstro = (L) => 1 + Math.max(0, L - 6) * B.CRESCIMENTO_MONSTRO;

/** Numeros de combate de um monstro no nivel L. `m` sao os multiplicadores do monstro. */
export function statsMonstro(m, L) {
  const g = crescimentoMonstro(L);
  return {
    vidaMax: Math.round((20 + L * 13) * g * (m.vida ?? 1)),
    manaMax: 0,
    ataque: Math.round((6 + L * 3.1) * g * (m.ataque ?? 1)),
    poder: Math.round((6 + L * 3.1) * g * (m.poder ?? m.ataque ?? 1)),
    defesa: Math.round((2 + L * 1.6) * (m.defesa ?? 1)),
    resistencia: Math.round((2 + L * 1.6) * (m.resistencia ?? m.defesa ?? 1)),
    velocidade: Math.round((m.velocidade ?? 90) + L * 1.2),
    critico: m.critico ?? 0.05,
    esquiva: m.esquiva ?? 0.03,
  };
}

/** Recompensa base por abate (antes do fator de XP do heroi). */
export function recompensaMonstro(m, L) {
  return {
    xp: Math.round((5 + L * 4) * (m.xp ?? 1)),
    ouro: Math.round((2 + L * 1.6) * (m.ouro ?? 1)),
  };
}

// ----------------------------------------------------------------------- dano

/**
 * Defesa relativa ao nivel do atacante: a mesma defesa protege muito contra
 * quem e fraco e pouco contra quem e forte. Mantem a curva estavel do nivel
 * 1 ao 60 sem precisar de tabelas.
 */
export function fatorDefesa(defesa, nivelAtacante, ignora = 0) {
  const k = 30 + nivelAtacante * 6;
  return k / (k + defesa * (1 - ignora));
}

export function calcularDano({ potencia, defesa, nivelAtacante, ignora = 0, elemento = 1, critico = false, rng }) {
  let d = potencia * fatorDefesa(defesa, nivelAtacante, ignora) * elemento;
  d = rng.variar(d, B.VARIACAO_DANO);
  if (critico) d *= B.CRIT_MULT;
  return Math.max(1, Math.round(d));
}

// ------------------------------------------------------------------ expedicao

// ---------------------------------------------------------------------- itens

/** Valor de um atributo de item no nivel L, antes da variacao sorteada. */
export function valorStatItem(def, nivel, multRaridade = 1) {
  return (def.base + def.porNivel * nivel) * multRaridade;
}

/** Preco de compra de um equipamento. */
export function precoItem(nivel, multRaridade) {
  return Math.round((20 + nivel * 14) * multRaridade);
}

export const precoVenda = (precoCompra) => Math.max(1, Math.round(precoCompra * B.VENDA_FRACAO));

export const precoPocao = (nivelHeroi) => 18 + nivelHeroi * 2;

/** Bonus por vencer o mapa; a primeira vitoria paga mais. */
export function bonusVitoria(mapa, primeira) {
  const L = mapa.nivel;
  return {
    xp: Math.round((primeira ? 15 : 6) * L),
    ouro: Math.round((primeira ? 30 : 10) * L),
  };
}
