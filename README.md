# Long Division Worksheet Generator

A comprehensive toolkit for generating 5-digit by 2-digit long division worksheets with proper mathematical formatting and step-by-step working areas.

## Features

- **Interactive Web Interface**: Generate worksheets directly in the browser
- **Command Line Tool**: Batch generate PDF worksheets with configurable difficulty
- **Proper Mathematical Layout**: Grid-aligned working areas with vinculum (division bracket)
- **Multiple Difficulty Levels**: Easy, medium, and hard complexity settings
- **Answer Key Support**: Toggle between student worksheets and answer keys
- **Print-Optimized**: Perfect formatting for A4 printing

## Repository Structure

```
long-div/
├── cli/                    # Command-line tools
│   ├── alternative-cli.js  # Main CLI application
│   ├── generate-worksheet.sh          # Single worksheet generator
│   ├── generate-combined-worksheet.sh # Batch worksheet generator
│   ├── static-generator.js # Static HTML generator
│   ├── test-static-pdf.js  # PDF testing utility
│   └── package.json        # CLI dependencies
├── web/                    # Web interface
│   ├── index.html          # Interactive worksheet generator
│   └── package.json        # Web component info
└── README.md              # This file
```

## Quick Start

### Web Interface

1. Open the web interface:
   ```bash
   cd web
   python3 -m http.server 8000
   open http://localhost:8000
   ```

2. Generate worksheets interactively in your browser
3. Print to PDF using browser's print function

### Command Line Interface

1. Install dependencies:
   ```bash
   cd cli
   npm install
   ```

2. Generate a single worksheet:
   ```bash
   ./generate-worksheet.sh medium 9 worksheet.pdf
   ```

3. Generate combined worksheets (45 problems):
   ```bash
   ./generate-combined-worksheet.sh
   ```

## CLI Usage

### Basic Commands

```bash
# Generate 9 medium difficulty problems
node alternative-cli.js generate --complexity medium --count 9 --output worksheet.html

# Generate with answer key
node alternative-cli.js generate --complexity hard --count 6 --output answers.html --answers

# Available complexity levels: easy, medium, hard
# Problem count: 1-12
```

### Bash Scripts

```bash
# Single worksheet
./generate-worksheet.sh [complexity] [count] [output] [answers]
./generate-worksheet.sh medium 9 worksheet.pdf
./generate-worksheet.sh easy 6 easy.pdf answers

# Combined worksheets (5 worksheets = 45 problems)
./generate-combined-worksheet.sh
```

## Difficulty Levels

| Level  | Divisor Range | Quotient Range | Example Problem |
|--------|---------------|----------------|-----------------|
| Easy   | 10-50         | 100-199        | 23,000 ÷ 23 = 1,000 |
| Medium | 10-99         | 100-999        | 18,768 ÷ 23 = 816 |
| Hard   | 50-99         | 500-999        | 56,088 ÷ 67 = 837 |

## Requirements

### CLI Requirements
- Node.js 14+
- Google Chrome (for PDF generation)
- Optional: `pdfunite` for combining PDFs (`brew install poppler`)

### Web Requirements
- Modern web browser
- Python 3 (for local server)

## Technical Features

- **Proper Algorithm**: Implements correct long division with bring-down logic
- **Grid Alignment**: Working numbers align precisely with dividend digits  
- **Pink Highlighting**: Student work areas clearly marked
- **Vinculum Styling**: Professional mathematical bracket formatting
- **Responsive Layout**: 3×3 grid layout optimized for A4 printing
- **Static Generation**: No JavaScript required in generated PDFs

## File Formats

- **HTML**: Interactive worksheets and static worksheets for PDF conversion
- **PDF**: Print-ready worksheets generated via Chrome headless
- **JSON**: Problem data structure for programmatic access

## Contributing

This is a self-contained educational tool. Feel free to modify the complexity settings, styling, or add new features as needed.

## License

MIT License - Free for educational use.