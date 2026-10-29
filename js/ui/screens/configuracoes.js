/**
 * ui/screens/configuracoes.js - Preferencias e cuidado com o save.
 */

import { h } from '../components/dom.js';
import { modal, confirmar, toast } from '../components/overlays.js';
import { cabecalho } from '../components/widgets.js';
import { Router } from '../../core/router.js';
import { Storage } from '../../core/storage.js';
import { Jogo } from '../../systems/estado.js';
import { Sons } from '../../audio/som.js';

/** Linha de volume: interruptor + regua 0-100. `amostra` toca ao soltar a regua. */
function volume(rotulo, ligado, valor, aoMudar, amostra) {
  const regua = h('input', {
    type: 'range', min: '0', max: '100', step: '5', class: 'regua', 'aria-label': `Volume de ${rotulo.toLowerCase()}`,
    value: String(Math.round(valor * 100)),
    onInput: (ev) => aoMudar({ valor: Number(ev.target.value) / 100 }),
    onChange: () => amostra?.(),
  });
  regua.disabled = !ligado;
  return h('div', { class: 'opcao opcao--volume' },
    interruptor(rotulo, null, ligado, (v) => { regua.disabled = !v; aoMudar({ ligado: v }); }),
    regua,
  );
}

const VERSAO_JOGO = 'M4';

function interruptor(rotulo, descricao, ligado, aoMudar, { desabilitado = false, selo = null } = {}) {
  const botao = h('button', {
    class: ['btn', 'btn--pequeno', 'interruptor', ligado && 'btn--ativo'],
    role: 'switch', 'aria-checked': String(ligado), disabled: desabilitado,
    onClick: () => {
      ligado = !ligado;
      botao.classList.toggle('btn--ativo', ligado);
      botao.setAttribute('aria-checked', String(ligado));
      botao.textContent = ligado ? 'Ligado' : 'Desligado';
      aoMudar(ligado);
    },
  }, ligado ? 'Ligado' : 'Desligado');
  return h('div', { class: 'opcao' },
    h('div', { class: 'opcao__texto' },
      h('span', { class: 'opcao__rotulo' }, rotulo, selo && h('span', { class: 'selo-inline' }, selo)),
      descricao && h('span', { class: 'mudo-2 pequeno' }, descricao),
    ),
    botao,
  );
}

async function exportar() {
  const texto = Storage.exportar(Jogo.dados);
  const area = h('textarea', { readonly: true, 'aria-label': 'Save exportado' });
  area.value = texto;
  await modal({
    titulo: 'Exportar save',
    texto: 'Guarde este texto em lugar seguro. Ele restaura todo o seu progresso.',
    conteudo: area,
    acoes: [
      {
        texto: 'Copiar',
        variante: 'primario',
        valor: () => {
          area.select();
          navigator.clipboard?.writeText(texto).then(() => toast('Save copiado.'), () => toast('Selecione e copie o texto.'));
          return true;
        },
      },
    ],
  });
}

async function importar() {
  const area = h('textarea', { placeholder: 'Cole aqui o texto do save', 'aria-label': 'Save para importar' });
  const texto = await modal({
    titulo: 'Importar save',
    texto: 'O progresso atual será SUBSTITUÍDO pelo do texto colado.',
    conteudo: area,
    acoes: [
      { texto: 'Cancelar', valor: null },
      { texto: 'Importar', variante: 'perigo', valor: () => area.value },
    ],
  });
  if (!texto) return;
  try {
    const dados = Storage.importar(texto);
    if (!dados.heroi) throw new Error('save sem herói');
    Jogo.substituir(dados);
    toast('Save importado.', 'sucesso');
    Router.limparPilha();
    Router.go('hub', {}, { substituir: true });
  } catch (e) {
    console.warn(e);
    toast('Esse texto não é um save válido.');
  }
}

async function apagar() {
  const ok1 = await confirmar({
    titulo: 'Apagar progresso?',
    texto: 'Seu herói, ouro e mapas vencidos serão apagados deste aparelho.',
    sim: 'Apagar', perigo: true,
  });
  if (!ok1) return;
  const ok2 = await confirmar({
    titulo: 'Tem certeza?',
    texto: 'Não dá para desfazer. Se quiser guardar, exporte o save antes.',
    sim: 'Apagar de vez', perigo: true,
  });
  if (!ok2) return;
  Jogo.apagarTudo();
  Router.limparPilha();
  Router.go('criacao', {}, { substituir: true });
}

