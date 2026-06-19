import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, MapPin, Sparkles } from "lucide-react";
import ExploreIcon from "@mui/icons-material/Explore";
import CelebrationIcon from "@mui/icons-material/Celebration";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";


export default function Planner() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    startDate: "",
    duration: "",
    travelers: "",
    tripType: [],
    interests: [],
  });


  const travelerOptions = [
    {
      id: "solo",
      label: "Solo",
      icon: "🧳",
      description: "Travel at your own pace and discover the world on your own",
    },
    {
      id: "couple",
      label: "Couple",
      icon: "💑",
      description: "Share special moments and create memories together",
    },
    {
      id: "friends",
      label: "Friends",
      icon: "👥",
      description: "Fun and adventures shared with your group",
    },
    {
      id: "family",
      label: "Family",
      icon: "👨‍👩‍👧‍👦",
      description: "Unforgettable experiences for all ages",
    },
  ];

  const tripTypes = [
    {
      id: "exploration",
      label: "Exploration",
      icon: <ExploreIcon sx={{ fontSize: 40 }} />,
      color: "blue",
      description: "Discover the most iconic places and the local culture",
    },
    {
      id: "party",
      label: "Party",
      icon: <CelebrationIcon sx={{ fontSize: 40 }} />,
      color: "purple",
      description: "Experience the vibrant nightlife and local festivities",
    },
    {
      id: "relax",
      label: "Relax",
      icon: <BeachAccessIcon sx={{ fontSize: 40 }} />,
      color: "green",
      description: "Disconnect and enjoy a peaceful trips",
    },
  ];

  const interestOptions = [
    "Culture",
    "Food",
    "Nature",
    "Shopping",
    "Photography",
    "Wildlife",
    "Beach",
    "Museums",
    "Nightlife",
    "Sports",
  ];

  const handleSubmit = async (e) => {
    console.log(formData)
    e.preventDefault();
    navigate("/itinerary", { state: { formData } });
  
  };
    const toggleTripType = (type) => {
    setFormData((prev) => ({
      ...prev,
      tripType: prev.tripType.includes(type)
        ? prev.tripType.filter((t) => t !== type)
        : [...prev.tripType, type],
    }));
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 mt-7">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-blue-600" />
          Where would you like to Travel?
        </h1>
        <p className="text-gray-600 text-lg">
          Let AI create your perfect itinerary
        </p>
      </div>

      {/* Single Card Container */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form className="space-y-8">
          {/* Destination */}
          <div>
            <label className=" mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Where do you want to go?
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              placeholder="Enter destination (e.g., Paris, Tokyo)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Dates & Duration */}
          <div>
            <label className="mb-4 font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              When are you traveling?
            </label>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Number of Days
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="5"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <hr className="border-gray-200" />

          {/* Budget preference */}

          <div>
            <label className=" mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              What is your budget preference?
            </label>
            <div className="text-end mb-2">
              <span className="text-2xl font-bold text-blue-600">
                ₹{formData.budget || 0}
              </span>
            </div>

            <input
              type="range"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              min="1000"
              max="100000"
              step="100"
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Min: ₹1000</span>
              <span>Max: ₹1,00,000</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Travelers */}
          <div>
            <label className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Who's traveling?
            </label>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {travelerOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() =>
                    setFormData({ ...formData, travelers: option.id })
                  }
                  className={`cursor-pointer p-3 border-2 rounded-xl text-center transition-all ${
                    formData.travelers === option.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Trip Type */}
          <div>
            <label className="block mb-4 font-semibold text-gray-700">
              What kind of trip? (Select all that apply)
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {tripTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => toggleTripType(type.id)}
                  className={`cursor-pointer p-4 border-2 rounded-lg text-center transition-all ${
                    formData.tripType.includes(type.id)
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-sm mb-2">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Interests */}
          <div>
            <label className="block mb-4 font-semibold text-gray-700">
              Interests (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            <Sparkles className="w-5 h-5" />
            Generate My Itinerary
          </button>
        </form>
      </div>
    </div>
  );
}
