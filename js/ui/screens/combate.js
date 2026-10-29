/**
 * ui/screens/combate.js - Assistir a expedicao.
 *
 * Papel desta tela: pedir uma acao ao motor (batalha.passo()), transformar
 * os eventos em uma AGENDA de animacoes no tempo da cena, e so pedir a
 * proxima acao quando a agenda esvaziar. Recompensas sao aplicadas no
 * momento em que o abate aparece na tela (o jogador ve o XP entrar).
 */

import { h, fmt, vibrar } from '../components/dom.js';
import { confirmar, toast } from '../components/overlays.js';
import { barra, moeda } from '../components/widgets.js';
import { CenaCombate, DUR_ANDAR } from '../../render/cena.js';
import { criarLoop } from '../../core/loop.js';
import { Router } from '../../core/router.js';
import { xpParaProximo } from '../../data/balanceamento.js';
import { Jogo } from '../../systems/estado.js';
import { retrato } from '../../systems/combate.js';
import { iniciarExpedicao, aplicarEvento, encerrarExpedicao } from '../../systems/expedicao.js';
import { nomeDoItem } from '../../systems/itens.js';
import { RARIDADES, ORDEM_RARIDADES } from '../../data/itens.js';
import { iconeSprite } from '../../render/pixel.js';
import { classeDoHeroi } from '../../systems/progressao.js';
import { iconeHabilidade } from './habilidades.js';
import { CONSUMIVEIS } from '../../data/itens.js';
import { Sons } from '../../audio/som.js';

const VELOCIDADES = [1, 2, 4];
const SOM_ELEMENTO = { fogo: 'fogo', gelo: 'gelo', raio: 'raio', natureza: 'natureza', sombra: 'sombra', arcano: 'arcano' };
const PAUSA_ENTRE_ACOES = 240;

/** Fila de callbacks no tempo da cena. */
function criarAgenda() {
  let itens = [];
  return {
    em(t, fn) { itens.push({ t, fn }); },
    rodar(agora) {
      if (!itens.length) return;
      const prontos = itens.filter((i) => i.t <= agora).sort((a, b) => a.t - b.t);
      if (!prontos.length) return;
      itens = itens.filter((i) => i.t > agora);
      for (const i of prontos) {
        try { i.fn(); } catch (e) { console.error('[combate] agenda', e); }
      }
    },
    get vazia() { return itens.length === 0; },
    limpar() { itens = []; },
  };
}

