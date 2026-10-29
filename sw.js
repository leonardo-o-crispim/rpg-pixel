/**
 * sw.js - Service worker (funcionamento offline).
 *
 * Estrategia: REDE PRIMEIRO, cache como rede de seguranca. Cache-first serve
 * modulos antigos durante o desenvolvimento e faz uma correcao parecer que
 * "nao funcionou". Alem disso, main.js nao registra este arquivo em localhost.
 *
 * A lista abaixo (todos os arquivos do jogo) e a VERSAO sao escritas por
 * `python ferramentas/empacotar.py`: a versao e um resumo do conteudo, entao
 * qualquer mudanca em qualquer arquivo troca o cache no aparelho.
 */

// <lista-gerada>
const VERSAO = 'rpg-pixel-9ef0b5e53c';
const ESSENCIAIS = [
  './', './index.html', './manifest.webmanifest',
  './icon.svg', './css/base.css', './css/habilidades.css',
  './css/itens.css', './css/pixel.css', './css/screens.css',
  './js/audio/som.js', './js/core/bus.js', './js/core/loop.js',
  './js/core/rng.js', './js/core/router.js', './js/core/storage.js',
  './js/data/arvores.js', './js/data/balanceamento.js', './js/data/classes.js',
  './js/data/habilidades.js', './js/data/icones.js', './js/data/itens.js',
  './js/data/monstros.js', './js/data/regioes.js', './js/data/sons.js',
  './js/data/sprites.js', './js/main.js', './js/render/cena.js',
  './js/render/cenario.js', './js/render/fonte.js', './js/render/pixel.js',
  './js/systems/combate.js', './js/systems/desbloqueio.js', './js/systems/estado.js',
  './js/systems/expedicao.js', './js/systems/habilidades.js', './js/systems/inventario.js',
  './js/systems/itens.js', './js/systems/loja.js', './js/systems/progressao.js',
  './js/ui/components/dom.js', './js/ui/components/itens.js', './js/ui/components/overlays.js',
  './js/ui/components/widgets.js', './js/ui/screens/combate.js', './js/ui/screens/configuracoes.js',
  './js/ui/screens/criacao.js', './js/ui/screens/equipamentos.js', './js/ui/screens/habilidades.js',
  './js/ui/screens/hub.js', './js/ui/screens/inventario.js', './js/ui/screens/loja.js',
  './js/ui/screens/mapa.js', './js/ui/screens/resultado.js', './icones/apple-touch-icon.png',
  './icones/icon-192.png', './icones/icon-512.png', './icones/icon-maskable-512.png',
];
// </lista-gerada>

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(VERSAO)
      .then((c) => c.addAll(ESSENCIAIS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(req)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(VERSAO).then((c) => c.put(req, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))),
  );
});
