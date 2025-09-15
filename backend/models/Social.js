const _ = require('lodash');
const { pool } = require('../db/database');

class Social {
  static async follow(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      const existingFollow = await pool.query(
        'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      if (existingFollow.rows.length > 0) {
        throw new Error('Already following this user');
      }

      const result = await pool.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *',
        [followerId, followingId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async unfollow(followerId, followingId) {
    try {
      const result = await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING *',
        [followerId, followingId]
      );

      if (result.rows.length === 0) {
        throw new Error('Not following this user');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async isFollowing(followerId, followingId) {
    try {
      const result = await pool.query(
        'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getFollowers(userId) {
    try {
      const result = await pool.query('SELECT * FROM follows WHERE following_id = $1', [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getFollowing(userId) {
    try {
      const result = await pool.query('SELECT * FROM follows WHERE follower_id = $1', [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getFollowersCount(userId) {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  static async getFollowingCount(userId) {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  static async addActivity(userId, type, data) {
    try {
      const result = await pool.query(
        'INSERT INTO activities (user_id, type, data) VALUES ($1, $2, $3) RETURNING *',
        [userId, type, JSON.stringify(data)]
      );

      // Keep only latest 1000 activities per user to prevent unbounded growth
      await pool.query(
        'DELETE FROM activities WHERE user_id = $1 AND id NOT IN (SELECT id FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1000)',
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getFollowingActivities(userId, limit = 20) {
    try {
      const following = await this.getFollowing(userId);
      const followingIds = following.map(f => f.following_id);
      followingIds.push(userId);

      const result = await pool.query(
        'SELECT * FROM activities WHERE user_id = ANY($1) ORDER BY created_at DESC LIMIT $2',
        [followingIds, limit]
      );

      return result.rows.map(row => ({
        ...row,
        data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getUserActivities(userId, limit = 10) {
    try {
      const result = await pool.query(
        'SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
        [userId, limit]
      );

      return result.rows.map(row => ({
        ...row,
        data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      }));
    } catch (error) {
      throw error;
    }
  }

  static async searchUsers(query, currentUserId, limit = 10) {
    try {
      const User = require('./User');
      let allUsers;

      if (!query) {
        const userResult = await pool.query(
          'SELECT * FROM users WHERE id != $1 ORDER BY created_at DESC LIMIT $2',
          [currentUserId, limit]
        );
        allUsers = userResult.rows.map(row => new User(row));
      } else {
        const userResult = await pool.query(
          'SELECT * FROM users WHERE id != $1 AND (LOWER(name) LIKE LOWER($2) OR LOWER(email) LIKE LOWER($2)) ORDER BY created_at DESC LIMIT $3',
          [currentUserId, `%${query}%`, limit]
        );
        allUsers = userResult.rows.map(row => new User(row));
      }

      const results = [];
      for (const user of allUsers) {
        const isFollowing = await this.isFollowing(currentUserId, user.id);
        const followersCount = await this.getFollowersCount(user.id);
        results.push({
          ...user.toJSON(),
          isFollowing,
          followersCount
        });
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getNetworkStats(userId) {
    try {
      const followersCount = await this.getFollowersCount(userId);
      const followingCount = await this.getFollowingCount(userId);
      const activities = await this.getUserActivities(userId);

      return {
        followersCount,
        followingCount,
        activitiesCount: activities.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Social;