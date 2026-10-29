/**
 * systems/estado.js - O estado do jogo (o "save") e sua persistencia.
 *
 * Regra do projeto: o progresso e permanente. Por isso:
 *  - o save tem `versao` desde o primeiro dia;
 *  - toda mudanca de formato ganha um passo em MIGRACOES (nunca se apaga
 *    o save antigo para "comecar limpo");
 *  - campos novos que so precisam de valor padrao entram em estadoNovo() e
 *    sao preenchidos sozinhos por completar() ao carregar.
 */

import { Storage } from '../core/storage.js';
import { bus, EV } from '../core/bus.js';
import { B } from '../data/balanceamento.js';
import { itemInicial } from './itens.js';

export const VERSAO_SAVE = 3;

export function estadoNovo() {
  return {
    versao: VERSAO_SAVE,
    criadoEm: Date.now(),
    atualizadoEm: Date.now(),
    heroi: null,              // { nome, classe, nivel, xp }
    ouro: 0,
    progresso: {
      mapas: {},              // id -> { vitorias, tentativas }
      regioes: ['bosque'],    // regioes liberadas
    },
    inventario: [],           // itens na mochila
    equipado: {},             // espaco -> item (o item sai da mochila ao equipar)
    seqItem: 0,               // contador de identificadores de item
    consumiveis: { pocao_vida: B.POCOES_INICIAIS, pocao_mana: 0 },
    loja: { geradoEm: -1, itens: [] },
    habilidades: { ranks: {}, ativas: [] }, // id -> rank; ativas em ordem de prioridade
    config: {
      velocidade: 1, vibracao: true, numeros: true, limiarPocao: B.LIMIAR_POCAO,
      musica: true, efeitos: true, volMusica: 0.6, volEfeitos: 0.8,
    },
    estatisticas: { abates: 0, expedicoes: 0, vitorias: 0, derrotas: 0, recuos: 0, chefes: 0, ouroTotal: 0, xpTotal: 0 },
  };
}

/** Arma inicial da classe, para herois novos e para saves que vieram antes dos itens. */
function darArmaInicial(d) {
  d.seqItem = (d.seqItem ?? 0) + 1;
  d.equipado = d.equipado ?? {};
  d.equipado.arma = itemInicial(d.heroi.classe, `i${d.seqItem}`);
}

/**
 * Passos de migracao: MIGRACOES[n] leva um save da versao n para n+1.
 * Rodam ANTES de completar(): nao conte com campos novos ja existirem.
 */
const MIGRACOES = {
  // v2 (M2, itens): quem ja jogava ganha a arma inicial e as pocoes de boas-vindas
  1: (d) => {
    if (d.heroi && !d.equipado?.arma) darArmaInicial(d);
    d.consumiveis = { pocao_vida: B.POCOES_INICIAIS, ...(d.consumiveis ?? {}) };
    d.versao = 2;
  },
  // v3 (M3, habilidades): o formato provisorio {pontos, aprendidas} nunca foi usado
  2: (d) => {
    d.habilidades = { ranks: {}, ativas: [] };
    d.versao = 3;
  },
};

/** Preenche chaves ausentes com o padrao (so objetos; listas sao respeitadas). */
function completar(alvo, modelo) {
  for (const [k, v] of Object.entries(modelo)) {
    if (!(k in alvo) || alvo[k] === undefined) alvo[k] = v;
    else if (v && typeof v === 'object' && !Array.isArray(v) && alvo[k] && typeof alvo[k] === 'object') completar(alvo[k], v);
  }
  return alvo;
}

export function migrar(dados) {
  const d = dados;
  if (typeof d.versao !== 'number') d.versao = 1;
  while (d.versao < VERSAO_SAVE) {
    const passo = MIGRACOES[d.versao];
    if (!passo) { console.error(`[estado] sem migracao para a versao ${d.versao}`); break; }
    passo(d);
  }
  return completar(d, estadoNovo());
}

const ATRASO_SALVAR = 400;

class Estado {
  constructor() {
    this.dados = estadoNovo();
    this.timer = 0;
  }

  carregar() {
    const salvo = Storage.carregar();
    this.dados = salvo ? migrar(salvo) : estadoNovo();
    return this.dados;
  }

  /** Salva em seguida a uma rajada de mudancas (agrupa escritas). */
  salvar() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.salvarAgora(), ATRASO_SALVAR);
  }

  salvarAgora() {
    clearTimeout(this.timer);
    this.dados.atualizadoEm = Date.now();
    if (Storage.salvar(this.dados)) bus.emit(EV.SALVO, { quando: this.dados.atualizadoEm });
  }

  novoHeroi(nome, classe) {
    this.dados.heroi = { nome, classe, nivel: 1, xp: 0 };
    darArmaInicial(this.dados);
    this.salvarAgora();
  }

  /** Substitui o save inteiro (importacao). Passa pela migracao. */
  substituir(dados) {
    this.dados = migrar(dados);
    this.salvarAgora();
  }

  apagarTudo() {
    clearTimeout(this.timer);
    Storage.apagar();
    this.dados = estadoNovo();
  }

  get heroi() { return this.dados.heroi; }
  get config() { return this.dados.config; }
}

export const Jogo = new Estado();
