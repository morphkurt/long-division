#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate static HTML without JavaScript
function generateStaticHTML(problems, showAnswers = false) {
  
  // Generate problems HTML statically
  function createProblemHTML(problem, index) {
    const dividendStr = problem.dividend.toString();
    const quotientStr = problem.quotient.toString();
    
    // Calculate bracket width
    const bracketWidth = 60;
    
    // Quotient boxes
    let quotientBoxes = '';
    let hasNonZero = false;
    for (let i = 0; i < 5; i++) {
      const step = problem.steps[i];
      const digit = step.quotientDigit;
      
      if (digit > 0 || hasNonZero) {
        hasNonZero = true;
        const displayDigit = showAnswers ? digit : '';
        quotientBoxes += `<div class="quotient-box active">${displayDigit}</div>`;
      } else {
        quotientBoxes += `<div class="quotient-box"></div>`;
      }
    }
    
    // Dividend digits
    let dividendDigits = '';
    for (let i = 0; i < 5; i++) {
      dividendDigits += `<div class="dividend-digit">${dividendStr[i]}</div>`;
    }
    
    // Work table
    let workTable = '<table class="work-table"><colgroup>';
    for (let i = 0; i < 5; i++) {
      workTable += '<col>';
    }
    workTable += '</colgroup><tbody>';
    
    const visibleSteps = problem.steps.filter(step => step.showInGrid);
    
    for (let visibleIndex = 0; visibleIndex < visibleSteps.length; visibleIndex++) {
      const step = visibleSteps[visibleIndex];
      const stepIndex = step.digitIndex;
      const workingStr = step.working.toString();
      const endCol = stepIndex;
      const startCol = endCol - (workingStr.length - 1);
      
      // Pink row
      workTable += '<tr>';
      for (let col = 0; col < 5; col++) {
        let cellClass = 'work-cell';
        let cellContent = '';
        
        if (col <= endCol) {
          cellClass += ' pink';
          if (showAnswers && col >= startCol && col <= endCol) {
            const digitIndex = col - startCol;
            if (digitIndex < workingStr.length) {
              cellContent = workingStr[digitIndex];
            }
          }
        }
        
        workTable += `<td class="${cellClass}">${cellContent}</td>`;
      }
      workTable += '</tr>';
      
      // White row
      workTable += '<tr>';
      for (let col = 0; col < 5; col++) {
        let cellClass = 'work-cell';
        let cellContent = '';
        
        if (visibleIndex < visibleSteps.length - 1) {
          cellClass += ' thick-bottom';
        }
        
        // Show product when answers shown
        if (showAnswers && col >= startCol && col <= endCol) {
          const productStr = step.product.toString();
          const paddedProduct = productStr.padStart(workingStr.length, '0');
          const digitIndex = col - startCol;
          if (digitIndex < paddedProduct.length) {
            cellContent = paddedProduct[digitIndex];
          }
        }
        
        workTable += `<td class="${cellClass}">${cellContent}</td>`;
      }
      workTable += '</tr>';
    }
    
    // Final remainder row
    workTable += '<tr>';
    for (let col = 0; col < 5; col++) {
      let cellContent = '';
      if (showAnswers && problem.remainder === 0 && col === 4) {
        cellContent = '0';
      }
      workTable += `<td class="work-cell pink">${cellContent}</td>`;
    }
    workTable += '</tr>';
    
    workTable += '<tr>';
    workTable += `<td colspan="5" class="remainder-label">R: ${showAnswers ? problem.remainder : ''}</td>`;
    workTable += '</tr>';
    
    workTable += '</tbody></table>';
    
    return `
      <div class="problem">
        <div class="problem-container">
          <div class="quotient-row" style="margin-left: ${bracketWidth}px;">
            ${quotientBoxes}
          </div>
          <div class="dividend-container">
            <div class="divisor-area" style="width: ${bracketWidth}px;">
              ${problem.divisor}
            </div>
            <div class="dividend-bracket">
              ${dividendDigits}
            </div>
          </div>
          <div style="margin-left: ${bracketWidth}px;">
            ${workTable}
          </div>
        </div>
      </div>
    `;
  }
  
  const problemsHTML = problems.map((problem, index) => createProblemHTML(problem, index)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Long Division Worksheet</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; padding: 20px; background: white; color: #333; }
        .problems-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .problem { display: flex; flex-direction: column; align-items: center; page-break-inside: avoid; }
        .problem-container { display: inline-block; }
        .quotient-row { display: flex; margin-bottom: 2px; }
        .quotient-box { width: 28px; height: 28px; border: 0.5px solid #333; background: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; font-family: monospace; }
        .quotient-box.active { background: #f8d0d0; }
        .dividend-container { display: flex; align-items: center; margin-bottom: 8px; }
        .divisor-area { text-align: right; padding-right: 4px; font-weight: bold; font-size: 16px; font-family: monospace; }
        .dividend-bracket { border-top: 2px solid black; border-left: 2px solid black; display: flex; padding-top: 5px; padding-left: 5px; }
        .dividend-digit { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; font-family: monospace; }
        .work-table { border-collapse: collapse; font-family: monospace; font-size: 14px; }
        .work-table colgroup col { width: 28px; }
        .work-cell { width: 28px; height: 26px; border: 0.5px solid #ccc; text-align: center; vertical-align: middle; background: white; }
        .work-cell.pink { background: #f8d0d0; }
        .work-cell.thick-bottom { border-bottom: 2px solid black; }
        .remainder-label { text-align: left; padding-left: 5px; color: red; font-weight: bold; background: white; }
        @media print {
            body { padding: 10px; }
            .problems-grid { gap: 20px; }
            .problem { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="problems-grid">
        ${problemsHTML}
    </div>
</body>
</html>`;
}

// Generate test problems
function generateTestProblems() {
  const problems = [
    { divisor: 23, dividend: 18768, quotient: 816, remainder: 0 },
    { divisor: 45, dividend: 32640, quotient: 725, remainder: 0 },
    { divisor: 67, dividend: 56088, quotient: 837, remainder: 0 }
  ];
  
  return problems.map(problem => {
    const steps = computeLongDivisionSteps(problem.dividend, problem.divisor);
    return { ...problem, steps };
  });
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
      showInGrid: hasNonZeroQuotient || q > 0
    });
    
    working = remainder;
  }
  
  return steps;
}

// Generate and save static HTML
const problems = generateTestProblems();
const staticHTML = generateStaticHTML(problems, false);
fs.writeFileSync('static-worksheet.html', staticHTML);
console.log('✅ Generated static-worksheet.html');

// Also generate with answers
const answersHTML = generateStaticHTML(problems, true);
fs.writeFileSync('static-answers.html', answersHTML);
console.log('✅ Generated static-answers.html');