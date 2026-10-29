/**
 * ui/screens/hub.js - O acampamento: estado do heroi e saida para tudo.
 */

import { h, fmt } from '../components/dom.js';
import { toast } from '../components/overlays.js';
import { barra, moeda, botaoIcone } from '../components/widgets.js';
import { desenharSprite, dimensoes } from '../../render/pixel.js';
import { gerarCamadas, desenharCenario } from '../../render/cenario.js';
import { LARGURA_MIN } from '../../render/cena.js';
import { criarLoop } from '../../core/loop.js';
import { Router } from '../../core/router.js';
import { CENARIO_HUB } from '../../data/regioes.js';
import { xpParaProximo } from '../../data/balanceamento.js';
import { Jogo } from '../../systems/estado.js';
import { statsHeroi, classeDoHeroi, NOMES_ATRIBUTOS } from '../../systems/progressao.js';
import { proximoMapa } from '../../systems/desbloqueio.js';
import { contarNovos, poderDoHeroi } from '../../systems/inventario.js';
import { pontosLivres } from '../../systems/habilidades.js';

const ALTURA_HUB = 72;

/** Fogueira animada em pixels (sem sprite: muda a cada quadro). */
function desenharFogueira(ctx, x, y, t) {
  ctx.fillStyle = '#4a2a18';
  ctx.fillRect(x - 6, y, 12, 2);
  ctx.fillStyle = '#2e1a10';
  ctx.fillRect(x - 4, y + 1, 8, 1);
  const f = Math.floor(t / 110);
  const cores = ['#ffe08a', '#ffb040', '#ff6a2a', '#c8301a'];
  for (let i = 0; i < 4; i++) {
    const alt = 9 - i * 2 + ((f + i) % 3) - 1;
    const larg = 7 - i * 2;
    ctx.fillStyle = cores[3 - i];
    ctx.fillRect(x - Math.floor(larg / 2) - ((f + i) % 2), y - alt, larg, alt);
  }
  // fagulhas
  ctx.fillStyle = '#ffe08a';
  for (let i = 0; i < 3; i++) {
    const ciclo = (t / 900 + i / 3) % 1;
    ctx.fillRect(Math.round(x + Math.sin((t / 300) + i * 2) * 3), Math.round(y - 10 - ciclo * 18), 1, 1);
  }
  // brilho no chao
  ctx.fillStyle = 'rgba(255,160,60,0.18)';
  ctx.fillRect(x - 16, y - 1, 32, 4);
}

function cenaHub(canvas, spriteHeroi) {
  const ctx = canvas.getContext('2d');
  let cen = null, W = 120, t = 0, ultimaLargura = 0;
  const ajustar = (larguraCss) => {
    if (larguraCss === ultimaLargura) return;
    ultimaLargura = larguraCss;
    const escala = Math.max(2, Math.floor(larguraCss / LARGURA_MIN));
    W = Math.floor(larguraCss / escala);
    canvas.width = W;
    canvas.height = ALTURA_HUB;
    canvas.style.width = `${W * escala}px`;
    canvas.style.height = `${ALTURA_HUB * escala}px`;
    ctx.imageSmoothingEnabled = false;
    cen = gerarCamadas(W, ALTURA_HUB, CENARIO_HUB);
  };
  const { w, h: alt } = dimensoes(spriteHeroi);
  const quadro = (dt) => {
    t += dt;
    if (!cen) return;
    desenharCenario(ctx, cen, 0, t);
    const pe = cen.peY;
    desenharFogueira(ctx, Math.round(W * 0.66), pe - 1, t);
    const hx = Math.round(W * 0.34 - w);
    const resp = Math.floor(t / 480) % 2;
    ctx.fillStyle = 'rgba(42,24,48,0.25)';
    ctx.fillRect(hx + 6, pe - 1, w * 2 - 12, 2);
    // heroi em 2x dentro do canvas logico
    ctx.save();
    ctx.translate(hx, pe - alt * 2 - resp);
    ctx.scale(2, 2);
    desenharSprite(ctx, spriteHeroi, 0, 0);
    ctx.restore();
  };
  return { ajustar, quadro };
}

