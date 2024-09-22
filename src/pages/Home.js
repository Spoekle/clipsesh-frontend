import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import background from '../media/background.jpg';
import banner1 from '../media/banner1.png';
import { FaYoutube } from 'react-icons/fa';
import cheerio from 'cheerio';

function HomePage() {
  const [latestVideo, setLatestVideo] = useState('');

  useEffect(() => {
    async function fetchLatestVideo() {
      try {
        const response = await fetch('https://www.youtube.com/playlist?list=PLwx5EB8PdMNf6dnNR7YCtOqWHkfU5kvFv');
        const text = await response.text();
        const $ = cheerio.load(text);
        const videoId = $('a.yt-simple-endpoint.style-scope.ytd-playlist-video-renderer').first().attr('href').split('=')[1];
        setLatestVideo(`https://www.youtube.com/watch?v=${videoId}`);
      } catch (error) {
        console.error('Error fetching latest video:', error);
      }
    }

    fetchLatestVideo();
  }, []);

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
        <div className="container grid grid-cols-1 md:grid-cols-2 justify-center items-center w-full h-full">
          <div className='w-auto m-4'>
            {latestVideo ? (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${latestVideo}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Latest YouTube Video"
              ></iframe>
            ) : (
              <p>Loading latest video...</p>
            )}
          </div>
          <div className="flex flex-col justify-center items-center m-4 p-4 bg-neutral-300 dark:bg-neutral-950 rounded-lg">
            <h1 className="text-3xl m-4 text-center">Watch the latest highlights here!</h1>
            <div className="flex flex-col justify-between mt-8">
              <Link to="https://www.youtube.com/@CubeCommunity">
                <button className="bg-cc-red text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                  YouTube <FaYoutube className="inline" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
