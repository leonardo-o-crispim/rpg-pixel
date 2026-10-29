/**
 * ui/screens/resultado.js - Fim da expedicao: o que ganhou, o que subiu,
 * o que abriu, e para onde ir agora.
 */

import { h, fmt } from '../components/dom.js';
import { barra } from '../components/widgets.js';
import { iconeSprite } from '../../render/pixel.js';
import { Router } from '../../core/router.js';
import { REGIOES, mapaPorId, regiaoDoMapa } from '../../data/regioes.js';
import { xpParaProximo } from '../../data/balanceamento.js';
import { Jogo } from '../../systems/estado.js';
import { SIGLAS_ATRIBUTOS } from '../../systems/progressao.js';
import { mapaLiberado } from '../../systems/desbloqueio.js';
import { celulaItem, abrirItem, nomeColorido } from '../components/itens.js';
import { comparar } from '../../systems/inventario.js';

/**
 * Numero que conta de 0 ate `valor` (desacelerando no fim). Usa o relogio,
 * nao o numero de quadros: mesmo com temporizador atrasado termina certo.
 */
function contador(valor, prefixo = '+') {
  const el = h('span', {}, `${prefixo}0`);
  const t0 = performance.now() + 200;
  const dur = 750;
  const passo = () => {
    const p = Math.max(0, Math.min(1, (performance.now() - t0) / dur));
    el.textContent = `${prefixo}${fmt(Math.round(valor * (1 - (1 - p) ** 3)))}`;
    if (p < 1) setTimeout(passo, 30);
  };
  setTimeout(passo, 30);
  return el;
}

const TITULOS = {
  vitoria: { texto: 'Vitória!', classe: 'resultado--vitoria' },
  derrota: { texto: 'Derrota', classe: 'resultado--derrota' },
  recuo: { texto: 'Recuou', classe: 'resultado--recuo' },
};

