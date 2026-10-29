/**
 * data/itens.js - Equipamentos, raridades, afixos, materiais e consumiveis.
 *
 * Um item no save guarda os VALORES ja sorteados (systems/itens.js). Mudar
 * os numeros daqui afeta so itens novos: o que o jogador ja tem nao muda.
 * As formulas (valor por nivel, preco, chance de drop) ficam em
 * data/balanceamento.js; aqui so os parametros de cada peca.
 */

export const ESPACOS = [
  { id: 'arma', nome: 'Arma' },
  { id: 'elmo', nome: 'Elmo' },
  { id: 'armadura', nome: 'Armadura' },
  { id: 'botas', nome: 'Botas' },
  { id: 'anel', nome: 'Anel' },
  { id: 'amuleto', nome: 'Amuleto' },
];
export const NOME_ESPACO = Object.fromEntries(ESPACOS.map((e) => [e.id, e.nome]));

/**
 * mult: multiplica os atributos principais. afixos: quantos atributos extras.
 * peso / pesoChefe / pesoLoja: chance relativa em cada origem.
 * preco: multiplicador do preco base.
 * texto: cor do nome sobre fundo claro (a `cor` pura nem sempre e legivel).
 */
export const RARIDADES = {
  comum: { nome: 'Comum', cor: '#b8b8c0', texto: '#2a1830', mult: 1.0, afixos: 0, peso: 62, pesoChefe: 0, pesoLoja: 55, preco: 1 },
  incomum: { nome: 'Incomum', cor: '#5ed05a', texto: '#23853f', mult: 1.2, afixos: 1, peso: 27, pesoChefe: 50, pesoLoja: 35, preco: 1.8 },
  raro: { nome: 'Raro', cor: '#3fa8ff', texto: '#1f62c8', mult: 1.45, afixos: 2, peso: 8.5, pesoChefe: 35, pesoLoja: 10, preco: 3.5 },
  epico: { nome: 'Épico', cor: '#b36bff', texto: '#7a32c8', mult: 1.75, afixos: 3, peso: 2, pesoChefe: 12, pesoLoja: 0, preco: 7 },
  lendario: { nome: 'Lendário', cor: '#ff9f1c', texto: '#c25a00', mult: 2.1, afixos: 4, peso: 0.5, pesoChefe: 3, pesoLoja: 0, preco: 14 },
};
export const ORDEM_RARIDADES = ['comum', 'incomum', 'raro', 'epico', 'lendario'];

/** Material pelo nivel do item: da o nome ("de Ferro") e a cor do metal no icone. */
export const MATERIAIS = [
  { ate: 6, nome: 'Bronze', cores: { m: '#d8904a', s: '#ffd098', d: '#8a5228' } },
  { ate: 12, nome: 'Ferro', cores: { m: '#a8b0c0', s: '#eef2fa', d: '#5a6478' } },
  { ate: 20, nome: 'Aço', cores: { m: '#7c9cc8', s: '#d8e8ff', d: '#3f5a88' } },
  { ate: 30, nome: 'Prata Lunar', cores: { m: '#c8d0e8', s: '#ffffff', d: '#7a82a8' } },
  { ate: 40, nome: 'Astral', cores: { m: '#9a7aff', s: '#e0d0ff', d: '#5a3ab8' } },
  { ate: Infinity, nome: 'Eterno', cores: { m: '#ffc23a', s: '#fff4c0', d: '#b87a10' } },
];
export const materialDoNivel = (nivel) => MATERIAIS.find((m) => nivel <= m.ate);

export const TITULOS = {
  epico: ['do Falcão', 'da Aurora', 'das Brasas', 'do Vendaval', 'do Lobo Rei'],
  lendario: ['do Dragão', 'do Eclipse', 'dos Antigos', 'da Coroa Partida'],
};

/**
 * Pecas-base. primarios: atributos que a peca sempre tem.
 * classes: quem pode usar (ausente = todas).
 */
