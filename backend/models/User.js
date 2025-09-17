const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/database');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password = userData.password;
    this.name = userData.name || '';
    this.bio = userData.bio || '';
    this.favoriteGenre = userData.favorite_genre || userData.favoriteGenre || '';
    this.booksRead = userData.books_read || userData.booksRead || 0;
    this.createdAt = userData.created_at || userData.createdAt;
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 8);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(id)]);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = await User.hashPassword(userData.password);
      const result = await pool.query(
        'INSERT INTO users (email, password, name, bio, favorite_genre, books_read) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userData.email, hashedPassword, userData.name, userData.bio || '', userData.favoriteGenre || '', userData.booksRead || 0]
      );
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        const dbKey = key === 'favoriteGenre' ? 'favorite_genre' : (key === 'booksRead' ? 'books_read' : key);
        setClause.push(`${dbKey} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      });

      values.push(parseInt(id));
      const query = `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);

      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows.map(row => new User(row));
    } catch (error) {
      throw error;
    }
  }

  static async getUserCount() {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM users');
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    const user = _.pick(this, ['id', 'email', 'name', 'bio', 'favoriteGenre', 'booksRead', 'createdAt']);
    return user;
  }
}

module.exports = User;