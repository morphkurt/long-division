#!/usr/bin/env node

const { Command } = require('commander');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const program = new Command();

// Complexity levels configuration
const COMPLEXITY_LEVELS = {
  easy: {
    name: 'Easy',
    description: '2-digit divisor, simple quotients (100-199)',
    divisorRange: [10, 50],
    quotientRange: [100, 199],
    problems: 9
  },
  medium: {
    name: 'Medium', 
    description: '2-digit divisor, standard quotients (100-999)',
    divisorRange: [10, 99],
    quotientRange: [100, 999],
    problems: 9
  },
  hard: {
    name: 'Hard',
    description: '2-digit divisor, complex quotients (500-999)',
    divisorRange: [50, 99],
    quotientRange: [500, 999],
    problems: 9
  },
  custom: {
    name: 'Custom',
    description: 'User-defined parameters',
    divisorRange: [10, 99],
    quotientRange: [100, 999], 
    problems: 9
  }
};

// Generate random number within range
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a single long division problem
function generateProblem(config) {
  let attempts = 0;
  while (attempts < 100) { // Prevent infinite recursion
    const divisor = randomInRange(config.divisorRange[0], config.divisorRange[1]);
    const quotient = randomInRange(config.quotientRange[0], config.quotientRange[1]);
    const dividend = divisor * quotient;
    
    // Ensure 5-digit dividend
    if (dividend >= 10000 && dividend <= 99999) {
      return { divisor, dividend, quotient, remainder: 0 };
    }
    attempts++;
  }
  
  // Fallback if no valid problem found
  return { divisor: 23, dividend: 23000, quotient: 1000, remainder: 0 };
}

// Generate problems based on complexity
function generateProblems(complexity, count) {
  const config = COMPLEXITY_LEVELS[complexity] || COMPLEXITY_LEVELS.medium;
  const problems = [];
  
  for (let i = 0; i < count; i++) {
    problems.push(generateProblem(config));
  }
  
  return problems;
}

// Read the HTML template and inject problems
function generateHTML(problems, showAnswers = false) {
  const templatePath = path.join(__dirname, 'long-division-worksheet-v2.html');
  let html = fs.readFileSync(templatePath, 'utf8');
  
  // First, add the problems data and compute the long division steps
  const problemsWithSteps = problems.map(problem => {
    const steps = computeLongDivisionSteps(problem.dividend, problem.divisor);
    return { ...problem, steps };
  });
  
  // Replace the problems generation with our pre-generated problems
  const problemsJS = `
    let problems = ${JSON.stringify(problemsWithSteps)};
    let showingAnswers = ${showAnswers};
    
    // Copy the step computation function
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
  `;
  
  // Find and replace the JavaScript section
  html = html.replace(
    /let problems = \[\];[\s\S]*?window\.addEventListener\('load', generateProblems\);/,
    problemsJS + `
    
    function generateProblems() {
      // Problems are already generated, just render them
      renderProblems();
    }
    
    function renderProblems() {
      const grid = document.getElementById('problems-grid');
      if (grid && problems.length > 0) {
        grid.innerHTML = problems.map((problem, index) => 
          createProblemHTML(problem, index)
        ).join('');
      }
    }
    
    // Auto-start when DOM is ready
    if (document.readyState === 'loading') {
      window.addEventListener('load', generateProblems);
    } else {
      generateProblems();
    }
    `
  );
  
  // Remove the controls div for PDF generation
  html = html.replace(/<div class="controls">[\s\S]*?<\/div>/, '');
  
  return html;
}

// Helper function to compute long division steps (same as in HTML)
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

