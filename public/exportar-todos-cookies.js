// Script para exportar TODOS os cookies (incluindo HttpOnly)
// Execute no Console (F12) quando estiver logado no site Ahgora
// IMPORTANTE: Este método pega apenas cookies acessíveis via JavaScript
// Para cookies HttpOnly, use o método manual abaixo

console.log('📋 Método 1: Cookies via JavaScript (pode não incluir HttpOnly)');
const cookiesJS = document.cookie.split(';').map(cookie => {
  const [name, value] = cookie.trim().split('=');
  return {
    name: name,
    value: decodeURIComponent(value),
    domain: '.ahgora.com.br',
    path: '/',
  };
}).filter(c => c.name && c.value);

console.log('Cookies JavaScript:', cookiesJS.length);
console.log(JSON.stringify(cookiesJS, null, 2));

console.log('\n📋 Método 2: Exportar manualmente do DevTools');
console.log('1. Abra DevTools (F12)');
console.log('2. Vá para Application → Storage → Cookies → https://app.ahgora.com.br');
console.log('3. Clique com botão direito na tabela de cookies');
console.log('4. Selecione "Copy all as cURL" ou copie manualmente');
console.log('5. Ou use uma extensão como "EditThisCookie" para exportar');

console.log('\n💡 Dica: Cookies HttpOnly não são acessíveis via JavaScript por segurança.');
console.log('   Você precisa exportá-los manualmente do DevTools ou usar uma extensão.');
