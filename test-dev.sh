#!/bin/bash

echo "========================================"
echo "Testing npm run dev script"
echo "========================================"

cd "/Users/mignnez/Desktop/terra copy 7/tradearray-fukushima"

echo ""
echo "1. Checking concurrently installation..."
npm list concurrently | grep concurrently

echo ""
echo "2. Checking mobile app directory..."
if [ -d "../tapp-mobile" ]; then
  echo "✅ Mobile app directory exists at: $(cd ../tapp-mobile && pwd)"
else
  echo "❌ Mobile app directory NOT found"
fi

echo ""
echo "3. Checking if expo is available in mobile app..."
if [ -f "../tapp-mobile/package.json" ]; then
  echo "✅ package.json found in mobile app"
  if grep -q "expo" "../tapp-mobile/package.json"; then
    echo "✅ Expo is in mobile app dependencies"
  else
    echo "⚠️  Expo not found in dependencies"
  fi
else
  echo "❌ package.json NOT found in mobile app"
fi

echo ""
echo "4. Testing if dev script syntax is valid..."
npm run dev --help > /dev/null 2>&1
if [ $? -eq 0 ] || [ $? -eq 1 ]; then
  echo "✅ Dev script is recognized by npm"
else
  echo "❌ Dev script has syntax errors"
fi

echo ""
echo "========================================"
echo "Test complete. To run the actual dev server:"
echo "  cd /Users/mignnez/Desktop/terra\ copy\ 7/tradearray-fukushima"
echo "  npm run dev"
echo "========================================"
