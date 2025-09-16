const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { pool } = require('../db/database');
const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json(req.user.toJSON());
});

router.put('/', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('favoriteGenre').optional().notEmpty().withMessage('Favorite genre cannot be empty'),
  body('booksRead').optional().isInt({ min: 0 }).withMessage('Books read must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio, favoriteGenre, booksRead } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (favoriteGenre !== undefined) updateData.favoriteGenre = favoriteGenre;
    if (booksRead !== undefined) updateData.booksRead = parseInt(booksRead);

    const updatedUser = await User.updateById(req.user.id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const user = req.user;

    // Get actual books read count from database
    const booksReadResult = await pool.query(
      'SELECT COUNT(*) as count FROM books WHERE user_id = $1 AND status = $2',
      [user.id, 'read']
    );
    const actualBooksRead = parseInt(booksReadResult.rows[0].count);

    const stats = {
      totalBooksRead: actualBooksRead,
      favoriteGenre: user.favoriteGenre || 'Not specified',
      memberSince: user.createdAt,
      profileCompletion: calculateProfileCompletion(user, actualBooksRead)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Failed to fetch profile stats' });
  }
});

function calculateProfileCompletion(user, actualBooksRead = 0) {
  let completion = 0;
  const fields = ['name', 'bio', 'favoriteGenre'];

  fields.forEach(field => {
    if (user[field] && user[field].trim() !== '') {
      completion += 25;
    }
  });

  if (actualBooksRead > 0) {
    completion += 25;
  }

  return Math.round(completion);
}

module.exports = router;