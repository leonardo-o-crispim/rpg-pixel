/**
 * data/habilidades.js - Acoes de combate dos monstros, status e elementos.
 * As habilidades do heroi (com ranks e arvore) ficam em data/arvores.js e
 * usam o MESMO formato de efeitos.
 *
 * Uma habilidade e uma lista de efeitos aplicados em ordem:
 *   { tipo: 'dano',   mult, magico?, elemento?, ignora?, critico? }
 *       ignora = fracao da defesa ignorada; critico: true = sempre critico
 *   { tipo: 'status', status, turnos, potencia }
 *   { tipo: 'cura',   pct }                                  fracao da vida maxima
 *   { tipo: 'invocar', monstro, qtd, nivelMenos? }           lacaios na frente (so monstros)
 * Qualquer efeito com alvoProprio: true vale para QUEM USA (ex.: dano no
 * heroi + cura em si mesmo = dreno; escudo proprio depois de atacar).
 * alvo: 'inimigo' (o da frente) | 'todos' | 'proprio' | 'aleatorio'
 *
 * Quem usa a habilidade declara QUANDO usa (no monstro ou no heroi):
 *   { id, aCada?, quandoVidaAbaixo?, maxUsos?, recarga?, chance? }
 */

export const HABILIDADES = {
  ataque: {
    nome: 'Ataque',
    alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1 }],
  },
  investida: {
    nome: 'Investida',
    alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.9 }],
  },
  furia: {
    nome: 'Fúria',
    alvo: 'proprio',
    efeitos: [{ tipo: 'status', status: 'furia', turnos: 99, potencia: 0.35 }, { tipo: 'cura', pct: 0.1 }],
  },
  esporos: {
    nome: 'Esporos',
    alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 0.6, elemento: 'natureza' }, { tipo: 'status', status: 'veneno', turnos: 3, potencia: 0.35 }],
  },
  golpe_baixo: {
    nome: 'Golpe Baixo',
    alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.3, ignora: 0.5 }],
  },
  mordida: {
    nome: 'Mordida',
    alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.25 }, { tipo: 'status', status: 'sangramento', turnos: 2, potencia: 0.25 }],
  },

  // ------------------------------------------------------------ Pantano
  lama: {
    nome: 'Lama', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 0.7, elemento: 'natureza' }, { tipo: 'status', status: 'lento', turnos: 2, potencia: 0.25 }],
  },
  lingua_toxica: {
    nome: 'Língua Tóxica', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 0.8, elemento: 'natureza' }, { tipo: 'status', status: 'veneno', turnos: 2, potencia: 0.3 }],
  },
  sugar: {
    nome: 'Sugar', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.0 }, { tipo: 'cura', pct: 0.15, alvoProprio: true }],
  },
  chamado_brejo: {
    nome: 'Chamado do Brejo', alvo: 'proprio',
    efeitos: [{ tipo: 'invocar', monstro: 'sapo', qtd: 2 }],
  },
  praga: {
    nome: 'Praga', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.2, magico: true, elemento: 'natureza' }, { tipo: 'status', status: 'veneno', turnos: 3, potencia: 0.35 }],
  },

  // -------------------------------------------------------------- Minas
  picareta: {
    nome: 'Picareta', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.5, ignora: 0.35 }],
  },
  teia: {
    nome: 'Teia', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 0.6 }, { tipo: 'status', status: 'lento', turnos: 2, potencia: 0.35 }],
  },
  endurecer: {
    nome: 'Endurecer', alvo: 'proprio',
    efeitos: [{ tipo: 'status', status: 'escudo', turnos: 2, potencia: 0.5 }],
  },
  esmagar: {
    nome: 'Esmagar', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.9 }, { tipo: 'status', status: 'atordoado', turnos: 1, potencia: 1 }],
  },
  fornalha: {
    nome: 'Fornalha', alvo: 'proprio',
    efeitos: [{ tipo: 'status', status: 'furia', turnos: 99, potencia: 0.4 }],
  },

  // -------------------------------------------------------------- Picos
  mordida_gelida: {
    nome: 'Mordida Gélida', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.2, elemento: 'gelo' }, { tipo: 'status', status: 'lento', turnos: 1, potencia: 0.3 }],
  },
  avalanche: {
    nome: 'Avalanche', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.8 }],
  },
  raio_gelido: {
    nome: 'Raio Gélido', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.1, magico: true, elemento: 'gelo' }],
  },
  sopro_gelido: {
    nome: 'Sopro Gélido', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.4, magico: true, elemento: 'gelo' }, { tipo: 'status', status: 'lento', turnos: 2, potencia: 0.3 }],
  },
  frenesi: {
    nome: 'Frenesi', alvo: 'proprio',
    efeitos: [
      { tipo: 'status', status: 'acelerado', turnos: 99, potencia: -0.4 },
      { tipo: 'status', status: 'furia', turnos: 99, potencia: 0.2 },
    ],
  },

  // ----------------------------------------------------------- Cidadela
  golpe_sombrio: {
    nome: 'Golpe Sombrio', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.6, elemento: 'sombra' }],
  },
  toque_drenante: {
    nome: 'Toque Drenante', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.0, magico: true, elemento: 'sombra' }, { tipo: 'cura', pct: 0.12, alvoProprio: true }],
  },
  chama_negra: {
    nome: 'Chama Negra', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.3, magico: true, elemento: 'sombra' }],
  },
  bencao_sombria: {
    nome: 'Bênção Sombria', alvo: 'proprio',
    efeitos: [{ tipo: 'cura', pct: 0.3 }],
  },
  pele_pedra: {
    nome: 'Pele de Pedra', alvo: 'proprio',
    efeitos: [{ tipo: 'status', status: 'escudo', turnos: 2, potencia: 0.5 }],
  },
  lamina_eclipse: {
    nome: 'Lâmina do Eclipse', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.5, elemento: 'sombra', ignora: 0.2 }],
  },
  drenar_alma: {
    nome: 'Drenar Alma', alvo: 'inimigo',
    efeitos: [{ tipo: 'dano', mult: 1.2, magico: true, elemento: 'sombra' }, { tipo: 'cura', pct: 0.08, alvoProprio: true }],
  },
  chamado_eclipse: {
    nome: 'Chamado do Eclipse', alvo: 'proprio',
    efeitos: [{ tipo: 'invocar', monstro: 'espectro', qtd: 2 }, { tipo: 'status', status: 'furia', turnos: 99, potencia: 0.3 }],
  },
};

