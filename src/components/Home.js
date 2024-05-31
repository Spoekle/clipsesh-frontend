import React from 'react';
import image1 from '../media/CC250.png';
import image2 from '../media/CC250.png';

const HomePage = () => {
  return (
    <div className="bg-gradient-to-r from-cc-blue to-cc-red min-h-screen flex flex-col justify-center items-center text-white">
      <h1 className="text-5xl font-bold mb-8">Welcome to ClipSesh!</h1>
      <p className="text-xl mb-8">A new generation for Seasonal Highlights!</p>
      <p className="text-xl mb-8">Content Cubes come together to rate YOUR clips for the highlights!</p>
      <p className="text-xl mb-8">Now everyone can upvote or downvote clips to influence how the highlights will play out</p>
      <div className="flex justify-between w-64 mt-8">
        <button className="bg-white text-cc-blue hover:bg-cc-red hover:text-white font-bold w-1/2 py-3 px-6 ml-4 rounded-full shadow-lg transition duration-300">
          Login
        </button>
        <button className="bg-white text-cc-blue hover:bg-cc-red hover:text-white font-bold w-1/2 py-3 px-6 mr-4 rounded-full shadow-lg transition duration-300">
          View Clips
        </button>
      </div>
    </div>
  );
}

export default HomePage;
