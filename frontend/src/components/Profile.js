import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import SocialStats from './SocialStats';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    favoriteGenre: user?.favoriteGenre || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        favoriteGenre: user.favoriteGenre || ''
      });
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/profile/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchStats();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              backgroundColor: isEditing ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#efe',
            color: '#363',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Tell us about yourself and your reading interests..."
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Favorite Genre
              </label>
              <select
                name="favoriteGenre"
                value={formData.favoriteGenre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              >
                <option value="">Select a genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Romance">Romance</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Other">Other</option>
              </select>
            </div>


            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ marginTop: 0, color: '#555' }}>Personal Information</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Member Since:</strong> {formatDate(user.createdAt)}</p>
                <p><strong>Bio:</strong> {user.bio || 'No bio provided'}</p>
              </div>

              <div>
                <h3 style={{ marginTop: 0, color: '#555' }}>Reading Stats</h3>
                <p><strong>Favorite Genre:</strong> {user.favoriteGenre || 'Not specified'}</p>
                {stats && (
                  <p><strong>Books Read:</strong> {stats.totalBooksRead}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Reading Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#007bff' }}>{stats.totalBooksRead}</h3>
              <p style={{ margin: 0 }}>Books Read</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#28a745' }}>{stats.favoriteGenre}</h3>
              <p style={{ margin: 0 }}>Favorite Genre</p>
            </div>
          </div>
        </div>
      )}

      <SocialStats />
    </div>
  );
};

export default Profile;