export function telaHub() {
  let loop = null;
  let observador = null;

  return {
    mount() {
      const estado = Jogo.dados;
      const heroi = estado.heroi;
      const classe = classeDoHeroi(estado);
      const s = statsHeroi(estado);
      const proximo = proximoMapa(estado);
      const novos = contarNovos(estado);
      const pontos = pontosLivres(estado);

      const canvas = h('canvas', { class: 'hub__cena', 'aria-label': `${heroi.nome} no acampamento` });
      const cena = cenaHub(canvas, classe.sprite);

      const xp = barra('xp', { alta: true });
      const prox = xpParaProximo(heroi.nivel);
      xp.atualizar(heroi.xp, prox, `${fmt(heroi.xp)} / ${fmt(prox)} XP`);

      const emBreve = (marco) => () => toast(`Chega no marco ${marco}.`);
      const linhaStat = (rotulo, valor) => h('div', { class: 'stat' }, h('span', { class: 'stat__rotulo' }, rotulo), h('span', { class: 'stat__valor num' }, valor));

      const tela = h('section', { class: 'tela-hub' },
        h('header', { class: 'hud' },
          h('div', { class: 'hud__nome' },
            h('strong', {}, heroi.nome),
            h('span', { class: 'mudo pequeno' }, `${classe.nome} · Nível ${heroi.nivel} · Poder ${fmt(poderDoHeroi(estado))}`),
          ),
          moeda(estado.ouro),
        ),
        h('div', { class: 'rolavel' },
          h('div', { class: 'hub__palco px' }, canvas),
          h('div', { class: 'hub__xp' }, h('span', { class: 'hub__nivel num' }, `NV ${heroi.nivel}`), xp),

          h('button', {
            class: 'btn btn--verde btn--grande btn--bloco hub__partir',
            onClick: () => Router.go('mapa'),
          },
          h('span', {}, 'Expedição'),
          ),
          h('p', { class: 'centro mudo pequeno hub__dica' },
            proximo ? `Próximo desafio: ${proximo.nome} (nível ${proximo.chefe ? proximo.chefe.nivel : proximo.nivel})`
              : 'O Rei sem Coroa caiu e o mundo respira de novo. Continue fortalecendo seu herói.'),

          h('div', { class: 'grade-3 hub__menu' },
            botaoIcone({ icone: 'espada', texto: 'Mapa', onClick: () => Router.go('mapa') }),
            botaoIcone({ icone: 'mochila', texto: 'Inventário', selo: novos ? `${novos} novo${novos > 1 ? 's' : ''}` : null, seloDestaque: true, onClick: () => Router.go('inventario') }),
            botaoIcone({ icone: 'armadura', texto: 'Equipar', onClick: () => Router.go('equipamentos') }),
            botaoIcone({ icone: 'livro', texto: 'Habilidades', selo: pontos ? `${pontos} ponto${pontos > 1 ? 's' : ''}` : null, seloDestaque: true, onClick: () => Router.go('habilidades') }),
            botaoIcone({ icone: 'bolsa', texto: 'Loja', onClick: () => Router.go('loja') }),
            botaoIcone({ icone: 'engrenagem', texto: 'Ajustes', onClick: () => Router.go('configuracoes') }),
          ),

          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Atributos'),
            h('div', { class: 'grade-attrs' },
              Object.entries(s.atributos).map(([k, v]) => h('div', { class: 'attr' },
                h('span', { class: 'attr__valor num' }, v),
                h('span', { class: 'attr__nome' }, NOMES_ATRIBUTOS[k]),
              ))),
            h('p', { class: 'mudo-2 pequeno' }, 'Os atributos sobem sozinhos a cada nível, conforme a classe.'),
          ),
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Em combate'),
            h('div', { class: 'grade-2 stats' },
              linhaStat('Vida', fmt(s.vidaMax)),
              linhaStat('Mana', fmt(s.manaMax)),
              linhaStat('Ataque', fmt(s.ataque)),
              linhaStat('Defesa', fmt(s.defesa)),
              linhaStat('Velocidade', fmt(s.velocidade)),
              linhaStat('Crítico', `${Math.round(s.critico * 100)}%`),
              linhaStat('Esquiva', `${Math.round(s.esquiva * 100)}%`),
              linhaStat('Poder mágico', fmt(s.poder)),
            ),
          ),
        ),
      );

      const palco = tela.querySelector('.hub__palco');
      observador = new ResizeObserver(() => { if (palco.clientWidth) cena.ajustar(palco.clientWidth); });
      observador.observe(palco);
      loop = criarLoop(cena.quadro);
      loop.iniciar();
      return tela;
    },
    unmount() {
      loop?.parar();
      observador?.disconnect();
    },
  };
}
