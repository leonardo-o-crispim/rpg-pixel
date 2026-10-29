/**
 * data/classes.js - As classes jogaveis.
 *
 * base/crescimento: atributos no nivel 1 e quanto sobem por nivel.
 * ataque: coeficientes que transformam atributos no ataque basico.
 * disponivel: false mostra a classe na criacao, mas bloqueada (chega no M3,
 * junto com as habilidades que dao identidade a ela).
 * pesos: quanto cada numero de combate vale para a classe. E o que decide se
 *   um item e "melhor" (systems/inventario.js) e o "Equipar melhores".
 * afinidades: atributos extras que aparecem mais nos itens que ela encontra.
 */

export const CLASSES = {
  cavaleiro: {
    id: 'cavaleiro',
    nome: 'Cavaleiro',
    papel: 'Tanque corpo a corpo',
    descricao: 'Armadura pesada e espada firme. Aguenta o tranco e bate forte.',
    sprite: 'heroi_cavaleiro',
    base: { for: 6, int: 2, agi: 3, vit: 7 },
    crescimento: { for: 2, int: 0.5, agi: 1, vit: 2.5 },
    ataque: { for: 2.4, agi: 0.5 },
    alcance: 'corpo',
    elemento: 'fisico',
    pesos: { ataque: 1, defesa: 0.9, vidaMax: 0.12, velocidade: 0.4, critico: 45, esquiva: 35, resistencia: 0.3, poder: 0, manaMax: 0 },
    afinidades: ['for', 'vit', 'ataque', 'defesa', 'vidaMax', 'critico', 'velocidade'],
    disponivel: true,
  },
  mago: {
    id: 'mago',
    nome: 'Maga',
    papel: 'Dano mágico em área',
    descricao: 'Domina fogo, gelo e raio. Frágil, mas derruba grupos inteiros.',
    sprite: 'heroi_mago',
    base: { for: 2, int: 7, agi: 3, vit: 5 },
    crescimento: { for: 0.5, int: 2.5, agi: 1, vit: 2.1 },
    ataque: { int: 2.2 },
    alcance: 'distancia',
    elemento: 'arcano',
    pesos: { ataque: 0.6, poder: 1.1, manaMax: 0.15, vidaMax: 0.12, defesa: 0.6, resistencia: 0.5, velocidade: 0.4, critico: 40, esquiva: 35 },
    afinidades: ['int', 'poder', 'manaMax', 'ataque', 'vidaMax', 'resistencia', 'critico'],
    usaMana: true,
    disponivel: true,
  },
  arqueiro: {
    id: 'arqueiro',
    nome: 'Arqueiro',
    papel: 'Dano rápido à distância',
    descricao: 'Age antes de todos e acerta pontos fracos. Críticos frequentes.',
    sprite: 'heroi_arqueiro',
    base: { for: 3, int: 2, agi: 7, vit: 5 },
    crescimento: { for: 1, int: 0.5, agi: 1.9, vit: 1.6 },
    ataque: { agi: 1.65, for: 0.5 },
    alcance: 'distancia',
    elemento: 'fisico',
    pesos: { ataque: 1, critico: 60, velocidade: 0.6, esquiva: 45, vidaMax: 0.12, defesa: 0.6, resistencia: 0.3, poder: 0, manaMax: 0 },
    afinidades: ['agi', 'ataque', 'critico', 'velocidade', 'esquiva', 'vidaMax'],
    disponivel: true,
  },
};

export const ORDEM_CLASSES = ['cavaleiro', 'mago', 'arqueiro'];
