/**
 * systems/combate.js - Motor do combate automatico.
 *
 * INVARIANTE: este arquivo nao sabe que existe tela. Ele recebe combatentes
 * e ondas, e cada chamada a passo() executa UMA acao e devolve a lista de
 * eventos que ela gerou. A tela de combate so desenha esses eventos; o
 * simulador de balanceamento chama passo() em laco, sem desenhar nada.
 *
 * Barra de acao: todos enchem a barra pela Velocidade; quem chega primeiro
 * ao limiar age e desconta o limiar. Mais velocidade = mais turnos.
 *
 * Eventos emitidos:
 *   onda          {indice, total, chefe, inimigos:[retrato]}
 *   acao          {ator, habilidade, nome, alvos:[uid], alcance, especial, elemento, magico}
 *   dano          {alvo, ator?, valor, critico?, elemento?, fraco?, resistido?, bloqueado?, status?, vida}
 *   esquiva       {alvo}
 *   status        {alvo, status, turnos}
 *   status_fim    {alvo, status}
 *   imune         {alvo, status}                          (chefe nao pega atordoar)
 *   invocacao     {ator, inimigos:[retrato]}              (lacaios entram NA FRENTE)
 *   atordoado     {alvo}                                  (perdeu o turno)
 *   cura          {alvo, valor, vida}
 *   pocao         {alvo, item, recurso, valor, vida, mana, restantes}   (gasta o turno)
 *   morte         {alvo, recompensa?:{xp, ouro}, chefe?}
 *   onda_vencida  {indice, total}
 *   descanso      {alvo:'h', cura, vida, mana, removidos}
 *   fim           {vitoria}
 */

import { B, calcularDano, statsMonstro, recompensaMonstro, fatorXp } from '../data/balanceamento.js';
import { MONSTROS } from '../data/monstros.js';
import { HABILIDADES, STATUS } from '../data/habilidades.js';

const CAMPOS = ['vidaMax', 'manaMax', 'ataque', 'poder', 'defesa', 'resistencia', 'velocidade', 'critico', 'esquiva', 'bloqueio'];

function estadoDeTurno() {
  return { barra: 0, acoes: 0, status: [], usos: {}, recargas: {}, morto: false };
}

/**
 * habilidades: [{ id, recarga?, quandoVidaAbaixo?, def: { nome, alvo, custo?, efeitos } }]
 *   em ordem de prioridade; `def` ja vem resolvida no rank (systems/habilidades.js).
 * pocoes: [{ id, recurso: 'vida'|'mana', qtd, cura, limiar }] - o heroi bebe
 *   sozinho quando o recurso cai abaixo de `limiar`, recuperando `cura` do maximo.
 */
export function combatenteHeroi({ nome, classe, nivel, stats, habilidades = [], pocoes = [] }) {
  const c = {
    uid: 'h', lado: 'heroi', id: classe.id, nome, nivel, sprite: classe.sprite,
    alcance: classe.alcance, elemento: classe.elemento, chefe: false,
    fraquezas: {}, habilidades, pocoes,
    ...estadoDeTurno(),
  };
  for (const k of CAMPOS) c[k] = stats[k] ?? 0;
  c.vida = c.vidaMax;
  c.mana = c.manaMax;
  return c;
}

function combatenteMonstro(id, nivel, uid, rng) {
  const def = MONSTROS[id];
  if (!def) throw new Error(`[combate] monstro desconhecido: ${id}`);
  const s = statsMonstro(def.mult, nivel);
  return {
    uid, lado: 'monstro', id, nome: def.nome, nivel, sprite: def.sprite,
    alcance: def.alcance ?? 'corpo', elemento: def.elemento ?? 'fisico', chefe: !!def.chefe,
    fraquezas: def.fraquezas ?? {}, habilidades: def.habilidades ?? [], visual: def.visual ?? null,
    ...s, vida: s.vidaMax, mana: 0, bloqueio: 0,
    ...estadoDeTurno(),
    barra: rng.int(0, B.BARRA_INICIAL_MAX),
  };
}

/** Copia so o que a tela precisa para desenhar um combatente. */
export function retrato(c) {
  return {
    uid: c.uid, id: c.id, lado: c.lado, nome: c.nome, nivel: c.nivel, sprite: c.sprite,
    alcance: c.alcance, chefe: c.chefe, vida: c.vida, vidaMax: c.vidaMax, mana: c.mana, manaMax: c.manaMax,
    visual: c.visual ?? null,
  };
}

