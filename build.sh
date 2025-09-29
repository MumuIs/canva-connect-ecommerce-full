#!/bin/bash
set -e

echo "🔧 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️ Building frontend..."
npx webpack --config webpack.prod.config.js

echo "📄 Copying HTML file..."
cp public/index.html dist/

echo "✅ Build completed successfully!"
