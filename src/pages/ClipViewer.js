import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import LoadingBar from 'react-top-loading-bar';
import Pagination from '@mui/material/Pagination';
import background from '../media/background.jpg';
import placeholder from '../media/placeholder.png';
import banner1 from '../media/banner1.png';
import RatingModal from './components/clipViewer/RatingModal';
import DeniedClips from './components/clipViewer/DeniedClips';
import RatedClips from './components/clipViewer/RatedClips';

function ClipViewer() {
  const token = localStorage.getItem('token');
  const [clips, setClips] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [expandedClip, setExpandedClip] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [denyThreshold, setDenyThreshold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    sortClips(clips);
  }, [sortOption]);

  const fetchInitialData = async () => {
    try {
      await fetchUser();
      setProgress(10);
      await checkLoginStatus();
      setProgress(50);
      await fetchClipsAndRatings();
      setProgress(100);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('https://api.spoekle.com/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
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
      case 'newest':
        sortedClips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sortedClips.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
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

  // Pagination and sorting
  const indexOfLastClip = currentPage * itemsPerPage;
  const indexOfFirstClip = indexOfLastClip - itemsPerPage;
  const currentClips = clips.slice(indexOfFirstClip, indexOfLastClip);

  const totalPages = Math.ceil(clips.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen text-white relative bg-neutral-200 dark:bg-neutral-900">
      <div className='w-full'>
        <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
      </div>
      <div className="flex h-96 justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="flex bg-white/20 backdrop-blur-lg justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Clip Viewer</h1>
            <h1 className="text-3xl mb-4 text-center">Rate the clips!</h1>
          </div>
        </div>
      </div>
      <div className="grid justify-items-center text-white p-4 pt-8 bg-neutral-200 dark:bg-neutral-900 transition duration-200 justify-center items-center animate-fade"
      >
        <div className="text-center py-4 justify-center items-center z-30">
          <div className="pb-4 flex justify-center">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 py-2 px-4 rounded-md border-2 border-neutral-800 dark:border-white"
            >
              <option value="newest">Newest Clips</option>
              <option value="oldest">Oldest Clips</option>
              <option value="highestUpvotes">Highest Upvotes</option>
              <option value="highestDownvotes">Highest Downvotes</option>
              <option value="highestRatio">Highest Upvote/Downvote Ratio</option>
              <option value="lowestRatio">Lowest Upvote/Downvote Ratio</option>
            </select>
          </div>
        </div>
        <div className="container w-full mt-4 justify-center items-center rounded-md" style={{ backgroundImage: `url(${banner1})`, backgroundSize: 'cover' }}>
          <div className='h-full w-full bg-white/20 backdrop-blur-lg rounded-md'>
            <h2 className="p-4 text-center text-neutral-800 bg-white dark:bg-neutral-800 dark:text-white transition duration-200 backdrop-blur-sm rounded-t-md text-2xl font-bold drop-shadow-md mb-4">Clips</h2>
            <div className="flex justify-center">
              <div className="items-center bg-white justify-center rounded-md py-2 px-4">
                <Pagination
                  showFirstButton showLastButton
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => paginate(page)}
                />
              </div>
            </div>
            <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-4 relative animate-pulse drop-shadow-md">
                    <div className="overflow-hidden w-full text-center relative">
                      <div className='rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200 p-2'>
                        <img src={placeholder} alt="Logo" className="w-full rounded-lg border-white opacity-50" />
                      </div>
                    </div>
                    <div className="w-full flex justify-center bg-white dark:bg-neutral-900 transition duration-200 rounded-b-lg px-4 pt-2 pb-4">
                      <button
                        className="w-1/2 text-green-500 dark:text-green-800 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:text-white hover:bg-green-500 dark:hover:bg-green-800 transition duration-300 py-2 px-6 rounded-l-md"
                      >
                        <FaArrowUp className="mr-1" /> 420
                      </button>
                      <button
                        className="w-1/2 text-red-500 dark:text-red-800 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:text-white hover:bg-red-500 dark:hover:bg-red-800 transition duration-300 py-2 px-6 rounded-r-md"
                      >
                        <FaArrowDown className="mr-1" /> 69
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                currentClips.length > 0 ? (
                  currentClips
                    .filter(clip => {
                      if (isLoggedIn) {
                        const ratingData = ratings[clip._id];
                        return ratingData && !ratingData.ratingCounts.some(rateData => rateData.users.some(ratingUser => ratingUser.userId === user._id)) && ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count < denyThreshold);
                      } else {
                        return true;
                      }
                    })
                    .map(clip => (
                      <div key={clip._id} className="p-4 relative drop-shadow-md animate-fade">
                        <div className="overflow-hidden w-full text-center relative">
                          {isLoggedIn && (
                            <div className="flex justify-center">
                              <div className='absolute top-0 right-0 z-40 p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 rounded-md'>
                                <button
                                  className="text-lg font-bold p-1 bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white transition duration-200 hover:text-blue-500 rounded-sm"
                                  onClick={() => setExpandedClip(clip._id)}
                                >
                                  Rating!
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="absolute flex justify-center top-0 left-0 z-30 text-lg font-bold bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 p-2 rounded-md text-center">
                            <a href={clip.link} className='cursor-pointer'>{clip.streamer}</a>
                          </div>
                          <div className='rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200 p-2'>
                            <video
                              className="w-full rounded-lg border-white dark:border-neutral-800 transition duration-200"
                              src={`${clip.url}`}
                              controls
                            >
                            </video>
                          </div>
                        </div>
                        <div className="w-full flex justify-center bg-white dark:bg-neutral-900 transition duration-200 rounded-b-lg px-4 pt-2 pb-4">
                          <button
                            className="w-1/2 text-green-500 dark:text-green-800 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:text-white hover:bg-green-500 dark:hover:bg-green-800 transition duration-300 py-2 px-6 rounded-l-md"
                            onClick={() => upvoteClip(clip._id)}
                          >
                            <FaArrowUp className="mr-1" /> {clip.upvotes}
                          </button>
                          <button
                            className="w-1/2 text-red-500 dark:text-red-800 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:text-white hover:bg-red-500 dark:hover:bg-red-800 transition duration-300 py-2 px-6 rounded-r-md"
                            onClick={() => downvoteClip(clip._id)}
                          >
                            <FaArrowDown className="mr-1" /> {clip.downvotes}
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="my-2 mx-4 text-center bg-black/30 p-4 rounded-md font-semibold text-xl text-white col-span-full">No clips available.</div>
                )
              )}
            </div>

            <RatedClips isLoggedIn={isLoggedIn} isLoading={isLoading} setExpandedClip={setExpandedClip} currentClips={currentClips} ratings={ratings} denyThreshold={denyThreshold} upvoteClip={upvoteClip} downvoteClip={downvoteClip} user={user} />

          </div>
        </div>
        

        <RatingModal
          expandedClip={expandedClip}
          clips={clips}
          setExpandedClip={setExpandedClip}
          isLoggedIn={isLoggedIn}
          ratings={ratings}
          rateOrDenyClip={rateOrDenyClip}
        />
      </div>
    </div >
  );
}
// <DeniedClips isLoggedIn={isLoggedIn} isLoading={isLoading} deniedClips={deniedClips} setExpandedClip={setExpandedClip} />
export default ClipViewer;