/**
 * Efeitos que duram alguns turnos de quem os carrega (contados nos turnos DELE).
 * porTurno: 'dano'  tira vida no inicio do turno do portador.
 * ataqueMult        soma `potencia` ao multiplicador de ataque.
 * reduzDano         dano recebido x (1 - potencia).
 * velocidadeMult    velocidade x (1 - potencia).
 * impede            perde o turno.
 * chefeImune        nao pega em chefes (atordoar um chefe travaria a luta).
 * negativo          o descanso entre ondas remove.
 */
export const STATUS = {
  veneno: { nome: 'Veneno', cor: '#8ee04a', porTurno: 'dano', negativo: true },
  sangramento: { nome: 'Sangramento', cor: '#e04a4a', porTurno: 'dano', negativo: true },
  furia: { nome: 'Fúria', cor: '#ff7a3c', ataqueMult: true },
  atordoado: { nome: 'Atordoado', cor: '#ffe14a', impede: true, chefeImune: true, negativo: true },
  escudo: { nome: 'Escudo', cor: '#8ad8ff', reduzDano: true },
  lento: { nome: 'Lento', cor: '#9ab0ff', velocidadeMult: true, negativo: true },
  // potencia negativa: velocidade x (1 + |potencia|)
  acelerado: { nome: 'Acelerado', cor: '#ffe14a', velocidadeMult: true },
};

/** Fraqueza/resistencia: multiplicador sobre o dano daquele elemento. */
export const ELEMENTOS = {
  fisico: { nome: 'Físico', cor: '#ffffff' },
  arcano: { nome: 'Arcano', cor: '#c89bff' },
  fogo: { nome: 'Fogo', cor: '#ff8a3c' },
  gelo: { nome: 'Gelo', cor: '#8ad8ff' },
  raio: { nome: 'Raio', cor: '#ffe14a' },
  natureza: { nome: 'Natureza', cor: '#8ee04a' },
  sombra: { nome: 'Sombra', cor: '#9a6ad6' },
};
