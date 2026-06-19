import express from 'express';
import generateItinerary  from "../controllers/generateItinerary.js";
import {createStory,getUserStories,getPublicStories,togglePublicStory,updateStory,deleteStory,uploadImages,getNearPlace,searchPlace,toggleLike,getComments,addComment} from "../controllers/StoryController.js";
import {getUserProfile, updateUserProfile, uploadProfilePicture} from "../controllers/UserController.js";
import { requireAuth,clerkClient } from '@clerk/express'; // ✅ Changed import
import { upload } from '../util/cloudinary.js'; // ✅ Fixed import
import multer from 'multer';

const uploadSingle = multer({ dest: 'uploads/' });

let router=express.Router();

router.post("/generate",generateItinerary)
router.post('/stories/upload', (req, res, next) => {
  upload.array('images', 12)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File size exceeds 15MB limit' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          message: 'Maximum 12 images allowed' 
        });
      }
      return res.status(400).json({ 
        message: err.message || 'File upload failed' 
      });
    }
    next();
  });
}, uploadImages);

router.post("/stories", createStory); // ✅ Call as function
router.get("/stories/user", getUserStories);

router.get("/stories/public", getPublicStories);

router.patch("/stories/:id/toggle-public", togglePublicStory);
router.put("/stories/:id", updateStory);
router.delete("/stories/:id", deleteStory);

router.get("/explore/nearby", getNearPlace);
router.get("/explore/search", searchPlace);

// Like and Comment routes
router.post("/stories/:id/like", toggleLike);
router.get("/stories/:id/comments", getComments);
router.post("/stories/:id/comments", addComment);

// User Profile routes
router.get("/user/profile", requireAuth(), getUserProfile);
router.put("/user/profile", requireAuth(), updateUserProfile);
router.post("/user/upload-profile-picture", requireAuth(), uploadSingle.single('image'), uploadProfilePicture);

// Upload route - with error handling for file size


router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const clerkUser = await clerkClient.users.getUser(userId);
    
    res.json({
      clerkUser: {
        fullName: clerkUser.fullName,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        imageUrl: clerkUser.imageUrl,
        profileImageUrl: clerkUser.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;