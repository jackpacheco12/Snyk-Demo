import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthWrapper = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '40px',
        minWidth: '500px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', margin: '0 0 8px 0' }}>📚 BookShelf</h1>
          <p style={{ color: '#666', margin: 0 }}>
            Your personal library management system
          </p>
        </div>

        {isLoginMode ? (
          <Login onToggleMode={toggleMode} />
        ) : (
          <Register onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};

export default AuthWrapper;