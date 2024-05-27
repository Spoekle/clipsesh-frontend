import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ClipViewer() {
  const [clips, setClips] = useState([]);

  useEffect(() => {
    fetchClips();
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

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Clip Viewer</h1>
      <h1 className="text-2xl mb-4">Rate the clips!</h1>
      <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip) => (
          <div key={clip._id} className="p-4 bg-gray-800 rounded-lg flex flex-col items-center">
            <div className="overflow-hidden w-full mb-2">
              <div className="text-lg font-bold mb-2">{clip.streamer}</div>
              <video className="w-full rounded-t-lg" src={`https://api.spoekle.com${clip.url}`} controls></video>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-500 rounded-b-lg w-full">
              {[1, 2, 3, 4].map((rate) => (
                <button
                  key={rate}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-1/4 px-4 py-2 mx-2 rounded-md transition duration-300"
                  onClick={() => rateClip(clip._id, rate)}
                >
                  {rate}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClipViewer;