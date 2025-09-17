const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Social = require('../models/Social');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const follow = await Social.follow(followerId, followingId);

    await Social.addActivity(followerId, 'follow', {
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

router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    await Social.unfollow(followerId, followingId);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/search', auth, [
  query('q').optional().isLength({ min: 1 }).withMessage('Search query too short'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q: query = '', limit = 10 } = req.query;
    const users = await Social.searchUsers(query, req.user.id, parseInt(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error searching users' });
  }
});

router.get('/users/:userId', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const networkStats = await Social.getNetworkStats(userId);
    const isFollowing = await Social.isFollowing(req.user.id, userId);
    const followsYou = await Social.isFollowing(userId, req.user.id);

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

router.get('/following', auth, async (req, res) => {
  try {
    const following = await Social.getFollowing(req.user.id);
    const followingUsers = [];

    for (const follow of following) {
      const user = await User.findById(follow.following_id);
      const followersCount = await Social.getFollowersCount(user.id);
      followingUsers.push({
        ...user.toJSON(),
        followedAt: follow.created_at,
        followersCount
      });
    }

    res.json(followingUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching following list' });
  }
});

router.get('/followers', auth, async (req, res) => {
  try {
    const followers = await Social.getFollowers(req.user.id);
    const followerUsers = [];

    for (const follow of followers) {
      const user = await User.findById(follow.follower_id);
      const isFollowing = await Social.isFollowing(req.user.id, user.id);
      followerUsers.push({
        ...user.toJSON(),
        followedAt: follow.created_at,
        isFollowing
      });
    }

    res.json(followerUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching followers list' });
  }
});

router.get('/feed', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activities = await Social.getFollowingActivities(req.user.id, parseInt(limit));

    const enrichedActivities = [];
    for (const activity of activities) {
      const user = await User.findById(activity.user_id);
      enrichedActivities.push({
        ...activity,
        user: user.toJSON()
      });
    }

    res.json(enrichedActivities);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching activity feed' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Social.getNetworkStats(req.user.id);
    const recentActivities = await Social.getUserActivities(req.user.id, 5);

    res.json({
      ...stats,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching social stats' });
  }
});

module.exports = router;