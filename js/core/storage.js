/**
 * core/storage.js - Persistencia do save no localStorage.
 *
 * NAO MUDAR A CHAVE: trocar `CHAVE` apaga o progresso de todos os jogadores.
 * A versao do formato mora DENTRO do save (campo `versao`) e e tratada pela
 * migracao em systems/estado.js.
 *
 * Toda escrita guarda antes a copia anterior em CHAVE_ANTERIOR. Se o save
 * principal vier corrompido, o carregamento recorre a ela.
 */

const CHAVE = 'rpg-pixel:save';
const CHAVE_ANTERIOR = 'rpg-pixel:save:anterior';

function ler(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch (e) {
    console.warn(`[storage] falha lendo ${chave}`, e);
    return null;
  }
}

export const Storage = {
  carregar() {
    return ler(CHAVE) ?? ler(CHAVE_ANTERIOR);
  },

  salvar(dados) {
    try {
      const atual = localStorage.getItem(CHAVE);
      if (atual) localStorage.setItem(CHAVE_ANTERIOR, atual);
      localStorage.setItem(CHAVE, JSON.stringify(dados));
      return true;
    } catch (e) {
      console.error('[storage] falha salvando', e);
      return false;
    }
  },

  apagar() {
    try {
      localStorage.removeItem(CHAVE);
      localStorage.removeItem(CHAVE_ANTERIOR);
    } catch (e) { console.error(e); }
  },

  /** Save em texto para copiar e colar (backup manual / troca de aparelho). */
  exportar(dados) {
    const bytes = new TextEncoder().encode(JSON.stringify(dados));
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  },

  /** Inverso de exportar. Lanca erro se o texto nao for um save. */
  importar(texto) {
    const bytes = Uint8Array.from(atob(texto.trim()), (c) => c.charCodeAt(0));
    const dados = JSON.parse(new TextDecoder().decode(bytes));
    if (!dados || typeof dados !== 'object' || !('versao' in dados)) {
      throw new Error('Texto não é um save válido.');
    }
    return dados;
  },
};
