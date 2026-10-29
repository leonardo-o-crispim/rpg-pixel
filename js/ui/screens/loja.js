/**
 * ui/screens/loja.js - Comprar pocoes e equipamento; vender o que sobra.
 */

import { h, trocar, fmt } from '../components/dom.js';
import { toast } from '../components/overlays.js';
import { cabecalho, moeda } from '../components/widgets.js';
import { celulaItem, abrirItem, nomeColorido, metaDoItem, seloGanho } from '../components/itens.js';
import { iconeSprite } from '../../render/pixel.js';
import { CONSUMIVEIS } from '../../data/itens.js';
import { B } from '../../data/balanceamento.js';
import { Jogo } from '../../systems/estado.js';
import { precoCompra, valorVenda } from '../../systems/itens.js';
import { comparar, vender, ordenar, mochilaCheia } from '../../systems/inventario.js';
import { estoque, comprarItem, comprarPocao, precoDaPocao } from '../../systems/loja.js';
import { venderEmLote } from './inventario.js';
import { classeDoHeroi } from '../../systems/progressao.js';

const precoComMoeda = (valor) => h('span', { class: 'preco' }, iconeSprite('moeda', 2), h('span', { class: 'num' }, fmt(valor)));

export function telaLoja({ aba: abaInicial = 'comprar' } = {}) {
  const estado = Jogo.dados;
  let aba = abaInicial;
  let corpo;
  let moedaEl;

  function pocao(id) {
    const def = CONSUMIVEIS[id];
    const preco = precoDaPocao(estado);
    const botao = (qtd) => h('button', {
      class: 'btn btn--pequeno btn--primario',
      disabled: estado.ouro < preco * qtd,
      onClick: () => {
        const r = comprarPocao(estado, id, qtd);
        toast(r.ok ? `+${qtd} ${qtd === 1 ? 'poção' : 'poções'}.` : r.motivo, r.ok ? 'sucesso' : '');
        Jogo.salvar();
        render();
      },
    }, `+${qtd}`, precoComMoeda(preco * qtd));
    return h('div', { class: 'painel oferta-pocao' },
      h('div', { class: 'linha' },
        iconeSprite(def.sprite, 4),
        h('div', {},
          h('b', {}, def.nome),
          h('p', { class: 'mudo pequeno' }, def.descricao),
          h('span', { class: 'pequeno' }, 'Você tem ', h('b', { class: 'num' }, estado.consumiveis[id] ?? 0)),
        ),
      ),
      h('div', { class: 'linha oferta-pocao__botoes' }, botao(1), botao(5)),
    );
  }

  async function verOferta(item) {
    const preco = precoCompra(item);
    const escolha = await abrirItem(item, {
      comparacao: comparar(estado, item),
      acoes: [
        { texto: 'Fechar', valor: null },
        { texto: `Comprar ${fmt(preco)}`, valor: 'comprar', variante: 'primario', desabilitado: estado.ouro < preco || mochilaCheia(estado) },
      ],
    });
    if (escolha === 'comprar') {
      const r = comprarItem(estado, item.uid);
      toast(r.ok ? 'Comprado! Está na mochila.' : r.motivo, r.ok ? 'sucesso' : '');
      Jogo.salvar();
      render();
    }
  }

  function abaComprar() {
    const ofertas = estoque(estado);
    const pocoes = Object.keys(CONSUMIVEIS).filter((id) => !CONSUMIVEIS[id].soComMana || classeDoHeroi(estado).usaMana);
    return [
      pocoes.map(pocao),
      h('div', { class: 'painel' },
        h('h2', { class: 'titulo-secao' }, 'Equipamentos'),
        h('p', { class: 'mudo pequeno' }, 'O estoque muda a cada expedição.'),
        ofertas.length
          ? h('div', { class: 'ofertas' }, ofertas.map((it) => {
            const preco = precoCompra(it);
            return h('button', { class: ['oferta', estado.ouro < preco && 'oferta--caro'], onClick: () => verOferta(it) },
              celulaItem(it, { tag: 'span' }),
              h('span', { class: 'oferta__info' }, nomeColorido(it), h('span', { class: 'mudo pequeno' }, metaDoItem(it))),
              h('span', { class: 'oferta__lado' }, seloGanho(comparar(estado, it).ganho), precoComMoeda(preco)),
            );
          }))
          : h('p', { class: 'vazio' }, 'Você levou tudo! Volte depois da próxima expedição.'),
      ),
    ];
  }

  async function verVenda(item) {
    const escolha = await abrirItem(item, {
      comparacao: comparar(estado, item),
      acoes: [
        { texto: 'Fechar', valor: null },
        { texto: `Vender +${valorVenda(item)}`, valor: 'vender', variante: 'primario' },
      ],
    });
    if (escolha === 'vender') {
      toast(`Vendido por ${vender(estado, item.uid)} de ouro.`, 'ouro');
      Jogo.salvar();
      render();
    }
  }

  function abaVender() {
    const lista = ordenar(estado.inventario);
    return [
      h('div', { class: 'linha linha--entre' },
        h('span', { class: 'mochila-cap num' }, `Mochila ${estado.inventario.length}/${B.CAPACIDADE_MOCHILA}`),
        h('button', {
          class: 'btn btn--pequeno', disabled: !lista.length,
          onClick: async () => { if (await venderEmLote(estado)) render(); },
        }, 'Vender em lote'),
      ),
      lista.length
        ? h('div', { class: 'grade-itens' }, lista.map((it) => celulaItem(it, { rotulo: fmt(valorVenda(it)), onClick: () => verVenda(it) })))
        : h('p', { class: 'painel vazio' }, 'Nada para vender. Itens equipados não aparecem aqui.'),
    ];
  }

  function render() {
    trocar(corpo,
      h('div', { class: 'abas', role: 'tablist' },
        [['comprar', 'Comprar'], ['vender', 'Vender']].map(([id, nome]) => h('button', {
          class: ['aba', aba === id && 'aba--ativa'], role: 'tab', 'aria-selected': String(aba === id),
          onClick: () => { aba = id; render(); },
        }, nome))),
      aba === 'comprar' ? abaComprar() : abaVender(),
    );
    moedaEl.atualizar(estado.ouro);
  }

  return {
    mount() {
      moedaEl = moeda(estado.ouro);
      corpo = h('div', { class: 'rolavel' });
      const tela = h('section', { class: 'tela-loja' }, cabecalho('Loja', { extra: moedaEl }), corpo);
      render();
      return tela;
    },
    unmount() { Jogo.salvar(); },
  };
}
