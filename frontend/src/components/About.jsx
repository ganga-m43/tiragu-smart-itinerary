import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Why Tiragu?
            </h1>

            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Tiragu helps travelers go beyond the usual routes — to discover
                stories, not just places. It’s where planning meets passion, and
                every trip feels personal.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Tiragu is built for those who crave real experiences, not
                checklists. <br />
                We make exploring simpler, sharing easier, and memories
                unforgettable.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Tiragu brings together travel inspiration and smart tools in one
                space. <br />
                Plan, explore, and connect — all without losing the joy of
                discovery.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Our Vision for the Community
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Travel is more than destinations — it’s about the people and
                stories behind them. Tiragu connects curious travelers who
                explore with heart, not just with maps. I am creating a space
                where sharing journeys builds lasting bonds. Every explorer here
                belongs to a story bigger than their own.
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/About_page.jpg"
                alt="Tiragu Community"
                className="w-full h-180  object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
