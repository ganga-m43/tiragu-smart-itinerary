import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Camera, Loader2, User, Grid, Heart, MessageCircle, Settings, Plus, X } from "lucide-react";
import axios from "axios";
import PostModal from "../components/PostModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const Profile = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit modal states
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editProfilePicture, setEditProfilePicture] = useState("");

  useEffect(() => {
    fetchUserProfile();
    fetchUserStories();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("http://localhost:3000/api/itinerary/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(response.data.username || user?.username || "");
      setBio(response.data.bio || "");
      setProfilePicture(response.data.profilePicture || user?.imageUrl || "");
      setImagePreview(response.data.profilePicture || user?.imageUrl || "");
      setFollowersCount(response.data.followers?.length || 0);
      setFollowingCount(response.data.following?.length || 0);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUsername(user?.username || "");
      setBio("");
      setProfilePicture(user?.imageUrl || "");
      setImagePreview(user?.imageUrl || "");
      setFollowersCount(0);
      setFollowingCount(0);
    }
  };

  const fetchUserStories = async () => {
    try {
      setLoadingStories(true);
      const response = await axios.get("http://localhost:3000/api/itinerary/stories/user");
      setStories(response.data?.stories || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = await getToken();
      const response = await axios.post(
        "http://localhost:3000/api/itinerary/user/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditProfilePicture(response.data.url);
      setMessage({ type: "success", text: "Image uploaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ type: "error", text: "Failed to upload image" });
      setEditImagePreview(editProfilePicture);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      setMessage({ type: "error", text: "Username is required" });
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      await axios.put("http://localhost:3000/api/itinerary/user/profile", {
        username: editUsername.trim(),
        bio: editBio.trim(),
        profilePicture: editProfilePicture,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      
      // Update main state
      setUsername(editUsername);
      setBio(editBio);
      setProfilePicture(editProfilePicture);
      setImagePreview(editImagePreview);
      
      // Close modal and refresh
      setIsEditModalOpen(false);
      fetchUserStories();
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditUsername(username);
    setEditBio(bio);
    setEditProfilePicture(profilePicture);
    setEditImagePreview(imagePreview);
    setIsEditModalOpen(true);
  };

  const handleCardClick = (story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const getTotalLikes = () => {
    return stories.reduce((total, story) => {
      const likes = Array.isArray(story.likes) ? story.likes.length : (story.likes || 0);
      return total + likes;
    }, 0);
  };

  const getTotalComments = () => {
    return stories.reduce((total, story) => {
      return total + (story.comments?.length || 0);
    }, 0);
  };

  const handlePostUpdate = (updatedStory) => {
    setStories(stories.map(s => s._id === updatedStory._id ? updatedStory : s));
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Alert Messages */}
        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} mb-6 shadow-lg`}>
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Header - Instagram Style */}
        <div className="mb-10 pb-10 border-b border-gray-200">
          <div className="flex items-center gap-8 mb-6">
            {/* Profile Picture */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring-2 ring-gray-200">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-light">{username || "username"}</h1>
                <button
                  onClick={openEditModal}
                  className="btn btn-sm bg-gray-100 hover:bg-gray-200 border-gray-300 normal-case font-semibold"
                >
                  Edit Profile
                </button>
                <button className="btn btn-sm btn-ghost btn-circle">
                  <Settings size={20} />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <div>
                  <span className="font-semibold">{stories.length}</span> posts
                </div>
                <div>
                  <span className="font-semibold">{followersCount}</span> followers
                </div>
                <div>
                  <span className="font-semibold">{followingCount}</span> following
                </div>
              </div>

              {/* Bio */}
              {bio && (
                <div className="text-sm">
                  <p className="font-semibold">{username}</p>
                  <p className="whitespace-pre-wrap">{bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="border-t border-gray-200">
          <div className="flex justify-center py-4 border-b border-gray-200">
            <button className="flex items-center gap-2 text-sm font-semibold border-t-2 border-black -mt-[17px] pt-4 px-4">
              <Grid size={16} />
              POSTS
            </button>
          </div>

          {loadingStories ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={48} className="animate-spin text-gray-400" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-black flex items-center justify-center">
                <Camera size={32} />
              </div>
              <h3 className="text-3xl font-light mb-2">Share Photos</h3>
              <p className="text-gray-600 mb-6">When you share photos, they will appear on your profile.</p>
              <button
                onClick={() => navigate("/stories/addpost")}
                className="text-cyan-500 font-semibold hover:text-cyan-600"
              >
                Share your first photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 pt-4">
              {stories.map((story) => (
                <div
                  key={story._id}
                  onClick={() => handleCardClick(story)}
                  className="aspect-square relative cursor-pointer overflow-hidden group"
                >
                  <img
                    src={story.images?.[0] || "https://via.placeholder.com/300"}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-6">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 font-semibold">
                      <Heart size={20} fill="white" />
                      <span>{Array.isArray(story.likes) ? story.likes.length : (story.likes || 0)}</span>
                    </div>
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 font-semibold">
                      <MessageCircle size={20} fill="white" />
                      <span>{story.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Post Button */}
      <button
        onClick={() => navigate("/stories/addpost")}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold p-4 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 z-50"
        aria-label="Add new post"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-600 hover:text-gray-900">
                <X size={24} />
              </button>
              <h2 className="font-semibold text-lg">Edit Profile</h2>
              <button
                onClick={handleSaveProfile}
                disabled={saving || uploading}
                className="text-cyan-500 font-semibold hover:text-cyan-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Done"}
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="avatar mb-2">
                  <div className="w-24 h-24 rounded-full ring-2 ring-gray-200">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Profile" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <User size={36} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <label htmlFor="edit-profile-upload" className="text-cyan-500 font-semibold text-sm cursor-pointer hover:text-cyan-600">
                  {uploading ? "Uploading..." : "Change Profile Photo"}
                </label>
                <input
                  id="edit-profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {/* Username */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="input input-bordered focus:outline-none focus:border-gray-400"
                  maxLength={30}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">{editUsername.length}/30</span>
                </label>
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Bio</span>
                </label>
                <textarea
                  placeholder="Write a bio..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="textarea textarea-bordered h-24 focus:outline-none focus:border-gray-400 resize-none"
                  maxLength={150}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">{editBio.length}/150</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      <PostModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchUserStories(); // Refresh stories after modal closes
        }}
        onPostUpdate={handlePostUpdate}
      />
    </div>
  );
};

export default Profile;
