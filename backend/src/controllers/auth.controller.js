const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: { message: 'Name, email, and password are required' } });
  }

  // Basic password validation
  if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return res.status(400).json({ error: { message: 'Password must be at least 8 characters long and contain both letters and numbers' } });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' } });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active, created_at',
      [name, email, passwordHash, 'student']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Email and password are required' } });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    // Exclude password_hash from response
    delete user.password_hash;

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const logout = (req, res) => {
  // Since we use stateless JWTs, the client discards the token.
  // We can just return a 200 OK.
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout,
};
