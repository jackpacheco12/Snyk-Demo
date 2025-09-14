const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json(req.user.toJSON());
});

router.put('/', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('favoriteGenre').optional().notEmpty().withMessage('Favorite genre cannot be empty'),
  body('booksRead').optional().isInt({ min: 0 }).withMessage('Books read must be a positive number')
], (req, res) => {
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

    const updatedUser = User.updateById(req.user.id, updateData);

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

router.get('/stats', auth, (req, res) => {
  const user = req.user;

  const stats = {
    totalBooksRead: user.booksRead || 0,
    favoriteGenre: user.favoriteGenre || 'Not specified',
    memberSince: user.createdAt,
    profileCompletion: calculateProfileCompletion(user)
  };

  res.json(stats);
});

function calculateProfileCompletion(user) {
  let completion = 0;
  const fields = ['name', 'bio', 'favoriteGenre'];

  fields.forEach(field => {
    if (user[field] && user[field].trim() !== '') {
      completion += 33.33;
    }
  });

  if (user.booksRead > 0) {
    completion += 33.34;
  }

  return Math.round(completion);
}

module.exports = router;