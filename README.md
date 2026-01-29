# Coletar Logs PW - Extração de Memoria

Projeto Next.js para extrair automaticamente a informação de "Memoria" de equipamentos no sistema Ahgora.

## 🚀 Como usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

### 3. Acessar a aplicação

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 4. Extrair a informação de Memoria

1. **Cole a URL** do equipamento no campo URL (já vem preenchida com a URL padrão)
2. **Obtenha os cookies** (opcional, mas recomendado):
   - Abra o site Ahgora em outra aba e faça login
   - Abra o DevTools (F12) → Console
   - Cole o código fornecido na interface para copiar os cookies automaticamente
   - Cole os cookies no campo "Cookies" da interface
3. **Clique em "Extrair Memoria"**
4. O resultado será exibido (ex: "16 MB" ou "32 MB")

## 📋 Requisitos

- Node.js 18+ 
- NPM ou Yarn
- Acesso ao site Ahgora (com login)

## 🛠️ Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Puppeteer (para web scraping)

## 📝 Notas

- Os cookies são necessários para acessar páginas autenticadas
- O script usa Puppeteer para automatizar o navegador
- A extração procura por diferentes padrões de "Memoria" na página
- Se não encontrar, verifique se a URL está correta e se os cookies são válidos

## 🔧 Desenvolvimento

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm run start

# Linter
npm run lint
```
