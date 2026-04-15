// Script 100% automático - Funciona direto no navegador
// Execute no Console (F12) quando estiver na página do Ahgora
// Não precisa de servidor Next.js rodando!

(async function() {
  try {
    console.log('🔍 Extraindo Memoria automaticamente...');
    
    // Se já estamos na página, extrai direto
    if (window.location.href.includes('controle_log_rep')) {
      // Aguarda a página carregar completamente
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procura por "Memoria" na página
      const bodyText = document.body.innerText;
      const htmlContent = document.body.innerHTML;
      
      // Padrões de busca
      const patterns = [
        /Memoria["\s:]+(\d+\s*MB)/i,
        /Memoria["\s:]+["'](\d+\s*MB)["']/i,
        /"Memoria"\s*:\s*"(\d+\s*MB)"/i,
        /'Memoria'\s*:\s*'(\d+\s*MB)'/i,
        /Memoria\s*:\s*(\d+\s*MB)/i,
        /Memoria[^:]*:\s*(\d+\s*MB)/i,
      ];

      let memoria = null;

      // Tenta cada padrão no texto
      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match) {
          memoria = match[1].trim();
          break;
        }
      }

      // Se não encontrou, tenta no HTML
      if (!memoria) {
        for (const pattern of patterns) {
          const match = htmlContent.match(pattern);
          if (match) {
            memoria = match[1].trim();
            break;
          }
        }
      }

      // Procura em elementos específicos
      if (!memoria) {
        const elements = Array.from(document.querySelectorAll('td, th, div, span, p, li, pre, code'));
        for (const el of elements) {
          const text = el.textContent || '';
          if (text.includes('Memoria') || text.includes('Memória')) {
            for (const pattern of patterns) {
              const match = text.match(pattern);
              if (match) {
                memoria = match[1].trim();
                break;
              }
            }
            if (memoria) break;
            
            // Se encontrou "Memoria" mas não o padrão, tenta pegar o próximo número com MB
            const nextMB = text.match(/(\d+\s*MB)/i);
            if (nextMB) {
              memoria = nextMB[1].trim();
              break;
            }
          }
        }
      }

      // Procura em JSON se houver
      if (!memoria) {
        try {
          const jsonMatches = htmlContent.match(/\{[^}]*Memoria[^}]*\}/i);
          if (jsonMatches) {
            for (const jsonStr of jsonMatches) {
              for (const pattern of patterns) {
                const match = jsonStr.match(pattern);
                if (match) {
                  memoria = match[1].trim();
                  break;
                }
              }
              if (memoria) break;
            }
          }
        } catch (e) {
          // Ignora erros
        }
      }

      if (memoria) {
        console.log('✅ Memoria encontrada:', memoria);
        alert(`Memoria: ${memoria}`);
        
        // Copia para o clipboard
        await navigator.clipboard.writeText(memoria);
        console.log('📋 Valor copiado para o clipboard!');
        
        return memoria;
      } else {
        throw new Error('Campo Memoria não encontrado na página');
      }
    } else {
      // Se não está na página, navega para ela
      const url = 'https://app.ahgora.com.br/equipamentos/controle_log_rep?empr=a994580&rep=RPONTO-Ah30%2000430&ver=true&tam=1000000';
      console.log('🔄 Navegando para a página...');
      window.location.href = url;
      return 'Redirecionando...';
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro: ' + error.message);
    throw error;
  }
})();
