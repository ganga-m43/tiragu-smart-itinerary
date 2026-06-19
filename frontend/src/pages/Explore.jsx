import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import SeasonalPlaces from "../components/SeasonalPlaces";

const API_URL = "http://localhost:3000"; // 🔧 replace with your backend URL

const CACHE_KEY = "nearbyPlacesCache";
const MAX_DISTANCE_KM = 5; // Reuse cache if user within 5km
const MAX_CACHE_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Haversine distance in KM
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Explore = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  
  // New states for search results
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Get nearby places automatically
  useEffect(() => {
    fetchNearbyPlaces();
  }, []);

  // Determine items per view based on viewport
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  async function fetchNearbyPlaces() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("📍 User location:", { lat, lng });

        // Attempt to use cache first
        try {
          const cachedRaw = localStorage.getItem(CACHE_KEY);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            const age = Date.now() - cached.timestamp;
            const dist = haversine(lat, lng, cached.lat, cached.lng);
            console.log("🗄️ Cache age(ms):", age, "distance(km):", dist);
            if (age < MAX_CACHE_AGE_MS && dist < MAX_DISTANCE_KM && Array.isArray(cached.places)) {
              console.log("✅ Using cached nearby places (within distance & age threshold)");
              setPlaces(cached.places);
              return; // Skip fetch to save tokens
            }
          }
        } catch (e) {
          console.warn("⚠️ Cache parse error", e);
        }

        try {
          setLoading(true);
          setError(null);
          
          const url = `${API_URL}/api/itinerary/explore/nearby?lat=${lat}&lng=${lng}`;
          console.log("🔗 Fetching from:", url);
          
          const res = await fetch(url);
          
          console.log("🔍 Response status:", res.status);
          console.log("🔍 Response headers:", res.headers);
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Error response:", errorText);
            throw new Error(`Backend error: ${res.status} ${res.statusText}`);
          }
          
          const json = await res.json();
          console.log("✅ Full response:", json);
          console.log("✅ Places array:", json.places);
          console.log("✅ Places count:", json.places?.length || 0);
          
          if (json.places && Array.isArray(json.places)) {
            setPlaces(json.places);

            // Save to cache
            try {
              localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ lat, lng, timestamp: Date.now(), places: json.places })
              );
              console.log("🗄️ Cached nearby places");
            } catch (e) {
              console.warn("⚠️ Failed to cache", e);
            }
            
            if (json.places.length === 0) {
              setError("No places found nearby. Try a different location.");
            }
          } else {
            console.error("❌ Invalid response format:", json);
            setError("Invalid response from server");
            setPlaces([]);
          }
        } catch (err) {
          console.error("❌ Fetch error:", err);
          setError(err.message);
          setPlaces([]);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        setError("Please allow location access for recommendations");
        alert("Please allow location access for recommendations");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Handle search submission
  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResult(null);
      return;
    }

    // Clear previous result and show loading immediately
    setSearchResult(null);
    setSearchLoading(true);

    // First check if search term matches any recommended place
    const matchedPlace = places.find(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    );

    if (matchedPlace) {
      // Show matched place from recommendations
      setSearchLoading(false);
      setSearchResult({
        type: 'matched',
        data: matchedPlace
      });
    } else {
      // Fetch from backend API (which calls AI)
      try {
        const response = await fetch(
          `${API_URL}/api/itinerary/explore/search?query=${encodeURIComponent(search)}`
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.description) {
          throw new Error("Invalid response from server");
        }
        
        setSearchResult({
          type: 'ai',
          data: {
            query: data.query,
            description: data.description
          }
        });
      } catch (err) {
        console.error("❌ Search error:", err);
        setSearchResult({
          type: 'error',
          data: { message: "Failed to fetch information. Please try again." }
        });
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // Pagination controls (no scrollbar)
  const maxIndex = Math.max(0, places.length - itemsPerView);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < maxIndex;
  const goLeft = () => setCurrentIndex((i) => Math.max(0, i - itemsPerView));
  const goRight = () => setCurrentIndex((i) => Math.min(maxIndex, i + itemsPerView));

  return (
    <div className="p-6 min-h-screen bg-base-100">
      {/* 🔍 Search Bar - Above AI Recommended Section */}
      <div className="flex justify-center mb-8 mt-20 pt-7">
        <div className="relative w-full max-w-xl ">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ">
            <FaSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search a place or destination..."
            className="input input-bordered w-full pl-12 pr-28 rounded-full shadow-lg hover:shadow-xl focus:shadow-2xl transition-all border-2 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm rounded-full px-6"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {/* 🎯 Search Results Section */}
      {searchLoading && (
        <div className="flex flex-col justify-center items-center mb-8 p-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg">
          <div className="relative">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="absolute inset-0 loading loading-spinner loading-lg text-secondary opacity-50 animate-ping"></div>
          </div>
          <p className="text-lg font-semibold text-primary animate-pulse mt-6">🔍 Searching for information...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we gather the details</p>
        </div>
      )}

      {searchResult && !searchLoading && (
        <div className="mb-12 animate-fadeIn">
          {searchResult.type === 'matched' && (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 shadow-2xl border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">✨</span>
                <h2 className="text-3xl font-bold text-primary">Found in Recommendations!</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {searchResult.data.photo ? (
                    <img
                      src={searchResult.data.photo}
                      alt={searchResult.data.name}
                      className="w-full h-80 object-cover rounded-2xl shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white rounded-2xl">
                      <div className="text-center">
                        <p className="text-6xl mb-4">🗺️</p>
                        <p className="text-xl font-semibold">AI Recommended</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <h3 className="text-3xl font-bold">{searchResult.data.name}</h3>
                  <p className="text-lg text-gray-600 flex items-center gap-2">
                    <span>📍</span> {searchResult.data.address}
                  </p>
                  {searchResult.data.rating && (
                    <p className="text-xl flex items-center gap-2">
                      <span>⭐</span> <span className="font-semibold">{searchResult.data.rating}</span> Rating
                    </p>
                  )}
                  {searchResult.data.description && (
                    <p className="text-base text-gray-700 leading-relaxed">{searchResult.data.description}</p>
                  )}
                  {searchResult.data.photoAttribution && (
                    <p className="text-xs text-gray-400 italic">{searchResult.data.photoAttribution}</p>
                  )}
                  <a
                    href={searchResult.data.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg rounded-full mt-4"
                  >
                    📍 View on Map
                  </a>
                </div>
              </div>
            </div>
          )}

          {searchResult.type === 'ai' && (
            <div className="bg-gradient-to-br from-info/10 to-success/10 rounded-3xl p-8 shadow-2xl border-2 border-info/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🤖</span>
                <h2 className="text-3xl font-bold text-info">AI Travel Guide</h2>
              </div>
              <div className="bg-base-100 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                  <span>🌍</span> {searchResult.data.query}
                </h3>
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-loose space-y-4 text-base" style={{ whiteSpace: 'pre-line' }}>
                    {searchResult.data.description}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSearchResult(null)}
                  className="btn btn-outline btn-sm rounded-full"
                >
                  ✕ Clear Search
                </button>
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchResult(null);
                  }}
                  className="btn btn-primary btn-sm rounded-full"
                >
                  🔍 New Search
                </button>
              </div>
            </div>
          )}

          {searchResult.type === 'error' && (
            <div className="alert alert-error rounded-2xl shadow-lg">
              <span>⚠️ {searchResult.data.message}</span>
            </div>
          )}
        </div>
      )}

      {/* 🧭 Recommended Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Places Recommended Near You</h2>
      </div>

      {/* 🪄 Cards Grid */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>⚠️ {error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-gray-500 animate-pulse">🗺️ Finding amazing places near you...</p>
        </div>
      ) : places.length > 0 ? (
        <div>
          <div className={`grid gap-6 grid-cols-2 md:grid-cols-4`}>
            {places
              .slice(currentIndex, currentIndex + itemsPerView)
              .map((place, idx) => (
            <div key={`${currentIndex}-${idx}`} className="card bg-base-200 shadow-xl hover:scale-105 transition-transform duration-200">
              {place.photo ? (
                <figure>
                  <img
                    src={place.photo}
                    alt={place.name}
                    className="h-64 w-full object-cover rounded-t-xl"
                    loading="lazy"
                  />
                </figure>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white rounded-t-xl">
                  <div className="text-center p-4">
                    <p className="text-2xl mb-2">🗺️</p>
                    <p className="text-sm font-semibold">AI Recommended</p>
                  </div>
                </div>
              )}
              <div className="card-body p-4">
                <h3 className="card-title text-lg">{place.name}</h3>
                <p className="text-sm text-gray-500">{place.address}</p>
                {place.photoAttribution && (
                  <p className="mt-1 text-[10px] text-gray-400">{place.photoAttribution}</p>
                )}
                {place.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{place.description}</p>
                )}
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>⭐ {place.rating || "N/A"}</span>
                </div>
                <div className="card-actions mt-3">
                  <a
                    href={place.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm w-full"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            </div>
              ))}
          </div>
          {places.length > itemsPerView && (
            <div className="flex flex-col items-center mt-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goLeft}
                    className="btn btn-outline btn-md flex items-center"
                    disabled={!canGoLeft}
                    aria-label="Previous"
                  >
                    <FaChevronLeft />
                  </button>
                  <span
                    className={`text-sm font-medium select-none ${canGoLeft ? "text-gray-700 cursor-pointer" : "text-gray-400 cursor-not-allowed"}`}
                    onClick={() => { if (canGoLeft) goLeft(); }}
                    role="button"
                    tabIndex={canGoLeft ? 0 : -1}
                    onKeyDown={(e) => { if (canGoLeft && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goLeft(); } }}
                  >
                    Prev
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Page {Math.floor(currentIndex / itemsPerView) + 1} of {Math.ceil(places.length / itemsPerView)}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium select-none ${canGoRight ? "text-gray-700 cursor-pointer" : "text-gray-400 cursor-not-allowed"}`}
                    onClick={() => { if (canGoRight) goRight(); }}
                    role="button"
                    tabIndex={canGoRight ? 0 : -1}
                    onKeyDown={(e) => { if (canGoRight && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goRight(); } }}
                  >
                    Next
                  </span>
                  <button
                    onClick={goRight}
                    className="btn btn-outline btn-md flex items-center"
                    disabled={!canGoRight}
                    aria-label="Next"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">No recommendations found.</p>
      )}

      {/* Seasonal places section */}
      <SeasonalPlaces />
    </div>
  );
};

export default Explore;
