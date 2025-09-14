import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const searchUsers = async (query = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/social/users/search?q=${query}&limit=20`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = _.debounce(searchUsers, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    searchUsers('');
  }, []);

  const handleFollow = async (userId) => {
    try {
      await axios.post(`${API_BASE}/api/social/follow/${userId}`);
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 }
          : user
      ));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.delete(`${API_BASE}/api/social/follow/${userId}`);
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, isFollowing: false, followersCount: Math.max(0, user.followersCount - 1) }
          : user
      ));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Discover Readers</h2>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Searching...
        </div>
      ) : (
        <div>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              {searchTerm ? `No users found for "${searchTerm}"` : 'No users to discover yet'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {users.map(user => (
                <div
                  key={user.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', color: '#333' }}>{user.name}</h3>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                      {user.email}
                    </p>
                    {user.bio && (
                      <p style={{ margin: '0 0 8px 0', color: '#555', fontSize: '14px' }}>
                        {user.bio}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                      <span>{user.followersCount} followers</span>
                      <span>Joined {formatDate(user.createdAt)}</span>
                      {user.favoriteGenre && (
                        <span>Loves {user.favoriteGenre}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginLeft: '16px' }}>
                    {user.isFollowing ? (
                      <button
                        onClick={() => handleUnfollow(user.id)}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(user.id)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;