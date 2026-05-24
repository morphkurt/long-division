#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the original template
const templatePath = path.join(__dirname, 'long-division-worksheet-v2.html');
let html = fs.readFileSync(templatePath, 'utf8');

// Simple test problems
const problems = [{
  divisor: 25,
  dividend: 12345,
  quotient: 493,
  remainder: 0,
  steps: [
    { digitIndex: 2, working: 123, product: 100, quotientDigit: 4, remainder: 23, showInGrid: true },
    { digitIndex: 3, working: 234, product: 225, quotientDigit: 9, remainder: 9, showInGrid: true },
    { digitIndex: 4, working: 95, product: 75, quotientDigit: 3, remainder: 20, showInGrid: true }
  ]
}];

console.log('🔍 Original HTML search patterns:');
const jsRegex = /let problems = \[\];[\s\S]*?window\.addEventListener\('load', generateProblems\);/;
const match = html.match(jsRegex);
console.log('Found JS section:', match ? 'YES' : 'NO');
if (match) {
  console.log('Match length:', match[0].length);
  console.log('Match preview:', match[0].substring(0, 200) + '...');
}

// Try a simpler replacement approach
const simpleReplace = `
let problems = ${JSON.stringify(problems)};
let showingAnswers = false;

function generateProblems() {
  renderProblems();
}

function renderProblems() {
  const grid = document.getElementById('problems-grid');
  if (grid) {
    grid.innerHTML = problems.map((problem, index) => createProblemHTML(problem, index)).join('');
  }
}

window.addEventListener('load', generateProblems);
`;

// Find the script section and replace just the variables and functions
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
  console.log('Found script section');
  const beforeScript = html.substring(0, scriptStart + 8);
  const afterScript = html.substring(scriptEnd);
  
  // Keep the existing functions but replace the data
  const existingScript = html.substring(scriptStart + 8, scriptEnd);
  
  // Replace just the problem generation part
  let newScript = existingScript;
  newScript = newScript.replace(/let problems = \[\];/, `let problems = ${JSON.stringify(problems)};`);
  newScript = newScript.replace(/let showingAnswers = false;/, `let showingAnswers = false;`);
  newScript = newScript.replace(/function generateProblems\(\) \{[\s\S]*?\}/, `
    function generateProblems() {
      renderProblems();
    }
  `);
  
  const newHtml = beforeScript + newScript + afterScript;
  
  // Remove controls
  const finalHtml = newHtml.replace(/<div class="controls">[\s\S]*?<\/div>/, '');
  
  // Write test file
  fs.writeFileSync('test-worksheet.html', finalHtml);
  console.log('✅ Created test-worksheet.html');
  console.log('📝 Size:', finalHtml.length, 'characters');
  
} else {
  console.error('❌ Could not find script section');
}