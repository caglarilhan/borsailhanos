import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { generateSuperbillHTML, type SuperbillData } from '@/lib/superbill-generator';

export const dynamic = 'force-dynamic';

type Payload =
  | { mode: 'data'; superbill: SuperbillData }
  | { mode: 'raw-html'; html: string; filename?: string };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Payload;

    let html: string;
    if (body.mode === 'data') {
      html = generateSuperbillHTML(body.superbill);
    } else if (body.mode === 'raw-html') {
      html = body.html;
    } else {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ printBackground: true, format: 'Letter' });
    await browser.close();

    const filename = body.mode === 'raw-html' && body.filename ? body.filename : 'superbill.pdf';

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed to generate pdf';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}




