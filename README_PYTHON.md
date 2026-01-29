# Script Python - Marcar Log de Comunicação

Script Python otimizado para processar centenas de séries em paralelo usando todo o poder da sua máquina.

## 🚀 Instalação

1. **Instale Python 3.8+** (se ainda não tiver)

2. **Instale as dependências:**
```bash
pip install playwright
python -m playwright install chromium
```

**Nota:** No Windows, use `python -m playwright install chromium` ao invés de apenas `playwright install chromium`

## 📋 Preparação

### 1. Arquivo de Séries (`series.txt`)

Crie um arquivo `series.txt` com uma série por linha:

```
RPONTO-Ah30 00430
RPONTO-Ah30 00735
RPONTO-Ah30 00739
RPONTO-Ah30 00740
...
```

### 2. Arquivo de Cookies (`cookies.json`)

Exporte os cookies usando a extensão "EditThisCookie" no Chrome e salve como `cookies.json`.

O formato deve ser o mesmo JSON que você usa na interface web.

## 🎯 Como Usar

### Teste Rápido (Recomendado primeiro)

Teste com apenas 2 séries para verificar se está tudo funcionando:

```bash
python testar_script.py
```

### Processamento Completo

Depois que o teste funcionar, execute o script completo:

```bash
python marcar_log_comunicacao.py
```

O script vai perguntar:
- Arquivo com séries (padrão: `series.txt`)
- Arquivo com cookies (padrão: `cookies.json`)
- Se deve ignorar séries já marcadas (S/n)

## ⚙️ Configurações

No início do arquivo `marcar_log_comunicacao.py` você pode ajustar:

```python
TIMEOUT_ELEMENTO = 60  # segundos máximo para aguardar elementos aparecerem
```

**O script é inteligente:**
- ✅ **Processamento sequencial**: Processa uma série por vez, aguardando sucesso antes de continuar
- ✅ Aguarda o checkbox aparecer dinamicamente (não usa tempo fixo)
- ✅ Aguarda o botão Salvar aparecer dinamicamente (não usa tempo fixo)
- ✅ Verifica se os elementos estão realmente disponíveis para interação
- ✅ Mais rápido quando a página carrega rápido, mais paciente quando demora
- ✅ Mais confiável: garante que cada série seja processada completamente antes da próxima

## 📊 Resultados

O script gera dois arquivos:

1. **`resultados.txt`** - Formato texto simples
2. **`resultados.json`** - Formato JSON completo

## 💡 Vantagens sobre a versão web

- ✅ Processa centenas de séries sem travar
- ✅ Processamento sequencial confiável (uma por vez)
- ✅ Não depende do navegador do usuário
- ✅ Pode rodar em background
- ✅ Aguarda elementos dinamicamente (mais rápido e confiável)

## ⚠️ Notas

- O script processa **sequencialmente** (uma série por vez)
- Cada série aguarda sucesso antes de passar para a próxima
- Mais confiável que processamento paralelo
- Para 300 séries: tempo depende de cada página (estimativa: ~30-60 minutos)
