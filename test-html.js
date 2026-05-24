#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test HTML generation without PDF
const { generateHTML, generateProblem, computeLongDivisionSteps } = require('./cli-functions.js');

// Generate test problems
function generateRandomProblem() {
  const divisor = Math.floor(Math.random() * 90) + 10;
  const quotient = Math.floor(Math.random() * 900) + 100;
  const dividend = divisor * quotient;
  
  if (dividend < 10000 || dividend > 99999) {
    return generateRandomProblem();
  }
  
  return { divisor, dividend, quotient, remainder: 0 };
}

const problems = [];
for (let i = 0; i < 3; i++) {
  problems.push(generateRandomProblem());
}

console.log('Generated problems:', problems);

// Test HTML template reading
const templatePath = path.join(__dirname, 'long-division-worksheet-v2.html');
if (!fs.existsSync(templatePath)) {
  console.error('❌ HTML template not found:', templatePath);
  process.exit(1);
}

console.log('✅ HTML template found');
const templateSize = fs.statSync(templatePath).size;
console.log('📄 Template size:', templateSize, 'bytes');