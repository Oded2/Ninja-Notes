import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

export async function POST(req: NextRequest) {
  const formHTML = await req.text();
  const mode = process.env.NODE_ENV || 'production';
  if (!formHTML) {
    return NextResponse.json(
      { error: 'Missing form data, or token' },
      { status: 400 },
    );
  }
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    let tailwindCss = '';
    const tailwindCssPath = path.resolve(
      process.cwd(),
      '.next/static/css/app/layout.css',
    );
    if (mode == 'development') {
      tailwindCss = existsSync(tailwindCssPath)
        ? readFileSync(tailwindCssPath, 'utf-8')
        : '';
    } else {
      const cssDir = path.resolve(process.cwd(), '.next/static/css');
      const cssFiles = readdirSync(cssDir);
      // Function to check if a CSS file contains Tailwind-specific classes
      const isTailwindCss = (cssContent: string) => {
        return /(?:\.\w+)?\b(container|flex|grid|text-xl|p-4|m-2)\b/.test(
          cssContent,
        );
      };
      for (const file of cssFiles) {
        if (file.endsWith('.css')) {
          const filePath = path.join(cssDir, file);
          const cssContent = readFileSync(filePath, 'utf-8');
          if (isTailwindCss(cssContent)) {
            tailwindCss = cssContent;
            break; // Stop once the TailwindCSS file is found
          }
        }
      }
    }
    const htmlWithStyles = `
<html>
<head>
<style>${tailwindCss}</style>
</head>
<body>${formHTML}</body>
</html>
    `;
    const context = await browser.newContext();
    const pdfPage = await context.newPage();
    await pdfPage.setContent(htmlWithStyles, { waitUntil: 'load' });
    const pdfBuffer = await pdfPage.pdf({
      format: 'A4',
      margin: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });
    await browser.close();
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF` },
      { status: 500 },
    );
  }
}
