// Script para extrair Memoria automaticamente
// Execute este código no Console (F12) quando estiver na página do Ahgora

(async function() {
  try {
    console.log('🔍 Iniciando extração automática de Memoria...');
    
    // Pega a URL atual ou usa a URL fornecida
    const url = window.location.href.includes('controle_log_rep') 
      ? window.location.href 
      : 'https://app.ahgora.com.br/equipamentos/controle_log_rep?empr=a994580&rep=RPONTO-Ah30%2000430&ver=true&tam=1000000';
    
    console.log('📋 URL:', url);
    
    // Extrai os cookies automaticamente
    const cookies = document.cookie.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return {
        name: name,
        value: decodeURIComponent(value),
        domain: '.ahgora.com.br',
        path: '/',
      };
    }).filter(c => c.name && c.value);
    
    console.log('🍪 Cookies extraídos:', cookies.length);
    
    // Faz a requisição para a API local
    const response = await fetch('http://localhost:3000/api/extrair-memoria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        cookies: cookies,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao extrair memória');
    }
    
    // Mostra o resultado
    console.log('✅ Memoria encontrada:', data.memoria);
    alert(`Memoria: ${data.memoria}`);
    
    // Copia para o clipboard
    await navigator.clipboard.writeText(data.memoria);
    console.log('📋 Valor copiado para o clipboard!');
    
    return data.memoria;
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro: ' + error.message);
    throw error;
  }
})();
