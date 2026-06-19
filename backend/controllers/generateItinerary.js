import axios from "axios";


const generateItinerary = async (req, res) => {
  try {
    const formData = req.body;

    const prompt = `
You are a travel planner AI. 
Create a detailed ${formData.duration}-day itinerary for ${
      formData.travelers
    } people to ${formData.destination}. 
Budget: ${formData.budget}. 
Trip type: ${formData.tripType.join(", ")}. 
Interests: ${formData.interests.join(", ")}. 
Provide daily activities, food suggestions, and hidden gems if possible.
Respond ONLY in valid JSON format like this:
{
  "destination": "${formData.destination}",
  "days": [
    {
      "day": 1,
      "title": "Arrival and Beachside Chill",
      "activities": ["Check-in at hotel", "Visit Om Beach", "Dinner at Namaste Café"]
    },
    ...
  ]
}
`;

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
          role: "user",
          content: `${prompt}`,
        },
      ],
    }),
  }
);
const data = await response.json();
const aiText = data.choices[0].message.content.replace(/```json|```/g, "").trim();
console.log("AI RESPONSE:");
console.log(aiText);
let itineraryJSON;

try {
  itineraryJSON = JSON.parse(aiText);
} catch (err) {
      console.error("JSON parse failed, returning raw text:", aiText);
      itineraryJSON = { text: aiText };
}
console.log("Generated Itinerary JSON:", itineraryJSON);
res.status(200).json({ itinerary: itineraryJSON });


  } catch (error) {
    console.error("Error generating itinerary:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate itinerary." });
  }
};

export default generateItinerary;