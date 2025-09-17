const { pool, runMigrations } = require('../db/database');
const User = require('../models/User');
const Social = require('../models/Social');

async function testDatabase() {
  console.log('Testing database connection and functionality...\n');

  try {
    // Test 1: Run migrations
    console.log('1. Running migrations...');
    await runMigrations();
    console.log('✅ Migrations completed successfully\n');

    // Test 2: Create a test user
    console.log('2. Creating test user...');

    // Clean up any existing test user first
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);

    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      bio: 'This is a test user',
      favoriteGenre: 'Science Fiction'
    });
    console.log('✅ Test user created:', testUser.toJSON());
    console.log();

    // Test 3: Find user by email
    console.log('3. Finding user by email...');
    const foundUser = await User.findByEmail('test@example.com');
    console.log('✅ User found:', foundUser.toJSON());
    console.log();

    // Test 4: Add some books
    console.log('4. Adding test books...');
    const bookQueries = [
      ['INSERT INTO books (title, author, rating, status, user_id) VALUES ($1, $2, $3, $4, $5)',
       ['The Hitchhiker\'s Guide to the Galaxy', 'Douglas Adams', 5, 'read', testUser.id]],
      ['INSERT INTO books (title, author, rating, status, user_id) VALUES ($1, $2, $3, $4, $5)',
       ['Dune', 'Frank Herbert', 4, 'currently-reading', testUser.id]],
      ['INSERT INTO books (title, author, rating, status, user_id) VALUES ($1, $2, $3, $4, $5)',
       ['Foundation', 'Isaac Asimov', 0, 'want-to-read', testUser.id]]
    ];

    for (const [query, params] of bookQueries) {
      await pool.query(query, params);
    }
    console.log('✅ Test books added');
    console.log();

    // Test 5: Query books
    console.log('5. Querying books...');
    const booksResult = await pool.query('SELECT * FROM books WHERE user_id = $1', [testUser.id]);
    console.log('✅ Books found:', booksResult.rows.length);
    console.log('Books:', booksResult.rows.map(b => `${b.title} by ${b.author} (${b.status})`));
    console.log();

    // Test 6: Add activity
    console.log('6. Testing social features...');
    await Social.addActivity(testUser.id, 'book_added', {
      book: { title: 'Test Book', author: 'Test Author' },
      action: 'added a new book'
    });
    console.log('✅ Activity added');

    const activities = await Social.getUserActivities(testUser.id, 5);
    console.log('Activities:', activities.length);
    console.log();

    // Test 7: Get user stats
    console.log('7. Getting user stats...');
    const userStats = await pool.query('SELECT COUNT(*) as book_count FROM books WHERE user_id = $1', [testUser.id]);
    console.log('✅ User has', userStats.rows[0].book_count, 'books');
    console.log();

    console.log('🎉 All database tests passed!\n');

    // Cleanup
    console.log('Cleaning up test data...');
    await pool.query('DELETE FROM activities WHERE user_id = $1', [testUser.id]);
    await pool.query('DELETE FROM books WHERE user_id = $1', [testUser.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    console.log('✅ Test data cleaned up\n');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();