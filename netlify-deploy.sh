#!/bin/bash

echo "🚀 Deploying Replica View Studio to Netlify..."

# Check if we have the built assets
if [ ! -f "assets/index-DSs8-5hr.js" ]; then
    echo "❌ Built assets not found. Please ensure assets folder contains built files."
    exit 1
fi

echo "✅ Built assets found"

# Create dist directory
mkdir -p dist

# Copy main files
echo "📦 Copying files to dist..."
cp index.html dist/
cp -r assets dist/
cp -r public/* dist/ 2>/dev/null || true
cp _redirects dist/
cp netlify.toml dist/

echo "📋 Files in dist directory:"
ls -la dist/

echo ""
echo "🌐 Ready for Netlify deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://app.netlify.com/teams/basharagb/projects"
echo "2. Click 'Add new site' > 'Deploy manually'"
echo "3. Drag and drop the 'dist' folder"
echo "4. Or connect to your GitHub repo for automatic deployments"
echo ""
echo "✅ Deployment package ready in ./dist/"
