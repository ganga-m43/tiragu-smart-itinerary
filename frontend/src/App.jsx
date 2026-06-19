import React from "react"
import { Routes, Route } from "react-router"
import "./App.css"
import Home from "./pages/Home.jsx"
import Navbar from "./components/Navbar.jsx"
import Planner from "./pages/Planner.jsx"
import Explore from "./pages/Explore.jsx"
import Stories from "./pages/Stories.jsx"
import Footer from "./components/Footer.jsx"
import ItineraryResult from "./pages/ItineraryResult.jsx"
import Addpost from "./pages/Addpost.jsx"
import Profile from "./pages/Profile.jsx"

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/Explore" element={<Explore />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/itinerary" element={<ItineraryResult/>} />
        <Route path="/stories/addpost" element={<Addpost/>} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
      <Footer/>
    </div>
  );
}