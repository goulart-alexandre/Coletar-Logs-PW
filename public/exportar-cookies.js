// Script para copiar cookies do navegador
// Cole este código no Console do navegador (F12) quando estiver logado no site Ahgora

(function() {
  const cookies = document.cookie.split(';').map(cookie => {
    const [name, value] = cookie.trim().split('=');
    return {
      name: name,
      value: decodeURIComponent(value),
      domain: '.ahgora.com.br',
      path: '/',
    };
  });

  const cookiesJson = JSON.stringify(cookies, null, 2);
  
  // Copia para o clipboard
  navigator.clipboard.writeText(cookiesJson).then(() => {
    console.log('✅ Cookies copiados para o clipboard!');
    console.log('Cookies:', cookiesJson);
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    console.log('Cookies (cole manualmente):', cookiesJson);
  });
})();
