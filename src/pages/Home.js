import React from 'react';
import { Link } from 'react-router-dom';
import background from '../media/background.jpg';
import banner1 from '../media/banner1.png';

function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-neutral-900 text-neutral-900 dark:text-white relative">
      <div className="flex h-96 justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="flex bg-white/20 backdrop-blur-lg justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-center">ClipSesh!</h1>
            <p className="text-2xl text-center">A new generation for Seasonal Highlights!</p>
          </div>
        </div>
      </div>
      <div className="flex-grow flex flex-col p-4 pt-8 bg-neutral-200 dark:bg-neutral-900 transition duration-200 justify-center items-center">
        <div className="container grid grid-cols-1 md:grid-cols-2 justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center m-4 p-4 bg-neutral-300 dark:bg-neutral-950 rounded-lg">
            <p className="text-xl m-4 text-center">Content Cubes come together to rate YOUR clips for the highlights!</p>
            <p className="text-xl m-4 text-center">Now everyone can upvote or downvote clips to influence how the highlights will play out</p>
            <div className="flex flex-col justify-between mt-8">
              <Link to="/clips">
                <button className="bg-white text-cc-blue hover:bg-cc-red hover:text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                  View Clips
                </button>
              </Link>
            </div>
          </div>
          <div className='w-auto m-4'>
            <img src={banner1} alt="Banner" className='rounded-lg' />
          </div>
        </div>
      </div>
      <div className="flex-grow flex flex-col justify-center items-center" style={{ backgroundImage: `url(${banner1})`, backgroundSize: 'cover' }}>
      </div>
    </div>
  );
}

export default HomePage;