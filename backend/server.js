const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { auth } = require('./middleware/auth');
const Social = require('./models/Social');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let books = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", rating: 4, userId: 1, addedAt: new Date(), status: 'read' },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", rating: 5, userId: 1, addedAt: new Date(), status: 'read' },
  { id: 3, title: "1984", author: "George Orwell", rating: 5, userId: 1, addedAt: new Date(), status: 'read' }
];

let nextId = 4;

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/social', require('./routes/social'));

app.get('/api/books', auth, (req, res) => {
  const { search, status } = req.query;
  let result = _.filter(books, { userId: req.user.id });

  if (status) {
    result = _.filter(result, { status });
  }

  if (search) {
    result = _.filter(result, book =>
      _.includes(_.toLower(book.title), _.toLower(search)) ||
      _.includes(_.toLower(book.author), _.toLower(search))
    );
  }

  res.json(result);
});

app.get('/api/books/by-status', auth, (req, res) => {
  const userBooks = _.filter(books, { userId: req.user.id });

  const categorizedBooks = {
    'want-to-read': _.filter(userBooks, { status: 'want-to-read' }),
    'currently-reading': _.filter(userBooks, { status: 'currently-reading' }),
    'read': _.filter(userBooks, { status: 'read' })
  };

  res.json(categorizedBooks);
});

app.post('/api/books', auth, (req, res) => {
  const { title, author, rating, status } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  const validStatuses = ['want-to-read', 'currently-reading', 'read'];
  const bookStatus = validStatuses.includes(status) ? status : 'want-to-read';

  const newBook = {
    id: nextId++,
    title,
    author,
    rating: rating || 0,
    status: bookStatus,
    userId: req.user.id,
    addedAt: new Date()
  };

  books.push(newBook);

  Social.addActivity(req.user.id, 'book_added', {
    book: _.omit(newBook, 'userId'),
    action: 'added a new book'
  });

  res.status(201).json(newBook);
});

app.put('/api/books/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const { rating, status } = req.body;

  const book = _.find(books, { id, userId: req.user.id });

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const oldRating = book.rating;
  const oldStatus = book.status;

  if (rating !== undefined) {
    book.rating = rating;
  }

  if (status !== undefined) {
    const validStatuses = ['want-to-read', 'currently-reading', 'read'];
    if (validStatuses.includes(status)) {
      book.status = status;
    }
  }

  if (rating !== oldRating && rating >= 4) {
    Social.addActivity(req.user.id, 'book_rated', {
      book: _.omit(book, 'userId'),
      rating: rating,
      action: `rated "${book.title}" ${rating} stars`
    });
  }

  if (status !== oldStatus && status === 'read') {
    Social.addActivity(req.user.id, 'book_finished', {
      book: _.omit(book, 'userId'),
      action: `finished reading "${book.title}"`
    });
  } else if (status !== oldStatus && status === 'currently-reading') {
    Social.addActivity(req.user.id, 'book_started', {
      book: _.omit(book, 'userId'),
      action: `started reading "${book.title}"`
    });
  }

  res.json(book);
});

app.delete('/api/books/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = _.findIndex(books, { id, userId: req.user.id });

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books.splice(index, 1);
  res.status(204).send();
});

app.get('/api/books/public', (req, res) => {
  const { search } = req.query;
  let result = books;

  if (search) {
    result = _.filter(books, book =>
      _.includes(_.toLower(book.title), _.toLower(search)) ||
      _.includes(_.toLower(book.author), _.toLower(search))
    );
  }

  res.json(_.map(result, book => _.omit(book, 'userId')));
});

app.get('/api/users/:userId/books', auth, (req, res) => {
  const userId = parseInt(req.params.userId);
  const { search } = req.query;

  let result = _.filter(books, { userId });

  if (search) {
    result = _.filter(result, book =>
      _.includes(_.toLower(book.title), _.toLower(search)) ||
      _.includes(_.toLower(book.author), _.toLower(search))
    );
  }

  const publicBooks = _.map(result, book => _.omit(book, 'userId'));
  res.json(publicBooks);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});