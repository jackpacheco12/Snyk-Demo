#!/bin/bash

# Frontend startup script for bookshelf app
# This script fixes the OpenSSL/Node.js compatibility issue

echo "🚀 Starting Frontend with OpenSSL Legacy Provider..."
echo ""
echo "This fixes the 'digital envelope routines::unsupported' error"
echo "that occurs with newer Node.js versions and older React apps."
echo ""

cd "$(dirname "$0")/frontend"

export NODE_OPTIONS=--openssl-legacy-provider
export REACT_APP_API_URL=http://localhost:8000

echo "Starting React development server..."
npm start