export function telaConfiguracoes() {
  return {
    mount() {
      const cfg = Jogo.config;
      const salvar = () => Jogo.salvar();

      const velocidades = [1, 2, 4].map((v) => h('button', {
        class: ['btn', 'btn--pequeno', cfg.velocidade === v && 'btn--ativo'],
        'aria-pressed': String(cfg.velocidade === v),
        onClick: (ev) => {
          cfg.velocidade = v;
          for (const b of velocidades) { b.classList.remove('btn--ativo'); b.setAttribute('aria-pressed', 'false'); }
          ev.currentTarget.classList.add('btn--ativo');
          ev.currentTarget.setAttribute('aria-pressed', 'true');
          salvar();
        },
      }, `${v}×`));

      const limiares = [0.25, 0.35, 0.5].map((v) => h('button', {
        class: ['btn', 'btn--pequeno', cfg.limiarPocao === v && 'btn--ativo'],
        'aria-pressed': String(cfg.limiarPocao === v),
        onClick: (ev) => {
          cfg.limiarPocao = v;
          for (const b of limiares) { b.classList.remove('btn--ativo'); b.setAttribute('aria-pressed', 'false'); }
          ev.currentTarget.classList.add('btn--ativo');
          ev.currentTarget.setAttribute('aria-pressed', 'true');
          salvar();
        },
      }, `${Math.round(v * 100)}%`));

      return h('section', { class: 'tela-config' },
        cabecalho('Ajustes'),
        h('div', { class: 'rolavel' },
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Combate'),
            h('div', { class: 'opcao' },
              h('div', { class: 'opcao__texto' },
                h('span', { class: 'opcao__rotulo' }, 'Velocidade padrão'),
                h('span', { class: 'mudo-2 pequeno' }, 'Também muda durante a luta.'),
              ),
              h('div', { class: 'linha' }, velocidades),
            ),
            interruptor('Números de dano', 'Mostra o dano sobre os personagens.', cfg.numeros, (v) => { cfg.numeros = v; salvar(); }),
            h('div', { class: 'opcao' },
              h('div', { class: 'opcao__texto' },
                h('span', { class: 'opcao__rotulo' }, 'Beber poção com vida abaixo de'),
                h('span', { class: 'mudo-2 pequeno' }, 'Até 2 poções por expedição. Beber gasta o turno.'),
              ),
              h('div', { class: 'linha' }, limiares),
            ),
          ),
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Aparelho'),
            interruptor('Vibração', 'Em críticos, chefes e ao subir de nível.', cfg.vibracao, (v) => { cfg.vibracao = v; salvar(); }),
          ),
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Som'),
            volume('Música', cfg.musica, cfg.volMusica, ({ ligado, valor }) => {
              if (ligado !== undefined) cfg.musica = ligado;
              if (valor !== undefined) cfg.volMusica = valor;
              Sons.aplicarConfig(cfg);
              salvar();
            }),
            volume('Efeitos', cfg.efeitos, cfg.volEfeitos, ({ ligado, valor }) => {
              if (ligado !== undefined) cfg.efeitos = ligado;
              if (valor !== undefined) cfg.volEfeitos = valor;
              Sons.aplicarConfig(cfg);
              salvar();
            }, () => Sons.tocar('moeda')),
            h('p', { class: 'mudo-2 pequeno' }, 'Tudo sintetizado no aparelho: nenhum arquivo de áudio é baixado.'),
          ),
          h('div', { class: 'painel' },
            h('h2', { class: 'titulo-secao' }, 'Progresso'),
            h('p', { class: 'mudo pequeno' }, 'O progresso é salvo sozinho neste aparelho. Exporte para ter uma cópia.'),
            h('div', { class: 'grade-2' },
              h('button', { class: 'btn', onClick: exportar }, 'Exportar'),
              h('button', { class: 'btn', onClick: importar }, 'Importar'),
            ),
            h('button', { class: 'btn btn--perigo btn--bloco', onClick: apagar }, 'Apagar progresso'),
          ),
          h('p', { class: 'centro mudo-2 pequeno' }, `RPG Pixel · versão ${VERSAO_JOGO}`),
        ),
      );
    },
  };
}
