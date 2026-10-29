/**
 * data/arvores.js - Arvores de habilidades das classes (M3).
 *
 * Cada classe tem 8 habilidades em 4 faixas de nivel. Uma habilidade tem
 * ranks (1..maxRank); cada rank custa 1 ponto, e o heroi ganha 1 ponto por
 * nivel.
 *
 * Ativa:  usada no combate. Campos: custo (mana), recarga (turnos do heroi),
 *         alvo, efeitos(rank) no mesmo formato de data/habilidades.js, e
 *         opcionalmente quandoVidaAbaixo (so usa com a vida baixa).
 * Passiva: sempre ligada. bonus(rank) -> { plano: {stat: v}, pct: {stat: v} }
 *         plano soma ao numero final; pct multiplica (0.05 = +5%).
 *
 * texto(rank) descreve o efeito NAQUELE rank (a tela mostra o atual e o proximo).
 */

const pct = (v) => `${Math.round(v * 100)}%`;

export const FAIXAS = [1, 3, 6, 10];

export const ARVORES = {
  // ======================================================================= Cavaleiro
  golpe_pesado: {
    classe: 'cavaleiro', tipo: 'ativa', nivelMin: 1, maxRank: 5,
    nome: 'Golpe Pesado', icone: 'hab_golpe',
    recarga: 3, alvo: 'inimigo',
    efeitos: (r) => [{ tipo: 'dano', mult: 1.7 + 0.15 * (r - 1) }],
    texto: (r) => `Um golpe de ${pct(1.7 + 0.15 * (r - 1))} do ataque.`,
  },
  pele_de_ferro: {
    classe: 'cavaleiro', tipo: 'passiva', nivelMin: 1, maxRank: 5,
    nome: 'Pele de Ferro', icone: 'hab_escudo', tinta: { b: '#8a96a8', B: '#c8d0dc', n: '#5a6478' },
    bonus: (r) => ({ pct: { defesa: 0.06 * r } }),
    texto: (r) => `+${pct(0.06 * r)} de defesa.`,
  },
  investida_escudo: {
    classe: 'cavaleiro', tipo: 'ativa', nivelMin: 3, maxRank: 5,
    nome: 'Investida com Escudo', icone: 'hab_estrelas',
    recarga: 5, alvo: 'inimigo',
    efeitos: (r) => [{ tipo: 'dano', mult: 0.9 + 0.1 * (r - 1) }, { tipo: 'status', status: 'atordoado', turnos: 1, potencia: 1 }],
    texto: (r) => `${pct(0.9 + 0.1 * (r - 1))} do ataque e atordoa: o alvo perde o próximo turno. Chefes são imunes.`,
  },
  vigor: {
    classe: 'cavaleiro', tipo: 'passiva', nivelMin: 3, maxRank: 5,
    nome: 'Vigor', icone: 'hab_coracao',
    bonus: (r) => ({ pct: { vidaMax: 0.06 * r } }),
    texto: (r) => `+${pct(0.06 * r)} de vida máxima.`,
  },
  grito_guerra: {
    classe: 'cavaleiro', tipo: 'ativa', nivelMin: 6, maxRank: 5,
    nome: 'Grito de Guerra', icone: 'hab_grito',
    recarga: 8, alvo: 'proprio',
    efeitos: (r) => [{ tipo: 'status', status: 'furia', turnos: 4, potencia: 0.25 + 0.05 * (r - 1) }],
    texto: (r) => `+${pct(0.25 + 0.05 * (r - 1))} de ataque por 4 turnos.`,
  },
  bloqueio: {
    classe: 'cavaleiro', tipo: 'passiva', nivelMin: 6, maxRank: 5,
    nome: 'Bloqueio', icone: 'hab_escudo',
    bonus: (r) => ({ plano: { bloqueio: 0.05 * r } }),
    texto: (r) => `${pct(0.05 * r)} de chance de bloquear metade de um golpe.`,
  },
  muralha: {
    classe: 'cavaleiro', tipo: 'ativa', nivelMin: 10, maxRank: 5,
    nome: 'Muralha', icone: 'hab_escudo', tinta: { b: '#3fa8ff', B: '#9ad8ff', n: '#1f62c8' },
    recarga: 6, alvo: 'proprio', quandoVidaAbaixo: 0.7,
    efeitos: (r) => [{ tipo: 'status', status: 'escudo', turnos: 4, potencia: 0.4 + 0.05 * (r - 1) }],
    texto: (r) => `Com a vida abaixo de 70%: recebe ${pct(0.4 + 0.05 * (r - 1))} menos dano por 4 turnos.`,
  },
  furia_justa: {
    classe: 'cavaleiro', tipo: 'passiva', nivelMin: 10, maxRank: 5,
    nome: 'Fúria Justa', icone: 'hab_grito', tinta: { r: '#ffcf3f', y: '#fff4c0' },
    bonus: (r) => ({ pct: { ataque: 0.05 * r } }),
    texto: (r) => `+${pct(0.05 * r)} de ataque.`,
  },

  // =========================================================================== Maga
  bola_fogo: {
    classe: 'mago', tipo: 'ativa', nivelMin: 1, maxRank: 5,
    nome: 'Bola de Fogo', icone: 'hab_fogo',
    custo: 7, recarga: 2, alvo: 'inimigo',
    efeitos: (r) => [{ tipo: 'dano', mult: 1.5 + 0.12 * (r - 1), magico: true, elemento: 'fogo' }],
    texto: (r) => `Dano mágico de fogo: ${pct(1.5 + 0.12 * (r - 1))} do poder mágico.`,
  },
  mente_afiada: {
    classe: 'mago', tipo: 'passiva', nivelMin: 1, maxRank: 5,
    nome: 'Mente Afiada', icone: 'hab_orbe',
    bonus: (r) => ({ pct: { poder: 0.08 * r, ataque: 0.03 * r } }),
    texto: (r) => `+${pct(0.08 * r)} de poder mágico e +${pct(0.03 * r)} de ataque.`,
  },
  nevasca: {
    classe: 'mago', tipo: 'ativa', nivelMin: 3, maxRank: 5,
    nome: 'Nevasca', icone: 'hab_gelo',
    custo: 12, recarga: 4, alvo: 'todos',
    efeitos: (r) => [
      { tipo: 'dano', mult: 0.7 + 0.06 * (r - 1), magico: true, elemento: 'gelo' },
      { tipo: 'status', status: 'lento', turnos: 2, potencia: 0.3 },
    ],
    texto: (r) => `Gelo em TODOS os inimigos: ${pct(0.7 + 0.06 * (r - 1))} do poder mágico, e ficam 30% mais lentos por 2 turnos.`,
  },
  sabedoria: {
    classe: 'mago', tipo: 'passiva', nivelMin: 3, maxRank: 5,
    nome: 'Sabedoria', icone: 'hab_orbe', tinta: { p: '#3fa8ff', q: '#9ad8ff' },
    bonus: (r) => ({ pct: { manaMax: 0.1 * r, vidaMax: 0.06 * r } }),
    texto: (r) => `+${pct(0.1 * r)} de mana e +${pct(0.06 * r)} de vida.`,
  },
  corrente_raio: {
    classe: 'mago', tipo: 'ativa', nivelMin: 6, maxRank: 5,
    nome: 'Corrente de Raio', icone: 'hab_raio',
    custo: 15, recarga: 5, alvo: 'todos',
    efeitos: (r) => [{ tipo: 'dano', mult: 1.05 + 0.08 * (r - 1), magico: true, elemento: 'raio' }],
    texto: (r) => `Raio em TODOS os inimigos: ${pct(1.05 + 0.08 * (r - 1))} do poder mágico.`,
  },
  escudo_arcano: {
    classe: 'mago', tipo: 'ativa', nivelMin: 6, maxRank: 5,
    nome: 'Escudo Arcano', icone: 'hab_orbe', tinta: { p: '#8ad8ff', q: '#ffffff' },
    custo: 9, recarga: 6, alvo: 'proprio', quandoVidaAbaixo: 0.7,
    efeitos: (r) => [{ tipo: 'status', status: 'escudo', turnos: 4, potencia: 0.45 + 0.05 * (r - 1) }],
    texto: (r) => `Com a vida abaixo de 70%: recebe ${pct(0.45 + 0.05 * (r - 1))} menos dano por 4 turnos.`,
  },
  meteoro: {
    classe: 'mago', tipo: 'ativa', nivelMin: 10, maxRank: 5,
    nome: 'Meteoro', icone: 'hab_fogo', tinta: { r: '#c02f3f', o: '#ff5a3c', y: '#ffcf3f' },
    custo: 24, recarga: 7, alvo: 'inimigo',
    efeitos: (r) => [{ tipo: 'dano', mult: 2.6 + 0.2 * (r - 1), magico: true, elemento: 'fogo' }],
    texto: (r) => `Um golpe enorme de fogo: ${pct(2.6 + 0.2 * (r - 1))} do poder mágico.`,
  },
  concentracao: {
    classe: 'mago', tipo: 'passiva', nivelMin: 10, maxRank: 5,
    nome: 'Concentração', icone: 'hab_olho', tinta: { i: '#b36bff' },
    bonus: (r) => ({ plano: { critico: 0.02 * r } }),
    texto: (r) => `+${pct(0.02 * r)} de chance de crítico.`,
  },

  // ======================================================================= Arqueiro
  tiro_duplo: {
    classe: 'arqueiro', tipo: 'ativa', nivelMin: 1, maxRank: 5,
    nome: 'Tiro Duplo', icone: 'hab_flechas',
    recarga: 2, alvo: 'inimigo',
    efeitos: (r) => {
      const m = 0.62 + 0.05 * (r - 1);
      return [{ tipo: 'dano', mult: m }, { tipo: 'dano', mult: m }];
    },
    texto: (r) => `Duas flechas de ${pct(0.62 + 0.05 * (r - 1))} do ataque cada.`,
  },
  olho_aguia: {
    classe: 'arqueiro', tipo: 'passiva', nivelMin: 1, maxRank: 5,
    nome: 'Olho de Águia', icone: 'hab_olho',
    bonus: (r) => ({ plano: { critico: 0.025 * r } }),
    texto: (r) => `+${pct(0.025 * r)} de chance de crítico.`,
  },
  flecha_venenosa: {
    classe: 'arqueiro', tipo: 'ativa', nivelMin: 3, maxRank: 5,
    nome: 'Flecha Venenosa', icone: 'hab_gota',
    recarga: 3, alvo: 'inimigo',
    efeitos: (r) => [
      { tipo: 'dano', mult: 0.9, elemento: 'natureza' },
      { tipo: 'status', status: 'veneno', turnos: 3, potencia: 0.3 + 0.05 * (r - 1) },
    ],
    texto: (r) => `90% do ataque e envenena: ${pct(0.3 + 0.05 * (r - 1))} do ataque por turno, durante 3 turnos.`,
  },
  pes_leves: {
    classe: 'arqueiro', tipo: 'passiva', nivelMin: 3, maxRank: 5,
    nome: 'Pés Leves', icone: 'hab_pena',
    bonus: (r) => ({ plano: { esquiva: 0.015 * r }, pct: { velocidade: 0.02 * r } }),
    texto: (r) => `+${pct(0.015 * r)} de esquiva e +${pct(0.02 * r)} de velocidade.`,
  },
  chuva_flechas: {
    classe: 'arqueiro', tipo: 'ativa', nivelMin: 6, maxRank: 5,
    nome: 'Chuva de Flechas', icone: 'hab_flechas', tinta: { o: '#5a6478', s: '#ffcf3f' },
    recarga: 4, alvo: 'todos',
    efeitos: (r) => [{ tipo: 'dano', mult: 0.75 + 0.06 * (r - 1) }],
    texto: (r) => `Flechas em TODOS os inimigos: ${pct(0.75 + 0.06 * (r - 1))} do ataque.`,
  },
  mira_certeira: {
    classe: 'arqueiro', tipo: 'ativa', nivelMin: 6, maxRank: 5,
    nome: 'Mira Certeira', icone: 'hab_alvo',
    recarga: 5, alvo: 'inimigo',
    efeitos: (r) => [{ tipo: 'dano', mult: 1.15 + 0.1 * (r - 1), critico: true, ignora: 0.3 }],
    texto: (r) => `Crítico garantido de ${pct(1.15 + 0.1 * (r - 1))} do ataque, ignorando 30% da defesa.`,
  },
  instinto: {
    classe: 'arqueiro', tipo: 'passiva', nivelMin: 10, maxRank: 5,
    nome: 'Instinto Predador', icone: 'hab_olho', tinta: { i: '#ff5a4f' },
    bonus: (r) => ({ pct: { ataque: 0.05 * r } }),
    texto: (r) => `+${pct(0.05 * r)} de ataque.`,
  },
  couro_reforcado: {
    classe: 'arqueiro', tipo: 'passiva', nivelMin: 10, maxRank: 5,
    nome: 'Couro Reforçado', icone: 'hab_coracao', tinta: { r: '#b8743a', R: '#7a4a22' },
    bonus: (r) => ({ pct: { vidaMax: 0.06 * r, defesa: 0.04 * r } }),
    texto: (r) => `+${pct(0.06 * r)} de vida e +${pct(0.04 * r)} de defesa.`,
  },
};

/** Habilidades de uma classe, agrupadas pela faixa de nivel. */
export function arvoreDa(classeId) {
  return FAIXAS.map((nivel) => ({
    nivel,
    habilidades: Object.entries(ARVORES)
      .filter(([, h]) => h.classe === classeId && h.nivelMin === nivel)
      .map(([id, h]) => ({ id, ...h })),
  }));
}

export const ATIVAS_MAX = 3;
