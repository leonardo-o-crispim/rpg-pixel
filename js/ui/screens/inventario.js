/**
 * ui/screens/inventario.js - A mochila: ver, filtrar, comparar, equipar e vender.
 */

import { h, trocar } from '../components/dom.js';
import { modal, toast } from '../components/overlays.js';
import { cabecalho, moeda } from '../components/widgets.js';
import { celulaItem, abrirItem } from '../components/itens.js';
import { iconeSprite } from '../../render/pixel.js';
import { Router } from '../../core/router.js';
import { ESPACOS, CONSUMIVEIS } from '../../data/itens.js';
import { classeDoHeroi } from '../../systems/progressao.js';
import { B } from '../../data/balanceamento.js';
import { Jogo } from '../../systems/estado.js';
import { espacoDo, nomeDoItem, valorVenda } from '../../systems/itens.js';
import { comparar, ehMelhor, equipar, vender, venderLote, marcarVistos, ordenar } from '../../systems/inventario.js';

/** Janela "vender em lote"; resolve com o resumo ou null. Usada aqui e na Loja. */
export async function venderEmLote(estado) {
  const ate = await modal({
    titulo: 'Vender em lote',
    texto: 'Vende tudo até a raridade escolhida. Itens melhores que o equipado são poupados.',
    acoes: [
      { texto: 'Cancelar', valor: null },
      { texto: 'Comuns', valor: 'comum' },
      { texto: 'Até incomuns', valor: 'incomum', variante: 'primario' },
    ],
  });
  if (!ate) return null;
  const r = venderLote(estado, ate);
  toast(r.qtd ? `${r.qtd} ${r.qtd === 1 ? 'item vendido' : 'itens vendidos'} por ${r.ouro} de ouro.` : 'Nada para vender nessa faixa.', r.qtd ? 'ouro' : '');
  Jogo.salvar();
  return r;
}

export function telaInventario() {
  const estado = Jogo.dados;
  let filtro = 'todos';
  let corpo;
  let moedaEl;

  async function abrir(item) {
    const escolha = await abrirItem(item, {
      comparacao: comparar(estado, item),
      acoes: [
        { texto: `Vender +${valorVenda(item)}`, valor: 'vender' },
        { texto: 'Equipar', valor: 'equipar', variante: 'verde' },
      ],
    });
    if (escolha === 'vender') {
      toast(`Vendido por ${vender(estado, item.uid)} de ouro.`, 'ouro');
      Jogo.salvar();
    } else if (escolha === 'equipar') {
      equipar(estado, item.uid);
      toast(`${nomeDoItem(item)} equipado.`, 'sucesso');
      Jogo.salvar();
    }
    render();
  }

  function render() {
    const lista = ordenar(estado.inventario.filter((it) => filtro === 'todos' || espacoDo(it) === filtro));
    const filtros = [['todos', 'Todos'], ...ESPACOS.map((e) => [e.id, e.nome])];
    trocar(corpo,
      h('div', { class: 'painel linha linha--entre linha-pocao' },
        h('div', { class: 'linha linha-pocao__lista' },
          Object.entries(CONSUMIVEIS)
            .filter(([, c]) => !c.soComMana || classeDoHeroi(estado).usaMana)
            .map(([id, c]) => h('div', { class: 'linha' },
              iconeSprite(c.sprite, 3),
              h('div', { class: 'linha-pocao__texto' },
                h('b', {}, c.nome.replace('Poção de ', '')),
                h('span', { class: 'mudo pequeno' }, `Você tem ${estado.consumiveis[id] ?? 0}`),
              ),
            ))),
        h('button', { class: 'btn btn--pequeno', onClick: () => Router.go('loja') }, 'Loja'),
      ),
      h('div', { class: 'chips', role: 'tablist' },
        filtros.map(([id, nome]) => h('button', {
          class: ['chip', filtro === id && 'chip--ativo'],
          role: 'tab', 'aria-selected': String(filtro === id),
          onClick: () => { filtro = id; render(); },
        }, nome))),
      h('div', { class: 'linha linha--entre' },
        h('span', { class: ['mochila-cap', 'num', estado.inventario.length >= B.CAPACIDADE_MOCHILA && 'cor-perigo'] },
          `Mochila ${estado.inventario.length}/${B.CAPACIDADE_MOCHILA}`),
        h('button', {
          class: 'btn btn--pequeno', disabled: !estado.inventario.length,
          onClick: async () => { if (await venderEmLote(estado)) render(); },
        }, 'Vender em lote'),
      ),
      lista.length
        ? h('div', { class: 'grade-itens' }, lista.map((it) => celulaItem(it, { melhor: ehMelhor(estado, it), onClick: () => abrir(it) })))
        : h('p', { class: 'painel vazio' }, filtro === 'todos'
          ? 'Mochila vazia. Monstros às vezes deixam itens cair, e a Loja vende equipamento.'
          : 'Nada deste tipo na mochila.'),
      lista.length > 0 && h('p', { class: 'centro dica-tela pequeno' }, '▲ = melhor que o que está equipado agora.'),
    );
    moedaEl.atualizar(estado.ouro);
  }

  return {
    mount() {
      moedaEl = moeda(estado.ouro);
      corpo = h('div', { class: 'rolavel' });
      const tela = h('section', { class: 'tela-inventario' }, cabecalho('Inventário', { extra: moedaEl }), corpo);
      render();
      return tela;
    },
    unmount() {
      marcarVistos(estado); // as marcas de "novo" valem so para esta visita
      Jogo.salvar();
    },
  };
}
