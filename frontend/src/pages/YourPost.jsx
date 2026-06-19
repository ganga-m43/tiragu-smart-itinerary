import { useEffect, useState } from "react";
import BigCard from "../components/BigCard.jsx";
import axios from "axios";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostModal from "../components/PostModal.jsx";

const YourPost = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📤 Fetching user stories...");

        const response = await axios.get(
          "http://localhost:3000/api/itinerary/stories/user"
        );
        
        console.log("✅ User stories response:", response.data);
        console.log("📊 Number of stories:", response.data?.stories?.length || 0);
        
        setStories(response.data?.stories || []);
      } catch (error) {
        console.error("❌ Error fetching stories:", error);
        setError(error.message);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleCardClick = (story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Stories Yet</h2>
          <p className="text-base-content/60 mb-4">
            Be the first to share your travel story!
          </p>
          <button
            onClick={() => navigate("/stories/addpost")}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Create Your First Story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
      <h1 className="text-3xl font-bold mb-6">Your Travel Stories</h1>
      <div className="space-y-6">
        {stories.map((story) => (
          <div 
            key={story._id} 
            onClick={() => handleCardClick(story)} 
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <BigCard story={story} />
          </div>
        ))}
      </div>

      {/* ✅ Sea Blue Themed Add Post Button - Bottom Right */}
      <button
        onClick={() => navigate("/stories/addpost")}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 z-50 flex items-center gap-2"
        aria-label="Add new post"
      >
        <Plus size={22} strokeWidth={2.5} />
        <span className="text-base">Add Post</span>
      </button>

      {/* Instagram-style Post Modal */}
      <PostModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default YourPost;