export class Batalha {
  /**
   * @param {object} p
   * @param {object} p.heroi  combatenteHeroi(...)
   * @param {Array}  p.ondas  [{monstros:[id], nivel, chefe}] (ver ondasDoMapa)
   * @param {object} p.rng    criarRng(semente)
   */
  constructor({ heroi, ondas, rng }) {
    this.heroi = heroi;
    this.ondas = ondas;
    this.rng = rng;
    this.inimigos = [];
    this.indiceOnda = -1;
    this.seq = 0;
    this.acoes = 0;
    this.terminada = false;
    this.vitoria = null;
    this.fila = [this._iniciarOnda(0)];
  }

  get totalOndas() { return this.ondas.length; }

  /** Executa uma acao (ou entrega eventos pendentes, como a entrada de onda). */
  passo() {
    if (this.fila.length) return this.fila.splice(0);
    if (this.terminada) return [];
    const ev = [];
    const ator = this._proximoAtor();
    this.acoes += 1;
    this._turno(ator, ev);
    this._verificarFim(ev);
    return ev;
  }

  /** Aplica numeros novos ao heroi no meio da luta (subiu de nivel). */
  atualizarHeroi(stats, nivel) {
    const h = this.heroi;
    const ganhoVida = Math.max(0, stats.vidaMax - h.vidaMax);
    const ganhoMana = Math.max(0, stats.manaMax - h.manaMax);
    for (const k of CAMPOS) h[k] = stats[k];
    h.nivel = nivel;
    h.vida = Math.min(h.vidaMax, h.vida + ganhoVida);
    h.mana = Math.min(h.manaMax, h.mana + ganhoMana);
    return retrato(h);
  }

  // ------------------------------------------------------------ internos

  _iniciarOnda(i) {
    this.indiceOnda = i;
    const onda = this.ondas[i];
    this.inimigos = onda.monstros.map((id) => combatenteMonstro(id, onda.nivel, `m${++this.seq}`, this.rng));
    return { tipo: 'onda', indice: i, total: this.ondas.length, chefe: !!onda.chefe, inimigos: this.inimigos.map(retrato) };
  }

  _proximoAtor() {
    const vivos = [this.heroi, ...this.inimigos].filter((c) => c.vida > 0);
    let ator = vivos[0];
    let menor = Infinity;
    const vel = (c) => c.velocidade * (1 - Math.min(0.7, this._somaStatus(c, 'velocidadeMult')));
    for (const c of vivos) {
      const falta = Math.max(0, B.ATB_LIMIAR - c.barra) / vel(c);
      if (falta < menor) { menor = falta; ator = c; } // empate: o heroi (primeiro da lista) age
    }
    for (const c of vivos) c.barra += vel(c) * menor;
    ator.barra = Math.max(0, ator.barra - B.ATB_LIMIAR);
    return ator;
  }

  _turno(ator, ev) {
    // 1) efeitos que agem no inicio do turno (veneno, sangramento)
    for (const st of ator.status) {
      if (STATUS[st.id]?.porTurno !== 'dano') continue;
      const valor = Math.max(1, st.valor);
      ator.vida = Math.max(0, ator.vida - valor);
      ev.push({ tipo: 'dano', alvo: ator.uid, valor, status: st.id, vida: ator.vida });
      if (ator.vida <= 0) { this._morrer(ator, ev); return; }
    }
    // 2) o tempo passa para efeitos e recargas (atordoar vale para ESTE turno)
    const atordoado = ator.status.some((st) => STATUS[st.id]?.impede);
    ator.status = ator.status.filter((st) => {
      st.turnos -= 1;
      if (st.turnos > 0) return true;
      ev.push({ tipo: 'status_fim', alvo: ator.uid, status: st.id });
      return false;
    });
    for (const k of Object.keys(ator.recargas)) if (ator.recargas[k] > 0) ator.recargas[k] -= 1;
    if (atordoado) {
      ev.push({ tipo: 'atordoado', alvo: ator.uid });
      ator.acoes += 1;
      return;
    }

    // 3) recurso baixo e pocao no cinto: bebe em vez de agir
    const p = this._pocaoParaBeber(ator);
    if (p) {
      p.qtd -= 1;
      const mana = p.recurso === 'mana';
      const max = mana ? ator.manaMax : ator.vidaMax;
      const real = Math.min(Math.round(max * p.cura), max - (mana ? ator.mana : ator.vida));
      if (mana) ator.mana += real; else ator.vida += real;
      ev.push({ tipo: 'pocao', alvo: ator.uid, item: p.id, recurso: p.recurso, valor: real, vida: ator.vida, mana: ator.mana, restantes: p.qtd });
      ator.acoes += 1;
      return;
    }

    // 4) escolhe e executa a acao
    const uso = this._escolher(ator);
    const idHab = uso?.id ?? 'ataque';
    const hab = uso?.def ?? HABILIDADES[idHab];
    const alvos = this._alvos(ator, hab.alvo);
    const primeiroDano = hab.efeitos.find((e) => e.tipo === 'dano');
    ev.push({
      tipo: 'acao', ator: ator.uid, habilidade: idHab, nome: hab.nome,
      alvos: alvos.map((a) => a.uid), alcance: ator.alcance, especial: !!uso,
      elemento: primeiroDano?.elemento ?? ator.elemento, magico: !!primeiroDano?.magico,
    });
    if (uso) {
      const chave = uso.uso ?? idHab;
      ator.usos[chave] = (ator.usos[chave] ?? 0) + 1;
      if (uso.recarga) ator.recargas[chave] = uso.recarga;
      if (hab.custo) ator.mana -= hab.custo;
    }
    for (const alvo of alvos) {
      for (const ef of hab.efeitos) {
        // efeito em si mesmo (cura ao drenar, escudo proprio): vale mesmo se o alvo caiu
        if (ef.alvoProprio) {
          if (ator.vida > 0) this._efeito(ator, ator, ef, ev);
          continue;
        }
        if (alvo.vida <= 0) break;
        if (this._efeito(ator, alvo, ef, ev) === 'esquiva') break;
      }
    }

    ator.acoes += 1;
    if (ator.manaMax) ator.mana = Math.min(ator.manaMax, ator.mana + Math.round(ator.manaMax * B.MANA_POR_TURNO));
  }

