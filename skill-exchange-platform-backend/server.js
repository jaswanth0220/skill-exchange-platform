const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const jwt = require('jsonwebtoken');
const ChatRoom = require('./models/Chat');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/skill-exchange', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  
  // Set up Socket.IO after MongoDB connection is established
  setupSocketIO();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

function setupSocketIO() {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.userId;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    socket.on('sendMessage', async (data, callback) => {
      try {
        const { roomId, content } = data;
        const chatRoom = await ChatRoom.findOne({
          _id: roomId,
          participants: socket.userId
        });

        if (!chatRoom) {
          throw new Error('Chat room not found');
        }

        const newMessage = {
          _id: new mongoose.Types.ObjectId(),
          sender: socket.userId,
          content,
          read: false,
          roomId,
          createdAt: new Date()
        };

        chatRoom.messages.push(newMessage);
        chatRoom.lastMessage = newMessage;
        await chatRoom.save();

        // Populate the sender information before emitting
        const populatedMessage = await ChatRoom.populate(newMessage, {
          path: 'sender',
          select: '_id name'
        });

        // Broadcast to all clients in the room
        socket.to(roomId).emit('newMessage', populatedMessage);
        // Also emit to sender
        socket.emit('newMessage', populatedMessage);
        
        callback(populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
