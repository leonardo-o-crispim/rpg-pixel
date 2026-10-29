/**
 * data/icones.js - Icones da interface (moeda, cadeado, menu do Hub), feitos
 * a mao. Mesmo formato dos sprites; 'k' e o contorno desenhado na propria
 * matriz (icones nao recebem contorno automatico).
 */

export const PALETA_BASE = { k: '#2a1830' };

const ACO = { s: '#f4f8ff', m: '#b9c6d8', d: '#6e7d99' };

export const ICONES = {
  // --------------------------------------------------------- icones pequenos
  moeda: {
    cores: { y: '#f2c14e', Y: '#a8761f', w: '#fff3c0' },
    linhas: [
      '..kkkk..',
      '.kyyyyk.',
      'kyywyyYk',
      'kywyyyYk',
      'kyyyyyYk',
      'kyyyyYYk',
      '.kYYYYk.',
      '..kkkk..',
    ],
  },

  cadeado: {
    cores: { s: '#a4afc0', y: '#f2c14e', Y: '#a8761f' },
    linhas: [
      '..kkkk..',
      '.ks..sk.',
      '.ks..sk.',
      'kkkkkkkk',
      'kyyyyyyk',
      'kyykkyyk',
      'kYYYYYYk',
      'kkkkkkkk',
    ],
  },

  caveira: {
    cores: { w: '#ece4d4' },
    linhas: [
      '.kkkkkk.',
      'kwwwwwwk',
      'kwkwwkwk',
      'kwkwwkwk',
      'kwwwwwwk',
      '.kwwwwk.',
      '.kkwwkk.',
      '..kkkk..',
    ],
  },

  estrela: {
    cores: { y: '#f2c14e', Y: '#a8761f' },
    linhas: [
      '...kk...',
      '..kyyk..',
      'kkkyykkk',
      'kyyyyyYk',
      '.kyyyYk.',
      '.kyYkYk.',
      'kYk..kYk',
      'kk....kk',
    ],
  },

  // --------------------------------------------------------- icones do Hub 12x12
  espada: {
    cores: { s: '#e6ecf2', w: '#a4afc0', y: '#f0c050', o: '#7a4a22' },
    linhas: [
      '..........kk',
      '.........ksk',
      '........kswk',
      '.......kswk.',
      '......kswk..',
      '.....kswk...',
      '..k.kswk....',
      '..kyswk.....',
      '...kyk......',
      '..kokyk.....',
      '.kok..k.....',
      '.kk.........',
    ],
  },

  mochila: {
    cores: { t: '#9a6432', T: '#5e3a1a', y: '#f0c050' },
    linhas: [
      '....kkkk....',
      '...k....k...',
      '..kkkkkkkk..',
      '.kttttttttk.',
      '.kTttttttTk.',
      '.kkkkkkkkkk.',
      '.kttkyykttk.',
      '.kttkkkkttk.',
      '.kttttttttk.',
      '.kTttttttTk.',
      '.kTTTTTTTTk.',
      '..kkkkkkkk..',
    ],
  },

  armadura: {
    cores: { ...ACO },
    linhas: [
      '..kkk..kkk..',
      '.kmsskkssmk.',
      'kmsmmmmmmsmk',
      'kmmmmssmmmmk',
      'kkmmmssmmmkk',
      '.kmmmssmmmk.',
      '.kmmmmmmmmk.',
      '.kdmmmmmmdk.',
      '.kddmmmmddk.',
      '..kddddddk..',
      '...kkkkkk...',
      '............',
    ],
  },

  livro: {
    cores: { p: '#7a3fb0', P: '#45206e', y: '#f0c050', w: '#ece4d4' },
    linhas: [
      '............',
      '.kkkkkkkkkkk',
      '.kPppppppppk',
      '.kPpyyyyyppk',
      '.kPppppppppk',
      '.kPppyyypppk',
      '.kPppppppppk',
      '.kPppppppppk',
      '.kPppppppppk',
      '.kPwwwwwwwwk',
      '.kkkkkkkkkkk',
      '............',
    ],
  },

  bolsa: {
    cores: { t: '#b8862a', T: '#7a5414', y: '#ffe08a' },
    linhas: [
      '....kkkk....',
      '....kttk....',
      '.....kk.....',
      '....kttk....',
      '...kttttk...',
      '..kttyyttk..',
      '.kttyyyttTk.',
      '.kttttyttTk.',
      '.kttyyyttTk.',
      '.kTttttttTk.',
      '..kTTTTTTk..',
      '...kkkkkk...',
    ],
  },

  engrenagem: {
    cores: { s: '#a4afc0', d: '#5c6680' },
    linhas: [
      '.....kk.....',
      '..k.kssk.k..',
      '.kskssssksk.',
      '..kssddssk..',
      '.kssd..dssk.',
      'kssd....dssk',
      'kssd....dssk',
      '.kssd..dssk.',
      '..kssddssk..',
      '.kskssssksk.',
      '..k.kssk.k..',
      '.....kk.....',
    ],
  },
};