  _somaStatus(c, propriedade) {
    return c.status.reduce((s, st) => s + (STATUS[st.id]?.[propriedade] ? st.potencia : 0), 0);
  }

  /** Pocao a beber agora (vida antes de mana); mana so se alguma magia precisa. */
  _pocaoParaBeber(ator) {
    for (const p of ator.pocoes ?? []) {
      if (p.qtd <= 0) continue;
      if (p.recurso === 'mana') {
        const precisa = ator.habilidades.some((u) => (u.def?.custo ?? 0) > ator.mana);
        if (precisa && ator.mana / Math.max(1, ator.manaMax) < p.limiar) return p;
      } else if (ator.vida / ator.vidaMax < p.limiar) {
        return p;
      }
    }
    return null;
  }

  /** Primeira habilidade cujas condicoes valem agora; null = ataque basico. */
  _escolher(ator) {
    for (const u of ator.habilidades) {
      const hab = u.def ?? HABILIDADES[u.id];
      if (!hab) continue;
      const chave = u.uso ?? u.id; // a mesma habilidade pode ter duas contagens
      if (u.maxUsos != null && (ator.usos[chave] ?? 0) >= u.maxUsos) continue;
      if (u.quandoVidaAbaixo != null && ator.vida / ator.vidaMax >= u.quandoVidaAbaixo) continue;
      if (u.aCada && (ator.acoes + 1) % u.aCada !== 0) continue;
      if (u.recarga && (ator.recargas[chave] ?? 0) > 0) continue;
      if (hab.custo && ator.mana < hab.custo) continue;
      if (u.chance != null && !this.rng.chance(u.chance)) continue;
      return u;
    }
    return null;
  }

  _alvos(ator, tipo) {
    if (tipo === 'proprio') return [ator];
    const oponentes = (ator.lado === 'heroi' ? this.inimigos : [this.heroi]).filter((c) => c.vida > 0);
    if (tipo === 'todos') return oponentes;
    if (tipo === 'aleatorio') return [this.rng.escolher(oponentes)];
    return oponentes.slice(0, 1); // 'inimigo': o da frente
  }

