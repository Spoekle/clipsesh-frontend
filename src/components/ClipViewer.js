import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ClipViewer() {
  const [clips, setClips] = useState([]);

  useEffect(() => {
    fetchClips();
  }, []);

  async function fetchClips() {
    try {
      const response = await axios.get('/api/clips', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClips(response.data);
    } catch (error) {
      console.error('Error fetching clips:', error);
    }
  }

  async function rateClip(id, rating) {
    try {
      await axios.post(`/api/rate/${id}`, { rating }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchClips(); // Refresh clips after rating
    } catch (error) {
      console.error('Error rating clip:', error);
    }
  }

  async function upvoteClip(id) {
    try {
      await axios.post(`/api/clips/${id}/upvote`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchClips(); // Refresh clips after upvoting
    } catch (error) {
      console.error('Error upvoting clip:', error);
    }
  }

  async function downvoteClip(id) {
    try {
      await axios.post(`/api/clips/${id}/downvote`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchClips(); // Refresh clips after downvoting
    } catch (error) {
      console.error('Error downvoting clip:', error);
    }
  }

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Clip Viewer</h1>
      <h1 className="text-2xl mb-4">Rate the clips!</h1>
      <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip) => (
          <div key={clip._id} className="p-4">
            <div className="bg-gray-800 p-4 rounded-lg overflow-hidden relative">
              <video className="w-full max-w-md rounded-t-lg" src={clip.url} controls></video>
              <div className="flex justify-between items-center p-2 bg-blue-700 rounded-b-lg">
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 mr-2"
                  onClick={() => upvoteClip(clip._id)}
                >
                  Upvote
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  onClick={() => downvoteClip(clip._id)}
                >
                  Downvote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClipViewer;
