/**
 * ui/screens/equipamentos.js - O heroi e seus seis espacos: trocar pecas,
 * ver o que cada uma da, e "Equipar melhores".
 */

import { h, trocar, fmt } from '../components/dom.js';
import { modal, toast } from '../components/overlays.js';
import { cabecalho } from '../components/widgets.js';
import { celulaItem, abrirItem, nomeColorido, metaDoItem, seloGanho, COMPARAVEIS } from '../components/itens.js';
import { iconeSprite } from '../../render/pixel.js';
import { BASES, NOME_ESPACO, NOMES_STATS, formatarStat } from '../../data/itens.js';
import { Jogo } from '../../systems/estado.js';
import { statsHeroi, classeDoHeroi } from '../../systems/progressao.js';
import { basesPara, espacoDo } from '../../systems/itens.js';
import {
  comparar, ehMelhor, equipar, desequipar, equiparMelhores, ordenar, poderDoHeroi, mochilaCheia,
} from '../../systems/inventario.js';

const ESQUERDA = ['elmo', 'armadura', 'botas'];
const DIREITA = ['arma', 'anel', 'amuleto'];

export function telaEquipamentos() {
  const estado = Jogo.dados;
  let corpo;

  const candidatos = (espaco) => ordenar(estado.inventario.filter((it) => espacoDo(it) === espaco));
  const temMelhor = (espaco) => candidatos(espaco).some((it) => ehMelhor(estado, it));

  /** Silhueta do espaco vazio: o icone da peca-base da classe, apagado. */
  function iconeVazio(espaco) {
    const base = basesPara(estado.heroi.classe, espaco)[0];
    const cv = iconeSprite(BASES[base].sprite, 3, { sombra: true });
    cv.classList.add('slot__vazio');
    return cv;
  }

  function slot(espaco) {
    const item = estado.equipado[espaco];
    return h('button', {
      class: ['slot', item && `rar-${item.raridade}`],
      onClick: () => abrirEspaco(espaco),
      'aria-label': `${NOME_ESPACO[espaco]}: ${item ? 'equipado' : 'vazio'}`,
    },
    item ? celulaItem(item, { tag: 'span' }) : h('span', { class: 'item-celula item-celula--vazia' }, iconeVazio(espaco)),
    h('span', { class: 'slot__nome' }, NOME_ESPACO[espaco]),
    temMelhor(espaco) && h('span', { class: 'slot__melhor', 'aria-label': 'há algo melhor na mochila' }, '▲'),
    );
  }

  async function abrirEspaco(espaco) {
    const atual = estado.equipado[espaco];
    const lista = candidatos(espaco)
      .map((it) => ({ it, cmp: comparar(estado, it) }))
      .sort((a, b) => b.cmp.ganho - a.cmp.ganho);

    const escolha = await modal({
      titulo: NOME_ESPACO[espaco],
      acoes: [{ texto: 'Fechar', valor: null }],
      conteudo: (fechar) => h('div', { class: 'escolhas' },
        atual
          ? h('div', { class: 'escolha escolha--atual' },
            celulaItem(atual, { onClick: () => fechar({ ver: atual }) }),
            h('div', { class: 'escolha__info' }, nomeColorido(atual), h('span', { class: 'mudo pequeno' }, metaDoItem(atual))),
            h('button', { class: 'btn btn--pequeno', disabled: mochilaCheia(estado), onClick: () => fechar({ remover: true }) }, 'Tirar'),
          )
          : h('p', { class: 'mudo pequeno' }, 'Espaço vazio.'),
        h('h3', { class: 'titulo-secao' }, lista.length ? 'Na mochila' : 'Nada deste tipo na mochila'),
        lista.map(({ it, cmp }) => h('button', { class: 'escolha', onClick: () => fechar({ equipar: it }) },
          celulaItem(it, { tag: 'span' }),
          h('span', { class: 'escolha__info' }, nomeColorido(it), h('span', { class: 'mudo pequeno' }, metaDoItem(it))),
          seloGanho(cmp.ganho),
        )),
      ),
    });
    if (!escolha) return;
    if (escolha.remover) {
      desequipar(estado, espaco);
      toast('Peça guardada na mochila.');
    } else if (escolha.equipar) {
      equipar(estado, escolha.equipar.uid);
      toast(`${NOME_ESPACO[espaco]} trocado.`, 'sucesso');
    } else if (escolha.ver) {
      await abrirItem(escolha.ver, { comparacao: comparar(estado, escolha.ver) });
    }
    Jogo.salvar();
    render();
  }

  function render() {
    const classe = classeDoHeroi(estado);
    const semNada = statsHeroi(estado, {});
    const agora = statsHeroi(estado);
    const algoMelhor = [...ESQUERDA, ...DIREITA].some(temMelhor);

    trocar(corpo,
      h('div', { class: 'painel boneco' },
        h('div', { class: 'boneco__coluna' }, ESQUERDA.map(slot)),
        h('div', { class: 'boneco__heroi' },
          iconeSprite(classe.sprite, 5),
          h('span', { class: 'boneco__poder num' }, `Poder ${fmt(poderDoHeroi(estado))}`),
        ),
        h('div', { class: 'boneco__coluna' }, DIREITA.map(slot)),
      ),
      h('button', {
        class: 'btn btn--verde btn--bloco',
        disabled: !algoMelhor,
        onClick: () => {
          const n = equiparMelhores(estado);
          toast(n ? `${n} ${n === 1 ? 'peça trocada' : 'peças trocadas'}.` : 'Já está com o melhor.', n ? 'sucesso' : '');
          Jogo.salvar();
          render();
        },
      }, algoMelhor ? 'Equipar melhores' : 'Já está com o melhor'),
      h('div', { class: 'painel' },
        h('h2', { class: 'titulo-secao' }, 'Números com equipamento'),
        h('div', { class: 'grade-2 stats' },
          COMPARAVEIS.filter((k) => classe.pesos[k] > 0 || agora[k] !== semNada[k]).map((k) => {
            const bonus = agora[k] - semNada[k];
            return h('div', { class: 'stat' },
              h('span', { class: 'stat__rotulo' }, NOMES_STATS[k]),
              h('span', { class: 'stat__valor num' }, formatarStat(k, agora[k]),
                bonus > 1e-6 && h('span', { class: 'stat__bonus' }, ` +${formatarStat(k, bonus)}`)),
            );
          })),
        h('p', { class: 'mudo-2 pequeno' }, 'Em verde, o que vem do equipamento.'),
      ),
    );
  }

  return {
    mount() {
      corpo = h('div', { class: 'rolavel' });
      const tela = h('section', { class: 'tela-equipamentos' }, cabecalho('Equipamentos'), corpo);
      render();
      return tela;
    },
  };
}