  _efeito(ator, alvo, ef, ev) {
    if (ef.tipo === 'dano') {
      if (alvo !== ator && this.rng.chance(alvo.esquiva)) {
        ev.push({ tipo: 'esquiva', alvo: alvo.uid });
        return 'esquiva';
      }
      const elemento = ef.elemento ?? ator.elemento;
      const multElem = alvo.fraquezas[elemento] ?? 1;
      const furia = this._somaStatus(ator, 'ataqueMult');
      const potencia = (ef.magico ? ator.poder : ator.ataque) * ef.mult * (1 + furia);
      const critico = ef.critico === true || this.rng.chance(ator.critico);
      let valor = calcularDano({
        potencia,
        defesa: ef.magico ? alvo.resistencia : alvo.defesa,
        nivelAtacante: ator.nivel,
        ignora: ef.ignora ?? 0,
        elemento: multElem,
        critico,
        rng: this.rng,
      });
      const reducao = Math.min(0.7, this._somaStatus(alvo, 'reduzDano'));
      if (reducao > 0) valor = Math.max(1, Math.round(valor * (1 - reducao)));
      const bloqueado = alvo.bloqueio > 0 && this.rng.chance(alvo.bloqueio);
      if (bloqueado) valor = Math.max(1, Math.round(valor * (1 - B.BLOQUEIO_FRACAO)));
      alvo.vida = Math.max(0, alvo.vida - valor);
      ev.push({
        tipo: 'dano', alvo: alvo.uid, ator: ator.uid, valor, critico, elemento,
        fraco: multElem > 1, resistido: multElem < 1, bloqueado, vida: alvo.vida,
      });
      if (alvo.vida <= 0) this._morrer(alvo, ev);
      return 'ok';
    }

    if (ef.tipo === 'status') {
      if (alvo.chefe && STATUS[ef.status]?.chefeImune) {
        ev.push({ tipo: 'imune', alvo: alvo.uid, status: ef.status });
        return 'ok';
      }
      const valor = Math.round(ator.ataque * ef.potencia); // usado por efeitos de dano por turno
      const existente = alvo.status.find((s) => s.id === ef.status);
      if (existente) {
        existente.turnos = Math.max(existente.turnos, ef.turnos);
        existente.valor = Math.max(existente.valor, valor);
      } else {
        alvo.status.push({ id: ef.status, turnos: ef.turnos, potencia: ef.potencia, valor });
      }
      ev.push({ tipo: 'status', alvo: alvo.uid, status: ef.status, turnos: ef.turnos });
      return 'ok';
    }

    if (ef.tipo === 'cura') {
      const real = Math.min(Math.round(alvo.vidaMax * ef.pct), alvo.vidaMax - alvo.vida);
      alvo.vida += real;
      ev.push({ tipo: 'cura', alvo: alvo.uid, valor: real, vida: alvo.vida });
      return 'ok';
    }

    if (ef.tipo === 'invocar') return this._invocar(ator, ef, ev);
    return 'ok';
  }

  /** Lacaios entram na FRENTE do invocador: o heroi precisa passar por eles. */
  _invocar(ator, ef, ev) {
    if (ator.lado !== 'monstro') return 'ok';
    const vivos = this.inimigos.filter((c) => c.vida > 0).length;
    const qtd = Math.min(ef.qtd, B.INIMIGOS_MAX - vivos);
    if (qtd <= 0) return 'ok';
    const novos = [];
    for (let i = 0; i < qtd; i++) {
      const c = combatenteMonstro(ef.monstro, Math.max(1, ator.nivel - (ef.nivelMenos ?? 2)), `m${++this.seq}`, this.rng);
      c.invocado = true;
      novos.push(c);
    }
    this.inimigos.unshift(...novos);
    ev.push({ tipo: 'invocacao', ator: ator.uid, inimigos: novos.map(retrato) });
    return 'ok';
  }

  _morrer(c, ev) {
    if (c.morto) return;
    c.morto = true;
    if (c.lado !== 'monstro') { ev.push({ tipo: 'morte', alvo: c.uid }); return; }
    const base = recompensaMonstro(MONSTROS[c.id].mult, c.nivel);
    const fator = c.invocado ? B.RECOMPENSA_INVOCADO : 1; // lacaio vale menos: nao vira fonte de farm
    ev.push({
      tipo: 'morte', alvo: c.uid, chefe: c.chefe, invocado: !!c.invocado,
      recompensa: {
        xp: Math.max(1, Math.round(base.xp * fatorXp(this.heroi.nivel, c.nivel) * fator)),
        ouro: Math.max(1, Math.round(this.rng.variar(base.ouro, 0.2) * fator)),
      },
    });
  }

  _verificarFim(ev) {
    if (this.terminada) return;
    if (this.heroi.vida <= 0) {
      this.terminada = true;
      this.vitoria = false;
      ev.push({ tipo: 'fim', vitoria: false });
      return;
    }
    if (!this.inimigos.every((i) => i.vida <= 0)) return;

    ev.push({ tipo: 'onda_vencida', indice: this.indiceOnda, total: this.ondas.length });
    if (this.indiceOnda + 1 >= this.ondas.length) {
      this.terminada = true;
      this.vitoria = true;
      ev.push({ tipo: 'fim', vitoria: true });
      return;
    }

    // descanso entre ondas
    const h = this.heroi;
    const cura = Math.min(h.vidaMax - h.vida, Math.round(h.vidaMax * B.DESCANSO_VIDA));
    h.vida += cura;
    h.mana = Math.min(h.manaMax, h.mana + Math.round(h.manaMax * B.DESCANSO_MANA));
    const removidos = h.status.filter((s) => STATUS[s.id]?.negativo).map((s) => s.id);
    h.status = h.status.filter((s) => !STATUS[s.id]?.negativo);
    h.barra = 0;
    ev.push({ tipo: 'descanso', alvo: h.uid, cura, vida: h.vida, mana: h.mana, removidos });
    this.fila.push(this._iniciarOnda(this.indiceOnda + 1));
  }
}