export function telaResultado({ resultado: r }) {
  return {
    /** "Voltar" do Android no resultado leva ao Hub (nao de volta a luta). */
    aoVoltar() {
      Router.limparPilha();
      Router.go('hub', {}, { voltar: true });
      return true;
    },
    mount() {
      const estado = Jogo.dados;
      const mapa = mapaPorId(r.mapaId);
      const regiao = regiaoDoMapa(r.mapaId);
      const titulo = TITULOS[r.tipo];
      const i = regiao.mapas.findIndex((m) => m.id === mapa.id);
      const seguinte = regiao.mapas[i + 1];
      const podeSeguir = r.tipo === 'vitoria' && seguinte && mapaLiberado(estado, seguinte.id);

      const xp = barra('xp', { alta: true });
      const prox = xpParaProximo(estado.heroi.nivel);
      xp.atualizar(estado.heroi.xp, prox, `NV ${estado.heroi.nivel} · ${fmt(estado.heroi.xp)} / ${fmt(prox)}`);

      const linha = (rotulo, valor, extra = null) => h('div', { class: 'linha linha--entre resultado__linha' },
        h('span', { class: 'mudo' }, rotulo), h('span', { class: 'num' }, valor, extra));

      // ganhos de atributos somados de todos os niveis da expedicao
      const ganhos = {};
      for (const n of r.niveis) for (const [k, v] of Object.entries(n.ganhos)) ganhos[k] = (ganhos[k] ?? 0) + v;

      const ultimaRegiao = REGIOES[REGIOES.length - 1];
      const fimDaJornada = r.tipo === 'vitoria' && r.primeira && mapa.chefe && regiao.id === ultimaRegiao.id;
      const dica = r.tipo === 'derrota'
        ? 'Dica: repita um mapa já vencido para subir de nível. Os atributos crescem sozinhos.'
        : r.tipo === 'recuo' ? 'Tudo o que você ganhou até recuar ficou com você.' : null;

      return h('section', { class: ['tela-resultado', titulo.classe] },
        h('div', { class: 'rolavel' },
          h('div', { class: 'resultado__titulo' },
            h('h1', { class: 'contornado' }, titulo.texto),
            h('p', { class: 'mudo' }, mapa.nome),
          ),
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Recompensas'),
            linha('Experiência', contador(r.xp)),
            linha('Ouro', h('span', { class: 'moeda' }, iconeSprite('moeda', 2), contador(r.ouro))),
            linha('Abates', fmt(r.abates)),
            r.pocoes > 0 && linha('Poções bebidas', fmt(r.pocoes)),
            r.bonus && linha(r.primeira ? 'Bônus da 1ª vitória' : 'Bônus de vitória', `+${fmt(r.bonus.xp)} XP · +${fmt(r.bonus.ouro)}`),
            h('div', { class: 'resultado__xp' }, xp),
          ),
          (r.itens.length > 0 || r.vendidosNaHora > 0) && h('div', { class: 'painel resultado__itens' },
            h('h2', { class: 'titulo-secao' }, r.itens.length === 1 ? 'Item encontrado' : 'Itens encontrados'),
            r.itens.map((it) => h('div', { class: 'linha resultado__item' },
              celulaItem(it, { onClick: () => abrirItem(it, { comparacao: comparar(estado, it) }) }),
              nomeColorido(it),
            )),
            r.vendidosNaHora > 0 && h('p', { class: 'mudo pequeno' },
              `Mochila cheia: ${r.vendidosNaHora} ${r.vendidosNaHora === 1 ? 'item foi vendido' : 'itens foram vendidos'} na hora.`),
          ),
          r.niveis.length > 0 && h('div', { class: 'painel resultado__nivel' },
            h('h2', { class: 'titulo-secao' }, 'Subiu de nível!'),
            h('p', { class: 'resultado__nivel-num num' }, `${r.nivelInicial} → ${r.nivelFinal}`),
            h('div', { class: 'resultado__ganhos' },
              Object.entries(ganhos).map(([k, v]) => h('span', { class: 'ganho' }, `${SIGLAS_ATRIBUTOS[k]} +${v}`))),
          ),
          r.desbloqueios.length > 0 && h('div', { class: 'painel resultado__desbloqueios' },
            h('h2', { class: 'titulo-secao' }, 'Desbloqueado'),
            r.desbloqueios.map((d) => h('p', { class: 'desbloqueio' },
              iconeSprite(d.tipo === 'regiao' ? 'estrela' : 'espada', 2),
              h('span', {}, d.tipo === 'regiao' ? 'Nova região: ' : 'Novo mapa: ', h('b', {}, d.nome),
                d.emBreve && h('span', { class: 'mudo pequeno' }, ` (mapas no ${d.emBreve})`)),
            )),
          ),
          fimDaJornada && h('div', { class: 'painel resultado__fim' },
            h('h2', { class: 'titulo-secao' }, 'Fim da jornada'),
            h('p', {}, `${estado.heroi.nome} derrotou o último chefe. As cinco regiões estão livres.`),
            h('p', { class: 'mudo pequeno' }, 'O progresso continua: farme mapas, cace itens lendários e complete a árvore de habilidades.'),
          ),
          dica && h('p', { class: 'centro mudo pequeno resultado__dica' }, dica),
        ),
        h('div', { class: 'rodape rodape--acoes' },
          podeSeguir && h('button', {
            class: 'btn btn--primario btn--bloco',
            onClick: () => Router.go('combate', { mapaId: seguinte.id }, { substituir: true }),
          }, `Seguir: ${seguinte.nome}`),
          r.itens.length > 0 && h('button', {
            class: 'btn btn--bloco',
            onClick: () => { Router.limparPilha(); Router.go('inventario', {}, { substituir: true }); },
          }, 'Ver inventário'),
          h('div', { class: 'grade-2' },
            h('button', { class: 'btn', onClick: () => Router.go('combate', { mapaId: mapa.id }, { substituir: true }) }, 'Repetir'),
            h('button', {
              class: ['btn', !podeSeguir && 'btn--primario'],
              onClick: () => { Router.limparPilha(); Router.go('hub', {}, { voltar: true }); },
            }, 'Hub'),
          ),
        ),
      );
    },
  };
}
