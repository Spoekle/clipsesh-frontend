import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

function ClipViewer() {
  const token = localStorage.getItem('token');
  const [clips, setClips] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [expandedClip, setExpandedClip] = useState(null); // Track the expanded clip for rating counts
  const ratingCountsRef = useRef(null);

  useEffect(() => {
    fetchClips();
    checkLoginStatus(); // Check login status when component mounts
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ratingCountsRef.current && !ratingCountsRef.current.contains(event.target)) {
        setExpandedClip(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ratingCountsRef]);

  async function fetchClips() {
    try {
      const response = await axios.get('https://api.spoekle.com/api/clips');
      setClips(response.data);
    } catch (error) {
      console.error('Error fetching clips:', error);
    }
  }

  async function upvoteClip(id) {
    try {
      const response = await axios.post(`https://api.spoekle.com/api/clips/${id}/upvote`);
      if (response.status === 200) {
        fetchClips(); // Refresh clips after upvoting
      } else {
        console.error('Error upvoting clip:', response.data);
        alert(`${response.data}`);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error upvoting clip:', error.response.data);
        alert(`${error.response.data}`);
      } else {
        console.error('Error upvoting clip:', error.message);
        alert(`${error.message}`);
      }
    }
  }

  async function downvoteClip(id) {
    try {
      const response = await axios.post(`https://api.spoekle.com/api/clips/${id}/downvote`);
      if (response.status === 200) {
        fetchClips(); // Refresh clips after downvoting
      } else {
        console.error('Error downvoting clip:', response.data);
        alert(`${response.data}`);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error downvoting clip:', error.response.data);
        alert(`${error.response.data}`);
      } else {
        console.error('Error downvoting clip:', error.message);
        alert(`${error.message}`);
      }
    }
  }

  async function rateClip(id, rating) {
    try {
      await axios.post(`https://api.spoekle.com/api/rate/${id}`, { rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClips(); // Refresh clips after rating
    } catch (error) {
      alert('Error rating clip:', error);
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
              <div className="overflow-hidden w-full text-center">
                <div className="text-lg font-bold mb-2 text-center">{clip.streamer}</div>
                <video className="w-full rounded-t-lg" src={`https://api.spoekle.com${clip.url}`} controls></video>
              </div>
              <div ref={ratingCountsRef} className="flex justify-between items-center p-2 bg-blue-700 rounded-b-lg">
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
              <div className="mt-2">
                {expandedClip === clip._id ? (
                  <div className="bg-gray-700 text-white p-4 rounded-lg">
                    <p className="text-center font-bold">Ratings:</p>
                    <p className="text-center">1: {clip.ratingCounts.rating1}</p>
                    <p className="text-center">2: {clip.ratingCounts.rating2}</p>
                    <p className="text-center">3: {clip.ratingCounts.rating3}</p>
                    <p className="text-center">4: {clip.ratingCounts.rating4}</p>
                  </div>
                ) : (
                  <button
                    className="bg-gray-700 text-white py-2 px-4 rounded-md w-full"
                    onClick={() => setExpandedClip(clip._id)}
                  >
                    Show Ratings
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClipViewer;
