import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Hero from "../components/Hero.jsx"
import Highlight from '../components/Highlight.jsx'
import About from '../components/About.jsx'


const Home = () => {
  return (
   <div>
    <Hero/>
    <Highlight/>
    <About/>
   </div>

  )
}

export default Home