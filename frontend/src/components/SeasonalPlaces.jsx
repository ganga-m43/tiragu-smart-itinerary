import React, { useState, useEffect, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import seasonsData from "../data/season_places.json";

/**
 * SeasonalPlaces Component
 * Shows a dropdown to choose a season, displays a carousel of places.
 * Fetches images dynamically from Wikimedia API.
 */
const SeasonalPlaces = () => {
  const seasonKeys = Object.keys(seasonsData); // ["Winter", "Summer", ...]
  const [season, setSeason] = useState("All");
  const [itemsPerView, setItemsPerView] = useState(4);
  const [index, setIndex] = useState(0);
  const [imageCache, setImageCache] = useState({});

  // Responsive items per view similar to Explore.jsx
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Aggregate / filter data based on selected season
  const places = useMemo(() => {
    let filtered = [];
    if (season === "All") {
      filtered = seasonKeys.flatMap((key) => seasonsData[key]);
    } else {
      filtered = seasonsData[season] || [];
    }
    
    return filtered;
  }, [season, seasonKeys]);

  // Fetch image from Wikimedia API
  const fetchWikimediaImage = async (placeName) => {
    if (imageCache[placeName]) return imageCache[placeName];
    
    const baseTitle = placeName.split(",")[0].trim();
    try {
      // Try direct page lookup
      let res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=${encodeURIComponent(baseTitle)}&origin=*`
      );
      let data = await res.json();
      let pages = data?.query?.pages || {};
      let page = Object.values(pages)[0];
      let imgUrl = page?.original?.source;

      if (!imgUrl) {
        // Fallback to search
        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(baseTitle + " India tourism")}&origin=*`
        );
        const searchData = await searchRes.json();
        const firstResult = searchData?.query?.search?.[0]?.title;
        
        if (firstResult) {
          res = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=${encodeURIComponent(firstResult)}&origin=*`
          );
          data = await res.json();
          pages = data?.query?.pages || {};
          page = Object.values(pages)[0];
          imgUrl = page?.original?.source;
        }
      }

      const finalUrl = imgUrl || "https://placehold.co/600x400?text=No+Image";
      setImageCache(prev => ({ ...prev, [placeName]: finalUrl }));
      return finalUrl;
    } catch (err) {
      console.warn("Failed to fetch image for", placeName, err);
      const fallback = "https://placehold.co/600x400?text=Error";
      setImageCache(prev => ({ ...prev, [placeName]: fallback }));
      return fallback;
    }
  };

  // Fetch images for visible places
  useEffect(() => {
    const visiblePlaces = places.slice(index, index + itemsPerView);
    visiblePlaces.forEach(place => {
      if (!imageCache[place.name]) {
        fetchWikimediaImage(place.name);
      }
    });
  }, [places, index, itemsPerView]);

  // Clamp index when season changes or itemsPerView changes
  useEffect(() => {
    setIndex(0);
  }, [season, itemsPerView]);

  const maxIndex = Math.max(0, places.length - itemsPerView);
  const canPrev = index > 0;
  const canNext = index < maxIndex;
  const prev = () => canPrev && setIndex((i) => Math.max(0, i - itemsPerView));
  const next = () => canNext && setIndex((i) => Math.min(maxIndex, i + itemsPerView));

  return (
    <section className="mt-12">
      {/* Header with title and Season dropdown */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold">Seasonal Highlights</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="season-select" className="font-medium text-sm">Season:</label>
          <select
            id="season-select"
            value={season}
            onChange={(e) => {
              setSeason(e.target.value);
              setIndex(0);
            }}
            className="select select-bordered select-sm md:select-md"
          >
            <option value="All">All</option>
            {seasonKeys.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {places.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No places found for this season.</p>
      ) : (
        <>
          {/* Carousel container */}
          <div className="relative">
            {/* Overlay navigation buttons */}
            {places.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous"
              className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle ${!canPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            >
              <FaChevronLeft className="text-white" size={22} />
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              aria-label="Next"
              className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle ${!canNext ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            >
              <FaChevronRight className="text-white" size={22} />
            </button>
          </>
        )}

            {/* Cards grid (slice acts like pages) */}
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {places
                .slice(index, index + itemsPerView)
                .map((place, idx) => (
                  <div key={`${index}-${idx}-${place.name}`} className="card bg-base-200 shadow-xl hover:scale-105 transition-transform duration-200">
                    <figure className="relative">
                      {!imageCache[place.name] ? (
                        <div className="h-64 w-full flex items-center justify-center bg-base-300 animate-pulse">
                          <span className="loading loading-spinner loading-md text-primary"></span>
                        </div>
                      ) : (
                        <img
                          src={imageCache[place.name]}
                          alt={place.name}
                          className="h-64 w-full object-cover rounded-t-xl"
                          loading="lazy"
                        />
                      )}
                    </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{place.name}</h3>
                  <p className="text-sm text-gray-500">{place.address}</p>
                  {place.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{place.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span>⭐ {place.rating || "N/A"}</span>
                  </div>
                  <div className="card-actions mt-3">
                    <a
                      href={place.map}
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
          </div>

          {/* Mobile pagination controls below (since arrows hidden on mobile) */}
          {places.length > itemsPerView && (
        <div className="flex items-center justify-center gap-6 mt-6 md:hidden">
          <button
            onClick={prev}
            disabled={!canPrev}
            className="btn btn-outline btn-sm"
          >
            Prev
          </button>
          <span className="text-xs text-gray-600">
            Page {Math.floor(index / itemsPerView) + 1} / {Math.ceil(places.length / itemsPerView)}
          </span>
          <button
            onClick={next}
            disabled={!canNext}
            className="btn btn-outline btn-sm"
          >
            Next
          </button>
        </div>
          )}
        </>
      )}
    </section>
  );
};

export default SeasonalPlaces;
