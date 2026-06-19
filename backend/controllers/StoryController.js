import Story from "../util/db.js";
import User from "../models/User.model.js";
import { getNearbyPlaces } from "../util/placeService.js";

export const createStory = async (req, res) => {
  try {
    const {  title, destination, story, content, images=[], isPublic } =
      req.body;

    if (!title || !destination) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Use dummy userId for development if not authenticated
    const userId = req.auth()?.userId || "dev-user-123";
    
    const newStory = new Story({
      userId,
      title,
      destination,
      content,
      images,
      isPublic: Boolean(isPublic),
    });

    await newStory.save();
    res
      .status(201)
      .json({ message: "Story created successfully", story: newStory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getUserStories = async (req, res) => {
  try {
    // Use dummy userId for development if not authenticated
    const userId = req.auth()?.userId || "dev-user-123";
    
    console.log("📋 Fetching stories for userId:", userId);
    
    const stories = await Story.find({ userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .lean();
    
    console.log(`✅ Found ${stories.length} stories for user ${userId}`);
    
    res.status(200).json({ 
      success: true,
      stories: stories || []
     });
  } catch (error) {
    console.error("❌ Error in getUserStories:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getPublicStories = async (req, res) => {
  try {
       const stories = await Story.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture') 
      .lean()

    res.status(200).json({
      success: true,
      stories: stories || [] 
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const togglePublicStory = async (req, res) => {
    try {
        const {id}=req.params;
        const userId = req.auth()?.userId || "dev-user-123";
        
        const story = await Story.findOne({_id:id,userId});
        if(!story){
            return res.status(404).json({message:"Story not found"});
        }
        
        // Toggle the isPublic field
        story.isPublic = !story.isPublic;
        await story.save();
        
        res.status(200).json({
            message: `Story is now ${story.isPublic ? 'public' : 'private'}`,
            story
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateStory = async (req, res) => {
    try {
        const {id}=req.params;
        const userId = req.auth()?.userId || "dev-user-123";

     const story = await Story.findOneAndUpdate(
      { _id: id, userId }, // Only owner
      req.body,
      { new: true }
    );

        if(!story){
            return res.status(404).json({message:"Story not found"});
        }
        res.status(200).json({message:"Story updated successfully",story});
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const deleteStory = async (req, res) => {
    try {
        const {id}=req.params;
        const userId = req.auth()?.userId || "dev-user-123";
        
        const story = await Story.findOneAndDelete({_id:id,userId});
        if(!story){
            return res.status(404).json({message:"Story not found"});
        }
        res.status(200).json({message:"Story deleted successfully"});
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const uploadImages = async (req, res) => {
  try {
    console.log("📸 Upload request received");
    console.log("Files:", req.files);
    console.log("Auth:", req.auth);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Check file sizes (15MB max per file)
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    const oversizedFiles = req.files.filter(file => file.size > MAX_SIZE);
    
    if (oversizedFiles.length > 0) {
      return res.status(400).json({ 
        message: `Files exceed 15MB limit: ${oversizedFiles.map(f => f.originalname).join(", ")}` 
      });
    }

    // Cloudinary multer attaches uploaded file info on req.files
    const imageUrls = req.files.map((file) => file.path);

    console.log("✅ Upload successful:", imageUrls);

    return res.status(200).json({
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    
    // Handle multer file size error
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: "File size exceeds 15MB limit" 
      });
    }
    
    return res
      .status(500)
      .json({ message: "Failed to upload images", error: error.message });
  }
};

export const getNearPlace = async (req, res) => {
  const { lat, lng, limit } = req.query;
  
  console.log("📍 getNearPlace called with:", { lat, lng, limit });
  
  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng required" });
  }

  try {
    const places = await getNearbyPlaces(
      parseFloat(lat),
      parseFloat(lng),
      limit ? parseInt(limit) : 8
    );
    
    console.log(`✅ Returning ${places.length} places`);
    res.json({ places });
  } catch (err) {
    console.error("❌ Error in getNearPlace:", err);
    res.status(500).json({ error: "server error", details: err.message });
  }
};

export const searchPlace = async (req, res) => {
  const { query } = req.query;
  
  console.log("🔍 searchPlace called with:", query);
  
  if (!query) {
    return res.status(400).json({ error: "query parameter required" });
  }

  try {
    const prompt = `Tell me about "${query}" as a travel destination. 

Please provide information in this exact format (use emojis and clean formatting):

📍 Overview
Write 2-3 sentences introducing the place

🌤️ Best Time to Visit
Explain when to visit and why (1-2 sentences)

✨ Main Attractions
List 3-5 top attractions (one per line, brief)

🎯 Interesting Facts
Share 2-3 unique or surprising facts

Keep it concise, informative, and engaging. Use simple formatting without markdown symbols like *, #, or code blocks.`;

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V3-0324",
          messages: [
            {
              role: "system",
              content: "You are a professional travel guide. Provide clear, well-structured information without using markdown formatting symbols. Use emojis for section headers."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from AI");
    }
    
    let aiDescription = data.choices[0].message.content.trim();
    
    // Clean up the response - remove markdown artifacts and extra formatting
    aiDescription = aiDescription
      .replace(/```json\n?/g, "")           // Remove ```json
      .replace(/```\n?/g, "")                // Remove ```
      .replace(/\*\*\*/g, "")                // Remove ***
      .replace(/\*\*/g, "")                  // Remove **
      .replace(/\*/g, "")                    // Remove *
      .replace(/---+/g, "")                  // Remove ---
      .replace(/===+/g, "")                  // Remove ===
      .replace(/\/\/\/+/g, "")               // Remove ///
      .replace(/\/\//g, "")                  // Remove //
      .replace(/####/g, "")                  // Remove ####
      .replace(/###/g, "")                   // Remove ###
      .replace(/##/g, "")                    // Remove ##
      .replace(/#/g, "")                     // Remove #
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove markdown links [text](url) -> text
      .replace(/^\s*[\r\n]/gm, "\n")         // Remove extra blank lines
      .replace(/\n{3,}/g, "\n\n")            // Max 2 newlines
      .replace(/\t/g, "  ")                  // Replace tabs with spaces
      .trim();
    
    console.log(`✅ AI search result for "${query}"`);
    res.json({ 
      success: true,
      query,
      description: aiDescription 
    });
  } catch (err) {
    console.error("❌ Error in searchPlace:", err);
    res.status(500).json({ 
      error: "Failed to search place", 
      details: err.message 
    });
  }
};

// Like/Unlike a story
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth()?.userId || "dev-user-123";

    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const likeIndex = story.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike
      story.likes.splice(likeIndex, 1);
    } else {
      // Like
      story.likes.push(userId);
    }

    await story.save();

    res.status(200).json({ 
      message: "Like toggled successfully",
      likes: story.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error("❌ Error in toggleLike:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get comments for a story
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findById(id)
      .select('comments')
      .lean();

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // If no comments, return empty array
    if (!story.comments || story.comments.length === 0) {
      return res.status(200).json({
        success: true,
        comments: []
      });
    }

    // Populate user info for each comment
    const commentsWithUsers = await Promise.all(
      story.comments.map(async (comment) => {
        try {
          const user = await User.findOne({ clerkId: comment.userId })
            .select('username profilePicture')
            .lean();
          return {
            ...comment,
            user: user || { username: 'Anonymous', profilePicture: '' }
          };
        } catch (err) {
          console.error("Error fetching user for comment:", err);
          return {
            ...comment,
            user: { username: 'Anonymous', profilePicture: '' }
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      comments: commentsWithUsers
    });
  } catch (error) {
    console.error("❌ Error in getComments:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message,
      comments: [] // Return empty array on error
    });
  }
};

// Add a comment to a story
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.auth()?.userId || "dev-user-123";

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const newComment = {
      userId,
      content: content.trim(),
      likes: 0
    };

    story.comments.push(newComment);
    await story.save();

    // Get user info for the response
    const user = await User.findOne({ clerkId: userId })
      .select('username profilePicture')
      .lean();

    const commentWithUser = {
      ...newComment,
      _id: story.comments[story.comments.length - 1]._id,
      createdAt: story.comments[story.comments.length - 1].createdAt,
      user: user || { username: 'Anonymous', profilePicture: '' }
    };

    res.status(201).json({
      message: "Comment added successfully",
      comment: commentWithUser
    });
  } catch (error) {
    console.error("❌ Error in addComment:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
