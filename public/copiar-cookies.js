// Script para copiar cookies automaticamente
// Execute no Console (F12) quando estiver logado no site Ahgora

const cookies = document.cookie.split(';').map(cookie => {
  const [name, value] = cookie.trim().split('=');
  return {
    name: name,
    value: decodeURIComponent(value),
    domain: '.ahgora.com.br',
    path: '/',
  };
}).filter(c => c.name && c.value);

const cookiesJson = JSON.stringify(cookies, null, 2);

// Mostra no console primeiro (sempre funciona)
console.log('✅ Cookies extraídos!');
console.log('Total de cookies:', cookies.length);
console.log('📋 Copie o JSON abaixo:');
console.log(cookiesJson);

// Tenta copiar para clipboard (pode falhar se não estiver focado)
navigator.clipboard.writeText(cookiesJson).then(() => {
  console.log('✅ Cookies também copiados para o clipboard!');
}).catch(err => {
  console.log('⚠️ Não foi possível copiar automaticamente. Use o texto acima do console.');
});
