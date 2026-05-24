#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPDFGeneration() {
  console.log('🔢 Testing PDF generation from test-worksheet.html...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the test HTML file
    const htmlPath = path.join(__dirname, 'test-worksheet.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    console.log('📄 HTML file size:', html.length);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    // Check if content is rendered
    const hasGrid = await page.evaluate(() => {
      const grid = document.getElementById('problems-grid');
      return grid ? true : false;
    });
    console.log('Grid element found:', hasGrid);
    
    const problemCount = await page.evaluate(() => {
      const problems = document.querySelectorAll('.problem');
      return problems.length;
    });
    console.log('Problems rendered:', problemCount);
    
    // Get page content for debugging
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML.length;
    });
    console.log('Body content length:', bodyContent);
    
    // Generate PDF
    await page.pdf({
      path: 'debug-test.pdf',
      format: 'A4',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      printBackground: true
    });
    
    console.log('✅ PDF generated: debug-test.pdf');
    
    // Check PDF file size
    const pdfStats = fs.statSync('debug-test.pdf');
    console.log('📊 PDF size:', pdfStats.size, 'bytes');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPDFGeneration();