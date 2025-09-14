import React from 'react';
import _ from 'lodash';

const BookList = ({ books, onRatingChange, searchTerm }) => {
  const renderStars = (rating, bookId) => {
    return _.range(1, 6).map(star => (
      <span
        key={star}
        style={{
          cursor: 'pointer',
          fontSize: '20px',
          color: star <= rating ? '#ffd700' : '#ddd',
          marginRight: '2px'
        }}
        onClick={() => onRatingChange(bookId, star)}
      >
        ★
      </span>
    ));
  };

  if (books.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
        {searchTerm ? `No books found for "${searchTerm}"` : 'No books in your collection yet.'}
      </div>
    );
  }

  return (
    <div>
      <h2>Your Books ({books.length})</h2>
      {books.map(book => (
        <div
          key={book.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{book.title}</h3>
          <p style={{ margin: '0 0 8px 0', color: '#666' }}>by {book.author}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rating:</span>
            {renderStars(book.rating, book.id)}
            <span>({book.rating}/5)</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;