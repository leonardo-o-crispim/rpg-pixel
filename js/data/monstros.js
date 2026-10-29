/**
 * data/monstros.js - Bestiario.
 *
 * mult: multiplicadores sobre a curva base de data/balanceamento.js
 *       (vida, ataque, defesa, xp, ouro) e velocidade absoluta.
 * fraquezas: { elemento: multiplicador } (>1 fraco, <1 resistente).
 * habilidades: quando o monstro troca o ataque basico por outra acao.
 * visual: so para a cena. elastico = achata e estica parado; flutuar = voa
 *   (balanca e sombra menor); tinta = recolore o sprite (variacao de um
 *   monstro existente com outras letras de cor).
 * Uma habilidade pode aparecer duas vezes com usos diferentes (ex.: chefe que
 * invoca aos 70% e de novo aos 35%): use `uso` para separar a contagem.
 */

export const MONSTROS = {
  // ------------------------------------------------ Regiao 1: Bosque dos Sussurros
  gosma: {
    nome: 'Gosma Verde',
    sprite: 'gosma',
    visual: { elastico: true },
    mult: { vida: 0.8, ataque: 0.8, defesa: 0.6, velocidade: 85, xp: 0.8, ouro: 0.8 },
    fraquezas: { fogo: 1.5, gelo: 0.75 },
  },
  lobo: {
    nome: 'Lobo Cinzento',
    sprite: 'lobo',
    mult: { vida: 0.8, ataque: 1.0, defesa: 0.7, velocidade: 130, xp: 1.0, ouro: 0.7, esquiva: 0.08 },
    fraquezas: { fogo: 1.25 },
    habilidades: [{ id: 'mordida', aCada: 3 }],
  },
  cogumelo: {
    nome: 'Fungo Pestilento',
    sprite: 'cogumelo',
    visual: { elastico: true },
    mult: { vida: 1.1, ataque: 0.7, defesa: 0.9, velocidade: 80, xp: 1.1, ouro: 0.9 },
    fraquezas: { fogo: 1.75, natureza: 0.5 },
    habilidades: [{ id: 'esporos', aCada: 2 }],
  },
  goblin: {
    nome: 'Goblin Saqueador',
    sprite: 'goblin',
    mult: { vida: 1.1, ataque: 1.2, defesa: 0.9, velocidade: 105, xp: 1.2, ouro: 1.8 },
    fraquezas: { raio: 1.25 },
    habilidades: [{ id: 'golpe_baixo', chance: 0.3 }],
  },
  javali_anciao: {
    nome: 'Javali Ancião',
    sprite: 'javali',
    chefe: true,
    mult: { vida: 5.4, ataque: 1.2, defesa: 1.1, velocidade: 92, xp: 6, ouro: 6 },
    fraquezas: { fogo: 1.25, gelo: 1.25 },
    habilidades: [
      { id: 'furia', quandoVidaAbaixo: 0.5, maxUsos: 1 },
      { id: 'investida', aCada: 3 },
    ],
  },

  // --------------------------------------------- Regiao 2: Pantano de Lodomorto
  lodo: {
    nome: 'Lodo do Pântano',
    sprite: 'gosma',
    visual: { elastico: true, tinta: { g: '#9aa83f', G: '#5e6a26', l: '#d8e08a', p: '#c8a060' } },
    mult: { vida: 1.15, ataque: 0.85, defesa: 0.9, velocidade: 80, xp: 1.0, ouro: 0.9 },
    fraquezas: { fogo: 1.5, raio: 0.8 },
    habilidades: [{ id: 'lama', aCada: 3 }],
  },
  sapo: {
    nome: 'Sapo Venenoso',
    sprite: 'sapo',
    mult: { vida: 0.8, ataque: 1.0, defesa: 0.8, velocidade: 110, xp: 1.0, ouro: 0.9 },
    fraquezas: { gelo: 1.4, natureza: 0.5 },
    habilidades: [{ id: 'lingua_toxica', aCada: 2 }],
  },
  mosquito: {
    nome: 'Mosquito Gigante',
    sprite: 'mosquito',
    visual: { flutuar: true },
    mult: { vida: 0.6, ataque: 0.9, defesa: 0.6, velocidade: 140, xp: 0.9, ouro: 0.8, esquiva: 0.12 },
    fraquezas: { raio: 1.5, fogo: 1.25 },
    habilidades: [{ id: 'sugar', chance: 0.35 }],
  },
  bruxa_brejo: {
    nome: 'Bruxa do Brejo',
    sprite: 'bruxa',
    chefe: true,
    alcance: 'distancia',
    mult: { vida: 5.0, ataque: 1.05, poder: 1.25, defesa: 0.9, resistencia: 1.2, velocidade: 100, xp: 6, ouro: 6 },
    fraquezas: { fogo: 1.4, natureza: 0.5 },
    habilidades: [
      { id: 'chamado_brejo', quandoVidaAbaixo: 0.7, maxUsos: 1 },
      { id: 'chamado_brejo', uso: 'chamado_2', quandoVidaAbaixo: 0.35, maxUsos: 1 },
      { id: 'praga', aCada: 3 },
    ],
  },

  // --------------------------------------------- Regiao 3: Minas de Ferro Velho
  morcego: {
    nome: 'Morcego das Minas',
    sprite: 'morcego',
    visual: { flutuar: true },
    mult: { vida: 0.6, ataque: 0.95, defesa: 0.6, velocidade: 150, xp: 0.9, ouro: 0.8, esquiva: 0.14 },
    fraquezas: { raio: 1.3, fogo: 1.2 },
    habilidades: [{ id: 'mordida', aCada: 3 }],
  },
  esqueleto: {
    nome: 'Esqueleto Mineiro',
    sprite: 'esqueleto',
    mult: { vida: 1.1, ataque: 1.1, defesa: 1.2, velocidade: 95, xp: 1.1, ouro: 1.3 },
    fraquezas: { fogo: 1.25, natureza: 0.6, sombra: 0.5 },
    habilidades: [{ id: 'picareta', aCada: 3 }],
  },
  aranha: {
    nome: 'Aranha de Cristal',
    sprite: 'aranha',
    mult: { vida: 0.95, ataque: 1.0, defesa: 1.0, velocidade: 120, xp: 1.0, ouro: 1.0 },
    fraquezas: { fogo: 1.5, raio: 0.75 },
    habilidades: [{ id: 'teia', aCada: 3 }],
  },
  golem_escoria: {
    nome: 'Golem de Escória',
    sprite: 'golem',
    chefe: true,
    mult: { vida: 7.5, ataque: 1.4, defesa: 1.6, resistencia: 0.8, velocidade: 80, xp: 6, ouro: 6 },
    fraquezas: { gelo: 1.4, raio: 1.3, fogo: 0.5 },
    habilidades: [
      { id: 'fornalha', quandoVidaAbaixo: 0.3, maxUsos: 1 },
      { id: 'endurecer', aCada: 4 },
      { id: 'esmagar', aCada: 3 },
    ],
  },

  // ----------------------------------------------- Regiao 4: Picos de Vidragelo
  lobo_gelo: {
    nome: 'Lobo de Gelo',
    sprite: 'lobo',
    visual: { tinta: { c: '#d8ecff', C: '#7aa8d8', W: '#ffffff', h: '#eef6ff', e: '#1f62c8' } },
    mult: { vida: 0.9, ataque: 1.05, defesa: 0.8, velocidade: 140, xp: 1.0, ouro: 0.8, esquiva: 0.08 },
    fraquezas: { fogo: 1.5, gelo: 0.5 },
    habilidades: [{ id: 'mordida_gelida', aCada: 3 }],
  },
  yeti: {
    nome: 'Yeti',
    sprite: 'yeti',
    mult: { vida: 1.6, ataque: 1.2, defesa: 1.1, velocidade: 85, xp: 1.4, ouro: 1.3 },
    fraquezas: { fogo: 1.5, gelo: 0.4 },
    habilidades: [{ id: 'avalanche', aCada: 4 }],
  },
  espirito_gelo: {
    nome: 'Espírito Gélido',
    sprite: 'espirito',
    alcance: 'distancia',
    visual: { flutuar: true },
    mult: { vida: 0.7, ataque: 0.9, poder: 1.1, defesa: 0.6, resistencia: 1.5, velocidade: 115, xp: 1.0, ouro: 1.0, esquiva: 0.1 },
    fraquezas: { fogo: 1.8, fisico: 1.25, gelo: 0.3 },
    habilidades: [{ id: 'raio_gelido', chance: 0.5 }],
  },
  serpe_glacial: {
    nome: 'Serpe Glacial',
    sprite: 'serpe',
    chefe: true,
    mult: { vida: 7.5, ataque: 1.35, poder: 1.25, defesa: 1.2, resistencia: 1.2, velocidade: 110, xp: 6, ouro: 6 },
    fraquezas: { fogo: 1.5, raio: 1.2, gelo: 0.3 },
    habilidades: [
      { id: 'frenesi', quandoVidaAbaixo: 0.4, maxUsos: 1 },
      { id: 'sopro_gelido', aCada: 3 },
      { id: 'investida', aCada: 5 },
    ],
  },

  // --------------------------------------------- Regiao 5: Cidadela do Eclipse
  cavaleiro_caido: {
    nome: 'Cavaleiro Caído',
    sprite: 'heroi_cavaleiro',
    visual: { tinta: { m: '#5a5070', s: '#8a80a0', d: '#3a3050', b: '#5a2a6a', B: '#8a4a9a', n: '#3a1a4a', r: '#9a3ab8', R: '#5a1a78', L: '#c88aff', f: '#a898b8', F: '#7a6a8a', p: '#9a3ab8', y: '#8a7a9a', Y: '#5a5070' } },
    mult: { vida: 1.5, ataque: 1.15, defesa: 1.4, velocidade: 95, xp: 1.3, ouro: 1.3 },
    fraquezas: { raio: 1.3, sombra: 0.5 },
    habilidades: [{ id: 'golpe_sombrio', aCada: 3 }],
  },
  espectro: {
    nome: 'Espectro',
    sprite: 'espirito',
    alcance: 'distancia',
    visual: { flutuar: true, tinta: { c: '#b88aff', C: '#7a4ac8', w: '#f0e0ff', o: '#ff5a9a' } },
    mult: { vida: 0.8, ataque: 1.0, poder: 1.1, defesa: 0.6, resistencia: 1.0, velocidade: 120, xp: 1.0, ouro: 0.9, esquiva: 0.12 },
    fraquezas: { fisico: 1.3, fogo: 1.2, sombra: 0.3 },
    habilidades: [{ id: 'toque_drenante', aCada: 2 }],
  },
  cultista: {
    nome: 'Cultista do Eclipse',
    sprite: 'heroi_mago',
    alcance: 'distancia',
    visual: { tinta: { p: '#6a1a2a', P: '#3a0a1a', q: '#a83a4a', h: '#2a1830', H: '#1a1020', y: '#c86aff', c: '#c86aff', C: '#7a2ab8', f: '#c8b0b8', F: '#9a8090' } },
    mult: { vida: 1.0, ataque: 0.8, poder: 1.35, defesa: 0.8, resistencia: 0.9, velocidade: 100, xp: 1.2, ouro: 1.3 },
    fraquezas: { fisico: 1.2, sombra: 0.5 },
    habilidades: [
      { id: 'bencao_sombria', quandoVidaAbaixo: 0.5, maxUsos: 1 },
      { id: 'chama_negra', aCada: 2 },
    ],
  },
  gargula: {
    nome: 'Gárgula',
    sprite: 'gargula',
    visual: { flutuar: true },
    mult: { vida: 1.4, ataque: 1.1, defesa: 1.7, resistencia: 0.7, velocidade: 90, xp: 1.3, ouro: 1.2 },
    fraquezas: { raio: 1.4, gelo: 1.2, sombra: 0.6 },
    habilidades: [{ id: 'pele_pedra', aCada: 4 }],
  },
  rei_sem_coroa: {
    nome: 'Rei sem Coroa',
    sprite: 'rei',
    chefe: true,
    mult: { vida: 8.0, ataque: 1.3, poder: 1.3, defesa: 1.3, resistencia: 1.0, velocidade: 100, xp: 8, ouro: 8 },
    fraquezas: { raio: 1.2, sombra: 0.3 },
    habilidades: [
      { id: 'chamado_eclipse', quandoVidaAbaixo: 0.5, maxUsos: 1 },
      { id: 'drenar_alma', aCada: 4 },
      { id: 'lamina_eclipse', aCada: 3 },
    ],
  },
};
