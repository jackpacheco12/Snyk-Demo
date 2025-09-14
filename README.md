# BookShelf Demo - Snyk Security Scanning

A simple book tracking web application built for demonstrating Snyk security scanning capabilities.

## Features

- **User Authentication**: Register and login with email/password
- **User Profiles**: Manage personal profile with bio, favorite genre, reading stats
- **Personal Book Collection**: Add books to your private collection
- **Book Rating**: Rate books (1-5 stars)
- **Search Functionality**: Search books by title or author
- **User-Specific Data**: Books are private to each user account
- **Profile Statistics**: Track reading progress and profile completion
- **Social Following**: Follow other readers to see their activity
- **User Discovery**: Search and discover other readers by name or email
- **Activity Feed**: See what friends are reading and rating
- **Social Stats**: View followers, following counts, and social activity
- **Real-time Activity Tracking**: Book additions and ratings generate social activity

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

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/stats` - Get user reading statistics

### Books (Authentication Required)
- `GET /api/books` - List user's books (supports ?search= query)
- `POST /api/books` - Add a new book to user's collection
- `PUT /api/books/:id` - Update book rating
- `DELETE /api/books/:id` - Delete a book from collection
- `GET /api/users/:userId/books` - View another user's books

### Social Features (Authentication Required)
- `POST /api/social/follow/:userId` - Follow a user
- `DELETE /api/social/follow/:userId` - Unfollow a user
- `GET /api/social/users/search` - Search for users (supports ?q= query)
- `GET /api/social/users/:userId` - Get user profile with social stats
- `GET /api/social/following` - Get list of users you follow
- `GET /api/social/followers` - Get list of your followers
- `GET /api/social/feed` - Get activity feed from followed users
- `GET /api/social/stats` - Get your social network statistics

### Public
- `GET /api/books/public` - List all books (no authentication)

## Sample API Usage

```bash
# Register a new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get user's books (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/books

# Add a book to user's collection
curl -X POST http://localhost:5001/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","rating":5}'

# Update user profile
curl -X PUT http://localhost:5001/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"I love reading","favoriteGenre":"Fantasy","booksRead":15}'

# Social Features
# Search for users
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5001/api/social/users/search?q=alice"

# Follow a user
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/social/follow/2

# Get activity feed
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/social/feed

# Get social stats
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/social/stats
```

## Snyk Security Scanning

This project is specifically designed for Snyk security demonstrations and includes:

### Vulnerable Dependencies
- **express@4.16.0** - Contains known vulnerabilities
- **lodash@4.17.4** - Contains prototype pollution vulnerabilities
- **axios@0.21.0** - Contains security issues
- **react@16.13.0** - Older version with potential issues
- **jsonwebtoken@8.5.1** - JWT library with potential vulnerabilities
- **bcryptjs@2.4.3** - Password hashing library
- **express-validator@6.6.0** - Input validation middleware

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