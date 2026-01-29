import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  return NextResponse.json({ 
    message: 'API de extração de Memoria está funcionando',
    endpoint: '/api/extrair-memoria',
    method: 'POST',
    body: { url: 'string' }
  });
}

export async function POST(request: NextRequest) {
  let browser;
  try {
    const body = await request.json();
    const { url, cookies } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    console.log('Iniciando Puppeteer para URL:', url);

    // Tenta usar o perfil do Chrome do usuário (onde ele já está logado)
    // No Windows, o perfil padrão geralmente está em:
    // C:\Users\[USERNAME]\AppData\Local\Google\Chrome\User Data
    const userDataDir = process.env.CHROME_USER_DATA_DIR || undefined;
    
    const launchOptions: any = {
      headless: true, // Mude para false se quiser ver o navegador
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    };

    // Se tiver userDataDir configurado, usa o perfil do Chrome
    if (userDataDir) {
      launchOptions.userDataDir = userDataDir;
      console.log('Usando perfil do Chrome em:', userDataDir);
    }

    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (launchError: any) {
      console.error('Erro ao iniciar Puppeteer:', launchError.message);
      // Tenta novamente sem userDataDir se falhar
      if (userDataDir) {
        console.log('Tentando sem userDataDir...');
        delete launchOptions.userDataDir;
        browser = await puppeteer.launch(launchOptions);
      } else {
        throw launchError;
      }
    }

    console.log('Puppeteer iniciado com sucesso');

    const page = await browser.newPage();

    // Configura user agent para parecer um navegador real
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Se cookies foram fornecidos, adiciona eles antes de acessar a página
    if (cookies && Array.isArray(cookies) && cookies.length > 0) {
      console.log('Adicionando', cookies.length, 'cookies...');
      try {
        // Converte o formato da extensão EditThisCookie para o formato do Puppeteer
        const puppeteerCookies = cookies.map((cookie: any) => {
          const puppeteerCookie: any = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain || '.ahgora.com.br',
            path: cookie.path || '/',
          };

          // Adiciona campos opcionais se existirem
          if (cookie.expirationDate) {
            puppeteerCookie.expires = cookie.expirationDate;
          }
          if (cookie.httpOnly !== undefined) {
            puppeteerCookie.httpOnly = cookie.httpOnly;
          }
          if (cookie.secure !== undefined) {
            puppeteerCookie.secure = cookie.secure;
          }
          if (cookie.sameSite) {
            // Converte sameSite para o formato do Puppeteer
            const sameSiteMap: any = {
              'Strict': 'Strict',
              'Lax': 'Lax',
              'None': 'None',
              'unspecified': undefined,
              'no_restriction': 'None',
            };
            puppeteerCookie.sameSite = sameSiteMap[cookie.sameSite] || cookie.sameSite;
          }

          return puppeteerCookie;
        });

        console.log('Cookies convertidos:', puppeteerCookies.length);
        await page.setCookie(...puppeteerCookies);
        console.log('✅ Cookies adicionados com sucesso (incluindo HttpOnly)');
      } catch (cookieError: any) {
        console.error('Erro ao adicionar cookies:', cookieError.message);
        console.error('Stack:', cookieError.stack);
        // Continua mesmo se houver erro ao adicionar cookies
      }
    } else {
      console.log('⚠️ Nenhum cookie fornecido - pode ser necessário autenticação');
    }

    // Acessa a página
    console.log('Acessando URL:', url);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Página carregada, aguardando conteúdo...');
    // Aguarda o conteúdo carregar (substitui waitForTimeout que foi removido)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verifica se a página carregou corretamente
    const pageTitle = await page.title();
    console.log('Título da página:', pageTitle);
    
    // Captura o HTML completo para debug
    const htmlContent = await page.content();
    console.log('Tamanho do HTML:', htmlContent.length, 'caracteres');
    
    // Verifica se há redirecionamento para login
    const currentUrl = page.url();
    console.log('URL atual após carregamento:', currentUrl);
    
    // Tenta extrair mesmo se redirecionou, pois o conteúdo pode estar no HTML
    const isLoginPage = currentUrl.includes('login') || pageTitle.toLowerCase().includes('login');
    if (isLoginPage) {
      console.log('⚠️ Página redirecionou para login, mas tentando extrair mesmo assim...');
    }

    // Extrai todas as informações do JSON
    const dadosExtraidos = await page.evaluate(() => {
      // Pega todo o texto da página (logs de texto)
      const bodyText = document.body.innerText || document.body.textContent || '';
      const htmlContent = document.body.innerHTML || '';
      const allText = bodyText + ' ' + htmlContent;
      
      console.log('Texto da página (primeiros 1000 chars):', allText.substring(0, 1000));
      
      // Procura pelo JSON completo que contém BIODATA, IP, Build, Kernel, Versao, etc.
      // Padrão: procura por um objeto JSON que contenha "BIODATA" e "IP"
      const jsonPattern = /\{[^}]*"BIODATA"[^}]*"IP"[^}]*\}/;
      
      // Tenta encontrar o JSON completo
      let jsonMatch = allText.match(jsonPattern);
      if (!jsonMatch) {
        // Tenta um padrão mais amplo - procura por qualquer JSON que contenha esses campos
        const broaderPattern = /\{[^{}]*"BIODATA"[^{}]*\{[^{}]*"VersaoAS"[^{}]*"Memoria"[^{}]*\}[^{}]*"Kernel"[^{}]*"Build"[^{}]*"Versao"[^{}]*"IP"[^{}]*\}/;
        jsonMatch = allText.match(broaderPattern);
      }
      
      if (!jsonMatch) {
        // Tenta encontrar linhas que contenham o JSON de status
        const lines = allText.split('\n');
        for (const line of lines) {
          if (line.includes('"BIODATA"') && line.includes('"IP"')) {
            // Tenta extrair o JSON completo da linha
            const lineJsonMatch = line.match(/\{[^}]*"BIODATA"[^}]*\}/);
            if (lineJsonMatch) {
              jsonMatch = lineJsonMatch;
              break;
            }
          }
        }
      }
      
      if (!jsonMatch) {
        return {
          found: false,
          error: 'JSON não encontrado na página',
          sampleText: allText.substring(0, 2000),
        };
      }
      
      try {
        // Tenta fazer parse do JSON encontrado
        // Pode precisar limpar o JSON antes de fazer parse
        let jsonStr = jsonMatch[0];
        
        // Tenta encontrar o JSON completo que começa com { e termina com }
        // Procura pelo JSON que contém "req":"status"
        const fullJsonPattern = /\{"BIODATA"[^}]*\}[^}]*"Kernel"[^}]*"Build"[^}]*"Versao"[^}]*"Rede"[^}]*"IP"[^}]*"resp"[^}]*"req":"status"\}/;
        const fullJsonMatch = allText.match(fullJsonPattern);
        if (fullJsonMatch) {
          jsonStr = fullJsonMatch[0];
        }
        
        // Tenta fazer parse
        const jsonObj = JSON.parse(jsonStr);
        
        // Extrai os campos necessários
        const biodata = jsonObj.BIODATA || {};
        const resultado = {
          found: true,
          ip: jsonObj.IP || '',
          build: jsonObj.Build || '',
          kernel: jsonObj.Kernel || '',
          versao: jsonObj.Versao || '',
          versaoAS: biodata.VersaoAS || '',
          memoria: biodata.Memoria || '',
          bioUso: biodata.bioUso !== undefined ? biodata.bioUso.toString() : '',
        };
        
        console.log('✅ Dados extraídos:', resultado);
        return resultado;
      } catch (parseError) {
        // Se não conseguir fazer parse, tenta extrair os campos manualmente com regex
        console.log('Erro ao fazer parse do JSON, tentando extração manual...');
        
        const extrairCampo = (campo: string): string => {
          const pattern = new RegExp(`"${campo}"\\s*:\\s*"([^"]+)"`, 'i');
          const match = allText.match(pattern);
          return match ? match[1] : '';
        };
        
        const extrairCampoNumero = (campo: string): string => {
          const pattern = new RegExp(`"${campo}"\\s*:\\s*(\\d+)`, 'i');
          const match = allText.match(pattern);
          return match ? match[1] : '';
        };
        
        // Extrai IP
        const ip = extrairCampo('IP');
        
        // Extrai Build
        const build = extrairCampo('Build');
        
        // Extrai Kernel
        const kernel = extrairCampo('Kernel');
        
        // Extrai Versao
        const versao = extrairCampo('Versao');
        
        // Extrai VersaoAS (dentro de BIODATA)
        const versaoAS = allText.match(/"BIODATA"[^}]*"VersaoAS"\s*:\s*"([^"]+)"/i);
        const versaoASValue = versaoAS ? versaoAS[1] : '';
        
        // Extrai Memoria (dentro de BIODATA)
        const memoria = allText.match(/"BIODATA"[^}]*"Memoria"\s*:\s*"([^"]+)"/i);
        const memoriaValue = memoria ? memoria[1] : '';
        
        // Extrai bioUso (dentro de BIODATA)
        const bioUso = allText.match(/"BIODATA"[^}]*"bioUso"\s*:\s*(\d+)/i);
        const bioUsoValue = bioUso ? bioUso[1] : '';
        
        return {
          found: true,
          ip: ip || '',
          build: build || '',
          kernel: kernel || '',
          versao: versao || '',
          versaoAS: versaoASValue || '',
          memoria: memoriaValue || '',
          bioUso: bioUsoValue || '',
        };
      }
    });

    console.log('Resultado da extração:', dadosExtraidos);
    
    // Extrai o número de série da URL
    const serieMatch = url.match(/rep=([^&]+)/);
    const numeroSerie = serieMatch ? decodeURIComponent(serieMatch[1]).replace(/%20/g, ' ') : '';
    
    // Se retornou objeto com found: false, significa que não encontrou
    if (typeof dadosExtraidos === 'object' && dadosExtraidos !== null && 'found' in dadosExtraidos && !dadosExtraidos.found) {
      console.log('Debug - JSON não encontrado');
      console.log('Debug - Texto da página (primeiros 2000 chars):', dadosExtraidos.sampleText);
      
      return NextResponse.json(
        { 
          error: 'Dados não encontrados na página',
          debug: {
            sampleText: dadosExtraidos.sampleText?.substring(0, 500) || '',
          }
        },
        { status: 404 }
      );
    }

    if (browser) {
      await browser.close();
      console.log('Navegador fechado');
    }

    // Se encontrou os dados, retorna tudo
    if (typeof dadosExtraidos === 'object' && dadosExtraidos !== null && 'found' in dadosExtraidos && dadosExtraidos.found) {
      return NextResponse.json({
        success: true,
        numeroSerie: numeroSerie,
        ip: dadosExtraidos.ip || '',
        build: dadosExtraidos.build || '',
        kernel: dadosExtraidos.kernel || '',
        versao: dadosExtraidos.versao || '',
        versaoAS: dadosExtraidos.versaoAS || '',
        memoria: dadosExtraidos.memoria || '',
        bioUso: dadosExtraidos.bioUso || '',
      });
    }

    // Se chegou aqui, não encontrou
    return NextResponse.json(
      { error: 'Dados não encontrados na página. Verifique se a URL está correta e se você tem acesso à página.' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Erro ao extrair memória:', error);
    console.error('Stack trace:', error.stack);
    
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Erro ao fechar navegador:', e);
      }
    }
    
    const errorMessage = error.message || 'Erro desconhecido';
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? error.stack 
      : undefined;
    
    return NextResponse.json(
      {
        error: 'Erro ao processar a requisição',
        message: errorMessage,
        ...(errorDetails && { details: errorDetails }),
      },
      { status: 500 }
    );
  }
}
