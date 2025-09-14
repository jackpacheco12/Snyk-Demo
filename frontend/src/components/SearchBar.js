import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div style={{
      marginBottom: '24px',
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Search Books
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search by title or author..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            style={{
              padding: '10px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>
      {searchTerm && (
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          Searching for: "{searchTerm}"
        </p>
      )}
    </div>
  );
};

export default SearchBar;