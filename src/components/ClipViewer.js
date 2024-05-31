import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

function ClipViewer() {
  const [clips, setClips] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  useEffect(() => {
    fetchClips();
    checkLoginStatus(); // Check login status when component mounts
  }, []);

  async function fetchClips() {
    try {
      const response = await axios.get('https://api.spoekle.com/api/clips');
      setClips(response.data);
    } catch (error) {
      console.error('Error fetching clips:', error);
    }
  }

  async function rateClip(id, rating) {
    try {
      await axios.post(`https://api.spoekle.com/api/rate/${id}`, { rating });
      fetchClips(); // Refresh clips after rating
    } catch (error) {
      console.error('Error rating clip:', error);
    }
  }

  async function upvoteClip(id) {
    try {
      await axios.post(`https://api.spoekle.com/api/clips/${id}/upvote`);
      fetchClips(); // Refresh clips after upvoting
    } catch (error) {
      console.error('Error upvoting clip:', error);
    }
  }

  async function downvoteClip(id) {
    try {
      await axios.post(`https://api.spoekle.com/api/clips/${id}/downvote`);
      fetchClips(); // Refresh clips after downvoting
    } catch (error) {
      console.error('Error downvoting clip:', error);
    }
  }

  async function checkLoginStatus() {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Update login status based on token presence
  }

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Clip Viewer</h1>
      <h1 className="text-2xl mb-4">Rate the clips!</h1>
      <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip) => (
          <div key={clip._id} className="p-4 relative">
            <div className="bg-gray-800 p-4 rounded-lg overflow-hidden relative">
            <div className="overflow-hidden w-full mb-2">
              <div className="text-lg font-bold mb-2">{clip.streamer}</div>
                <video className="w-full rounded-t-lg" src={`https://api.spoekle.com${clip.url}`} controls></video>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-700 rounded-b-lg">
                {isLoggedIn &&
                  [1, 2, 3, 4].map((rate) => (
                    <button
                      key={rate}
                      className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition duration-300 mr-2"
                      onClick={() => rateClip(clip._id, rate)}
                    >
                      {rate}
                    </button>
                  ))}
                <div className="flex">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l-md transition duration-300 relative flex items-center"
                    onClick={() => upvoteClip(clip._id)}
                  >
                    <FaArrowUp />
                    <span className="ml-1">{clip.upvotes}</span>
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-300 relative flex items-center"
                    onClick={() => downvoteClip(clip._id)}
                  >
                    <FaArrowDown />
                    <span className="ml-1">{clip.downvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClipViewer;
