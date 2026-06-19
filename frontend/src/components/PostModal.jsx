import { X, Heart, MessageCircle, Bookmark, Globe, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

const PostModal = ({ story, isOpen, onClose, onPostUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (isOpen && story) {
      fetchComments();
      const likesArray = Array.isArray(story.likes) ? story.likes : [];
      setLikes(likesArray.length);
      setIsLiked(likesArray.includes(user?.id) || false);
      setIsPublic(story.isPublic || false);
    }
  }, [isOpen, story, user]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/itinerary/stories/${story._id}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await axios.post(`http://localhost:3000/api/itinerary/stories/${story._id}/comments`, { 
        content: newComment 
      });
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`http://localhost:3000/api/itinerary/stories/${story._id}/like`);
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleTogglePublic = async () => {
    try {
      const response = await axios.patch(`http://localhost:3000/api/itinerary/stories/${story._id}/toggle-public`);
      setIsPublic(response.data.story.isPublic);
      if (onPostUpdate) onPostUpdate(response.data.story);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  if (!isOpen || !story) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg overflow-hidden flex" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
        >
          <X size={24} />
        </button>

        <div className="w-3/5 bg-black flex items-center justify-center">
          <img 
            src={story.images?.[0] || '/placeholder.jpg'} 
            alt={story.title} 
            className="max-h-full max-w-full object-contain" 
          />
        </div>

        <div className="w-2/5 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full ring ring-cyan-500">
                <img 
                  src={story.user?.profilePicture || user?.imageUrl || 'https://via.placeholder.com/40'} 
                  alt="User" 
                  className="rounded-full w-full h-full object-cover" 
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {story.user?.username || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">{story.location}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full">
                <img 
                  src={story.user?.profilePicture || user?.imageUrl} 
                  alt="User" 
                  className="rounded-full w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-semibold mr-2">
                    {story.user?.username || 'Anonymous'}
                  </span>
                  {story.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-30" />
                <p>No comments yet</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full">
                    <img 
                      src={comment.user?.profilePicture} 
                      alt="User" 
                      className="rounded-full w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-semibold mr-2">
                        {comment.user?.username || 'Anonymous'}
                      </span>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLike} 
                  className={isLiked ? 'text-red-500' : 'text-gray-900'}
                >
                  <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button className="text-gray-900">
                  <MessageCircle size={24} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTogglePublic} 
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
                    isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isPublic ? (
                    <>
                      <Globe size={14} />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      Private
                    </>
                  )}
                </button>
                <button className="text-gray-900">
                  <Bookmark size={24} />
                </button>
              </div>
            </div>
            
            <p className="font-semibold text-sm text-gray-900">{likes} likes</p>
            
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400" 
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()} 
                className="text-cyan-500 font-semibold disabled:opacity-30 text-sm"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;