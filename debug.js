#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test the HTML generation in isolation
function generateTestProblem() {
  return {
    divisor: 25,
    dividend: 12345,
    quotient: 493,
    remainder: 0
  };
}

function computeLongDivisionSteps(dividend, divisor) {
  const dividendStr = dividend.toString().padStart(5, '0');
  const steps = [];
  let working = 0;
  let hasNonZeroQuotient = false;
  
  for (let i = 0; i < 5; i++) {
      working = working * 10 + parseInt(dividendStr[i]);
      const q = Math.floor(working / divisor);
      const product = q * divisor;
      const remainder = working - product;
      
      if (q > 0) hasNonZeroQuotient = true;
      
      steps.push({
          digitIndex: i,
          working: working,
          product: product,
          quotientDigit: q,
          remainder: remainder,
          isLeadingZero: q === 0 && !hasNonZeroQuotient,
          showInGrid: hasNonZeroQuotient || q > 0
      });
      
      working = remainder;
  }
  
  return steps;
}

// Generate simple test problems
const problems = [generateTestProblem()];
const problemsWithSteps = problems.map(problem => {
  const steps = computeLongDivisionSteps(problem.dividend, problem.divisor);
  return { ...problem, steps };
});

console.log('Generated problems with steps:');
console.log(JSON.stringify(problemsWithSteps, null, 2));

// Test HTML template reading
const templatePath = path.join(__dirname, 'long-division-worksheet-v2.html');
console.log('\n🔍 Checking template:', templatePath);
console.log('Template exists:', fs.existsSync(templatePath));

if (fs.existsSync(templatePath)) {
  const template = fs.readFileSync(templatePath, 'utf8');
  console.log('Template size:', template.length, 'characters');
  console.log('Contains problems-grid:', template.includes('problems-grid'));
  console.log('Contains createProblemHTML:', template.includes('createProblemHTML'));
}