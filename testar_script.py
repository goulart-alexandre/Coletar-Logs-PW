#!/usr/bin/env python3
"""
Script de teste rápido - processa apenas 2 séries para verificar se está funcionando
"""

import asyncio
from marcar_log_comunicacao import (
    carregar_series,
    carregar_cookies,
    processar_em_lotes
)

async def main():
    print("🧪 TESTE RÁPIDO - Processando apenas 2 séries\n")
    
    # Carrega apenas as 2 primeiras séries
    series = carregar_series('series.txt')[:362]
    cookies = carregar_cookies('cookies.json')
    
    print(f"📋 Testando com {len(series)} séries:")
    for serie in series:
        print(f"   - {serie}")
    
    print(f"\n🍪 {len(cookies)} cookies carregados")
    print("\n🚀 Iniciando teste...\n")
    
    resultados = await processar_em_lotes(series, cookies, ignorar_se_marcado=True)
    
    print("\n" + "=" * 60)
    print("📊 RESULTADOS DO TESTE")
    print("=" * 60)
    for resultado in resultados:
        if resultado['sucesso']:
            status = "⏭️ Ignorado" if resultado.get('jaEstavaMarcado') else "✅ Sucesso"
            print(f"{status}: {resultado['serie']}")
        else:
            print(f"❌ Erro: {resultado['serie']} - {resultado['erro']}")
    print("=" * 60)
    
    if all(r['sucesso'] for r in resultados):
        print("\n✅ Teste passou! Você pode executar o script completo agora.")
        print("   Execute: python marcar_log_comunicacao.py")
    else:
        print("\n⚠️  Alguns erros ocorreram. Verifique os cookies e as séries.")

if __name__ == "__main__":
    asyncio.run(main())
