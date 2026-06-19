import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxLength: 30
  },
  profilePicture: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    default: '',
    maxLength: 150
  },
  followers: {
    type: [String],
    default: []
  },
  following: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true 
});

export default mongoose.model('User', userSchema);
