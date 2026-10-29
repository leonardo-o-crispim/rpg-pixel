/**
 * core/loop.js - Laco de animacao com prazo de seguranca.
 *
 * requestAnimationFrame para quando a aba fica oculta (ou o painel do
 * navegador embutido esta escondido). Uma cena que dependesse so dele
 * congelaria. O laco tem um setTimeout de reserva: se o rAF nao disparar em
 * ~120 ms, o quadro e chamado mesmo assim.
 *
 * dt e limitado a 100 ms para que uma volta de segundo plano nao avance a
 * luta inteira de uma vez.
 */

export function criarLoop(quadro) {
  let ativo = false;
  let ultimo = 0;
  let rafId = 0;
  let reservaId = 0;

  const passo = () => {
    if (!ativo) return;
    cancelAnimationFrame(rafId);
    clearTimeout(reservaId);
    const agora = performance.now();
    const dt = Math.min(100, agora - ultimo);
    ultimo = agora;
    try { quadro(dt); } catch (e) { console.error('[loop]', e); }
    agendar();
  };

  const agendar = () => {
    rafId = requestAnimationFrame(passo);
    reservaId = setTimeout(passo, 120);
  };

  return {
    iniciar() {
      if (ativo) return;
      ativo = true;
      ultimo = performance.now();
      agendar();
    },
    parar() {
      ativo = false;
      cancelAnimationFrame(rafId);
      clearTimeout(reservaId);
    },
    get ativo() { return ativo; },
  };
}
