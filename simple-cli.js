#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Simple test with hardcoded HTML
const simpleHTML = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; padding: 20px; }
        .problem { margin: 20px; padding: 10px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>Test Worksheet</h1>
    <div class="problem">Problem 1: 45 ÷ 32640 = 725</div>
    <div class="problem">Problem 2: 23 ÷ 18768 = 816</div>
    <div class="problem">Problem 3: 67 ÷ 56088 = 837</div>
</body>
</html>`;

async function createTestPDF() {
    console.log('🔢 Creating simple test PDF...');
    
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        await page.setContent(simpleHTML);
        
        await page.pdf({
            path: 'simple-test.pdf',
            format: 'A4',
            margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
        });
        
        await browser.close();
        
        console.log('✅ Simple PDF created successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestPDF();