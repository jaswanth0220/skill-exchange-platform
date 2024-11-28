// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const notificationSchema = new mongoose.Schema({
  message: String,
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  bio: { type: String, required: true, maxlength: 500 },
  profilePicture: { type: String, default: 'https://via.placeholder.com/150' },
  password: { type: String, required: true },
  offeredSkills: [{
    id: String,
    name: String,
    description: String,
    offeredBy: String,
    location: String,
    level: String,
    availableTimes: [String]
  }],
  desiredSkills: [String],
  notifications: [notificationSchema]
}, { timestamps: true });

// Hash the password before saving it to the database
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;