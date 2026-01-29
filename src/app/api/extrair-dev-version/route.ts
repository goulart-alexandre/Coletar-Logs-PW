import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

    console.log('Iniciando Puppeteer para extrair dev_version:', url);

    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    };

    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (launchError: any) {
      console.error('Erro ao iniciar Puppeteer:', launchError.message);
      throw launchError;
    }

    console.log('Puppeteer iniciado com sucesso');

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Adiciona cookies se fornecidos
    if (cookies && Array.isArray(cookies) && cookies.length > 0) {
      console.log('Adicionando', cookies.length, 'cookies...');
      try {
        const puppeteerCookies = cookies.map((cookie: any) => {
          const puppeteerCookie: any = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain || '.ahgora.com.br',
            path: cookie.path || '/',
          };

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

        await page.setCookie(...puppeteerCookies);
        console.log('✅ Cookies adicionados com sucesso');
      } catch (cookieError: any) {
        console.error('Erro ao adicionar cookies:', cookieError.message);
      }
    }

    // Acessa a página
    console.log('Acessando URL:', url);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Página carregada, aguardando conteúdo...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extrai dev_version
    const devVersion = await page.evaluate(() => {
      const bodyText = document.body.innerText || document.body.textContent || '';
      const htmlContent = document.body.innerHTML || '';
      const allText = bodyText + ' ' + htmlContent;
      
      console.log('Texto da página (primeiros 2000 chars):', allText.substring(0, 2000));
      
      // Procura por "dev_version":"valor" no JSON (pode estar em diferentes níveis)
      // Padrão mais flexível que busca em qualquer lugar do JSON
      const devVersionPatterns = [
        /"dev_version"\s*:\s*"([^"]+)"/i,
        /dev_version["\s:]+["']([^"']+)["']/i,
        /dev_version\s*:\s*"([^"]+)"/i,
        /"dev_version"\s*:\s*"([^"]+)"/
      ];
      
      // Tenta cada padrão no texto completo
      for (const pattern of devVersionPatterns) {
        let match = allText.match(pattern);
        if (match && match[1]) {
          console.log('✅ dev_version encontrado com padrão:', match[1]);
          return match[1].trim();
        }
      }
      
      // Tenta no bodyText
      for (const pattern of devVersionPatterns) {
        let match = bodyText.match(pattern);
        if (match && match[1]) {
          console.log('✅ dev_version encontrado no bodyText:', match[1]);
          return match[1].trim();
        }
      }
      
      // Tenta no HTML
      for (const pattern of devVersionPatterns) {
        let match = htmlContent.match(pattern);
        if (match && match[1]) {
          console.log('✅ dev_version encontrado no HTML:', match[1]);
          return match[1].trim();
        }
      }
      
      // Se não encontrou, tenta buscar em linhas específicas que contenham "status"
      const lines = allText.split('\n');
      for (const line of lines) {
        if (line.includes('status') && line.includes('dev_version')) {
          for (const pattern of devVersionPatterns) {
            const match = line.match(pattern);
            if (match && match[1]) {
              console.log('✅ dev_version encontrado em linha de status:', match[1]);
              return match[1].trim();
            }
          }
        }
      }
      
      console.log('❌ dev_version não encontrado. Texto de amostra:', allText.substring(0, 500));
      return null;
    });

    console.log('Resultado da extração:', devVersion);
    
    // Extrai o número de série da URL
    const serieMatch = url.match(/rep=([^&]+)/);
    const numeroSerie = serieMatch ? decodeURIComponent(serieMatch[1]).replace(/%20/g, ' ') : '';

    if (browser) {
      await browser.close();
      console.log('Navegador fechado');
    }

    if (devVersion) {
      return NextResponse.json({
        success: true,
        numeroSerie: numeroSerie,
        devVersion: devVersion,
      });
    }

    return NextResponse.json(
      { error: 'Campo dev_version não encontrado na página. Verifique se a URL está correta e se você tem acesso à página.' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Erro ao extrair dev_version:', error);
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
