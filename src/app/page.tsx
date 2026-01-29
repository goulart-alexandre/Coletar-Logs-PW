'use client';

import { useState } from 'react';
import Ah30LiteIoT from './components/Ah30LiteIoT';
import Ah10LiteREPP from './components/Ah10LiteREPP';

type Modelo = 'ah30' | 'ah10' | null;

export default function Home() {
  const [modeloSelecionado, setModeloSelecionado] = useState<Modelo>(null);

  // Tela inicial de seleção
  if (!modeloSelecionado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
            <h1 className="mb-8 text-center text-3xl font-bold text-black dark:text-zinc-50">
              📋 Coletar Logs PW - Ahgora
            </h1>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
              Selecione o modelo do equipamento:
            </p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={() => setModeloSelecionado('ah30')}
                className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 text-left transition-all hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              >
                <h2 className="mb-2 text-xl font-bold text-blue-700 dark:text-blue-300">
                  Ah30 Lite IoT
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Extrair: IP, Build, Kernel, Versao, VersaoAS, Memoria, bioUso
                </p>
              </button>

              <button
                onClick={() => setModeloSelecionado('ah10')}
                className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-left transition-all hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
              >
                <h2 className="mb-2 text-xl font-bold text-green-700 dark:text-green-300">
                  Ah10 Lite REP-P
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Extrair: dev_version
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza o componente do modelo selecionado
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mb-4 flex items-center justify-between border-b border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-zinc-900">
        <h1 className="text-xl font-bold text-black dark:text-zinc-50">
          {modeloSelecionado === 'ah30' ? 'Ah30 Lite IoT' : 'Ah10 Lite REP-P'}
        </h1>
        <button
          onClick={() => setModeloSelecionado(null)}
          className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          ← Voltar
        </button>
      </div>
      
      {modeloSelecionado === 'ah30' && <Ah30LiteIoT />}
      {modeloSelecionado === 'ah10' && <Ah10LiteREPP />}
    </div>
  );
}
