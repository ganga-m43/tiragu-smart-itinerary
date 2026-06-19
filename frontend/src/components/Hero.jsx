import React from 'react'
import { NavLink } from 'react-router'

const Hero = () => {
  return (
    <div className='relative w-full h-[600px] md:h-[700px] px-4 md:px-16 py-8 mt-7'>
        <div className='relative w-full h-full rounded-[40px] overflow-hidden'>
            <img src="./Hero.jpg" alt="Hero Photo" className='w-full h-full object-cover'/>
       
            <div className='absolute inset-0 bg-black/30'></div>

            {/* left side content  */}
            <div className='absolute inset-0 flex items-center px-8 md:px-16'>
                <div className='max-w-2xl text-white'>
                    <h1 className='text-4xl md:text-6xl font-bold leading-tight mb-2'>
                        Plan. Explore. Share.
                    </h1>
                    <p className='text-xl leading-tight mb-3'>
                       Join a global community of travelers sharing real stories and hidden gems.
                    </p>

                    <button className='flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition'>
                        <NavLink to="/explore">Get Started</NavLink>
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Hero