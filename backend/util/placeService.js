// Simple in-memory cache for Wikimedia lookups to reduce repeated API calls
const wikiImageCache = new Map();

export async function getNearbyPlaces(userLat, userLng, limit = 8) {
  try {
    const prompt = `You are a JSON API. Return ONLY valid JSON, no explanations.
List exactly ${limit} famous tourist places near ${userLat}, ${userLng}.
Format: {"places":[{"name":"","address":"","rating":4.5,"lat":0,"lng":0,"description":""}]}`;

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
              content: "You are a JSON API. Always respond with valid JSON only, no markdown, no explanations."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();
    let aiText = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks
    aiText = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    // Extract JSON from text (find first { to last })
    const jsonStart = aiText.indexOf("{");
    const jsonEnd = aiText.lastIndexOf("}") + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.error("❌ No JSON found in response:", aiText);
      return [];
    }
    
    const jsonString = aiText.substring(jsonStart, jsonEnd);
    
    let placesJSON;
    try {
      placesJSON = JSON.parse(jsonString);
    } catch (err) {
      console.error("❌ JSON parse failed:", err);
      console.error("Raw response:", aiText);
      console.error("Extracted JSON:", jsonString);
      return [];
    }

    // Filter invalid place entries first
    const valid = Array.isArray(placesJSON.places)
      ? placesJSON.places.filter(p => {
          const ok = p?.name && p?.address && typeof p.lat === 'number' && typeof p.lng === 'number';
          return ok;
        })
      : [];

    // Only take up to limit before fetching images to reduce calls
    const trimmed = valid.slice(0, limit);

    // Fetch Wikimedia images in parallel
    const withImages = [];
    for (const p of trimmed) {
      // Serial to avoid hammering Wikimedia and reduce rate-limit risk
      const img = await getWikiImage(p.name);
      withImages.push({
        name: p.name,
        address: p.address,
        rating: p.rating || null,
        photo: img?.url || null,
        photoAttribution: img?.attribution || null,
        mapLink: `https://www.google.com/maps?q=${p.lat},${p.lng}`,
        lat: p.lat,
        lng: p.lng,
        description: p.description || ''
      });
    }

    return withImages;

  } catch (error) {
    console.error("❌ Error in getNearbyPlaces:", error);
    return [];
  }
}

// ---------------- Wikimedia Image Helpers ----------------

async function getWikiImage(placeName) {
  if (!placeName) return null;
  if (wikiImageCache.has(placeName)) return wikiImageCache.get(placeName);

  // Try exact title then fallback search
  let result = await fetchWikiByTitles(placeName);
  if (!result) result = await fetchWikiBySearch(placeName);
  wikiImageCache.set(placeName, result);
  return result;
}

async function fetchWikiByTitles(title) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '800',
    redirects: '1',
    titles: title,
    origin: '*'
  });
  return requestAndExtract(params);
}

async function fetchWikiBySearch(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrlimit: '1',
    gsrsearch: query,
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '800',
    origin: '*'
  });
  return requestAndExtract(params);
}

async function requestAndExtract(params) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TiraguApp/1.0 (contact: dev@tiragu.local)' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const pages = json?.query?.pages;
    if (!pages) return null;
    const first = Object.values(pages)[0];
    if (first?.thumbnail?.source) {
      return {
        url: first.thumbnail.source,
        attribution: 'Image from Wikipedia (Wikimedia Commons)'
      };
    }
    return null;
  } catch (e) {
    console.warn('Wikimedia fetch error:', e.message);
    return null;
  }
}