/**
 * data/regioes.js - O mundo: regioes, mapas, ondas e o visual de cada uma.
 *
 * Mapa:
 *   { id, nome, nivel, ondas: [ ['gosma','lobo'], { m: ['lobo'], nivelExtra: 1 } ], chefe? }
 *   chefe: { id, nivel, escolta?: [...] } - vira a ultima onda.
 * Desbloqueio: o 1o mapa da regiao abre junto com ela; cada mapa abre o
 * seguinte; vencer o chefe abre a proxima regiao (systems/desbloqueio.js).
 *
 * Regiao sem mapas (ou com `emBreve`) aparece como "em breve" no Mapa.
 */

export const REGIOES = [
  {
    id: 'bosque',
    nome: 'Bosque dos Sussurros',
    descricao: 'Trilhas antigas onde o vento parece falar. Bom lugar para começar.',
    niveis: [1, 6],
    cenario: {
      semente: 11,
      ceu: ['#3fa8ff', '#7cc8ff', '#c8eeff'],
      sol: '#fff6c8',
      camadas: [
        { tipo: 'nuvens', cor: '#ffffff', sombra: '#d8eeff', vel: 0.05, densidade: 4 },
        { tipo: 'colinas', cor: '#8ed86a', realce: '#c4f59a', base: 0.66, altura: 0.18, vel: 0.15 },
        { tipo: 'arvores', cor: '#3fae4f', realce: '#7ad866', tronco: '#8a5a2a', base: 0.72, altura: 0.34, vel: 0.35, densidade: 14 },
        { tipo: 'arbustos', cor: '#2f9442', realce: '#5ec05a', base: 0.71, altura: 0.06, vel: 0.6, densidade: 16 },
      ],
      chao: {
        altura: 0.3, cor: '#5ece4a', cor2: '#4fbb40', borda: '#a6f06e',
        trilha: '#e8b878', trilha2: '#c8925a', pedra: '#fff0d0',
        flores: ['#ff6a8a', '#fff27a', '#ffffff'],
      },
    },
    mapas: [
      {
        id: 'bosque-1', nome: 'Trilha das Raízes', nivel: 1,
        ondas: [['gosma'], ['gosma', 'gosma'], ['lobo']],
      },
      {
        id: 'bosque-2', nome: 'Clareira Úmida', nivel: 2,
        ondas: [['gosma', 'cogumelo'], ['lobo'], ['cogumelo', 'cogumelo'], ['lobo', 'gosma']],
      },
      {
        id: 'bosque-3', nome: 'Toca dos Goblins', nivel: 3,
        ondas: [['goblin'], ['lobo', 'lobo'], ['goblin', 'cogumelo'], { m: ['goblin', 'goblin'], nivelExtra: 1 }],
      },
      {
        id: 'bosque-4', nome: 'Coração do Bosque', nivel: 5,
        ondas: [['lobo', 'goblin'], ['cogumelo', 'cogumelo', 'gosma']],
        chefe: { id: 'javali_anciao', nivel: 6 },
      },
    ],
  },
  {
    id: 'pantano',
    nome: 'Pântano de Lodomorto',
    descricao: 'Névoa verde e água parada. Dizem que uma bruxa mora no fundo.',
    niveis: [7, 13],
    cenario: {
      semente: 23,
      ceu: ['#7ab0a0', '#a8d8b8', '#e0f4d0'],
      camadas: [
        { tipo: 'nuvens', cor: '#f0fff4', sombra: '#c8e8d8', vel: 0.05, densidade: 3 },
        { tipo: 'arvores', cor: '#5a9a6a', realce: '#8ac88a', tronco: '#4a3a2a', base: 0.7, altura: 0.38, vel: 0.25, densidade: 18 },
        { tipo: 'juncos', cor: '#3a7a4a', ponta: '#a0703a', base: 0.72, altura: 0.12, vel: 0.6 },
      ],
      chao: {
        altura: 0.3, cor: '#6aae4a', cor2: '#5a9a40', borda: '#9ad86a',
        trilha: '#9a8058', trilha2: '#7a6444', pedra: '#c8b088',
        flores: ['#c88aff', '#ffffff'],
      },
    },
    mapas: [
      {
        id: 'pantano-1', nome: 'Margem Lamacenta', nivel: 7,
        ondas: [['lodo'], ['sapo', 'lodo'], ['mosquito', 'mosquito'], ['lodo', 'sapo']],
      },
      {
        id: 'pantano-2', nome: 'Ponte Podre', nivel: 9,
        ondas: [['mosquito', 'sapo'], ['lodo', 'lodo'], ['sapo', 'sapo', 'mosquito'], { m: ['lodo', 'mosquito'], nivelExtra: 1 }],
      },
      {
        id: 'pantano-3', nome: 'Ilha das Névoas', nivel: 11,
        ondas: [['sapo', 'mosquito', 'lodo'], ['lodo', 'lodo', 'sapo'], ['mosquito', 'mosquito', 'mosquito'], { m: ['sapo', 'sapo', 'lodo'], nivelExtra: 1 }],
      },
      {
        id: 'pantano-4', nome: 'Cabana da Bruxa', nivel: 12,
        ondas: [['lodo', 'sapo'], ['mosquito', 'sapo', 'lodo']],
        chefe: { id: 'bruxa_brejo', nivel: 13 },
      },
    ],
  },
  {
    id: 'minas',
    nome: 'Minas de Ferro Velho',
    descricao: 'Túneis abandonados pelos anões. Algo ainda martela lá embaixo.',
    niveis: [14, 21],
    cenario: {
      semente: 37,
      ceu: ['#2a2040', '#44365e', '#5e4a6a'],
      camadas: [
        { tipo: 'estalactites', cor: '#3a2e50', base: 0.06, altura: 0.22, vel: 0.3 },
        { tipo: 'cristais', cor: '#4ad8ff', realce: '#c8f8ff', base: 0.7, altura: 0.12, vel: 0.4, densidade: 22 },
      ],
      chao: {
        altura: 0.3, cor: '#6a5a6a', cor2: '#5a4a5a', borda: '#8a7a8a',
        trilha: '#a08068', trilha2: '#7a6050', pedra: '#d8c0a0',
        flores: ['#4ad8ff'],
      },
    },
    mapas: [
      {
        id: 'minas-1', nome: 'Entrada Desabada', nivel: 14,
        ondas: [['morcego'], ['esqueleto'], ['morcego', 'morcego'], ['esqueleto', 'morcego']],
      },
      {
        id: 'minas-2', nome: 'Galeria dos Trilhos', nivel: 16,
        ondas: [['aranha', 'morcego'], ['esqueleto', 'esqueleto'], ['aranha', 'aranha'], { m: ['esqueleto', 'aranha'], nivelExtra: 1 }],
      },
      {
        id: 'minas-3', nome: 'Veio de Cristal', nivel: 18,
        ondas: [['aranha', 'aranha', 'morcego'], ['esqueleto', 'aranha'], ['morcego', 'morcego', 'morcego'], { m: ['esqueleto', 'esqueleto', 'aranha'], nivelExtra: 1 }],
      },
      {
        id: 'minas-4', nome: 'Forja Profunda', nivel: 20,
        ondas: [['esqueleto', 'aranha'], ['morcego', 'esqueleto', 'morcego']],
        chefe: { id: 'golem_escoria', nivel: 21 },
      },
    ],
  },
  {
    id: 'picos',
    nome: 'Picos de Vidragelo',
    descricao: 'Gelo que corta como vidro. O ar é fino e o silêncio, pesado.',
    niveis: [22, 30],
    cenario: {
      semente: 41,
      ceu: ['#4a9cff', '#9ad0ff', '#eef8ff'],
      sol: '#ffffff',
      camadas: [
        { tipo: 'nuvens', cor: '#ffffff', sombra: '#dcecff', vel: 0.05, densidade: 5 },
        { tipo: 'montanhas', cor: '#8ab4e0', neve: '#ffffff', base: 0.68, altura: 0.38, vel: 0.1 },
        { tipo: 'pinheiros', cor: '#3f8aa8', realce: '#e8f8ff', base: 0.72, altura: 0.26, vel: 0.35, densidade: 9 },
      ],
      chao: {
        altura: 0.3, cor: '#f0f8ff', cor2: '#dcecf8', borda: '#ffffff',
        trilha: '#c8dcf0', trilha2: '#a8c0dc', pedra: '#ffffff',
      },
    },
    mapas: [
      {
        id: 'picos-1', nome: 'Trilha Congelada', nivel: 22,
        ondas: [['lobo_gelo'], ['lobo_gelo', 'lobo_gelo'], ['espirito_gelo'], ['yeti']],
      },
      {
        id: 'picos-2', nome: 'Desfiladeiro do Vento', nivel: 24,
        ondas: [['espirito_gelo', 'lobo_gelo'], ['yeti'], ['lobo_gelo', 'lobo_gelo', 'espirito_gelo'], { m: ['yeti', 'espirito_gelo'], nivelExtra: 1 }],
      },
      {
        id: 'picos-3', nome: 'Lago de Vidragelo', nivel: 27,
        ondas: [['yeti', 'lobo_gelo'], ['espirito_gelo', 'espirito_gelo'], ['lobo_gelo', 'lobo_gelo', 'lobo_gelo'], { m: ['yeti', 'yeti'], nivelExtra: 1 }],
      },
      {
        id: 'picos-4', nome: 'Ninho da Serpe', nivel: 29,
        ondas: [['yeti', 'espirito_gelo'], ['lobo_gelo', 'lobo_gelo', 'espirito_gelo']],
        chefe: { id: 'serpe_glacial', nivel: 30 },
      },
    ],
  },
  {
    id: 'cidadela',
    nome: 'Cidadela do Eclipse',
    descricao: 'A fortaleza de um rei que perdeu a coroa e não aceitou perder o resto.',
    niveis: [32, 40],
    cenario: {
      semente: 53,
      estrelas: 30,
      lua: '#fff0c8',
      ceu: ['#2a1a50', '#6a3a8a', '#ff8aa0'],
      camadas: [
        { tipo: 'nuvens', cor: '#b88ad8', sombra: '#8a5ab0', vel: 0.05, densidade: 3 },
        { tipo: 'casas', cor: '#3a2456', telhado: '#2a1840', janela: '#ffc23a', base: 0.72, altura: 0.42, vel: 0.3 },
      ],
      chao: {
        altura: 0.3, cor: '#6a5a8a', cor2: '#5a4a7a', borda: '#8a7aaa',
        trilha: '#a898b8', trilha2: '#887898', pedra: '#e0d8f0',
      },
    },
    mapas: [
      {
        id: 'cidadela-1', nome: 'Portões Caídos', nivel: 32,
        ondas: [['gargula'], ['cavaleiro_caido'], ['espectro', 'espectro'], ['cultista', 'gargula']],
      },
      {
        id: 'cidadela-2', nome: 'Pátio das Sombras', nivel: 34,
        ondas: [['cavaleiro_caido', 'espectro'], ['cultista', 'cultista'], ['gargula', 'espectro'], { m: ['cavaleiro_caido', 'cultista'], nivelExtra: 1 }],
      },
      {
        id: 'cidadela-3', nome: 'Biblioteca Proibida', nivel: 37,
        ondas: [['cultista', 'espectro', 'espectro'], ['cavaleiro_caido', 'gargula'], ['espectro', 'espectro', 'espectro'], { m: ['cavaleiro_caido', 'cavaleiro_caido', 'cultista'], nivelExtra: 1 }],
      },
      {
        id: 'cidadela-4', nome: 'Salão do Trono', nivel: 39,
        ondas: [['gargula', 'cavaleiro_caido'], ['cultista', 'espectro', 'cavaleiro_caido']],
        chefe: { id: 'rei_sem_coroa', nivel: 40 },
      },
    ],
  },
];

