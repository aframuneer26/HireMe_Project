const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`📝 Registration attempt for: ${email}`);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    console.log(`✅ User registered: ${email}`);
    const { password: pwd, ...userData } = user._doc;
    res.status(201).json({ message: 'User registered successfully', user: userData });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ Login failed: User not found (${email})`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Login failed: Incorrect password (${email})`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Login successful: ${email}`);
    const { password: pwd, ...userData } = user._doc;
    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
