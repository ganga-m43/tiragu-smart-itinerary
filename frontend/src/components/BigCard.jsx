import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Heart, MessageCircle, MapPin } from 'lucide-react'

const BigCard = ({ story }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [likesCount, setLikesCount] = useState(story.likes || 0)
  const [storyUser, setStoryUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const images = story.images || []
  const maxDescriptionLength = 150

  // Use content field from backend
  const description = story.content || story.description || ''

  // Use mock user data for development
  useEffect(() => {
    // Set mock user data immediately for dev-user-123
    if (story.userId === 'dev-user-123') {
      setStoryUser({
        clerkUser: {
          fullName: 'Travel Explorer',
          username: 'explorer',
          imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev-user'
        }
      })
      setLoading(false)
    }
  }, [story.userId])

  // Format timestamp to relative time (e.g., "2 hours ago")
  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const createdAt = new Date(timestamp)
    const diffInSeconds = Math.floor((now - createdAt) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 604800)}w ago`
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const truncatedDescription = description?.length > maxDescriptionLength
    ? description.substring(0, maxDescriptionLength) + '...'
    : description

  // Get user display info from Clerk
  const displayName = storyUser?.clerkUser?.fullName || 
                      storyUser?.clerkUser?.firstName || 
                      storyUser?.clerkUser?.username || 
                      'User'
  
  const avatarUrl = storyUser?.clerkUser?.imageUrl || 
                   storyUser?.clerkUser?.profileImageUrl || 
                   '/default-avatar.png'

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-2xl mb-6 rounded-xl overflow-hidden">
      {/* User Info Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              {loading ? (
                <div className="skeleton w-full h-full rounded-full"></div>
              ) : (
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png'
                  }}
                />
              )}
            </div>
          </div>
          <div>
            {loading ? (
              <div className="skeleton h-4 w-24 mb-1"></div>
            ) : (
              <h3 className="font-semibold text-base text-base-content">
                {displayName}
              </h3>
            )}
            <div className="flex items-center gap-1 text-sm text-base-content/60">
              <MapPin size={14} />
              <span>{story.destination}</span>
            </div>
          </div>
        </div>
        <span className="text-xs text-base-content/50">
          {story.createdAt ? getTimeAgo(story.createdAt) : 'Just now'}
        </span>
      </div>

      {/* Image Section - Show full image as uploaded */}
      <div className="relative w-full bg-base-200 group">
        {images.length > 0 && (
          <>
            <img 
              src={images[currentImageIndex]} 
              alt={`${story.destination} - ${currentImageIndex + 1}`}
              className="w-full h-auto object-contain max-h-[600px]"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button 
                  className="btn btn-circle btn-sm bg-base-100/90 hover:bg-base-100 border-none absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="btn btn-circle btn-sm bg-base-100/90 hover:bg-base-100 border-none absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <span 
                      key={index}
                      className={`rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'w-2 h-2 bg-white' 
                          : 'w-1.5 h-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="card-body p-4">
        {/* Actions */}
        <div className="flex gap-4 mb-3">
          <button 
            className={`btn btn-ghost btn-sm p-1 min-h-0 h-auto hover:scale-110 transition-transform ${
              isLiked ? 'text-error' : 'text-base-content'
            }`}
            onClick={handleLike}
            aria-label="Like"
          >
            <Heart 
              size={24} 
              fill={isLiked ? 'currentColor' : 'none'} 
              className={isLiked ? 'animate-pulse' : ''}
            />
          </button>
          <button 
            className="btn btn-ghost btn-sm p-1 min-h-0 h-auto hover:scale-110 transition-transform text-base-content" 
            aria-label="Comment"
          >
            <MessageCircle size={24} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="text-sm font-semibold text-base-content mb-2">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </div>

        {/* Title and Description */}
        <div className="mb-2">
          <h2 className="card-title text-base font-semibold mb-2">{story.title}</h2>
          <p className="text-sm text-base-content leading-relaxed">
            {showFullDescription ? description : truncatedDescription}
            {description?.length > maxDescriptionLength && (
              <button 
                className="btn btn-link btn-sm p-0 min-h-0 h-auto ml-1 text-base-content/60 hover:text-base-content no-underline"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        </div>

        {/* Comments Preview */}
        {story.commentsCount > 0 && (
          <button className="btn btn-link btn-sm p-0 min-h-0 h-auto justify-start text-base-content/60 hover:text-base-content no-underline">
            View all {story.commentsCount} comments
          </button>
        )}
      </div>
    </div>
  )
}

export default BigCard;