/** Cenario do Hub (a vila ao fim da tarde). */
export const CENARIO_HUB = {
  semente: 7,
  ceu: ['#ff9a6a', '#ffc88a', '#fff0c8'],
  sol: '#fff8e0',
  camadas: [
    { tipo: 'nuvens', cor: '#fff4e8', sombra: '#ffd8b8', vel: 0.05, densidade: 3 },
    { tipo: 'colinas', cor: '#9ad86a', realce: '#c8f59a', base: 0.64, altura: 0.16, vel: 0.15 },
    { tipo: 'casas', cor: '#f4e0c0', telhado: '#e0583a', janela: '#5a6aa8', base: 0.72, altura: 0.34, vel: 0.3 },
  ],
  chao: {
    altura: 0.3, cor: '#5ece4a', cor2: '#4fbb40', borda: '#a6f06e',
    trilha: '#e8b878', trilha2: '#c8925a', pedra: '#fff0d0',
    flores: ['#ff6a8a', '#fff27a'],
  },
};

// ---------------------------------------------------------------- consultas

const PORID_REGIAO = new Map(REGIOES.map((r) => [r.id, r]));
const PORID_MAPA = new Map(REGIOES.flatMap((r) => r.mapas.map((m) => [m.id, { ...m, regiao: r.id }])));

export const regiaoPorId = (id) => PORID_REGIAO.get(id);
export const mapaPorId = (id) => PORID_MAPA.get(id);
export const regiaoDoMapa = (mapaId) => PORID_REGIAO.get(PORID_MAPA.get(mapaId)?.regiao);

/** Ondas do mapa ja normalizadas, com o chefe como ultima onda. */
export function ondasDoMapa(mapa) {
  const ondas = mapa.ondas.map((o) => (Array.isArray(o)
    ? { monstros: o, nivel: mapa.nivel, chefe: false }
    : { monstros: o.m, nivel: mapa.nivel + (o.nivelExtra ?? 0), chefe: false }));
  if (mapa.chefe) {
    ondas.push({
      monstros: [...(mapa.chefe.escolta ?? []), mapa.chefe.id],
      nivel: mapa.chefe.nivel ?? mapa.nivel + 1,
      chefe: true,
    });
  }
  return ondas;
}
