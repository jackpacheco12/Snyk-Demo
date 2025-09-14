import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '16px 20px',
      marginBottom: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>📚 BookShelf</h1>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button
            onClick={() => onViewChange('books')}
            style={{
              backgroundColor: currentView === 'books' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            My Books
          </button>

          <button
            onClick={() => onViewChange('feed')}
            style={{
              backgroundColor: currentView === 'feed' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Activity Feed
          </button>

          <button
            onClick={() => onViewChange('discover')}
            style={{
              backgroundColor: currentView === 'discover' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Discover
          </button>

          <button
            onClick={() => onViewChange('profile')}
            style={{
              backgroundColor: currentView === 'profile' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Profile
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px' }}>
              Welcome, {user?.name || user?.email}
            </span>
            <button
              onClick={logout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;