import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const BookStatusCard = ({ book, onStatusChange, onRatingChange }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{book.title}</h4>
      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>by {book.author}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <select
          value={book.status}
          onChange={(e) => onStatusChange(book.id, e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="want-to-read">📚 Want to Read</option>
          <option value="currently-reading">📖 Currently Reading</option>
          <option value="read">✅ Read</option>
        </select>

        {book.status === 'read' && (
          <select
            value={book.rating}
            onChange={(e) => onRatingChange(book.id, parseInt(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value={0}>No rating</option>
            <option value={1}>1 Star</option>
            <option value={2}>2 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={5}>5 Stars</option>
          </select>
        )}
      </div>
    </div>
  );
};

const CategorySection = ({ title, books, icon, onStatusChange, onRatingChange }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        {title} ({books.length})
      </h3>

      {books.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>
          No books in this category yet
        </p>
      ) : (
        books.map(book => (
          <BookStatusCard
            key={book.id}
            book={book}
            onStatusChange={onStatusChange}
            onRatingChange={onRatingChange}
          />
        ))
      )}
    </div>
  );
};

const CategorizedBookList = () => {
  const [categorizedBooks, setCategorizedBooks] = useState({
    'want-to-read': [],
    'currently-reading': [],
    'read': []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorizedBooks();
  }, []);

  const fetchCategorizedBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/books/by-status`);
      setCategorizedBooks(response.data);
    } catch (error) {
      console.error('Error fetching categorized books:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookStatus = async (bookId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/books/${bookId}`, { status: newStatus });
      fetchCategorizedBooks();
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const updateBookRating = async (bookId, rating) => {
    try {
      await axios.put(`${API_BASE}/api/books/${bookId}`, { rating });
      fetchCategorizedBooks();
    } catch (error) {
      console.error('Error updating book rating:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        Loading your books...
      </div>
    );
  }

  return (
    <div>
      <CategorySection
        title="Want to Read"
        icon="📚"
        books={categorizedBooks['want-to-read']}
        onStatusChange={updateBookStatus}
        onRatingChange={updateBookRating}
      />

      <CategorySection
        title="Currently Reading"
        icon="📖"
        books={categorizedBooks['currently-reading']}
        onStatusChange={updateBookStatus}
        onRatingChange={updateBookRating}
      />

      <CategorySection
        title="Read"
        icon="✅"
        books={categorizedBooks['read']}
        onStatusChange={updateBookStatus}
        onRatingChange={updateBookRating}
      />
    </div>
  );
};

export default CategorizedBookList;