export const BASES = {
  espada: {
    espaco: 'arma', nome: 'Espada', sprite: 'item_espada', classes: ['cavaleiro'],
    primarios: [{ stat: 'ataque', base: 1, porNivel: 0.5 }],
  },
  cajado: {
    espaco: 'arma', nome: 'Cajado', sprite: 'item_cajado', classes: ['mago'],
    primarios: [{ stat: 'ataque', base: 1, porNivel: 0.45 }, { stat: 'poder', base: 0.5, porNivel: 0.3 }],
  },
  arco: {
    espaco: 'arma', nome: 'Arco', sprite: 'item_arco', classes: ['arqueiro'],
    primarios: [{ stat: 'ataque', base: 1, porNivel: 0.45 }, { stat: 'critico', base: 0.005, porNivel: 0.0003 }],
  },
  elmo: {
    espaco: 'elmo', nome: 'Elmo', sprite: 'item_elmo',
    primarios: [{ stat: 'defesa', base: 0.5, porNivel: 0.2 }, { stat: 'vidaMax', base: 2, porNivel: 1.2 }],
  },
  armadura: {
    espaco: 'armadura', nome: 'Armadura', sprite: 'item_armadura',
    primarios: [{ stat: 'defesa', base: 1, porNivel: 0.4 }, { stat: 'vidaMax', base: 3, porNivel: 1.8 }],
  },
  botas: {
    espaco: 'botas', nome: 'Botas', sprite: 'item_botas',
    primarios: [{ stat: 'velocidade', base: 1, porNivel: 0.3 }, { stat: 'defesa', base: 0.3, porNivel: 0.12 }],
  },
  anel: {
    espaco: 'anel', nome: 'Anel', sprite: 'item_anel',
    primarios: [{ stat: 'critico', base: 0.008, porNivel: 0.0004 }, { stat: 'ataque', base: 0.5, porNivel: 0.2 }],
  },
  amuleto: {
    espaco: 'amuleto', nome: 'Amuleto', sprite: 'item_amuleto',
    primarios: [{ stat: 'vidaMax', base: 3, porNivel: 1.5 }, { stat: 'resistencia', base: 0.5, porNivel: 0.25 }],
  },
};

/** Atributos extras sorteados conforme a raridade (sem repetir os principais). */
export const AFIXOS = {
  for: { base: 0.5, porNivel: 0.15 },
  int: { base: 0.5, porNivel: 0.15 },
  agi: { base: 0.5, porNivel: 0.15 },
  vit: { base: 0.5, porNivel: 0.15 },
  vidaMax: { base: 3, porNivel: 1.2 },
  manaMax: { base: 2, porNivel: 0.8 },
  ataque: { base: 0.5, porNivel: 0.25 },
  poder: { base: 0.5, porNivel: 0.3 },
  defesa: { base: 0.5, porNivel: 0.2 },
  resistencia: { base: 0.5, porNivel: 0.2 },
  velocidade: { base: 1, porNivel: 0.25 },
  critico: { base: 0.005, porNivel: 0.0005 },
  esquiva: { base: 0.005, porNivel: 0.0004 },
};

export const NOMES_STATS = {
  vidaMax: 'Vida', manaMax: 'Mana', ataque: 'Ataque', poder: 'Poder mágico',
  defesa: 'Defesa', resistencia: 'Resistência', velocidade: 'Velocidade',
  critico: 'Crítico', esquiva: 'Esquiva',
  for: 'Força', int: 'Inteligência', agi: 'Agilidade', vit: 'Vitalidade',
};
export const STATS_PERCENTUAIS = new Set(['critico', 'esquiva']);

/** Formata o valor de um atributo para a tela: 0.032 -> "3,2%", 12 -> "12". */
export function formatarStat(stat, valor) {
  if (STATS_PERCENTUAIS.has(stat)) return `${(valor * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  return Math.round(valor).toLocaleString('pt-BR');
}

export const CONSUMIVEIS = {
  pocao_vida: {
    nome: 'Poção de Vida',
    descricao: 'Recupera 30% da vida. O herói bebe sozinho quando a vida cai abaixo do limite (Ajustes). Até 2 por expedição.',
    sprite: 'pocao_vida',
    recurso: 'vida',
    cura: 0.3,
  },
  pocao_mana: {
    nome: 'Poção de Mana',
    descricao: 'Recupera 40% da mana. Bebida sozinha quando a mana cai abaixo de 30% e alguma magia precisa dela. Até 2 por expedição.',
    sprite: 'pocao_mana',
    recurso: 'mana',
    cura: 0.4,
    soComMana: true,
  },
};
