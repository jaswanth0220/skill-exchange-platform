const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/Chat');
const auth = require('../middleware/auth');

// Get all chat rooms for current user
router.get('/rooms', auth, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user._id
    })
    .populate('participants', '_id name profilePicture')
    .populate('lastMessage')
    .sort('-updatedAt');

    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Failed to fetch chat rooms' });
  }
});

// Get messages for a specific chat room
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findOne({
      _id: req.params.roomId,
      participants: req.user._id
    });

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Properly populate the messages with sender information
    const populatedRoom = await ChatRoom.populate(chatRoom, {
      path: 'messages.sender',
      select: '_id name'
    });

    res.json(populatedRoom.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Create a new chat room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if chat room already exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: [req.user._id, userId] }
    });

    if (existingRoom) {
      return res.json(existingRoom);
    }

    // Create new chat room
    const chatRoom = new ChatRoom({
      participants: [req.user._id, userId],
      messages: []
    });

    await chatRoom.save();
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Failed to create chat room' });
  }
});

// Send a message in a chat room
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chatRoom = await ChatRoom.findOne({
      _id: req.params.roomId,
      participants: req.user._id
    });

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const newMessage = {
      sender: req.user._id,
      content,
      read: false
    };

    chatRoom.messages.push(newMessage);
    chatRoom.lastMessage = newMessage;
    await chatRoom.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router; 