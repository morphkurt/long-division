#!/bin/bash

# Simple Long Division Worksheet Generator
# Usage: ./generate-worksheet.sh [complexity] [count] [output] [answers]
# Example: ./generate-worksheet.sh medium 9 worksheet.pdf
# Example: ./generate-worksheet.sh easy 6 easy.pdf answers

# Default values
COMPLEXITY="${1:-medium}"
COUNT="${2:-9}"
OUTPUT="${3:-worksheet.pdf}"
ANSWERS="${4:-}"

echo "🔢 Long Division Worksheet Generator"
echo "=================================="
echo "📊 Complexity: $COMPLEXITY"
echo "📝 Problems: $COUNT"
echo "📄 Output: $OUTPUT"
if [ "$ANSWERS" == "answers" ]; then
    echo "✅ Including answer key"
fi

# Check if Chrome exists
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME" ]; then
    echo "❌ Google Chrome not found at expected location"
    exit 1
fi

# Check if alternative-cli.js exists
if [ ! -f "alternative-cli.js" ]; then
    echo "❌ alternative-cli.js not found"
    exit 1
fi

echo ""
echo "📝 Generating worksheet..."

# Build the command
CMD="node alternative-cli.js generate --complexity $COMPLEXITY --count $COUNT --output temp_worksheet.html"
if [ "$ANSWERS" == "answers" ]; then
    CMD="$CMD --answers"
fi

# Generate HTML worksheet
eval $CMD > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate worksheet"
    exit 1
fi

echo "🖨️  Converting to PDF..."

# Convert HTML to PDF using Chrome headless
"$CHROME" \
    --headless \
    --disable-gpu \
    --no-sandbox \
    --print-to-pdf="$OUTPUT" \
    --print-to-pdf-no-header \
    "temp_worksheet.html" \
    > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to convert to PDF"
    exit 1
fi

# Clean up temp file
rm -f temp_worksheet.html

if [ -f "$OUTPUT" ]; then
    FILE_SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
    echo "✅ Worksheet created successfully!"
    echo "📄 File: $OUTPUT"
    echo "📏 Size: $FILE_SIZE"
    echo ""
    echo "🎉 Ready for printing!"
else
    echo "❌ PDF file not created"
    exit 1
fi