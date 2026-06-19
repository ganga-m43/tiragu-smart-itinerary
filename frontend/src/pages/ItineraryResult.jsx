import React from 'react'
import { useEffect,useState } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import ItineraryDisplay from '../components/ItineraryDisplay.jsx';
import LetMeCookLoader from '../components/loadingcomopent.jsx';

const ItineraryResult = () => {
    const {state}=useLocation();
    const navigate=useNavigate();
    const formData=state?.formData;

 const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState("");

  useEffect(() => {
    const fetchItinerary = async () => {
      if(!formData){
          navigate("/planner");
          return;
      }
      setLoading(true);
      try {
        let res = await fetch("http://localhost:3000/api/itinerary/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        setItinerary(data);
        console.log(data,itinerary);
      } catch (error) {
        setError(error.message);
        console.error("Error generating itinerary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
}, [formData, navigate]);

return (
  <div>
    {loading && <LetMeCookLoader loading={loading} />}
    {!loading && error && <p className="text-center mt-10 text-lg text-red-500">Error: {error}</p>}
    {!loading && !error && itinerary && (
      <ItineraryDisplay itinerary={itinerary} />
    )}
  </div>
);
};

export default ItineraryResult