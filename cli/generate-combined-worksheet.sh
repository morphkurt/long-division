#!/bin/bash

# Long Division Worksheet Generator - Combined PDF Script
# Generates 5 medium difficulty worksheets (45 total problems) and combines into one PDF

echo "🔢 Long Division Worksheet Generator"
echo "=================================="

# Check if Chrome exists
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME" ]; then
    echo "❌ Google Chrome not found at expected location"
    echo "   Please install Google Chrome or update the path in this script"
    exit 1
fi

# Check if alternative-cli.js exists
if [ ! -f "alternative-cli.js" ]; then
    echo "❌ alternative-cli.js not found"
    echo "   Please ensure you're running this script from the correct directory"
    exit 1
fi

# Create temp directory for individual worksheets
TEMP_DIR="temp_worksheets"
mkdir -p "$TEMP_DIR"

echo "📝 Generating 5 medium difficulty worksheets..."

# Generate 5 worksheets with 9 problems each
for i in {1..5}; do
    echo "   Creating worksheet $i/5..."
    
    # Generate HTML worksheet
    node alternative-cli.js generate \
        --complexity medium \
        --count 9 \
        --output "$TEMP_DIR/worksheet_$i.html" \
        > /dev/null 2>&1
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate worksheet $i"
        exit 1
    fi
    
    # Convert HTML to PDF using Chrome headless
    echo "   Converting worksheet $i to PDF..."
    "$CHROME" \
        --headless \
        --disable-gpu \
        --no-sandbox \
        --print-to-pdf="$TEMP_DIR/worksheet_$i.pdf" \
        --print-to-pdf-no-header \
        "$TEMP_DIR/worksheet_$i.html" \
        > /dev/null 2>&1
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to convert worksheet $i to PDF"
        exit 1
    fi
    
    # Verify PDF was created
    if [ ! -f "$TEMP_DIR/worksheet_$i.pdf" ]; then
        echo "❌ PDF file not created for worksheet $i"
        exit 1
    fi
    
    echo "   ✅ Worksheet $i complete"
done

echo ""
echo "🔗 Combining PDFs into single file..."

# Check if we have a PDF merger available
if command -v pdfunite >/dev/null 2>&1; then
    # Use pdfunite (part of poppler-utils)
    pdfunite "$TEMP_DIR"/worksheet_*.pdf "combined_long_division_worksheet.pdf"
elif command -v "/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" >/dev/null 2>&1; then
    # Use macOS built-in PDF combiner
    "/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" \
        -o "combined_long_division_worksheet.pdf" \
        "$TEMP_DIR"/worksheet_*.pdf
elif command -v pdftk >/dev/null 2>&1; then
    # Use pdftk if available
    pdftk "$TEMP_DIR"/worksheet_*.pdf cat output "combined_long_division_worksheet.pdf"
else
    echo "⚠️  No PDF merger found. Individual PDFs created in $TEMP_DIR/"
    echo "   Available PDFs:"
    ls -la "$TEMP_DIR"/*.pdf
    echo ""
    echo "💡 To combine manually:"
    echo "   - Install pdfunite: brew install poppler"
    echo "   - Or use Preview.app to combine PDFs manually"
    exit 0
fi

if [ $? -eq 0 ] && [ -f "combined_long_division_worksheet.pdf" ]; then
    echo "✅ Combined PDF created successfully!"
    echo ""
    echo "📊 Summary:"
    echo "   📄 File: combined_long_division_worksheet.pdf"
    echo "   📝 Total problems: 45 (5 worksheets × 9 problems each)"
    echo "   🎯 Difficulty: Medium"
    echo "   📏 File size: $(ls -lh combined_long_division_worksheet.pdf | awk '{print $5}')"
    echo ""
    
    # Clean up temp files
    echo "🧹 Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    
    echo "🎉 Done! Your combined worksheet is ready for printing."
else
    echo "❌ Failed to combine PDFs"
    echo "   Individual PDFs are available in $TEMP_DIR/"
    exit 1
fi