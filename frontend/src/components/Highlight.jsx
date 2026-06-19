import React from "react";

const Hero = () => {
  return (
    <section className="min-h-screen px-4 py-20 bg-base-100">
      <div className="max-w-7xl mx-auto">
        {/* Top Banner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Side - Big Promo */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl lg:text-5xl font-bold mb-6">
              Your Next Adventure Starts Here !!!
              <br />
              AI Trip Planning, Travel Stories, Hidden Gems & More
            </h1>
          </div>

          {/* Right Side - Promo Details */}
          <div className="flex flex-col justify-center bg-base-200/50 p-8 rounded-3xl">
            <p className="text-base-content/60 mb-6 ">
              Experience the future of travel with Tiragu: plan trips in
              seconds, explore authentic stories from fellow travelers, uncover
              hidden gems across the globe, and connect with a passionate,
              helpful community—your journey is now powered by people and AI
            </p>
          </div>
        </div>

        {/* Cards Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Summer Promo with Image */}
          <div className="card bg-base-100 shadow-xl rounded-3xl overflow-hidden group">
            <figure className="relative h-64">
              <img
                src="./card1.jpg"
                alt="Summer Promo"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex items-center justify-between w-[calc(100%-2rem)]">
                <p className="text-white font-semibold text-lg bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                  Plan Smarter, Travel Better
                </p>
              </div>
            </figure>
          </div>
          {/* Card 2 - Let's Explore Together */}
          <div className="card bg-base-200 shadow-xl rounded-3xl overflow-hidden relative">
            {/* Background Image with Opacity */}
            <div className="absolute inset-0">
              <img
                src="./card2.jpg"
                alt="Explore Background"
                className="w-full h-full object-cover opacity-89 shadow"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 flex flex-col justify-end h-64">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white pl-4">
                  Let's Explore Together
                </h2>
                <div className="toggle toggle-lg"></div>
              </div>
            </div>
          </div>

          {/* Card 3 - Ramadhan Promo with Image */}
          <div className="card bg-base-100 shadow-xl rounded-3xl overflow-hidden group">
            <figure className="relative h-64">
              <img
                src="./card3.jpg"
                alt="Ramadhan Promo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center justify-between w-[calc(100%-2rem)]">
                <p className="text-white font-semibold text-lg">
                  Join the Community
                </p>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
