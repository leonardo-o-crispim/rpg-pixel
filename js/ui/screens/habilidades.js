/**
 * ui/screens/habilidades.js - A arvore da classe: aprender ranks, escolher
 * as 3 ativas e a ORDEM em que o heroi tenta usa-las.
 */

import { h, trocar, fmt } from '../components/dom.js';
import { modal, confirmar, toast } from '../components/overlays.js';
import { cabecalho } from '../components/widgets.js';
import { iconeSprite } from '../../render/pixel.js';
import { arvoreDa, ATIVAS_MAX } from '../../data/arvores.js';
import { Jogo } from '../../systems/estado.js';
import {
  defHabilidade, rankDe, pontosLivres, podeAprender, aprender, equiparAtiva, retirarAtiva, moverAtiva,
  redistribuir, precoRedistribuir, pontosGastos,
} from '../../systems/habilidades.js';

export function iconeHabilidade(id, escala = 3) {
  const d = defHabilidade(id);
  return iconeSprite(d.icone, escala, d.tinta ? { tinta: d.tinta } : {});
}

/** "7 mana · recarga 2" / "Passiva" */
function resumo(d) {
  if (d.tipo === 'passiva') return 'Passiva · sempre ligada';
  const partes = [];
  if (d.custo) partes.push(`${d.custo} mana`);
  if (d.recarga) partes.push(`recarga ${d.recarga}`);
  if (d.quandoVidaAbaixo) partes.push(`vida < ${Math.round(d.quandoVidaAbaixo * 100)}%`);
  return `Ativa · ${partes.join(' · ')}`;
}

const pips = (rank, max) => h('span', { class: 'pips', 'aria-label': `rank ${rank} de ${max}` },
  Array.from({ length: max }, (_, i) => h('i', { class: i < rank ? 'cheio' : '' })));

