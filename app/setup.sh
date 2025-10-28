#!/bin/bash

# Double App Setup Script
echo "🚀 Setting up Double App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! You can now start the app with:"
    echo "   npx expo start"
    echo ""
    echo "📱 Demo login credentials:"
    echo "   Email: demo@doubledate.com"
    echo "   Password: demo123"
    echo ""
    echo "   Or use developer account:"
    echo "   Email: testing@gmail.com"
    echo "   Password: test123"
else
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi
