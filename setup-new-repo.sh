#!/bin/bash

# Setup script for new GitHub repository
echo "🚀 Setting up new GitHub repository for Silo Monitoring System"

# Step 1: Create new repository on GitHub
echo "📝 Step 1: Create a new repository on GitHub"
echo "   1. Go to https://github.com/new"
echo "   2. Repository name: silo-monitoring-system"
echo "   3. Description: Industrial Silo Temperature Monitoring System"
echo "   4. Make it Public"
echo "   5. Don't initialize with README (we have existing code)"
echo "   6. Click 'Create repository'"
echo ""

# Step 2: Update package.json
echo "📦 Step 2: Update package.json homepage"
echo "   Current: https://basharagb.github.io/replica-view-studio"
echo "   New:     https://basharagb.github.io/silo-monitoring-system"
echo ""

# Step 3: Update vite.config.ts
echo "⚙️  Step 3: Update vite.config.ts base path"
echo "   Current: base: '/replica-view-studio/'"
echo "   New:     base: '/silo-monitoring-system/'"
echo ""

# Step 4: Commands to run
echo "💻 Step 4: Run these commands:"
echo "   git remote remove origin"
echo "   git remote add origin https://github.com/basharagb/silo-monitoring-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "   npm run deploy"
echo ""

echo "✅ After setup, your new live link will be:"
echo "   https://basharagb.github.io/silo-monitoring-system/"
echo ""

echo "🔗 Alternative: Use a different name like:"
echo "   - industrial-silo-monitor"
echo "   - silo-temperature-system"
echo "   - replica-silo-monitor"
echo ""

read -p "Press Enter to continue..."
