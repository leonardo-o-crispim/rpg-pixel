/**
 * systems/desbloqueio.js - O que esta aberto no mundo.
 *
 * Regras: a primeira regiao comeca aberta; o primeiro mapa abre junto com a
 * regiao; vencer um mapa abre o seguinte; vencer o mapa com chefe abre a
 * proxima regiao.
 */

import { REGIOES, regiaoPorId, regiaoDoMapa, mapaPorId } from '../data/regioes.js';
import { bus, EV } from '../core/bus.js';

export const vitoriasNoMapa = (estado, mapaId) => estado.progresso.mapas[mapaId]?.vitorias ?? 0;
export const mapaConcluido = (estado, mapaId) => vitoriasNoMapa(estado, mapaId) > 0;
export const regiaoLiberada = (estado, regiaoId) => estado.progresso.regioes.includes(regiaoId);

export function mapaLiberado(estado, mapaId) {
  const regiao = regiaoDoMapa(mapaId);
  if (!regiao || !regiaoLiberada(estado, regiao.id)) return false;
  const i = regiao.mapas.findIndex((m) => m.id === mapaId);
  return i === 0 || mapaConcluido(estado, regiao.mapas[i - 1].id);
}

/** Chefe da regiao ja derrotado? */
export function regiaoConcluida(estado, regiaoId) {
  const r = regiaoPorId(regiaoId);
  const comChefe = r?.mapas.find((m) => m.chefe);
  return !!comChefe && mapaConcluido(estado, comChefe.id);
}

/** Mapa mais avancado liberado e ainda nao vencido (sugestao do Hub). */
export function proximoMapa(estado) {
  for (const r of REGIOES) {
    if (!regiaoLiberada(estado, r.id)) continue;
    for (const m of r.mapas) if (mapaLiberado(estado, m.id) && !mapaConcluido(estado, m.id)) return m;
  }
  return null;
}

/**
 * Registra o fim de uma expedicao e devolve o que foi liberado agora.
 * @returns {{ primeira: boolean, novos: Array<{tipo, id, nome, emBreve?}> }}
 */
export function registrarResultado(estado, mapaId, vitoria) {
  const p = (estado.progresso.mapas[mapaId] ??= { vitorias: 0, tentativas: 0 });
  p.tentativas += 1;
  const novos = [];
  if (!vitoria) return { primeira: false, novos };

  const primeira = p.vitorias === 0;
  p.vitorias += 1;
  if (!primeira) return { primeira, novos };

  const regiao = regiaoDoMapa(mapaId);
  const mapa = mapaPorId(mapaId);
  const i = regiao.mapas.findIndex((m) => m.id === mapaId);
  const seguinte = regiao.mapas[i + 1];
  if (seguinte) novos.push({ tipo: 'mapa', id: seguinte.id, nome: seguinte.nome });

  if (mapa.chefe) {
    const ri = REGIOES.findIndex((r) => r.id === regiao.id);
    const proxima = REGIOES[ri + 1];
    if (proxima && !regiaoLiberada(estado, proxima.id)) {
      estado.progresso.regioes.push(proxima.id);
      novos.push({ tipo: 'regiao', id: proxima.id, nome: proxima.nome, emBreve: proxima.emBreve });
    }
  }
  for (const n of novos) bus.emit(EV.DESBLOQUEIO, n);
  return { primeira, novos };
}
