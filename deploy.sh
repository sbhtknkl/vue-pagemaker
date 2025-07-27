#!/bin/bash

# Vue PageMaker Deployment Script
echo "🚀 Vue PageMaker Deployment Script"
echo "=================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Not a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial Vue PageMaker setup"
    echo "✅ Git repository initialized"
fi

echo ""
echo "Choose deployment option:"
echo "1) 🏆 Netlify/Vercel (Git push - triggers auto-deploy)"
echo "2) ⚡ Surge.sh (instant deploy)"
echo "3) 🔥 Firebase Hosting"
echo "4) 📁 GitHub Pages setup"
echo "5) 🌐 All services info"

read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo ""
    echo "📤 Pushing to Git repository..."
    git add .
    read -p "📝 Commit message (or press Enter for default): " message
    if [ -z "$message" ]; then
        message="Update Vue PageMaker - $(date '+%Y-%m-%d %H:%M')"
    fi
    git commit -m "$message"
    
    if git remote get-url origin > /dev/null 2>&1; then
        git push
        echo "✅ Code pushed to Git!"
        echo ""
        echo "🎉 If you have Netlify or Vercel connected, your site will deploy automatically!"
        echo "📝 To set up auto-deployment:"
        echo "   - Netlify: https://netlify.com (connect your Git repo)"
        echo "   - Vercel: https://vercel.com (import your Git repo)"
    else
        echo "⚠️  No remote repository configured."
        echo "📝 Set up your repository:"
        echo "   1. Create repo on GitHub"
        echo "   2. Run: git remote add origin https://github.com/USERNAME/REPO.git"
        echo "   3. Run: git push -u origin main"
    fi
    ;;
    
  2)
    echo ""
    echo "⚡ Deploying to Surge.sh..."
    
    # Check if surge is installed
    if ! command -v surge &> /dev/null; then
        echo "📦 Installing Surge.sh..."
        npm install -g surge
    fi
    
    # Generate a random subdomain if not specified
    if [ -z "$SURGE_DOMAIN" ]; then
        RANDOM_NAME=$(openssl rand -hex 4)
        SURGE_DOMAIN="vue-pagemaker-$RANDOM_NAME.surge.sh"
    fi
    
    surge . $SURGE_DOMAIN
    echo "✅ Deployed to Surge!"
    echo "🌐 Your site: https://$SURGE_DOMAIN"
    ;;
    
  3)
    echo ""
    echo "🔥 Deploying to Firebase..."
    
    # Check if firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        echo "📦 Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    # Check if firebase is initialized
    if [ ! -f "firebase.json" ]; then
        echo "🔧 Initializing Firebase..."
        firebase login
        firebase init hosting
    fi
    
    firebase deploy
    echo "✅ Deployed to Firebase!"
    ;;
    
  4)
    echo ""
    echo "📁 GitHub Pages Setup Instructions:"
    echo "=================================="
    echo "1. Push your code to GitHub (use option 1 first)"
    echo "2. Go to your repository on GitHub"
    echo "3. Click Settings → Pages"
    echo "4. Set Source to 'Deploy from branch'"
    echo "5. Select 'main' branch and '/ (root)' folder"
    echo "6. Click Save"
    echo ""
    echo "🌐 Your site will be available at:"
    echo "   https://USERNAME.github.io/REPOSITORY_NAME/"
    ;;
    
  5)
    echo ""
    echo "🌐 All Deployment Services:"
    echo "=========================="
    echo ""
    echo "🏆 NETLIFY (Recommended for beginners)"
    echo "   • Free tier: Excellent"
    echo "   • Auto-deploy: ✅ (from Git)"
    echo "   • Custom domain: ✅"
    echo "   • Setup: Connect Git repo at netlify.com"
    echo ""
    echo "🚀 VERCEL (Great for developers)"
    echo "   • Free tier: Excellent"
    echo "   • Auto-deploy: ✅ (from Git)"
    echo "   • Performance: Excellent"
    echo "   • Setup: Import Git repo at vercel.com"
    echo ""
    echo "⚡ SURGE.SH (Instant deployment)"
    echo "   • Free tier: Good"
    echo "   • Auto-deploy: ❌ (manual)"
    echo "   • Speed: Instant"
    echo "   • Setup: Run 'surge' command"
    echo ""
    echo "🔥 FIREBASE (Google ecosystem)"
    echo "   • Free tier: Good"
    echo "   • Auto-deploy: ❌ (manual)"
    echo "   • Analytics: ✅"
    echo "   • Setup: firebase init & deploy"
    echo ""
    echo "📁 GITHUB PAGES (Simple & free)"
    echo "   • Free tier: Basic"
    echo "   • Auto-deploy: ✅ (from Git)"
    echo "   • Custom domain: ✅"
    echo "   • Setup: Enable in repo settings"
    echo ""
    echo "💡 Recommendation: Start with Netlify for best experience!"
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment script completed!"
echo "📖 For more details, see DEPLOYMENT.md" 