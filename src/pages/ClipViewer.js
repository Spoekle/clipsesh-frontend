import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { BiLoaderCircle } from 'react-icons/bi';
import LoadingBar from 'react-top-loading-bar';
import background from '../media/background.jpg';
import Navbar from './components/Navbar';

function ClipViewer() {
  const token = localStorage.getItem('token');
  const [clips, setClips] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedClip, setExpandedClip] = useState(null);
  const [sortOption, setSortOption] = useState('highestUpvotes');
  const [denyThreshold, setDenyThreshold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkLoginStatus();
    fetchInitialData();
  }, []);

  useEffect(() => {
    sortClips(clips);
  }, [sortOption]);

  const fetchInitialData = async () => {
    try {
      setProgress(10);
      await fetchClipsAndRatings();
      setProgress(50);
      setProgress(100);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClipsAndRatings = async () => {
    try {
      setIsLoading(true);
      const clipResponse = await axios.get('https://api.spoekle.com/api/clips');
      setClips(clipResponse.data);
      if (token) {
        const ratingPromises = clipResponse.data.map(clip =>
          axios.get(`https://api.spoekle.com/api/ratings/${clip._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        await fetchDenyThreshold();
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
    } finally {
      setIsLoading(false);
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

  const deniedClips = clips.filter(clip => {
    const ratingData = ratings[clip._id];
    return ratingData && ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count >= denyThreshold);
  });

  const renderModal = () => {
    if (expandedClip === null) return null;
    const clip = clips.find((clip) => clip._id === expandedClip);

    return ReactDOM.createPortal(
      <div
        className="modal-overlay fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-50"
        onClick={handleClickOutside}
      >
        <div className="modal-content bg-neutral-700 p-4 rounded-lg relative animate-fade-up">
          <button
            className="absolute top-0 right-0 m-4 text-white bg-red-700 hover:bg-red-800 transition duration-300 rounded-md p-2"
            onClick={() => setExpandedClip(null)}
          >
            Close
          </button>
          <h2 className="text-2xl text-white font-bold mb-4">{clip.streamer}</h2>
          <div className="flex flex-col justify-center items-center">
            {isLoggedIn &&
              <div className="flex flex-col items-center mt-2">
                <div className="bg-black/30 text-white p-4 rounded-lg mb-2">
                  <p className="text-center font-bold text-2xl mb-4">Ratings:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ratings[expandedClip] && ratings[expandedClip].ratingCounts ? (
                      ratings[expandedClip].ratingCounts.map((rateData) => (
                        <div
                          key={rateData.rating}
                          className={`bg-${rateData.rating === 'deny' ? 'red' : 'blue'}-700 text-white font-bold py-4 px-6 rounded-md text-center transition duration-300`}
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
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition duration-300 m-2"
                      onClick={() => rateOrDenyClip(clip._id, rate)}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center w-full">
                  <button
                    className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md transition duration-300 mt-2 w-full md:w-auto"
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
    <div className="text-white min-h-screen relative bg-neutral-900">
      <div className="relative h-64" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-20% to-cc-red filter backdrop-blur-md"></div>
      </div>
      <div className='absolute top-0 w-full z-50'>
        <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
        <Navbar />
      </div>
      <div className="text-white">
        <div className="text-center py-4 bg-cc-red justify-center items-center z-30">
          <h1 className="text-4xl font-bold mb-4">Clip Viewer</h1>
          <h1 className="text-3xl mb-4">Rate the clips!</h1>
          <div className="pb-4 flex justify-center">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white text-neutral-800 py-2 px-4 rounded-md"
            >
              <option value="highestUpvotes">Highest Upvotes</option>
              <option value="highestDownvotes">Highest Downvotes</option>
              <option value="highestRatio">Highest Upvote/Downvote Ratio</option>
              <option value="lowestRatio">Lowest Upvote/Downvote Ratio</option>
            </select>
          </div>
        </div>
        <div className="pt-8 bg-gradient-to-b from-cc-red from-20% to-neutral-900">
          {isLoading ? (
            <div className="flex justify-center items-center space-x-2">
              <BiLoaderCircle className="animate-spin h-5 w-5 text-white" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <h2 className="p-4 mx-4 text-center bg-cc-blue backdrop-blur-sm rounded-md text-2xl font-bold mb-4">Clips</h2>
              <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clips.length > 0 ? (
                  clips
                    .filter(clip => {
                      if (isLoggedIn) {
                        const ratingData = ratings[clip._id];
                        return ratingData && ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count < denyThreshold);
                      } else {
                        return true;
                      }
                    })
                    .map(clip => (
                      <div key={clip._id} className="p-4 relative animate-fade-up">
                        <div className="bg-white/30 p-4 rounded-lg overflow-hidden relative">
                          <div className="overflow-hidden w-full text-center">
                            <div className="text-lg font-bold mb-2 bg-black/30 p-2 rounded-md text-center">{clip.streamer}</div>
                            {isLoggedIn && (
                              <div className="flex justify-center">
                                <button
                                  className="absolute top-0 right-0 p-2 m-4 mr-4 text-neutral-800 text-lg font-bold bg-white hover:bg-blue-600 hover:text-white transition duration-300 rounded-md"
                                  onClick={() => setExpandedClip(clip._id)}
                                >
                                  Rating!
                                </button>
                              </div>
                            )}
                            <video
                              className="w-full rounded-t-lg border-8 border-white"
                              src={`https://api.spoekle.com${clip.url}`}
                              controls
                            ></video>
                          </div>
                          <div className="flex justify-center bg-white rounded-b-lg px-4 pt-2 pb-4">
                            <button
                              className="text-green-500 mr-4 flex items-center bg-neutral-100 hover:text-white hover:bg-green-500 transition duration-300 py-4 px-6 rounded-md"
                              onClick={() => upvoteClip(clip._id)}
                            >
                              <FaArrowUp className="mr-1" /> {clip.upvotes}
                            </button>
                            <button
                              className="text-red-500 ml-4 flex items-center bg-neutral-100 hover:text-white hover:bg-red-500 transition duration-300 py-4 px-6 rounded-md"
                              onClick={() => downvoteClip(clip._id)}
                            >
                              <FaArrowDown className="mr-1" /> {clip.downvotes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="mt-2 mx-4 text-center bg-black/30 p-4 rounded-md font-semibold text-xl text-white col-span-full">No clips available.</div>
                )}
              </div>
            </>
          )}
        </div>

        {isLoggedIn && (
          <div className="pt-8 bg-gradient-to-b from-neutral-900 via-cc-blue via-30% to-neutral-900">
            {isLoading ? (
              <div className="flex justify-center items-center space-x-2">
                <BiLoaderCircle className="animate-spin h-5 w-5 text-white" />
                <span>Loading...</span>
              </div>
            ) : (
              <div>
                <h2 className="p-4 mx-4 text-center bg-red-700 backdrop-blur-sm rounded-md text-2xl font-bold mb-4">Denied Clips</h2>
                <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deniedClips.length > 0 ? (
                    deniedClips.map((clip) => (
                      <div key={clip._id} className="p-4 relative animate-fade-in">
                        <div className="bg-red-700/30 p-4 rounded-lg overflow-hidden relative">
                          <div className="overflow-hidden w-full text-center">
                            <div className="text-lg font-bold mb-2 bg-black/30 p-2 rounded-md text-center">{clip.streamer}</div>
                            {isLoggedIn && (
                              <div className="flex justify-center">
                                <button
                                  className="absolute top-0 right-0 p-2 m-4 mr-4 text-neutral-800 text-lg font-bold bg-white hover:bg-blue-600 hover:text-white transition duration-300 rounded-md"
                                  onClick={() => setExpandedClip(clip._id)}
                                >
                                  Rating!
                                </button>
                              </div>
                            )}
                            <video
                              className="w-full rounded-t-lg border-8 border-red-700"
                              src={`https://api.spoekle.com${clip.url}`}
                              controls
                            ></video>
                          </div>
                          <div className="flex flex-col justify-between items-center p-2 bg-red-700 rounded-b-lg">
                            <div className="flex justify-center mb-2">
                              <p className='text-xl font-bold'>
                                Clip has been denied.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="mt-2 mx-4 text-center bg-black/30 p-4 rounded-md font-semibold text-xl text-white col-span-full">No denied clips available.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {renderModal()}
      </div>
    </div>
  );
}

export default ClipViewer;
