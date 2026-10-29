/**
 * core/router.js - Maquina de estados das telas.
 *
 * Uma tela e uma fabrica com o contrato:
 *   (params) => { mount(params) -> HTMLElement, unmount?() }
 * Ninguem manipula #app diretamente: so o router. Toda troca de tela passa
 * pela mesma transicao.
 */

import { bus, EV } from './bus.js';

const DUR_SAIDA = 200; // precisa casar com .screen--exit em screens.css

class Roteador {
  constructor() {
    this.telas = new Map();
    this.raiz = null;
    this.atual = null;  // { nome, params, api, node }
    this.pilha = [];    // historico para voltar()
    this.travadoAte = 0;
  }

  init(raiz) { this.raiz = raiz; }

  register(nome, fabrica) { this.telas.set(nome, fabrica); return this; }

  /**
   * Navega para uma tela.
   * @param {object} opcoes {voltar:boolean, substituir:boolean}
   */
  go(nome, params = {}, opcoes = {}) {
    // trava por carimbo de tempo, nao por setTimeout: em aba oculta o
    // navegador atrasa temporizadores e a trava ficaria presa
    if (performance.now() < this.travadoAte) return;
    const fabrica = this.telas.get(nome);
    if (!fabrica) { console.error(`[router] tela desconhecida: ${nome}`); return; }
    this.travadoAte = performance.now() + DUR_SAIDA;

    const anterior = this.atual;
    if (anterior) {
      if (!opcoes.voltar && !opcoes.substituir) {
        this.pilha.push({ nome: anterior.nome, params: anterior.params });
        if (this.pilha.length > 12) this.pilha.shift();
      }
      anterior.node.classList.add('screen--exit');
      try { anterior.api.unmount?.(); } catch (e) { console.error(e); }
      const saindo = anterior.node;
      // sem animacao de saida (ex.: "reduzir movimento"), animationend nunca dispara
      if (getComputedStyle(saindo).animationName === 'none') saindo.remove();
      else {
        saindo.addEventListener('animationend', () => saindo.remove(), { once: true });
        setTimeout(() => saindo.remove(), DUR_SAIDA + 50);
      }
    }

    const api = fabrica(params) || {};
    const node = api.mount(params);
    node.classList.add('screen', opcoes.voltar ? 'screen--enter-back' : 'screen--enter');
    this.raiz.append(node);

    this.atual = { nome, params, api, node };
    bus.emit(EV.TELA, { nome, params });
  }

  /** Volta uma tela no historico. Sem historico, vai para o Hub. */
  voltar() {
    const alvo = this.pilha.pop();
    if (alvo) this.go(alvo.nome, alvo.params, { voltar: true });
    else this.go('hub', {}, { voltar: true });
  }

  limparPilha() { this.pilha.length = 0; }
  get nomeAtual() { return this.atual?.nome ?? null; }
}

export const Router = new Roteador();
