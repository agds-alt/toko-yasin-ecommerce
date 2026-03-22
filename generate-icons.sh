#!/bin/bash

# Script to generate icons with proper background (no white background)
# Background color: #1a2b4a (dark blue from theme)

LOGO_SOURCE="/DataPopOS/projects/ecommerce-manual/public/qahira-logo.png"
ICONS_DIR="/DataPopOS/projects/ecommerce-manual/public/icons"
BG_COLOR="#1a2b4a"

# Icon sizes needed
SIZES=(72 96 128 144 152 192 384 512)

echo "Generating icons with background color: $BG_COLOR"

for SIZE in "${SIZES[@]}"; do
    OUTPUT="$ICONS_DIR/icon-${SIZE}x${SIZE}.png"
    echo "Creating ${SIZE}x${SIZE} icon..."

    # Create icon with centered logo and background color
    convert "$LOGO_SOURCE" \
        -resize "${SIZE}x${SIZE}" \
        -gravity center \
        -background "$BG_COLOR" \
        -extent "${SIZE}x${SIZE}" \
        "$OUTPUT"

    echo "✓ Created: $OUTPUT"
done

# Generate apple-touch-icon (180x180)
echo "Creating Apple Touch Icon (180x180)..."
convert "$LOGO_SOURCE" \
    -resize "180x180" \
    -gravity center \
    -background "$BG_COLOR" \
    -extent "180x180" \
    "$ICONS_DIR/apple-touch-icon.png"
echo "✓ Created: $ICONS_DIR/apple-touch-icon.png"

# Generate favicon.ico (32x32 and 16x16 multi-resolution)
echo "Creating favicon.ico..."
convert "$LOGO_SOURCE" \
    -resize "32x32" \
    -gravity center \
    -background "$BG_COLOR" \
    -extent "32x32" \
    /tmp/favicon-32.png

convert "$LOGO_SOURCE" \
    -resize "16x16" \
    -gravity center \
    -background "$BG_COLOR" \
    -extent "16x16" \
    /tmp/favicon-16.png

convert /tmp/favicon-32.png /tmp/favicon-16.png \
    "/DataPopOS/projects/ecommerce-manual/public/favicon.ico"

rm /tmp/favicon-32.png /tmp/favicon-16.png
echo "✓ Created: favicon.ico"

echo ""
echo "✅ All icons generated successfully!"
echo "Icons now have background color: $BG_COLOR (no white background)"
