# BookShelf Demo - Snyk Security Scanning

A simple book tracking web application built for demonstrating Snyk security scanning capabilities.

## Features

- Add books to your collection
- Rate books (1-5 stars)
- Search books by title or author
- Simple, responsive interface

## Tech Stack

- **Frontend**: React 16.13.0 + JavaScript
- **Backend**: Node.js + Express 4.16.0
- **Database**: In-memory storage
- **Containerization**: Docker + Docker Compose

## Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd bookshelf-mvp
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5001

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

- `GET /api/books` - List all books (supports ?search= query)
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update book rating
- `DELETE /api/books/:id` - Delete a book

## Sample API Usage

```bash
# Get all books
curl http://localhost:5001/api/books

# Search books
curl "http://localhost:5001/api/books?search=gatsby"

# Add a book
curl -X POST http://localhost:5001/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","rating":5}'
```

## Snyk Security Scanning

This project is specifically designed for Snyk security demonstrations and includes:

### Vulnerable Dependencies
- **express@4.16.0** - Contains known vulnerabilities
- **lodash@4.17.4** - Contains prototype pollution vulnerabilities
- **axios@0.21.0** - Contains security issues
- **react@16.13.0** - Older version with potential issues

### Container Security Issues
- Uses **node:14** base image (older version)
- Basic Dockerfile without security hardening

### Running Snyk Scans

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Scan for vulnerabilities
snyk test

# Scan Docker images
snyk container test node:14

# Scan infrastructure as code
snyk iac test docker-compose.yml
```

## Project Structure

```
bookshelf-mvp/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── BookList.js
│   │   │   ├── BookForm.js
│   │   │   └── SearchBar.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Development Notes

- Books are stored in memory and will reset when the server restarts
- No authentication or authorization implemented
- CORS enabled for development
- Simple error handling

## Security Considerations

⚠️ **This application is intentionally vulnerable for demonstration purposes. Do not use in production!**

Known issues include:
- Vulnerable dependencies
- No input validation
- No authentication
- Prototype pollution risks
- Container security issues

Perfect for demonstrating Snyk's security scanning capabilities!