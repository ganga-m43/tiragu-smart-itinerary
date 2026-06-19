import React, { useEffect } from "react";
import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const Navbar = () => {

let [scroll,setScroll]=useState(false);

useEffect(()=>{
  const handelScroll=()=>{
    if(window.scroll>50){
      setScroll(true);
    }
    else{
      setScroll(false)
    }
  };
  window.addEventListener("scroll",handelScroll);
  return ()=>window.removeEventListener("scroll",handelScroll);
},[]);


  return (
    <nav className={`navbar fixed top-0 left-0 right-0 z-50 px-8 pt-4 pb-4 mb-2 transition-all duration-300 ${
    scroll? "bg-white/70 backdrop-blur-lg shadow-lg" :"bg-white/30 backdrop-blur-md"
    }`}>
      <div className="flex w-full items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <a href="/" className="text-3xl font-bold text-primary hover:opacity-80 transition-opacity">
            TiraGu
          </a>
        </div>

        {/* Center: Nav Links (desktop only for now) */}
        <ul className="flex space-x-8 text-lg font-medium text-gray-700">
          <li>
            <a
              href="/Explore"
              className="relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-600 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              Explore
            </a>
          </li>
          <li>
            <a
              href="/planner"
              className="relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-600 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              AI-planner
            </a>
          </li>
          <li>
            <a
              href="/stories"
              className="relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-600 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              Stories
            </a>
          </li>


          <li>
            <a
              href="/profile"
              className="relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-600 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              Profile
            </a>
          </li>
        </ul>

        {/* Right: Auth Section */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn bg-black text-white text-lg p-1.5 px-4 rounded-2xl hover:bg-gray-900">
                Get Started
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;