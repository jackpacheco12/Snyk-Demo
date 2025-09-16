import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const BookStatusCard = ({ book, onStatusChange, onRatingChange, onProgressUpdate, onDelete }) => {
  const [currentPageInput, setCurrentPageInput] = useState(book.current_page || 0);
  const [totalPagesInput, setTotalPagesInput] = useState(book.total_pages || 0);

  const progressPercentage = book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0;

  const handleProgressUpdate = () => {
    if (currentPageInput !== book.current_page || totalPagesInput !== book.total_pages) {
      onProgressUpdate(book.id, {
        current_page: parseInt(currentPageInput),
        total_pages: parseInt(totalPagesInput)
      });
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '16px'
    }}>
      {/* Cover image section */}
      {book.cover_image_url && (
        <div style={{ flexShrink: 0 }}>
          <img
            src={book.cover_image_url}
            alt={`Cover of ${book.title}`}
            style={{
              width: '60px',
              height: '90px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
            onError={(e) => {
              console.log('Failed to load cover image:', book.cover_image_url);
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Successfully loaded cover image:', book.cover_image_url);
            }}
          />
        </div>
      )}

      {/* Debug info for development */}
      {book.cover_image_url && (
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          Cover: {book.cover_image_url.substring(0, 50)}...
        </div>
      )}

      {/* Book details section */}
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{book.title}</h4>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
          by {book.author}
          {book.publication_year && (
            <span style={{ color: '#888', marginLeft: '8px' }}>
              ({book.publication_year})
            </span>
          )}
        </p>

      {/* Progress Bar for Currently Reading */}
      {book.status === 'currently-reading' && book.total_pages > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            <span>Progress: {book.current_page || 0} / {book.total_pages} pages</span>
            <span>{progressPercentage}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Progress Update Controls */}
      {(book.status === 'currently-reading' || book.status === 'read') && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="number"
              value={currentPageInput}
              onChange={(e) => setCurrentPageInput(e.target.value)}
              placeholder="Current page"
              min="0"
              max={totalPagesInput || 9999}
              style={{
                width: '80px',
                padding: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>of</span>
            <input
              type="number"
              value={totalPagesInput}
              onChange={(e) => setTotalPagesInput(e.target.value)}
              placeholder="Total pages"
              min="0"
              style={{
                width: '80px',
                padding: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <button
              onClick={handleProgressUpdate}
              style={{
                padding: '4px 8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Update
            </button>
          </div>
        </div>
      )}

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

        <button
          onClick={() => onDelete(book.id)}
          style={{
            padding: '4px 8px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Delete book"
        >
          🗑️ Delete
        </button>
      </div>
      </div>
    </div>
  );
};

const CategorySection = ({ title, books, icon, onStatusChange, onRatingChange, onProgressUpdate, onDelete }) => {
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
            onProgressUpdate={onProgressUpdate}
            onDelete={onDelete}
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

  const updateBookProgress = async (bookId, progressData) => {
    try {
      await axios.put(`${API_BASE}/api/books/${bookId}`, progressData);
      fetchCategorizedBooks();
    } catch (error) {
      console.error('Error updating book progress:', error);
    }
  };

  const deleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_BASE}/api/books/${bookId}`);
        fetchCategorizedBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
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
        onProgressUpdate={updateBookProgress}
        onDelete={deleteBook}
      />

      <CategorySection
        title="Currently Reading"
        icon="📖"
        books={categorizedBooks['currently-reading']}
        onStatusChange={updateBookStatus}
        onRatingChange={updateBookRating}
        onProgressUpdate={updateBookProgress}
        onDelete={deleteBook}
      />

      <CategorySection
        title="Read"
        icon="✅"
        books={categorizedBooks['read']}
        onStatusChange={updateBookStatus}
        onRatingChange={updateBookRating}
        onProgressUpdate={updateBookProgress}
        onDelete={deleteBook}
      />
    </div>
  );
};

export default CategorizedBookList;