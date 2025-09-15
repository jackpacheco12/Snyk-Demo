#!/bin/bash

# Backend startup script for bookshelf app

echo "🚀 Starting Backend Server..."
echo ""

cd "$(dirname "$0")/backend"

# Set PostgreSQL path for macOS Homebrew installation
export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"

# Start the backend server on port 8000
PORT=8000 npm run dev