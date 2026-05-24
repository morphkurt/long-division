#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testStaticPDF() {
  console.log('🔢 Testing static HTML PDF generation...');
  
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Test static worksheet
    const staticHTML = fs.readFileSync('static-worksheet.html', 'utf8');
    await page.setContent(staticHTML);
    
    await page.pdf({
      path: 'static-worksheet.pdf',
      format: 'A4',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      printBackground: true
    });
    
    console.log('✅ Generated static-worksheet.pdf');
    
    // Test answers version
    const answersHTML = fs.readFileSync('static-answers.html', 'utf8');
    await page.setContent(answersHTML);
    
    await page.pdf({
      path: 'static-answers.pdf',
      format: 'A4',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      printBackground: true
    });
    
    console.log('✅ Generated static-answers.pdf');
    
    await browser.close();
    
    // Check file sizes
    const worksheetSize = fs.statSync('static-worksheet.pdf').size;
    const answersSize = fs.statSync('static-answers.pdf').size;
    
    console.log('📊 Worksheet PDF:', worksheetSize, 'bytes');
    console.log('📊 Answers PDF:', answersSize, 'bytes');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStaticPDF();