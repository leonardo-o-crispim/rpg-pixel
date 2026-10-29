/**
 * systems/expedicao.js - Uma ida a um mapa, do inicio ao resultado.
 *
 * Liga o motor de combate ao estado do jogo: cada abate paga XP e ouro NA
 * HORA (o progresso nunca depende de chegar ao fim), subir de nivel no meio
 * da luta fortalece o heroi ali mesmo, e o encerramento registra vitoria,
 * bonus e desbloqueios.
 *
 * Nao salva nem desenha: quem chama (tela ou simulador) decide isso.
 */

import { Batalha, combatenteHeroi } from './combate.js';
import { statsHeroi, ganharXp, ganharOuro, classeDoHeroi } from './progressao.js';
import { registrarResultado } from './desbloqueio.js';
import { gerarDrop } from './itens.js';
import { adicionar, novoUid } from './inventario.js';
import { habilidadesParaCombate } from './habilidades.js';
import { mapaPorId, regiaoDoMapa, ondasDoMapa } from '../data/regioes.js';
import { CONSUMIVEIS } from '../data/itens.js';
import { B, bonusVitoria } from '../data/balanceamento.js';
import { criarRng, sementeAleatoria } from '../core/rng.js';

export function iniciarExpedicao(estado, mapaId, semente = sementeAleatoria()) {
  const mapa = mapaPorId(mapaId);
  if (!mapa) throw new Error(`[expedicao] mapa desconhecido: ${mapaId}`);
  const h = estado.heroi;
  const classe = classeDoHeroi(estado);
  const pocoes = Object.entries(CONSUMIVEIS)
    .filter(([, c]) => !c.soComMana || classe.usaMana)
    .map(([id, c]) => ({
      id,
      recurso: c.recurso,
      qtd: Math.min(estado.consumiveis[id] ?? 0, B.POCOES_POR_EXPEDICAO),
      cura: c.cura,
      limiar: c.recurso === 'mana' ? B.LIMIAR_POCAO_MANA : estado.config.limiarPocao,
    }));
  const heroi = combatenteHeroi({
    nome: h.nome, classe, nivel: h.nivel, stats: statsHeroi(estado),
    habilidades: habilidadesParaCombate(estado), pocoes,
  });
  return {
    mapa,
    regiao: regiaoDoMapa(mapaId),
    semente,
    batalha: new Batalha({ heroi, ondas: ondasDoMapa(mapa), rng: criarRng(semente) }),
    // rng separado para o saque: a sequencia da luta nao depende dos drops
    rngSaque: criarRng((semente ^ 0x9e3779b9) >>> 0),
    resumo: { xp: 0, ouro: 0, abates: 0, niveis: [], nivelInicial: h.nivel, itens: [], vendidosNaHora: 0, pocoes: 0 },
    resultado: null,
  };
}

/**
 * Aplica um evento do combate ao estado. Retorna o que a tela precisa
 * mostrar: niveis ganhos, retrato novo do heroi (se subiu) e itens caidos.
 */
export function aplicarEvento(exp, estado, ev) {
  if (ev.tipo === 'pocao') {
    estado.consumiveis[ev.item] = Math.max(0, (estado.consumiveis[ev.item] ?? 0) - 1);
    exp.resumo.pocoes += 1;
    return { niveis: [], itens: [] };
  }
  if (ev.tipo !== 'morte' || !ev.recompensa) return { niveis: [], itens: [] };
  const { xp, ouro } = ev.recompensa;
  exp.resumo.xp += xp;
  exp.resumo.ouro += ouro;
  exp.resumo.abates += 1;
  estado.estatisticas.abates += 1;
  ganharOuro(estado, ouro);

  const morto = exp.batalha.inimigos.find((i) => i.uid === ev.alvo);
  const itens = gerarDrop(exp.rngSaque, {
    nivel: morto?.nivel ?? exp.mapa.nivel, chefe: !!ev.chefe, classe: estado.heroi.classe, novoUid: () => novoUid(estado),
  });
  for (const it of itens) {
    const r = adicionar(estado, it);
    if (r.guardado) exp.resumo.itens.push(it);
    else { exp.resumo.vendidosNaHora += 1; exp.resumo.ouro += r.vendidoPor; }
  }

  const niveis = ganharXp(estado, xp);
  if (!niveis.length) return { niveis, itens };
  exp.resumo.niveis.push(...niveis);
  const heroi = exp.batalha.atualizarHeroi(statsHeroi(estado), estado.heroi.nivel);
  return { niveis, heroi, itens };
}

/** tipo: 'vitoria' | 'derrota' | 'recuo'. Idempotente. */
export function encerrarExpedicao(exp, estado, tipo) {
  if (exp.resultado) return exp.resultado;
  const vitoria = tipo === 'vitoria';
  const { primeira, novos } = registrarResultado(estado, exp.mapa.id, vitoria);
  const est = estado.estatisticas;
  est.expedicoes += 1;
  if (vitoria) est.vitorias += 1;
  else if (tipo === 'derrota') est.derrotas += 1;
  else est.recuos += 1;

  let bonus = null;
  if (vitoria) {
    bonus = bonusVitoria(exp.mapa, primeira);
    ganharOuro(estado, bonus.ouro);
    exp.resumo.niveis.push(...ganharXp(estado, bonus.xp));
    exp.resumo.xp += bonus.xp;
    exp.resumo.ouro += bonus.ouro;
    if (exp.mapa.chefe) est.chefes += 1;
  }

  exp.resultado = {
    tipo,
    mapaId: exp.mapa.id,
    ...exp.resumo,
    bonus,
    primeira,
    desbloqueios: novos,
    nivelFinal: estado.heroi.nivel,
  };
  return exp.resultado;
}
