const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Social = require('../models/Social');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/follow/:userId', auth, (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    const userToFollow = User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const follow = Social.follow(followerId, followingId);

    Social.addActivity(followerId, 'follow', {
      followedUser: userToFollow.toJSON()
    });

    res.status(201).json({
      message: 'Successfully followed user',
      follow
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/follow/:userId', auth, (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    Social.unfollow(followerId, followingId);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/search', auth, [
  query('q').optional().isLength({ min: 1 }).withMessage('Search query too short'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q: query = '', limit = 10 } = req.query;
    const users = Social.searchUsers(query, req.user.id, parseInt(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error searching users' });
  }
});

router.get('/users/:userId', auth, (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const networkStats = Social.getNetworkStats(userId);
    const isFollowing = Social.isFollowing(req.user.id, userId);
    const followsYou = Social.isFollowing(userId, req.user.id);

    res.json({
      ...user.toJSON(),
      isFollowing,
      followsYou,
      ...networkStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

router.get('/following', auth, (req, res) => {
  try {
    const following = Social.getFollowing(req.user.id);
    const followingUsers = following.map(follow => {
      const user = User.findById(follow.followingId);
      return {
        ...user.toJSON(),
        followedAt: follow.createdAt,
        followersCount: Social.getFollowersCount(user.id)
      };
    });

    res.json(followingUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching following list' });
  }
});

router.get('/followers', auth, (req, res) => {
  try {
    const followers = Social.getFollowers(req.user.id);
    const followerUsers = followers.map(follow => {
      const user = User.findById(follow.followerId);
      return {
        ...user.toJSON(),
        followedAt: follow.createdAt,
        isFollowing: Social.isFollowing(req.user.id, user.id)
      };
    });

    res.json(followerUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching followers list' });
  }
});

router.get('/feed', auth, (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activities = Social.getFollowingActivities(req.user.id, parseInt(limit));

    const enrichedActivities = activities.map(activity => {
      const user = User.findById(activity.userId);
      return {
        ...activity,
        user: user.toJSON()
      };
    });

    res.json(enrichedActivities);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching activity feed' });
  }
});

router.get('/stats', auth, (req, res) => {
  try {
    const stats = Social.getNetworkStats(req.user.id);
    const recentActivities = Social.getUserActivities(req.user.id, 5);

    res.json({
      ...stats,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching social stats' });
  }
});

module.exports = router;