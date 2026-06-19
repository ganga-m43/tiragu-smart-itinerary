import { useEffect, useState } from 'react'
import BigCard from '../components/BigCard.jsx'

const Stories = () => {
  const [stories, setStories] = useState([]) // ✅ Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch('http://localhost:3000/api/itinerary/stories/public')
        
        // ✅ Check if response is ok
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        
        // ✅ Safely set stories with fallback
        setStories(data?.stories || [])
        
      } catch (error) {
        console.error('Error fetching stories:', error)
        setError(error.message)
        setStories([]) // ✅ Set to empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    )
  }

  // ✅ Empty state
  if (stories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Stories Yet</h2>
          <p className="text-base-content/60">Be the first to share your travel story!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Travel Stories</h1>
      <div className="space-y-6">
        {stories.map((story) => (
          <BigCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  )
}

export default Stories