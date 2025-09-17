import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SocialStats = () => {
  const [stats, setStats] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      const [statsResponse, followersResponse, followingResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/social/stats`),
        axios.get(`${API_BASE}/api/social/followers`),
        axios.get(`${API_BASE}/api/social/following`)
      ]);

      setStats(statsResponse.data);
      setFollowers(followersResponse.data);
      setFollowing(followingResponse.data);
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.delete(`${API_BASE}/api/social/follow/${userId}`);
      setFollowing(following.filter(user => user.id !== userId));
      setStats(prev => ({ ...prev, followingCount: prev.followingCount - 1 }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        Loading social stats...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>Social Network</h3>

      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            backgroundColor: activeTab === 'stats' ? '#007bff' : 'transparent',
            color: activeTab === 'stats' ? 'white' : '#666',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('following')}
          style={{
            backgroundColor: activeTab === 'following' ? '#007bff' : 'transparent',
            color: activeTab === 'following' ? 'white' : '#666',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Following ({following.length})
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          style={{
            backgroundColor: activeTab === 'followers' ? '#007bff' : 'transparent',
            color: activeTab === 'followers' ? 'white' : '#666',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer'
          }}
        >
          Followers ({followers.length})
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#007bff' }}>{stats.followersCount}</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Followers</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#28a745' }}>{stats.followingCount}</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Following</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#ffc107' }}>{stats.activitiesCount}</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Activities</p>
            </div>
          </div>

          {stats.recentActivities && stats.recentActivities.length > 0 && (
            <div>
              <h4 style={{ color: '#555', marginBottom: '12px' }}>Recent Activity</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {stats.recentActivities.slice(0, 3).map(activity => (
                  <div
                    key={activity.id}
                    style={{
                      fontSize: '14px',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      color: '#666'
                    }}
                  >
                    {activity.type === 'book_added' && `Added "${activity.data.book.title}"`}
                    {activity.type === 'book_rated' && `Rated "${activity.data.book.title}" ${activity.data.rating} stars`}
                    {activity.type === 'follow' && `Followed ${activity.data.followedUser.name}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'following' && (
        <div>
          {following.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              You're not following anyone yet
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {following.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #eee',
                    borderRadius: '4px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {user.followersCount} followers • Followed {formatDate(user.followedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'followers' && (
        <div>
          {followers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No followers yet
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {followers.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #eee',
                    borderRadius: '4px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Started following {formatDate(user.followedAt)}
                      {user.isFollowing && ' • You follow back'}
                    </div>
                  </div>
                  {!user.isFollowing && (
                    <button
                      onClick={() => {}}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Follow Back
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialStats;