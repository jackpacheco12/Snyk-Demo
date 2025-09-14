const _ = require('lodash');

let follows = [];
let activities = [];
let nextFollowId = 1;
let nextActivityId = 1;

class Social {
  static follow(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existingFollow = _.find(follows, { followerId, followingId });
    if (existingFollow) {
      throw new Error('Already following this user');
    }

    const follow = {
      id: nextFollowId++,
      followerId,
      followingId,
      createdAt: new Date()
    };

    follows.push(follow);
    return follow;
  }

  static unfollow(followerId, followingId) {
    const followIndex = _.findIndex(follows, { followerId, followingId });
    if (followIndex === -1) {
      throw new Error('Not following this user');
    }

    follows.splice(followIndex, 1);
    return true;
  }

  static isFollowing(followerId, followingId) {
    return !!_.find(follows, { followerId, followingId });
  }

  static getFollowers(userId) {
    return _.filter(follows, { followingId: userId });
  }

  static getFollowing(userId) {
    return _.filter(follows, { followerId: userId });
  }

  static getFollowersCount(userId) {
    return this.getFollowers(userId).length;
  }

  static getFollowingCount(userId) {
    return this.getFollowing(userId).length;
  }

  static addActivity(userId, type, data) {
    const activity = {
      id: nextActivityId++,
      userId,
      type,
      data,
      createdAt: new Date()
    };

    activities.push(activity);

    if (activities.length > 1000) {
      activities = activities.slice(-1000);
    }

    return activity;
  }

  static getFollowingActivities(userId, limit = 20) {
    const following = this.getFollowing(userId).map(f => f.followingId);
    following.push(userId);

    const userActivities = _.filter(activities, activity =>
      following.includes(activity.userId)
    );

    return _.orderBy(userActivities, 'createdAt', 'desc').slice(0, limit);
  }

  static getUserActivities(userId, limit = 10) {
    const userActivities = _.filter(activities, { userId });
    return _.orderBy(userActivities, 'createdAt', 'desc').slice(0, limit);
  }

  static searchUsers(query, currentUserId, limit = 10) {
    const User = require('./User');
    const allUsers = User.getAllUsers ? User.getAllUsers() : [];

    if (!query) {
      return allUsers
        .filter(user => user.id !== currentUserId)
        .slice(0, limit)
        .map(user => ({
          ...user.toJSON(),
          isFollowing: this.isFollowing(currentUserId, user.id),
          followersCount: this.getFollowersCount(user.id)
        }));
    }

    const searchResults = allUsers.filter(user =>
      user.id !== currentUserId && (
        _.includes(_.toLower(user.name), _.toLower(query)) ||
        _.includes(_.toLower(user.email), _.toLower(query))
      )
    );

    return searchResults
      .slice(0, limit)
      .map(user => ({
        ...user.toJSON(),
        isFollowing: this.isFollowing(currentUserId, user.id),
        followersCount: this.getFollowersCount(user.id)
      }));
  }

  static getNetworkStats(userId) {
    return {
      followersCount: this.getFollowersCount(userId),
      followingCount: this.getFollowingCount(userId),
      activitiesCount: this.getUserActivities(userId).length
    };
  }
}

module.exports = Social;