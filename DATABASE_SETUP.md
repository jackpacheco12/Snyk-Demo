# Database Setup Guide

This guide explains how to set up PostgreSQL for the bookshelf application.

## Prerequisites

1. Install PostgreSQL on your system:
   - **macOS**: `brew install postgresql`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

2. Start PostgreSQL service:
   - **macOS**: `brew services start postgresql`
   - **Ubuntu/Debian**: `sudo systemctl start postgresql`
   - **Windows**: Start via Services or pgAdmin

## Database Configuration

1. Create a database for the application:
```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create database
CREATE DATABASE bookshelf;

# Create user (optional, for production)
CREATE USER bookshelf_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bookshelf TO bookshelf_user;

# Exit psql
\q
```

2. Set environment variables (optional):
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=bookshelf
export DB_USER=postgres
export DB_PASSWORD=password
```

If not set, the application will use these defaults:
- Host: `localhost`
- Port: `5432`
- Database: `bookshelf`
- User: `postgres`
- Password: `password`

## Installation & Testing

1. Install dependencies:
```bash
cd bookshelf-mvp/backend
npm install
```

2. Test database connection:
```bash
node scripts/test-db.js
```

3. Start the server:
```bash
npm run dev
```

The server will automatically run migrations on startup.

## Database Schema

The application creates the following tables:

### users
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password` (VARCHAR)
- `name` (VARCHAR)
- `bio` (TEXT)
- `favorite_genre` (VARCHAR)
- `books_read` (INTEGER)
- `created_at` (TIMESTAMP)

### books
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR)
- `author` (VARCHAR)
- `rating` (INTEGER)
- `status` (VARCHAR: 'want-to-read', 'currently-reading', 'read')
- `user_id` (FOREIGN KEY to users.id)
- `added_at` (TIMESTAMP)

### follows
- `id` (SERIAL PRIMARY KEY)
- `follower_id` (FOREIGN KEY to users.id)
- `following_id` (FOREIGN KEY to users.id)
- `created_at` (TIMESTAMP)

### activities
- `id` (SERIAL PRIMARY KEY)
- `user_id` (FOREIGN KEY to users.id)
- `type` (VARCHAR)
- `data` (JSONB)
- `created_at` (TIMESTAMP)

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running: `ps aux | grep postgres`
- Check if the database exists: `psql -l`
- Verify connection with: `psql -h localhost -U postgres bookshelf`

### Permission Issues
- Make sure the user has appropriate permissions on the database
- For development, you can use the `postgres` superuser

### Migration Issues
- Check the `migrations/` folder for SQL files
- Ensure migration files are named correctly (001_initial_schema.sql)
- Manual migration: `psql bookshelf < migrations/001_initial_schema.sql`

## Production Notes

For production deployment:
1. Use environment variables for all database credentials
2. Create a dedicated database user with minimal required permissions
3. Enable SSL connections
4. Set up regular backups
5. Consider connection pooling for high-traffic applications