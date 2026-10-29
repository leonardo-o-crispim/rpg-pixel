/**
 * main.js - Ponto de entrada.
 *
 * Ordem: carregar o save, registrar as telas, ligar o salvamento de
 * seguranca e abrir a primeira tela (criacao se nao ha heroi, senao Hub).
 */

import { Router } from './core/router.js';
import { bus, EV } from './core/bus.js';
import { Jogo } from './systems/estado.js';
import { Sons } from './audio/som.js';
import { fecharJanelaDoTopo } from './ui/components/overlays.js';

import { telaCriacao } from './ui/screens/criacao.js';
import { telaHub } from './ui/screens/hub.js';
import { telaMapa } from './ui/screens/mapa.js';
import { telaCombate } from './ui/screens/combate.js';
import { telaResultado } from './ui/screens/resultado.js';
import { telaConfiguracoes } from './ui/screens/configuracoes.js';
import { telaInventario } from './ui/screens/inventario.js';
import { telaEquipamentos } from './ui/screens/equipamentos.js';
import { telaLoja } from './ui/screens/loja.js';
import { telaHabilidades } from './ui/screens/habilidades.js';

function registrarTelas() {
  Router
    .register('criacao', telaCriacao)
    .register('hub', telaHub)
    .register('mapa', telaMapa)
    .register('combate', telaCombate)
    .register('resultado', telaResultado)
    .register('configuracoes', telaConfiguracoes)
    .register('inventario', telaInventario)
    .register('equipamentos', telaEquipamentos)
    .register('loja', telaLoja)
    .register('habilidades', telaHabilidades);
}

/** Salva ao sair/minimizar: no celular o app pode ser morto sem aviso. */
function ligarSalvamentoDeSeguranca() {
  const salvar = () => { if (Jogo.heroi) Jogo.salvarAgora(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) salvar(); });
  window.addEventListener('pagehide', salvar);
}

/**
 * Som: liga no primeiro toque, clique em botao faz "tic", e cada tela escolhe
 * a musica (o combate cuida da propria: aventura e chefe).
 */
function ligarSom() {
  Sons.aplicarConfig(Jogo.config);
  Sons.ligarNoPrimeiroGesto();
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest?.('button');
    if (b && !b.disabled) Sons.tocar('clique');
  }, true);
  bus.on(EV.TELA, ({ nome }) => {
    if (nome !== 'combate' && nome !== 'resultado') Sons.musica('vila');
  });
}

/**
 * Botao "voltar" do Android (no APK ele e o voltar do historico). Mantemos
 * sempre uma entrada "armada" no historico: cada voltar dispara popstate e
 * decidimos aqui - fecha janela, a tela trata (combate pergunta se recua),
 * volta uma tela, ou, no Hub, deixa o app fechar.
 */
function ligarBotaoVoltar() {
  const armar = () => history.pushState({ rpgPixel: true }, '');
  history.replaceState({ rpgPixelBase: true }, '');
  armar();
  window.addEventListener('popstate', () => {
    if (fecharJanelaDoTopo()) { armar(); return; }
    const api = Router.atual?.api;
    if (api?.aoVoltar?.()) { armar(); return; }
    if (['hub', 'criacao'].includes(Router.nomeAtual)) { history.back(); return; }
    Router.voltar();
    armar();
  });
}

/** Offline so fora do localhost (em desenvolvimento o cache engana). */
function registrarServiceWorker() {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (local || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('[sw]', e));
}

function iniciar() {
  Jogo.carregar();
  Router.init(document.getElementById('app'));
  registrarTelas();
  ligarSalvamentoDeSeguranca();
  ligarSom();
  ligarBotaoVoltar();
  registrarServiceWorker();
  Router.go(Jogo.heroi ? 'hub' : 'criacao');
}

iniciar();
