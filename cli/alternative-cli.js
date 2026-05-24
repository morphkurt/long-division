#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const program = new Command();

// Working static HTML generator (from previous test)
function generateStaticHTML(problems, showAnswers = false) {
  // Generate problems HTML statically
  function createProblemHTML(problem, index) {
    const dividendStr = problem.dividend.toString();
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
      
      // White row with product when showing answers
      workTable += '<tr>';
      for (let col = 0; col < 5; col++) {
        let cellClass = 'work-cell';
        let cellContent = '';
        
        if (visibleIndex < visibleSteps.length - 1) {
          cellClass += ' thick-bottom';
        }
        
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
    <title>Long Division Worksheet</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; padding: 20px; background: white; color: #333; }
        .problems-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .problem { display: flex; flex-direction: column; align-items: center; page-break-inside: avoid; }
        .problem-container { display: inline-block; }
        .quotient-row { display: flex; margin-bottom: 2px; }
        .quotient-box { width: 28px; height: 28px; border: 0.5px solid #333; background: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
        .quotient-box.active { background: #f8d0d0; }
        .dividend-container { display: flex; align-items: center; margin-bottom: 8px; }
        .divisor-area { text-align: right; padding-right: 4px; font-weight: bold; font-size: 16px; }
        .dividend-bracket { border-top: 2px solid black; border-left: 2px solid black; display: flex; padding: 5px; }
        .dividend-digit { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
        .work-table { border-collapse: collapse; font-size: 14px; }
        .work-table col { width: 28px; }
        .work-cell { width: 28px; height: 26px; border: 0.5px solid #ccc; text-align: center; vertical-align: middle; background: white; }
        .work-cell.pink { background: #f8d0d0; }
        .work-cell.thick-bottom { border-bottom: 2px solid black; }
        .remainder-label { text-align: left; padding-left: 5px; color: red; font-weight: bold; }
    </style>
</head>
<body>
    <div class="problems-grid">
        ${problemsHTML}
    </div>
</body>
</html>`;
}

// Rest of helper functions...
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

function generateProblem(divisorMin, divisorMax, quotientMin, quotientMax) {
  let attempts = 0;
  while (attempts < 100) {
    const divisor = Math.floor(Math.random() * (divisorMax - divisorMin + 1)) + divisorMin;
    const quotient = Math.floor(Math.random() * (quotientMax - quotientMin + 1)) + quotientMin;
    const dividend = divisor * quotient;
    
    if (dividend >= 10000 && dividend <= 99999) {
      const steps = computeLongDivisionSteps(dividend, divisor);
      return { divisor, dividend, quotient, remainder: 0, steps };
    }
    attempts++;
  }
  
  // Fallback
  const steps = computeLongDivisionSteps(23000, 23);
  return { divisor: 23, dividend: 23000, quotient: 1000, remainder: 0, steps };
}

// CLI Commands
program
  .name('longdiv')
  .description('Generate long division worksheets as HTML files')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .description('Generate a worksheet HTML file')
  .option('-c, --complexity <level>', 'difficulty (easy|medium|hard)', 'medium')
  .option('-n, --count <number>', 'number of problems (1-12)', '9')
  .option('-o, --output <file>', 'output filename', 'worksheet.html')
  .option('-a, --answers', 'include answer key')
  .action((options) => {
    try {
      console.log(chalk.blue('🔢 Generating long division worksheet...'));
      
      const count = parseInt(options.count);
      if (isNaN(count) || count < 1 || count > 12) {
        console.error(chalk.red('❌ Problem count must be between 1 and 12'));
        process.exit(1);
      }
      
      // Complexity settings
      const complexityMap = {
        easy: { divisorMin: 10, divisorMax: 50, quotientMin: 100, quotientMax: 199 },
        medium: { divisorMin: 10, divisorMax: 99, quotientMin: 100, quotientMax: 999 },
        hard: { divisorMin: 50, divisorMax: 99, quotientMin: 500, quotientMax: 999 }
      };
      
      const config = complexityMap[options.complexity] || complexityMap.medium;
      
      console.log(chalk.yellow(`📊 Complexity: ${options.complexity}`));
      console.log(chalk.yellow(`📝 Problems: ${count}`));
      console.log(chalk.yellow(`💾 Output: ${options.output}`));
      
      // Generate problems
      const problems = [];
      for (let i = 0; i < count; i++) {
        problems.push(generateProblem(config.divisorMin, config.divisorMax, config.quotientMin, config.quotientMax));
      }
      
      // Generate HTML
      const html = generateStaticHTML(problems, options.answers);
      fs.writeFileSync(options.output, html);
      
      console.log(chalk.green('✅ Worksheet generated successfully!'));
      console.log(chalk.gray(`📄 Saved to: ${path.resolve(options.output)}`));
      console.log(chalk.gray(`💡 Tip: Open the HTML file in a browser and use Print to PDF`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}