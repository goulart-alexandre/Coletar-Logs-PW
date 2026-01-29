'use client';

import { useState } from 'react';

interface Resultado {
  serie: string;
  ip: string;
  build: string;
  kernel: string;
  versao: string;
  versaoAS: string;
  memoria: string;
  bioUso: string;
  url: string;
  erro?: string;
}

export default function Ah30LiteIoT() {
  const [series, setSeries] = useState('RPONTO-Ah30 00430');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [cookies, setCookies] = useState('');

  const urlBase = 'https://app.ahgora.com.br/equipamentos/controle_log_rep?empr=a994580&rep={SERIE}&ver=true&tam=60000';

  const gerarUrl = (serie: string) => {
    const serieEncoded = serie.replace(/\s/g, '%20');
    return urlBase.replace('{SERIE}', serieEncoded);
  };

  const processarSeries = async () => {
    setLoading(true);

    const seriesArray = series
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (seriesArray.length === 0) {
      alert('Por favor, insira pelo menos um número de série');
      setLoading(false);
      return;
    }

    let cookiesArray: any[] = [];
    if (cookies.trim()) {
      try {
        cookiesArray = JSON.parse(cookies);
      } catch (e) {
        console.log('Cookies não são JSON válido');
      }
    }

    const todosResultados: Resultado[] = [...resultados];
    const TAMANHO_LOTE = 10;

    for (let i = 0; i < seriesArray.length; i += TAMANHO_LOTE) {
      const lote = seriesArray.slice(i, i + TAMANHO_LOTE);
      const numeroLote = Math.floor(i / TAMANHO_LOTE) + 1;
      const totalLotes = Math.ceil(seriesArray.length / TAMANHO_LOTE);
      
      console.log(`Processando lote ${numeroLote}/${totalLotes} (${lote.length} séries)`);

      const resultadosLote: Resultado[] = [];

      for (const serie of lote) {
        const jaProcessada = todosResultados.some(r => r.serie === serie);
        if (jaProcessada) {
          console.log(`Série ${serie} já foi processada, pulando...`);
          continue;
        }

        const url = gerarUrl(serie);
        
        try {
          const response = await fetch('/api/extrair-memoria', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              cookies: cookiesArray.length > 0 ? cookiesArray : undefined,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            resultadosLote.push({
              serie: data.numeroSerie || serie,
              ip: data.ip || '',
              build: data.build || '',
              kernel: data.kernel || '',
              versao: data.versao || '',
              versaoAS: data.versaoAS || '',
              memoria: data.memoria || '',
              bioUso: data.bioUso || '',
              url,
            });
          } else {
            resultadosLote.push({
              serie,
              ip: '',
              build: '',
              kernel: '',
              versao: '',
              versaoAS: '',
              memoria: '',
              bioUso: '',
              url,
              erro: data.error || 'Erro desconhecido',
            });
          }
        } catch (err: any) {
          resultadosLote.push({
            serie,
            ip: '',
            build: '',
            kernel: '',
            versao: '',
            versaoAS: '',
            memoria: '',
            bioUso: '',
            url,
            erro: err.message || 'Erro ao processar',
          });
        }
      }

      todosResultados.push(...resultadosLote);
      setResultados([...todosResultados]);
      
      if (i + TAMANHO_LOTE < seriesArray.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setLoading(false);
    console.log(`✅ Processamento concluído! Total de ${todosResultados.length} séries processadas.`);
  };

  const copiarResultadosCSV = () => {
    const linhas = resultados.map(r => {
      if (r.erro) {
        return `${r.serie}, ERRO: ${r.erro}`;
      }
      return `${r.serie}, ${r.ip}, ${r.build}, ${r.kernel}, ${r.versao}, ${r.versaoAS}, ${r.memoria}, ${r.bioUso}`;
    });

    const texto = linhas.join('\n');

    navigator.clipboard.writeText(texto).then(() => {
      alert('✅ Resultados copiados em formato CSV!');
    }).catch(() => {
      alert('❌ Erro ao copiar. Tente selecionar e copiar manualmente.');
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 p-4 dark:bg-black">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Coluna Esquerda - Entrada */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
              <h1 className="mb-6 text-2xl font-bold text-black dark:text-zinc-50">
                📋 Extrair Memoria - Ah30 Lite IoT
              </h1>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Números de Série (um por linha):
                  </label>
                  <textarea
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="h-32 w-full rounded-md border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 dark:text-white"
                    placeholder="RPONTO-Ah30 00430&#10;RPONTO-Ah30 00431&#10;RPONTO-Ah30 00432"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    💡 Um número de série por linha. Exemplo: RPONTO-Ah30 00430
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cookies (obrigatório):
                  </label>
                  <textarea
                    value={cookies}
                    onChange={(e) => setCookies(e.target.value)}
                    className="h-24 w-full rounded-md border border-gray-300 px-4 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 dark:text-white"
                    placeholder='Cole os cookies JSON aqui'
                    rows={3}
                  />
                  <div className="mt-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      📌 Use a extensão "EditThisCookie" para exportar todos os cookies (incluindo HttpOnly)
                    </p>
                  </div>
                </div>

                <button
                  onClick={processarSeries}
                  disabled={loading || !series.trim() || !cookies.trim()}
                  className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    (() => {
                      const total = series.split('\n').filter(s => s.trim()).length;
                      const processadas = resultados.length;
                      const loteAtual = Math.floor(processadas / 10) + 1;
                      const totalLotes = Math.ceil(total / 10);
                      return `Processando lote ${loteAtual}/${totalLotes}... (${processadas} de ${total})`;
                    })()
                  ) : '🚀 Extrair Memoria'}
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resultados */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black dark:text-zinc-50">
                  📊 Resultados
                </h2>
                {resultados.length > 0 && (
                  <button
                    onClick={copiarResultadosCSV}
                    className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                  >
                    📋 Copiar CSV
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {resultados.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Os resultados aparecerão aqui após processar as séries
                  </p>
                ) : (
                  <div className="max-h-[600px] space-y-2 overflow-y-auto">
                    {resultados.map((resultado, index) => (
                      <div
                        key={index}
                        className={`rounded-md border p-3 ${
                          resultado.erro
                            ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {resultado.serie}
                            </p>
                            {resultado.erro ? (
                              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                                ❌ {resultado.erro}
                              </p>
                            ) : (
                              <div className="mt-2 space-y-1 text-xs">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {resultado.serie}, {resultado.ip}, {resultado.build}, {resultado.kernel}, {resultado.versao}, {resultado.versaoAS}, {resultado.memoria}, {resultado.bioUso}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <div><strong>IP:</strong> {resultado.ip || '-'}</div>
                                  <div><strong>Build:</strong> {resultado.build || '-'}</div>
                                  <div><strong>Kernel:</strong> {resultado.kernel || '-'}</div>
                                  <div><strong>Versão:</strong> {resultado.versao || '-'}</div>
                                  <div><strong>VersãoAS:</strong> {resultado.versaoAS || '-'}</div>
                                  <div><strong>Memoria:</strong> {resultado.memoria || '-'}</div>
                                  <div><strong>bioUso:</strong> {resultado.bioUso || '-'}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          {!resultado.erro && (
                            <span className="ml-2 rounded-full bg-green-600 px-2 py-1 text-xs font-medium text-white">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {loading && resultados.length > 0 && (
                  <div className="mt-4 text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-xs text-gray-500">Processando...</p>
                  </div>
                )}
              </div>

              {resultados.length > 0 && (
                <div className="mt-4 rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ✅ Sucesso: {resultados.filter(r => !r.erro).length} / {resultados.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
