import React, { useState } from 'react';
import { Copy, Check, Play, Download, Terminal, Server, Code2 } from 'lucide-react';
import { TipoCalculo } from '../utils/calculators';
import {
  CONCEITOS_POR_MODULO,
  CODIGO_BACKEND_FLASK_COMPLETO,
  CODIGO_CLI_COMPLETO,
} from '../utils/pythonTemplates';

interface PythonCodePanelProps {
  tipoAtivo: TipoCalculo;
  codigoAtivo: string;
  payloadAtualBackend: Record<string, unknown>;
  onBaixarArquivoPy: (nomeArquivo: string, conteudo: string) => void;
}

interface RespostaApiBackend {
  sucesso: boolean;
  statusHttp: number;
  motorExecucao?: string;
  duracaoMs?: number;
  tipo?: string;
  entradaRecebida?: Record<string, unknown>;
  resultado?: Record<string, unknown>;
  erro?: string;
}

export const PythonCodePanel: React.FC<PythonCodePanelProps> = ({
  tipoAtivo,
  codigoAtivo,
  payloadAtualBackend,
  onBaixarArquivoPy,
}) => {
  const [abaCodigo, setAbaCodigo] = useState<'funcao' | 'backend' | 'arquivos'>('funcao');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<'cli' | 'flask'>('cli');
  const [copiado, setCopiado] = useState(false);
  const [carregandoApi, setCarregandoApi] = useState(false);
  const [respostaApi, setRespostaApi] = useState<RespostaApiBackend | null>(null);

  const conceitos = CONCEITOS_POR_MODULO[tipoAtivo] || [];

  const copiarCodigo = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const testarRequisicaoBackendReal = async () => {
    setCarregandoApi(true);
    try {
      const response = await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoAtivo,
          dados: payloadAtualBackend,
        }),
      });
      const data: RespostaApiBackend = await response.json();
      setRespostaApi(data);
    } catch (err) {
      setRespostaApi({
        sucesso: false,
        statusHttp: 500,
        erro: err instanceof Error ? err.message : 'Falha de comunicação com o servidor.',
      });
    } finally {
      setCarregandoApi(false);
    }
  };

  const textoExibido =
    abaCodigo === 'funcao'
      ? codigoAtivo
      : abaCodigo === 'arquivos'
      ? arquivoSelecionado === 'cli'
        ? CODIGO_CLI_COMPLETO
        : CODIGO_BACKEND_FLASK_COMPLETO
      : codigoAtivo;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Cabeçalho do Painel Python */}
      <div className="px-5 py-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono text-sky-400">ESTÚDIO DIDÁTICO PYTHON 3.12</span>
          <h2 className="text-base font-semibold tracking-tight text-white mt-0.5">
            Código Sincronizado &amp; Anatomia dos Componentes
          </h2>
        </div>

        {/* Abas de inspeção */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg" role="tablist" aria-label="Modos de visualização de código">
          <button
            type="button"
            role="tab"
            aria-selected={abaCodigo === 'funcao'}
            onClick={() => setAbaCodigo('funcao')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              abaCodigo === 'funcao'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Função Ativa
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaCodigo === 'backend'}
            onClick={() => setAbaCodigo('backend')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              abaCodigo === 'backend'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Testar Backend API
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaCodigo === 'arquivos'}
            onClick={() => setAbaCodigo('arquivos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              abaCodigo === 'arquivos'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Arquivos .PY
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba 1: Função Ativa + Conceitos */}
      {abaCodigo === 'funcao' && (
        <div className="p-5 space-y-5">
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                calculadora_interiores.py · módulo: {tipoAtivo}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copiarCodigo(codigoAtivo)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed text-slate-100 overflow-x-auto">
              <code>{codigoAtivo}</code>
            </pre>
          </div>

          {/* Explicação para quem está voltando a programar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Explicação dos Componentes Python Deste Módulo
              </h3>
              <span className="text-xs text-slate-500">
                Foco para quem já tem base de lógica
              </span>
            </div>

            <div className="space-y-2.5">
              {conceitos.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      0{idx + 1}. {c.termo}
                    </span>
                    <span className="text-xs text-sky-700 font-medium">
                      {c.resumoCurto}
                    </span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto">
                    {c.linhaReferencia}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.explicacaoDetalhada}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 2: Raio-X Interativo do Backend */}
      {abaCodigo === 'backend' && (
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Experimente na Prática: Como o Frontend conversa com o Backend Python
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quando você usa uma calculadora na web, o navegador (Frontend) empacota os valores digitados em um objeto <strong>JSON</strong> e faz uma chamada <code>HTTP POST</code> para o servidor. Neste ambiente, temos o script real <code>python_project/calculadora_interiores.py</code> instalado no servidor!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={testarRequisicaoBackendReal}
                disabled={carregandoApi}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                {carregandoApi
                  ? 'Executando Python no Servidor...'
                  : 'Executar Cálculo no Servidor Python'}
              </button>
            </div>
          </div>

          {/* Pacote de Envio (Request Payload) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                1. Requisição Enviada pelo Frontend (HTTP POST /api/calcular)
              </span>
              <span className="font-mono text-slate-500">Content-Type: application/json</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(
                {
                  tipo: tipoAtivo,
                  dados: payloadAtualBackend,
                },
                null,
                2
              )}
            </pre>
          </div>

          {/* Resposta Recebida do Servidor Python */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                2. Resposta Devolvida pelo Servidor (JSON Response)
              </span>
              {respostaApi && (
                <span className="font-mono text-emerald-700 font-medium tabular-nums">
                  HTTP {respostaApi.statusHttp} · {respostaApi.duracaoMs} ms · {respostaApi.motorExecucao}
                </span>
              )}
            </div>
            {respostaApi ? (
              <pre className="p-3.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
                {JSON.stringify(respostaApi, null, 2)}
              </pre>
            ) : (
              <div className="p-6 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Clique no botão acima para disparar a requisição real ao servidor e inspecionar o JSON retornado pelo script Python.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: Arquivos .PY Completos para Rodar Localmente */}
      {abaCodigo === 'arquivos' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setArquivoSelecionado('cli')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  arquivoSelecionado === 'cli'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Opção 1: Modo Terminal (Sem Backend)
              </button>
              <button
                type="button"
                onClick={() => setArquivoSelecionado('flask')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  arquivoSelecionado === 'flask'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Opção 2: API Backend em Python (Flask)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copiarCodigo(textoExibido)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onBaixarArquivoPy(
                    arquivoSelecionado === 'cli' ? 'menu_terminal.py' : 'app_backend.py',
                    textoExibido
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar .PY
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[460px]">
            <code>{textoExibido}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
