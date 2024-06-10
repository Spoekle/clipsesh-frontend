import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

function ClipViewer() {
  const token = localStorage.getItem('token');
  const [clips, setClips] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedClip, setExpandedClip] = useState(null);
  const [sortOption, setSortOption] = useState('highestUpvotes');
  const [denyThreshold, setDenyThreshold] = useState(0);

  useEffect(() => {
    checkLoginStatus();
    fetchInitialData();
  }, []);

  useEffect(() => {
    sortClips(clips);
  }, [sortOption]);

  const fetchInitialData = async () => {
    try {
      await fetchClipsAndRatings();
      fetchDenyThreshold();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchClipsAndRatings = async () => {
    try {
      const clipResponse = await axios.get('https://api.spoekle.com/api/clips');
      setClips(clipResponse.data);
      if (token) {
        const ratingPromises = clipResponse.data.map(clip =>
          axios.get(`https://api.spoekle.com/api/ratings/${clip._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        const ratingResponses = await Promise.all(ratingPromises);
        const ratingsData = ratingResponses.reduce((acc, res, index) => {
          acc[clipResponse.data[index]._id] = res.data;
          return acc;
        }, {});
        setRatings(ratingsData);
      }
      sortClips(clipResponse.data);
    } catch (error) {
      console.error('Error fetching clips and ratings:', error);
    }
  };

  const fetchDenyThreshold = async () => {
    try {
      const response = await axios.get('https://api.spoekle.com/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.length > 0) {
        setDenyThreshold(response.data[0].denyThreshold);
      }
    } catch (error) {
      console.error('Error fetching deny threshold:', error);
    }
  };

  const checkLoginStatus = () => {
    setIsLoggedIn(!!token);
  };

  const sortClips = (clipsToSort = clips) => {
    let sortedClips = [...clipsToSort];
    switch (sortOption) {
      case 'highestUpvotes':
        sortedClips.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'highestDownvotes':
        sortedClips.sort((a, b) => b.downvotes - a.downvotes);
        break;
      case 'highestRatio':
        sortedClips.sort((a, b) => {
          const ratioA = a.upvotes / (a.downvotes || 1);
          const ratioB = b.upvotes / (b.downvotes || 1);
          return ratioB - ratioA;
        });
        break;
      case 'lowestRatio':
        sortedClips.sort((a, b) => {
          const ratioA = a.upvotes / (a.downvotes || 1);
          const ratioB = b.upvotes / (b.downvotes || 1);
          return ratioA - ratioB;
        });
        break;
      default:
        break;
    }
    setClips(sortedClips);
  };

  const handleClickOutside = (event) => {
    if (event.target.className.includes('modal-overlay')) {
      setExpandedClip(null);
    }
  };

  const handleError = (error, action) => {
    if (error.response) {
      console.error(`Error ${action} clip:`, error.response.data);
      alert(`${error.response.data}`);
    } else {
      console.error(`Error ${action} clip:`, error.message);
      alert(`${error.message}`);
    }
  };

  const upvoteClip = async (id) => {
    try {
      const response = await axios.post(`https://api.spoekle.com/api/clips/${id}/upvote`);
      if (response.status === 200) {
        fetchClipsAndRatings();
      } else {
        console.error('Error upvoting clip:', response.data);
        alert(response.data);
      }
    } catch (error) {
      handleError(error, 'upvoting');
    }
  };

  const downvoteClip = async (id) => {
    try {
      const response = await axios.post(`https://api.spoekle.com/api/clips/${id}/downvote`);
      if (response.status === 200) {
        fetchClipsAndRatings();
      } else {
        console.error('Error downvoting clip:', response.data);
        alert(response.data);
      }
    } catch (error) {
      handleError(error, 'downvoting');
    }
  };

  const rateOrDenyClip = async (id, rating = null, deny = false) => {
    try {
      const data = rating !== null ? { rating } : { deny };
      await axios.post(`https://api.spoekle.com/api/rate/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClipsAndRatings();
    } catch (error) {
      alert('Error rating/denying clip:', error);
    }
  };

  const renderModal = () => {
    if (expandedClip === null) return null;
    const clip = clips.find((clip) => clip._id === expandedClip);

    return ReactDOM.createPortal(
      <div
        className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
        onClick={handleClickOutside}
      >
        <div className="modal-content bg-gray-800 p-4 rounded-lg relative">
          <button
            className="absolute top-0 right-0 m-4 text-white bg-red-700 rounded-md p-2"
            onClick={() => setExpandedClip(null)}
          >
            Close
          </button>
          <h2 className="text-2xl text-white font-bold mb-4">{clip.streamer}</h2>
          <div className="flex flex-col justify-center items-center">
            {isLoggedIn &&
              <div className="flex flex-col items-center mt-2">
                <div className="bg-gray-700 text-white p-4 rounded-lg mb-2">
                  <p className="text-center font-bold text-2xl mb-4">Ratings:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ratings[expandedClip] && ratings[expandedClip].ratingCounts ? (
                      ratings[expandedClip].ratingCounts.map((rateData) => (
                        <div
                          key={rateData.rating}
                          className={`bg-${rateData.rating === 'deny' ? 'red' : 'blue'}-800 text-white font-bold py-4 px-6 rounded-md text-center transition duration-300`}
                        >
                          <p className="text-xl">{rateData.rating === 'deny' ? 'Denied' : rateData.rating}</p>
                          <p className="text-lg mt-2">Total: {rateData.count}</p>
                          {rateData.users.length > 0 && (
                            <div>
                              <p className="text-sm mt-2">Users:</p>
                              {rateData.users.map(user => (
                                <p className="text-sm" key={user.userId}>{user.username}</p>
                              ))}
                            </div>
                          )}
                          {rateData.users.length === 0 && (
                            <p className="text-sm mt-2">{rateData.rating === 'deny' ? 'No denies' : 'No users'}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center w-full">
                  {[1, 2, 3, 4].map((rate) => (
                    <button
                      key={rate}
                      className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md transition duration-300 m-2"
                      onClick={() => rateOrDenyClip(clip._id, rate)}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center w-full">
                  <button
                    className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-md transition duration-300 mt-2 w-full md:w-auto"
                    onClick={() => rateOrDenyClip(clip._id, null, true)}
                  >
                    Deny
                  </button>
                </div>
              </div>
            }
          </div>  
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Clip Viewer</h1>
      <h1 className="text-2xl mb-4">Rate the clips!</h1>
      <div className="mb-4 flex justify-center">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-gray-700 text-white py-2 px-4 rounded-md"
        >
          <option value="highestUpvotes">Highest Upvotes</option>
          <option value="highestDownvotes">Highest Downvotes</option>
          <option value="highestRatio">Highest Upvote/Downvote Ratio</option>
          <option value="lowestRatio">Lowest Upvote/Downvote Ratio</option>
        </select>
      </div>
      <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips
          .filter(clip => {
            if (isLoggedIn) {
              const ratingData = ratings[clip._id];
              return ratingData && ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count < denyThreshold);
            } else {
              return true;
            }
          })
          .map((clip) => (
            <div key={clip._id} className="p-4 relative">
              <div className="bg-gray-800 p-4 rounded-lg overflow-hidden relative">
                <div className="overflow-hidden w-full text-center">
                  <div className="text-lg font-bold mb-2 text-center">{clip.streamer}</div>
                  {isLoggedIn &&
                    <div className="flex justify-center">
                      <button
                        className="absolute top-0 right-0 m-2 mr-4 text-white bg-gray-600 rounded-md p-2"
                        onClick={() => setExpandedClip(clip._id)}
                      >
                        Rating!
                      </button>
                    </div>
                  }
                  <video
                    className="w-full rounded-t-lg"
                    src={`https://api.spoekle.com${clip.url}`}
                    controls
                  ></video>
                </div>
                <div className="flex justify-center bg-gray-700 rounded-b-lg p-4">
                  <button
                    className="text-green-500 mr-2 flex items-center bg-gray-600 hover:text-white hover:bg-green-500 transition duration-300 py-4 px-3 rounded-md"
                    onClick={() => upvoteClip(clip._id)}
                  >
                    <FaArrowUp className="mr-1" /> {clip.upvotes}
                  </button>
                  <button
                    className="text-red-500 ml-2 flex items-center bg-gray-600 hover:text-white hover:bg-red-500 transition duration-300 py-4 px-3 rounded-md"
                    onClick={() => downvoteClip(clip._id)}
                  >
                    <FaArrowDown className="mr-1" /> {clip.downvotes}
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      {isLoggedIn &&
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Denied Clips</h2>
          <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips
              .filter(clip => {
                const ratingData = ratings[clip._id];
                return ratingData && ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count >= denyThreshold);
              })
              .map((clip) => (
                <div key={clip._id} className="p-4 relative">
                  <div className="bg-gray-800 p-4 rounded-lg overflow-hidden relative">
                    <div className="overflow-hidden w-full text-center">
                      <div className="text-lg font-bold mb-2 text-center">{clip.streamer}</div>
                      {isLoggedIn &&
                        <div className="flex justify-center">
                          <button
                            className="absolute top-0 right-0 m-2 mr-4 text-white bg-gray-600 rounded-md p-2"
                            onClick={() => setExpandedClip(clip._id)}
                          >
                            Rating!
                          </button>
                        </div>
                      }
                      <video
                        className="w-full rounded-t-lg"
                        src={`https://api.spoekle.com${clip.url}`}
                        controls
                      ></video>
                    </div>
                    <div className="flex flex-col justify-between items-center p-2 bg-red-700 rounded-b-lg">
                      <div className="flex justify-center mb-2">
                        <p>Clip has been denied.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      }
      {renderModal()}
    </div>
  );
}

export default ClipViewer;