// Generate PDF from HTML
async function generatePDF(html, outputPath) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Write HTML to temp file for debugging
    const tempHtmlPath = path.join(__dirname, 'temp-worksheet.html');
    fs.writeFileSync(tempHtmlPath, html);
    console.log(chalk.gray(`📝 Debug: HTML written to ${tempHtmlPath}`));
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    // Execute the rendering JavaScript manually with error handling
    await page.evaluate(() => {
      try {
        if (typeof generateProblems === 'function') {
          generateProblems();
        }
        
        // Fallback: trigger rendering directly
        const grid = document.getElementById('problems-grid');
        if (grid && typeof renderProblems === 'function') {
          renderProblems();
        }
      } catch (e) {
        console.error('Client-side error:', e);
      }
    });
    
    // Wait for content with timeout
    try {
      await page.waitForSelector('.problems-grid', { timeout: 3000 });
      console.log(chalk.gray('✓ Problems grid found'));
      
      const problemCount = await page.evaluate(() => {
        const grid = document.querySelector('.problems-grid');
        return grid ? grid.querySelectorAll('.problem').length : 0;
      });
      
      console.log(chalk.gray(`✓ Found ${problemCount} problems`));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠ Timeout waiting for content, proceeding anyway...'));
    }
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '0.5in',
        bottom: '0.5in', 
        left: '0.5in',
        right: '0.5in'
      },
      printBackground: true
    });
    
    // Cleanup temp file
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
    
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// CLI command definitions
program
  .name('longdiv')
  .description('Generate long division worksheets as PDF files')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .description('Generate a worksheet PDF')
  .option('-c, --complexity <level>', 'complexity level (easy|medium|hard|custom)', 'medium')
  .option('-n, --count <number>', 'number of problems (1-20)', '9')
  .option('-o, --output <file>', 'output PDF filename', 'worksheet.pdf')
  .option('-a, --answers', 'include answer key')
  .option('--divisor-min <min>', 'minimum divisor (custom mode)', '10')
  .option('--divisor-max <max>', 'maximum divisor (custom mode)', '99')
  .option('--quotient-min <min>', 'minimum quotient (custom mode)', '100')
  .option('--quotient-max <max>', 'maximum quotient (custom mode)', '999')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔢 Generating long division worksheet...'));
      
      // Validate complexity level
      if (!COMPLEXITY_LEVELS[options.complexity]) {
        console.error(chalk.red('❌ Invalid complexity level. Use: easy, medium, hard, or custom'));
        process.exit(1);
      }
      
      // Validate problem count
      const count = parseInt(options.count);
      if (isNaN(count) || count < 1 || count > 20) {
        console.error(chalk.red('❌ Problem count must be between 1 and 20'));
        process.exit(1);
      }
      
      // Setup configuration
      let config = COMPLEXITY_LEVELS[options.complexity];
      
      if (options.complexity === 'custom') {
        config = {
          ...config,
          divisorRange: [
            parseInt(options.divisorMin) || 10,
            parseInt(options.divisorMax) || 99
          ],
          quotientRange: [
            parseInt(options.quotientMin) || 100,
            parseInt(options.quotientMax) || 999
          ]
        };
      }
      
      // Generate problems
      console.log(chalk.yellow(`📊 Complexity: ${config.name}`));
      console.log(chalk.yellow(`📝 Problems: ${count}`));
      console.log(chalk.yellow(`💾 Output: ${options.output}`));
      
      const problems = generateProblems(options.complexity, count);
      
      // Generate HTML
      const html = generateHTML(problems, options.answers);
      
      // Generate PDF
      await generatePDF(html, options.output);
      
      console.log(chalk.green('✅ Worksheet generated successfully!'));
      console.log(chalk.gray(`📄 Saved to: ${path.resolve(options.output)}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error generating worksheet:'), error.message);
      process.exit(1);
    }
  });

program
  .command('levels')
  .description('List available complexity levels')
  .action(() => {
    console.log(chalk.blue.bold('\n📚 Available Complexity Levels:\n'));
    
    Object.entries(COMPLEXITY_LEVELS).forEach(([key, config]) => {
      console.log(chalk.yellow.bold(`${key}:`));
      console.log(chalk.white(`  ${config.description}`));
      console.log(chalk.gray(`  Divisor range: ${config.divisorRange[0]}-${config.divisorRange[1]}`));
      console.log(chalk.gray(`  Quotient range: ${config.quotientRange[0]}-${config.quotientRange[1]}\n`));
    });
  });

program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(chalk.blue.bold('\n📖 Usage Examples:\n'));
    
    const examples = [
      {
        cmd: 'longdiv generate',
        desc: 'Generate a medium difficulty worksheet (default)'
      },
      {
        cmd: 'longdiv gen -c easy -n 6 -o easy-worksheet.pdf',
        desc: 'Generate 6 easy problems'
      },
      {
        cmd: 'longdiv gen -c hard -a -o answers.pdf',
        desc: 'Generate hard problems with answer key'
      },
      {
        cmd: 'longdiv gen -c custom --divisor-min 20 --divisor-max 40',
        desc: 'Custom difficulty with specific divisor range'
      }
    ];
    
    examples.forEach(example => {
      console.log(chalk.yellow.bold(`${example.cmd}`));
      console.log(chalk.gray(`  ${example.desc}\n`));
    });
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}