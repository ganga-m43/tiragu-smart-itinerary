import User from '../models/User.model.js';
import { v2 as cloudinary } from 'cloudinary';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const clerkId = req.auth?.userId;
    
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create a default user if not exists
      user = new User({
        clerkId,
        username: 'User_' + clerkId.slice(-6),
        profilePicture: ''
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const clerkId = req.auth?.userId;
    const { username, profilePicture, bio } = req.body;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({
        clerkId,
        username,
        profilePicture,
        bio
      });
    } else {
      if (username) user.username = username;
      if (profilePicture !== undefined) user.profilePicture = profilePicture;
      if (bio !== undefined) user.bio = bio;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload profile picture to Cloudinary
export const uploadProfilePicture = async (req, res) => {
  try {
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user_profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: error.message });
  }
};
