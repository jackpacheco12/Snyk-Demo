import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/social/feed?limit=30`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'book_added':
        return '📚';
      case 'book_rated':
        return '⭐';
      case 'follow':
        return '👥';
      default:
        return '📖';
    }
  };

  const getActivityMessage = (activity) => {
    const userName = activity.user?.name || 'Someone';

    switch (activity.type) {
      case 'book_added':
        return `${userName} added "${activity.data.book.title}" by ${activity.data.book.author}`;
      case 'book_rated':
        return `${userName} ${activity.data.action}`;
      case 'follow':
        return `${userName} started following ${activity.data.followedUser.name}`;
      default:
        return `${userName} had some activity`;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? '#ffd700' : '#ddd',
          fontSize: '14px'
        }}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        Loading activity feed...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Friends Activity</h2>

      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ margin: '0 0 8px 0' }}>No Activity Yet</h3>
          <p style={{ margin: 0 }}>
            Follow some readers to see what they're reading!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {activities.map(activity => (
            <div
              key={activity.id}
              style={{
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '24px', flexShrink: 0 }}>
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 8px 0', color: '#333', lineHeight: '1.4' }}>
                    {getActivityMessage(activity)}
                  </p>

                  {activity.type === 'book_rated' && activity.data.rating && (
                    <div style={{ marginBottom: '8px' }}>
                      {renderStars(activity.data.rating)}
                    </div>
                  )}

                  {activity.data.book && (
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                        {activity.data.book.title}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        by {activity.data.book.author}
                      </div>
                      {activity.data.book.rating > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          {renderStars(activity.data.book.rating)}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {moment(activity.createdAt).fromNow()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          onClick={fetchActivities}
          style={{
            backgroundColor: '#f8f9fa',
            color: '#333',
            border: '1px solid #ddd',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;