export function telaCombate({ mapaId }) {
  let loop = null;
  let observador = null;
  let terminado = false;
  let recuarExterno = null;

  return {
    mount() {
      const estado = Jogo.dados;
      const exp = iniciarExpedicao(estado, mapaId);
      const { batalha, mapa, regiao } = exp;
      let velocidade = VELOCIDADES.includes(estado.config.velocidade) ? estado.config.velocidade : 1;
      const volumeVel = () => (velocidade >= 4 ? 0.55 : velocidade >= 2 ? 0.8 : 1);

      // ---------------------------------------------------------- interface
      const canvas = h('canvas', { class: 'combate__cena', 'aria-label': 'Cena de combate' });
      const cena = new CenaCombate(canvas, regiao.cenario, { numeros: estado.config.numeros });
      const agenda = criarAgenda();

      const rotuloOnda = h('span', { class: 'num' }, '');
      const vida = barra('vida', { alta: true });
      const mana = barra('mana');
      const xp = barra('xp');
      const nivelEl = h('span', { class: 'num' }, '');
      const ganhoXp = h('span', { class: 'num' }, '0');
      const ganhoOuro = moeda(0);
      const ganhoItens = h('span', { class: 'num' }, '0');
      const usaMana = !!classeDoHeroi(estado).usaMana;
      const contadoresPocao = {};
      const pocoesUI = batalha.heroi.pocoes.map((p) => {
        contadoresPocao[p.id] = h('span', { class: 'num' }, `×${p.qtd}`);
        return h('span', { class: 'combate__pocoes', title: `${CONSUMIVEIS[p.id].nome} para esta expedição` },
          iconeSprite(CONSUMIVEIS[p.id].sprite, 2), contadoresPocao[p.id]);
      });
      // barra das ativas equipadas, com a recarga por cima
      const slotsHab = batalha.heroi.habilidades.map((u) => {
        const capa = h('span', { class: 'barra-hab__recarga num oculto' }, '');
        const semMana = h('span', { class: 'barra-hab__sem-mana oculto' });
        const el = h('span', { class: 'hab-icone', title: u.def.nome }, iconeHabilidade(u.id, 2), semMana, capa);
        return { u, el, capa, semMana };
      });
      const atualizarHabilidades = () => {
        const hh = batalha.heroi;
        for (const s of slotsHab) {
          const falta = hh.recargas[s.u.id] ?? 0;
          s.capa.classList.toggle('oculto', falta <= 0);
          s.capa.textContent = falta > 0 ? String(falta) : '';
          s.semMana.classList.toggle('oculto', !(s.u.def.custo > hh.mana) || falta > 0);
        }
      };
      const log = h('div', { class: 'combate__log mudo pequeno', 'aria-live': 'polite' }, '');

      const botoesVel = VELOCIDADES.map((v) => h('button', {
        class: ['btn', 'btn--pequeno', v === velocidade && 'btn--ativo'],
        'aria-pressed': String(v === velocidade),
        onClick: () => mudarVelocidade(v),
      }, `${v}×`));

      function mudarVelocidade(v) {
        velocidade = v;
        botoesVel.forEach((b, i) => {
          b.classList.toggle('btn--ativo', VELOCIDADES[i] === v);
          b.setAttribute('aria-pressed', String(VELOCIDADES[i] === v));
        });
        estado.config.velocidade = v;
        Jogo.salvar();
      }

      const atualizarHeroi = (r) => {
        vida.atualizar(r.vida, r.vidaMax);
        mana.atualizar(r.mana, r.manaMax);
      };
      const atualizarXp = () => {
        const prox = xpParaProximo(estado.heroi.nivel);
        xp.atualizar(estado.heroi.xp, prox, `${fmt(estado.heroi.xp)} / ${fmt(prox)}`);
        nivelEl.textContent = `NV ${estado.heroi.nivel}`;
      };

      const tela = h('section', { class: 'tela-combate' },
        h('header', { class: 'cabecalho combate__topo' },
          h('div', { class: 'combate__titulo' },
            h('strong', {}, mapa.nome),
            h('span', { class: 'mudo pequeno' }, regiao.nome, ' · ', rotuloOnda),
          ),
          h('div', { class: 'combate__vel', role: 'group', 'aria-label': 'Velocidade' }, botoesVel),
        ),
        h('div', { class: 'combate__palco' }, canvas),
        h('div', { class: 'rolavel combate__painel' },
          h('div', { class: 'painel' },
            h('div', { class: 'linha linha--entre combate__heroi' },
              h('strong', {}, estado.heroi.nome),
              h('span', { class: 'linha' }, pocoesUI, nivelEl),
            ),
            vida,
            h('div', { class: ['combate__barras', !usaMana && 'combate__barras--unica'] }, usaMana && mana, xp),
            slotsHab.length > 0 && h('div', { class: 'barra-hab' }, slotsHab.map((s) => s.el)),
          ),
          h('div', { class: 'painel painel--escuro combate__ganhos' },
            h('div', {}, h('span', { class: 'mudo pequeno' }, 'XP'), ' ', ganhoXp),
            h('div', {}, ganhoOuro),
            h('div', {}, h('span', { class: 'mudo pequeno' }, 'Abates'), ' ', h('span', { class: 'num abates' }, '0')),
            h('div', {}, iconeSprite('bau', 2), ' ', ganhoItens),
          ),
          log,
          h('button', { class: 'btn btn--bloco btn--perigo', onClick: recuar }, 'Recuar'),
          h('p', { class: 'centro mudo-2 pequeno' }, 'Recuar mantém o XP e o ouro já ganhos.'),
        ),
      );
      const abatesEl = tela.querySelector('.abates');

      // ------------------------------------------------------- orquestracao
      const heroiRetrato = retrato(batalha.heroi);
      cena.definirHeroi(heroiRetrato);
      atualizarHeroi(heroiRetrato);
      atualizarXp();

      let proximoPasso = 0;
      const nomeDe = (uid) => (uid === 'h' ? estado.heroi.nome : batalha.inimigos.find((i) => i.uid === uid)?.nome ?? '?');

      function agendar(eventos) {
        let t = cena.t;
        let fimAgendado = false;
        for (const ev of eventos) {
          switch (ev.tipo) {
            case 'onda':
              agenda.em(t, () => {
                cena.entrarOnda(ev.inimigos, ev.chefe);
                rotuloOnda.textContent = ev.chefe ? 'CHEFE' : `Onda ${ev.indice + 1}/${ev.total}`;
                cena.aviso(ev.chefe ? 'CHEFE!' : `ONDA ${ev.indice + 1}/${ev.total}`, ev.chefe ? '#ff7a5a' : '#ffffff', ev.chefe ? 1300 : 850);
                if (ev.chefe) {
                  vibrar(80, estado.config.vibracao);
                  Sons.musica('chefe');
                  Sons.tocar('chefe');
                  const chefe = ev.inimigos.find((i) => i.chefe);
                  if (chefe) cena.aviso(chefe.nome.toUpperCase(), '#ffe08a', 1300, { linha: 1 });
                } else {
                  Sons.musica('aventura');
                }
              });
              t += DUR_ANDAR + (ev.chefe ? 600 : 200);
              break;
            case 'acao':
              agenda.em(t, () => {
                cena.acao(ev);
                if (ev.especial) log.textContent = `${nomeDe(ev.ator)} usou ${ev.nome}.`;
                if (ev.magico) Sons.tocar(ev.elemento in SOM_ELEMENTO ? SOM_ELEMENTO[ev.elemento] : 'arcano', { volume: volumeVel() });
                else if (ev.alcance === 'distancia') Sons.tocar('flecha', { volume: volumeVel() });
                else if (ev.especial) Sons.tocar('especial', { volume: volumeVel() });
                if (ev.ator === 'h') {
                  atualizarHabilidades();
                  mana.atualizar(batalha.heroi.mana, batalha.heroi.manaMax);
                }
              });
              t += ev.alcance === 'distancia' ? 230 : 126;
              break;
            case 'dano':
              agenda.em(t, () => {
                cena.dano(ev);
                if (!ev.status) {
                  const qual = ev.bloqueado ? 'bloqueio' : ev.critico ? 'critico' : ev.alvo === 'h' ? 'dano_heroi' : 'golpe';
                  Sons.tocar(qual, { volume: volumeVel() });
                }
                if (ev.alvo === 'h') {
                  atualizarHeroi({ ...retrato(batalha.heroi), vida: ev.vida });
                  if (ev.critico) vibrar(30, estado.config.vibracao);
                }
              });
              t += ev.status ? 320 : 30;
              break;
            case 'esquiva':
              agenda.em(t, () => { cena.esquiva(ev.alvo); Sons.tocar('esquiva', { volume: volumeVel() }); });
              t += 30;
              break;
            case 'status':
              agenda.em(t, () => cena.statusLigado(ev.alvo, ev.status));
              break;
            case 'status_fim':
              agenda.em(t, () => cena.statusDesligado(ev.alvo, ev.status));
              break;
            case 'invocacao':
              agenda.em(t, () => {
                cena.adicionarInimigos(ev.inimigos);
                Sons.tocar('invocacao');
                log.textContent = `${nomeDe(ev.ator)} chamou reforços!`;
                vibrar(40, estado.config.vibracao);
              });
              t += 650;
              break;
            case 'imune':
              agenda.em(t, () => cena.texto(ev.alvo, 'IMUNE', '#e0e8ff', { deslocY: -8 }));
              break;
            case 'atordoado':
              agenda.em(t, () => {
                cena.texto(ev.alvo, 'ATORDOADO', '#ffe14a', { cima: true });
                if (ev.alvo === 'h') atualizarHabilidades();
              });
              t += 380;
              break;
            case 'cura':
              agenda.em(t, () => {
                cena.cura(ev.alvo, ev.valor, ev.vida);
                if (ev.alvo === 'h') atualizarHeroi({ ...retrato(batalha.heroi), vida: ev.vida });
              });
              t += 160;
              break;
            case 'pocao':
              agenda.em(t, () => {
                aplicarEvento(exp, estado, ev);
                Sons.tocar('pocao');
                const deMana = ev.recurso === 'mana';
                cena.texto('h', 'POCAO!', deMana ? '#9ad8ff' : '#ff9aa8', { cima: true, dur: 800 });
                if (deMana) cena.texto('h', `+${ev.valor}`, '#5ac8ff', { pulo: true });
                else cena.cura('h', ev.valor, ev.vida);
                atualizarHeroi({ ...retrato(batalha.heroi), vida: ev.vida, mana: ev.mana });
                if (contadoresPocao[ev.item]) contadoresPocao[ev.item].textContent = `×${ev.restantes}`;
                atualizarHabilidades();
                log.textContent = `${estado.heroi.nome} bebeu ${CONSUMIVEIS[ev.item].nome.toLowerCase()}.`;
                Jogo.salvar();
              });
              t += 420;
              break;
            case 'morte':
              agenda.em(t, () => aoMorrer(ev));
              t += 280;
              break;
            case 'onda_vencida':
              t += 260;
              break;
            case 'descanso':
              agenda.em(t, () => {
                atualizarHabilidades();
                cena.limparStatus('h');
                cena.cura('h', ev.cura, ev.vida);
                atualizarHeroi(retrato(batalha.heroi));
                log.textContent = `${estado.heroi.nome} recupera o fôlego.`;
              });
              t += 600;
              break;
            case 'fim':
              fimAgendado = true;
              agenda.em(t + 250, () => {
                Sons.vinheta(ev.vitoria ? 'vitoria' : 'derrota');
                cena.aviso(ev.vitoria ? 'VITORIA!' : 'DERROTA', ev.vitoria ? '#ffe08a' : '#ff6a5a', 1400);
                vibrar(ev.vitoria ? [40, 60, 40] : 120, estado.config.vibracao);
              });
              agenda.em(t + 1500, () => encerrar(ev.vitoria ? 'vitoria' : 'derrota'));
              t += 1600;
              break;
            default:
              break;
          }
        }
        proximoPasso = fimAgendado ? Infinity : t + PAUSA_ENTRE_ACOES;
      }

      function aoMorrer(ev) {
        const r = aplicarEvento(exp, estado, ev);
        cena.morte(ev.alvo, { ouro: ev.recompensa?.ouro ?? 0 });
        if (ev.recompensa) Sons.tocar('abate', { volume: volumeVel() });
        if (ev.recompensa) {
          ganhoXp.textContent = fmt(exp.resumo.xp);
          ganhoOuro.atualizar(exp.resumo.ouro);
          abatesEl.textContent = String(exp.resumo.abates);
          atualizarXp();
          Jogo.salvar();
        }
        for (const it of r.itens) {
          const rar = RARIDADES[it.raridade];
          cena.drop(ev.alvo, rar.cor);
          Sons.tocar(ORDEM_RARIDADES.indexOf(it.raridade) >= ORDEM_RARIDADES.indexOf('raro') ? 'item_raro' : 'item');
          if (ORDEM_RARIDADES.indexOf(it.raridade) >= ORDEM_RARIDADES.indexOf('raro')) {
            toast(`${rar.nome}! ${nomeDoItem(it)}`, 'ouro');
            vibrar([20, 30, 20], estado.config.vibracao);
          }
        }
        ganhoItens.textContent = String(exp.resumo.itens.length);
        if (r.niveis.length) {
          const nv = r.niveis[r.niveis.length - 1].nivel;
          cena.retrato(r.heroi);
          cena.nivelSubiu('h', nv);
          atualizarHeroi(r.heroi);
          Sons.tocar('nivel');
          toast(`Nível ${nv}! Seus atributos aumentaram.`, 'sucesso', { som: false });
          vibrar([30, 40, 30], estado.config.vibracao);
        }
      }

      function encerrar(tipo) {
        if (terminado) return;
        terminado = true;
        loop?.parar();
        agenda.limpar();
        const resultado = encerrarExpedicao(exp, estado, tipo);
        Jogo.salvarAgora();
        Router.go('resultado', { resultado }, { substituir: true });
      }

      async function recuar() {
        if (terminado) return;
        const ok = await confirmar({
          titulo: 'Recuar?',
          texto: 'A expedição termina agora. Você mantém o XP e o ouro já ganhos.',
          sim: 'Recuar', nao: 'Continuar', perigo: true,
        });
        if (ok) encerrar('recuo');
      }

      recuarExterno = recuar;
      loop = criarLoop((dt) => {
        cena.atualizar(dt * velocidade);
        agenda.rodar(cena.t);
        if (!terminado && agenda.vazia && cena.t >= proximoPasso && !batalha.terminada) agendar(batalha.passo());
        cena.desenhar();
      });

      const palco = tela.querySelector('.combate__palco');
      observador = new ResizeObserver(() => { if (palco.clientWidth) cena.ajustar(palco.clientWidth); });
      observador.observe(palco);
      loop.iniciar();
      return tela;
    },

    unmount() {
      loop?.parar();
      observador?.disconnect();
    },

    /** "Voltar" do Android no meio da luta: pergunta se quer recuar. */
    aoVoltar() {
      recuarExterno?.();
      return true;
    },
  };
}