export function telaHabilidades() {
  const estado = Jogo.dados;
  let corpo;
  let seloPontos;

  async function abrir(id) {
    const d = defHabilidade(id);
    const r = rankDe(estado, id);
    const pode = podeAprender(estado, id);
    const ativa = d.tipo === 'ativa';
    const emUso = estado.habilidades.ativas.includes(id);
    const acoes = [{ texto: 'Fechar', valor: null }];
    if (ativa && r > 0) {
      acoes.push(emUso
        ? { texto: 'Tirar', valor: 'tirar' }
        : { texto: 'Usar', valor: 'usar', desabilitado: estado.habilidades.ativas.length >= ATIVAS_MAX });
    }
    acoes.push({ texto: r ? 'Melhorar' : 'Aprender', valor: 'aprender', variante: 'verde', desabilitado: !pode.ok });

    const escolha = await modal({
      classe: 'modal-hab',
      acoes,
      conteudo: h('div', { class: 'detalhe-hab' },
        h('div', { class: 'detalhe-hab__topo' },
          h('div', { class: 'detalhe-hab__icone' }, iconeHabilidade(id, 5)),
          h('div', {},
            h('h2', {}, d.nome),
            h('span', { class: 'mudo pequeno detalhe-hab__tipo' }, resumo(d)),
            h('div', {}, pips(r, d.maxRank)),
          ),
        ),
        r > 0 && h('p', { class: 'detalhe-hab__rank' }, h('b', {}, `Rank ${r}: `), d.texto(r)),
        r < d.maxRank && h('p', { class: 'detalhe-hab__rank detalhe-hab__rank--prox' }, h('b', {}, r ? `Rank ${r + 1}: ` : 'Ao aprender: '), d.texto(r + 1)),
        !pode.ok && r < d.maxRank && h('p', { class: 'mudo pequeno' }, pode.motivo),
        ativa && emUso && estado.habilidades.ativas.length > 1 && h('p', { class: 'mudo pequeno' },
          `Prioridade ${estado.habilidades.ativas.indexOf(id) + 1} de ${estado.habilidades.ativas.length}.`),
        ativa && r > 0 && !emUso && estado.habilidades.ativas.length >= ATIVAS_MAX && h('p', { class: 'mudo pequeno' },
          `As ${ATIVAS_MAX} vagas estão ocupadas. Tire uma para usar esta.`),
      ),
    });
    if (escolha === 'aprender' && aprender(estado, id)) toast(r ? `${d.nome} subiu para o rank ${r + 1}.` : `${d.nome} aprendida!`, 'sucesso');
    else if (escolha === 'usar') equiparAtiva(estado, id);
    else if (escolha === 'tirar') retirarAtiva(estado, id);
    if (escolha) Jogo.salvar();
    render();
  }

  function emUso() {
    const ativas = estado.habilidades.ativas;
    const linhas = [];
    for (let i = 0; i < ATIVAS_MAX; i++) {
      const id = ativas[i];
      if (!id) {
        linhas.push(h('div', { class: 'vaga vaga--livre' }, h('span', { class: 'vaga__num num' }, i + 1), 'Vaga livre: aprenda ou escolha uma ativa abaixo.'));
        continue;
      }
      const d = defHabilidade(id);
      linhas.push(h('div', { class: 'vaga' },
        h('span', { class: 'vaga__num num' }, i + 1),
        h('button', { class: 'vaga__hab', onClick: () => abrir(id) },
          h('span', { class: 'hab-icone' }, iconeHabilidade(id, 2)),
          h('span', { class: 'vaga__info' }, h('b', {}, d.nome), h('span', { class: 'mudo pequeno' }, `Rank ${rankDe(estado, id)} · ${resumo(d).replace('Ativa · ', '')}`)),
        ),
        h('span', { class: 'vaga__botoes' },
          h('button', { class: 'btn btn--pequeno', 'aria-label': 'Subir prioridade', disabled: i === 0, onClick: () => { moverAtiva(estado, id, -1); Jogo.salvar(); render(); } }, '↑'),
          h('button', { class: 'btn btn--pequeno', 'aria-label': 'Descer prioridade', disabled: i === ativas.length - 1, onClick: () => { moverAtiva(estado, id, 1); Jogo.salvar(); render(); } }, '↓'),
        ),
      ));
    }
    return h('div', { class: 'painel' },
      h('h2', { class: 'titulo-secao' }, 'Em uso · ordem de prioridade'),
      h('div', { class: 'vagas' }, linhas),
      h('p', { class: 'mudo pequeno' }, 'No combate, o herói usa a primeira da lista que estiver pronta. Se nenhuma estiver, ataca normalmente.'),
    );
  }

  function cartao(hab) {
    const r = rankDe(estado, hab.id);
    const travada = estado.heroi.nivel < hab.nivelMin;
    const pode = podeAprender(estado, hab.id).ok;
    return h('button', {
      class: ['cartao-hab', travada && 'cartao-hab--travada', r > 0 && 'cartao-hab--aprendida', estado.habilidades.ativas.includes(hab.id) && 'cartao-hab--uso'],
      onClick: () => abrir(hab.id),
    },
    h('span', { class: 'hab-icone hab-icone--grande' }, iconeHabilidade(hab.id, 3), pode && h('span', { class: 'hab-icone__mais' }, '+')),
    h('span', { class: 'cartao-hab__nome' }, hab.nome),
    h('span', { class: 'cartao-hab__tipo' }, hab.tipo === 'ativa' ? 'Ativa' : 'Passiva'),
    pips(r, hab.maxRank),
    );
  }

  function render() {
    const livres = pontosLivres(estado);
    seloPontos.textContent = `${livres} ${livres === 1 ? 'ponto' : 'pontos'}`;
    seloPontos.classList.toggle('selo-pontos--zero', livres === 0);
    const preco = precoRedistribuir(estado);
    trocar(corpo,
      emUso(),
      arvoreDa(estado.heroi.classe).map((faixa) => {
        const travada = estado.heroi.nivel < faixa.nivel;
        return h('div', { class: ['painel', 'faixa', travada && 'faixa--travada'] },
          h('h2', { class: 'titulo-secao' }, travada && iconeSprite('cadeado', 2), `Nível ${faixa.nivel}`),
          h('div', { class: 'grade-2' }, faixa.habilidades.map(cartao)),
        );
      }),
      h('button', {
        class: 'btn btn--bloco',
        disabled: pontosGastos(estado) === 0 || estado.ouro < preco,
        onClick: async () => {
          const ok = await confirmar({
            titulo: 'Redistribuir pontos?',
            texto: `Todos os pontos voltam para você e as ativas saem de uso. Custa ${fmt(preco)} de ouro.`,
            sim: 'Redistribuir',
          });
          if (ok && redistribuir(estado)) { toast('Pontos devolvidos.', 'sucesso'); Jogo.salvar(); }
          render();
        },
      }, `Redistribuir pontos (${fmt(preco)} de ouro)`),
      h('p', { class: 'centro dica-tela pequeno' }, 'Você ganha 1 ponto a cada nível.'),
    );
  }

  return {
    mount() {
      seloPontos = h('span', { class: 'selo-pontos num' }, '');
      corpo = h('div', { class: 'rolavel' });
      const tela = h('section', { class: 'tela-habilidades' }, cabecalho('Habilidades', { extra: seloPontos }), corpo);
      render();
      return tela;
    },
  };
}
