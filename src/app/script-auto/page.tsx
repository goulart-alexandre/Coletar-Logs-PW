'use client';

import { useEffect, useState } from 'react';

export default function ScriptAutoPage() {
  const [scriptCode, setScriptCode] = useState('');

  useEffect(() => {
    // Carrega o script automaticamente
    fetch('/extrair-memoria-auto.js')
      .then(res => res.text())
      .then(text => setScriptCode(text))
      .catch(err => console.error('Erro ao carregar script:', err));
  }, []);

  const copiarScript = () => {
    navigator.clipboard.writeText(scriptCode);
    alert('Script copiado para o clipboard!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <main className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-6 text-3xl font-bold text-black dark:text-zinc-50">
          Script Automático - Extrair Memoria
        </h1>

        <div className="space-y-6">
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <h2 className="mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200">
              Como usar (Método 1 - Console):
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-blue-700 dark:text-blue-300">
              <li>Certifique-se de que o servidor Next.js está rodando (npm run dev)</li>
              <li>Abra o site Ahgora e faça login</li>
              <li>Vá para a página do equipamento</li>
              <li>Abra o Console (F12 → Console)</li>
              <li>Cole o código abaixo e pressione Enter</li>
              <li>O resultado aparecerá automaticamente!</li>
            </ol>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Script para copiar:
              </label>
              <button
                onClick={copiarScript}
                className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                Copiar Script
              </button>
            </div>
            <textarea
              readOnly
              value={scriptCode || 'Carregando script...'}
              className="h-64 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <h2 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
              Método 2 - Bookmarklet (Mais fácil):
            </h2>
            <p className="mb-2 text-sm text-green-700 dark:text-green-300">
              Crie um favorito no navegador com este código:
            </p>
            <div className="rounded bg-green-100 p-3 dark:bg-green-900/40">
              <code className="text-xs">
                javascript:(function(){{'{'}}fetch('http://localhost:3000/extrair-memoria-auto.js').then(r=>r.text()).then(eval);{'}'})();
              </code>
            </div>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              Depois, quando estiver na página do Ahgora, clique no favorito!
            </p>
          </div>

          <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚡ Automático:
            </p>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
              O script pega automaticamente os cookies do navegador, faz a requisição e mostra o resultado. 
              Você não precisa fazer nada além de executar o script!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
