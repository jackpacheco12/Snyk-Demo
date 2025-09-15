const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { auth } = require('./middleware/auth');
const Social = require('./models/Social');
const { pool, runMigrations } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Initialize database
const initializeDatabase = async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/social', require('./routes/social'));

app.get('/api/books', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM books WHERE user_id = $1';
    let params = [req.user.id];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (LOWER(title) LIKE LOWER($${paramCount}) OR LOWER(author) LIKE LOWER($${paramCount + 1}))`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY added_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/api/books/by-status', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE user_id = $1 ORDER BY added_at DESC', [req.user.id]);
    const userBooks = result.rows;

    const categorizedBooks = {
      'want-to-read': userBooks.filter(book => book.status === 'want-to-read'),
      'currently-reading': userBooks.filter(book => book.status === 'currently-reading'),
      'read': userBooks.filter(book => book.status === 'read')
    };

    res.json(categorizedBooks);
  } catch (error) {
    console.error('Error fetching books by status:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.post('/api/books', auth, async (req, res) => {
  try {
    const { title, author, rating, status } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const validStatuses = ['want-to-read', 'currently-reading', 'read'];
    const bookStatus = validStatuses.includes(status) ? status : 'want-to-read';

    const result = await pool.query(
      'INSERT INTO books (title, author, rating, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, author, rating || 0, bookStatus, req.user.id]
    );

    const newBook = result.rows[0];

    await Social.addActivity(req.user.id, 'book_added', {
      book: _.omit(newBook, 'user_id'),
      action: 'added a new book'
    });

    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

app.put('/api/books/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rating, status } = req.body;

    // First, get the current book data
    const currentResult = await pool.query('SELECT * FROM books WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const currentBook = currentResult.rows[0];
    const oldRating = currentBook.rating;
    const oldStatus = currentBook.status;

    // Build update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (rating !== undefined) {
      updates.push(`rating = $${paramCount}`);
      params.push(rating);
      paramCount++;
    }

    if (status !== undefined) {
      const validStatuses = ['want-to-read', 'currently-reading', 'read'];
      if (validStatuses.includes(status)) {
        updates.push(`status = $${paramCount}`);
        params.push(status);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.json(currentBook);
    }

    params.push(id, req.user.id);
    const updateQuery = `UPDATE books SET ${updates.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;

    const result = await pool.query(updateQuery, params);
    const updatedBook = result.rows[0];

    // Add activities for significant changes
    if (rating !== oldRating && rating >= 4) {
      await Social.addActivity(req.user.id, 'book_rated', {
        book: _.omit(updatedBook, 'user_id'),
        rating: rating,
        action: `rated "${updatedBook.title}" ${rating} stars`
      });
    }

    if (status !== oldStatus && status === 'read') {
      await Social.addActivity(req.user.id, 'book_finished', {
        book: _.omit(updatedBook, 'user_id'),
        action: `finished reading "${updatedBook.title}"`
      });
    } else if (status !== oldStatus && status === 'currently-reading') {
      await Social.addActivity(req.user.id, 'book_started', {
        book: _.omit(updatedBook, 'user_id'),
        action: `started reading "${updatedBook.title}"`
      });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

app.delete('/api/books/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.get('/api/books/public', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM books';
    let params = [];

    if (search) {
      query += ' WHERE LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($2)';
      params = [`%${search}%`, `%${search}%`];
    }

    query += ' ORDER BY added_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows.map(book => _.omit(book, 'user_id')));
  } catch (error) {
    console.error('Error fetching public books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/api/users/:userId/books', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { search } = req.query;

    let query = 'SELECT * FROM books WHERE user_id = $1';
    let params = [userId];

    if (search) {
      query += ' AND (LOWER(title) LIKE LOWER($2) OR LOWER(author) LIKE LOWER($3))';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY added_at DESC';

    const result = await pool.query(query, params);
    const publicBooks = result.rows.map(book => _.omit(book, 'user_id'));
    res.json(publicBooks);
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).json({ error: 'Failed to fetch user books' });
  }
});

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);