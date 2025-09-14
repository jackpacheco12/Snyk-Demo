import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import Header from './components/Header';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import SearchBar from './components/SearchBar';
import CategorizedBookList from './components/CategorizedBookList';
import Profile from './components/Profile';
import ActivityFeed from './components/ActivityFeed';
import UserSearch from './components/UserSearch';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function BookShelfApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('books');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated]);

  const fetchBooks = async (search = '') => {
    try {
      setLoading(true);
      const url = search ? `${API_BASE}/api/books?search=${search}` : `${API_BASE}/api/books`;
      const response = await axios.get(url);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      if (error.response?.status === 401) {
        console.log('Authentication required');
      }
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData) => {
    try {
      const response = await axios.post(`${API_BASE}/api/books`, bookData);
      setBooks([...books, response.data]);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const updateRating = async (id, rating) => {
    try {
      const response = await axios.put(`${API_BASE}/api/books/${id}`, { rating });
      setBooks(books.map(book =>
        book.id === id ? response.data : book
      ));
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const handleSearch = _.debounce((term) => {
    setSearchTerm(term);
    fetchBooks(term);
  }, 300);

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {currentView === 'profile' && <Profile />}
        {currentView === 'feed' && <ActivityFeed />}
        {currentView === 'discover' && <UserSearch />}
        {currentView === 'books' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>My Book Collection</h2>
              <p style={{ margin: 0, color: '#666' }}>
                Organize your reading journey - Created on {moment().format('MMMM Do YYYY')}
              </p>
            </div>

            <BookForm onSubmit={addBook} />
            <CategorizedBookList />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BookShelfApp />
    </AuthProvider>
  );
}

export default App;