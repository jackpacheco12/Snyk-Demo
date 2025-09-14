const _ = require('lodash');
const bcrypt = require('bcryptjs');

let users = [];
let nextUserId = 1;

class User {
  constructor(userData) {
    this.id = nextUserId++;
    this.email = userData.email;
    this.password = userData.password;
    this.name = userData.name || '';
    this.bio = userData.bio || '';
    this.favoriteGenre = userData.favoriteGenre || '';
    this.booksRead = userData.booksRead || 0;
    this.createdAt = new Date();
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 8);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static findByEmail(email) {
    return _.find(users, { email });
  }

  static findById(id) {
    return _.find(users, { id: parseInt(id) });
  }

  static async create(userData) {
    const hashedPassword = await User.hashPassword(userData.password);
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    users.push(user);
    return user;
  }

  static updateById(id, updateData) {
    const userIndex = _.findIndex(users, { id: parseInt(id) });
    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updateData };
    return users[userIndex];
  }

  static getAllUsers() {
    return users;
  }

  static getUserCount() {
    return users.length;
  }

  toJSON() {
    const user = _.pick(this, ['id', 'email', 'name', 'bio', 'favoriteGenre', 'booksRead', 'createdAt']);
    return user;
  }
}

module.exports = User;