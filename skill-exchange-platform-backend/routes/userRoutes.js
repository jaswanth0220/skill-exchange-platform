const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile by ID
router.put('/:id', async (req, res) => {
  const updates = { ...req.body };

  // Remove password field from updates if it's being included
  if (updates.password) {
    return res.status(400).json({ message: 'Password cannot be updated via this route' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Send a notification to the user (e.g., when someone contacts them)
router.post('/:id/notify', async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notifications.push({ message });
    await user.save();
    
    res.json({ message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// userRoutes.js
router.post('/signup', async (req, res) => {
  const { name, email, location, bio, password, offeredSkills, desiredSkills } = req.body;

  try {
    // Validate offered skills format
    if (!Array.isArray(offeredSkills) || !offeredSkills.every(skill => 
      typeof skill === 'object' && 
      'id' in skill && 
      'name' in skill && 
      'description' in skill &&
      'offeredBy' in skill &&
      'location' in skill &&
      'level' in skill &&
      'availableTimes' in skill
    )) {
      return res.status(400).json({ 
        message: 'Invalid offered skills format' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      location,
      bio,
      password,
      offeredSkills,
      desiredSkills,
      notifications: []
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      user: user,
      token: token
    });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
});


// backend/routes/userRoutes.js - Add or update this route
// Get all users with their skills
// routes/userRoutes.js - Update get all users route

router.get('/', async (req, res) => {
  try {
    console.log('Getting all users...');
    
    const users = await User.find({}).select({
      password: 0 // Exclude password field
    });

    console.log(`Found ${users.length} users`);
    res.json(users);

  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
router.get('/:id/notifications', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'notifications.from',
        select: '_id name'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});
// backend/routes/userRoutes.js - Add or update notification route
router.post('/:id/contact', async (req, res) => {
  try {
    const { skillId, message, fromUser } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add notification with proper from field
    user.notifications.push({
      message: `${fromUser.name} wants to learn ${message}`,
      from: fromUser._id,
      read: false,
      createdAt: new Date()
    });

    await user.save();
    res.json({ message: 'Contact request sent successfully' });
  } catch (error) {
    console.error('Error sending contact:', error);
    res.status(500).json({ message: 'Failed to send contact request' });
  }
});

router.put('/:id/notifications/read', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark all notifications as read
    user.notifications = user.notifications.map(notification => ({
      ...notification.toObject(),
      read: true
    }));

    await user.save();
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
