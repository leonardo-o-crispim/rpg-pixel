/**
 * ui/screens/mapa.js - Regioes e mapas: o que esta aberto, o que falta,
 * e a saida para a expedicao.
 */

import { h } from '../components/dom.js';
import { modal } from '../components/overlays.js';
import { cabecalho, moeda } from '../components/widgets.js';
import { iconeSprite } from '../../render/pixel.js';
import { gerarCenario } from '../../render/cenario.js';
import { Router } from '../../core/router.js';
import { REGIOES, ondasDoMapa } from '../../data/regioes.js';
import { MONSTROS } from '../../data/monstros.js';
import { Jogo } from '../../systems/estado.js';
import {
  regiaoLiberada, mapaLiberado, mapaConcluido, vitoriasNoMapa, regiaoConcluida,
} from '../../systems/desbloqueio.js';

const BANNER_W = 160;
const BANNER_H = 44;
const banners = new Map();

/** Miniatura do cenario da regiao (gerada uma vez por sessao). */
function banner(regiao) {
  if (!banners.has(regiao.id)) {
    banners.set(regiao.id, gerarCenario(BANNER_W, BANNER_H, regiao.cenario).canvas);
  }
  const cv = h('canvas', { class: 'regiao__banner', width: BANNER_W, height: BANNER_H, 'aria-hidden': 'true' });
  const ctx = cv.getContext('2d');
  ctx.drawImage(banners.get(regiao.id), 0, 0);
  return cv;
}

const nivelRecomendado = (mapa) => (mapa.chefe ? mapa.chefe.nivel : mapa.nivel);

/** Monstros distintos do mapa, na ordem em que aparecem. */
function monstrosDoMapa(mapa) {
  const vistos = new Set();
  for (const onda of ondasDoMapa(mapa)) for (const id of onda.monstros) vistos.add(id);
  return [...vistos];
}

async function detalhesMapa(mapa) {
  const estado = Jogo.dados;
  const nivel = estado.heroi.nivel;
  const rec = nivelRecomendado(mapa);
  const aviso = nivel < rec - 1 ? 'Muito perigoso para o seu nível.'
    : nivel < rec ? 'Desafiador. Pode dar certo.'
      : 'Seu nível é suficiente.';
  const conteudo = h('div', { class: 'detalhe-mapa' },
    h('div', { class: 'linha linha--entre' },
      h('span', { class: 'mudo' }, `Nível recomendado`),
      h('b', { class: ['num', nivel < rec ? 'cor-perigo' : 'cor-sucesso'] }, rec),
    ),
    h('div', { class: 'linha linha--entre' },
      h('span', { class: 'mudo' }, 'Ondas'),
      h('b', { class: 'num' }, ondasDoMapa(mapa).length),
    ),
    h('p', { class: 'pequeno detalhe-mapa__aviso' }, aviso),
    h('h3', { class: 'titulo-secao' }, 'Inimigos'),
    h('div', { class: 'detalhe-mapa__monstros' },
      monstrosDoMapa(mapa).map((id) => {
        const m = MONSTROS[id];
        return h('div', { class: ['monstro-mini', m.chefe && 'monstro-mini--chefe'] },
          iconeSprite(m.sprite, 2, { espelhar: true, tinta: m.visual?.tinta }),
          h('span', {}, m.nome),
        );
      }),
    ),
  );
  const partir = await modal({
    titulo: mapa.nome,
    conteudo,
    acoes: [
      { texto: 'Voltar', valor: false },
      { texto: 'Partir', valor: true, variante: 'primario' },
    ],
  });
  if (partir) Router.go('combate', { mapaId: mapa.id });
}

function itemMapa(mapa) {
  const estado = Jogo.dados;
  const aberto = mapaLiberado(estado, mapa.id);
  const vencido = mapaConcluido(estado, mapa.id);
  const icone = !aberto ? 'cadeado' : mapa.chefe ? 'caveira' : vencido ? 'estrela' : null;
  return h('button', {
    class: ['mapa-item', !aberto && 'mapa-item--bloqueado', vencido && 'mapa-item--vencido', mapa.chefe && 'mapa-item--chefe'],
    disabled: !aberto,
    onClick: () => detalhesMapa(mapa),
  },
  h('span', { class: 'mapa-item__icone' }, icone ? iconeSprite(icone, 2) : h('span', { class: 'mapa-item__novo' }, 'NOVO')),
  h('span', { class: 'mapa-item__info' },
    h('span', { class: 'mapa-item__nome' }, mapa.nome),
    h('span', { class: 'mapa-item__meta mudo pequeno' },
      aberto ? `Nível ${nivelRecomendado(mapa)} · ${ondasDoMapa(mapa).length} ondas${mapa.chefe ? ' · chefe' : ''}`
        : 'Vença o mapa anterior'),
  ),
  vencido && h('span', { class: 'mapa-item__vitorias num pequeno' }, `${vitoriasNoMapa(estado, mapa.id)}×`),
  );
}

function blocoRegiao(regiao, indice) {
  const estado = Jogo.dados;
  const aberta = regiaoLiberada(estado, regiao.id);
  const concluida = regiaoConcluida(estado, regiao.id);
  const anterior = REGIOES[indice - 1];
  let rodape;
  if (!aberta) rodape = h('p', { class: 'regiao__trava mudo pequeno' }, iconeSprite('cadeado', 2), `Derrote o chefe de ${anterior?.nome ?? 'a região anterior'}.`);
  else if (regiao.emBreve || !regiao.mapas.length) rodape = h('p', { class: 'regiao__trava mudo pequeno' }, `Região liberada! Os mapas chegam no marco ${regiao.emBreve}.`);
  else rodape = h('div', { class: 'regiao__mapas' }, regiao.mapas.map(itemMapa));

  return h('article', { class: ['regiao', 'painel', !aberta && 'regiao--bloqueada'] },
    h('div', { class: 'regiao__topo' },
      banner(regiao),
      h('div', { class: 'regiao__titulo' },
        h('h2', {}, regiao.nome),
        h('span', { class: 'num pequeno' }, `Nv ${regiao.niveis[0]}–${regiao.niveis[1]}`, concluida && ' · concluída'),
      ),
    ),
    aberta && h('p', { class: 'regiao__desc mudo pequeno' }, regiao.descricao),
    rodape,
  );
}

export function telaMapa() {
  return {
    mount() {
      const estado = Jogo.dados;
      return h('section', { class: 'tela-mapa' },
        cabecalho('Mapa', { extra: moeda(estado.ouro) }),
        h('div', { class: 'rolavel' }, REGIOES.map(blocoRegiao)),
      );
    },
  };
}
