import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';
import Pagination from '@mui/material/Pagination';

import winterBg from '../media/winter.webp';
import springBg from '../media/spring.jpg';
import summerBg from '../media/summer.jpg';
import fallBg from '../media/fall.jpg';

import placeholder from '../media/placeholder.png';
import DeniedClips from './components/clipViewer/DeniedClips';
import ClipContent from './components/clipViewer/ClipContent';
import ClipItem from './components/clipViewer/ClipItem';

function ClipViewer() {
  const { clipId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortOption = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;
  const location = useLocation();
  const token = localStorage.getItem('token');

  const [unratedClips, setUnratedClips] = useState([]);
  const [filterRatedClips, setFilterRatedClips] = useState(() => {
    const storedValue = localStorage.getItem('filterRatedClips');
    return storedValue === 'true' ? true : false;
  });
  const [ratedClips, setRatedClips] = useState([]);
  const [deniedClips, setDeniedClips] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentClip, setCurrentClip] = useState(null);
  const [expandedClip, setExpandedClip] = useState(clipId || null);
  const [sortOptionState, setSortOptionState] = useState(sortOption);
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [seasonInfo, setSeasonInfo] = useState({ season: '' });
  const [itemsPerPage] = useState(6);
  const [isClipLoading, setIsClipLoading] = useState(false);

  // Memoized fetchClipsAndRatings to prevent unnecessary re-creations
  const fetchClipsAndRatings = useCallback(async (userData, filterRated) => {
    try {
      setIsLoading(true);
      const clipResponse = await axios.get('https://api.spoekle.com/api/clips');
      const clipsData = clipResponse.data;

      if (userData && (userData.role === 'clipteam' || userData.role === 'admin')) {
        const ratingPromises = clipsData.map((clip) =>
          axios.get(`https://api.spoekle.com/api/ratings/${clip._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        // Assuming fetchConfig is defined elsewhere
        await fetchConfig();

        const ratingResponses = await Promise.all(ratingPromises);
        const ratingsData = ratingResponses.reduce((acc, res, index) => {
          acc[clipsData[index]._id] = res.data;
          return acc;
        }, {});
        setRatings(ratingsData);

        if (filterRated) {
          // Filter Denied Clips Only If FilterRatedClips is True
          filterDeniedClips(clipsData, ratingsData);

          const rated = [];
          const unrated = [];
          clipsData.forEach((clip) => {
            const ratingData = ratingsData[clip._id];
            if (
              ratingData &&
              ratingData.ratingCounts.some((rateData) =>
                rateData.users.some((ratingUser) => ratingUser.userId === userData._id)
              )
            ) {
              rated.push(clip);
            } else {
              unrated.push(clip);
            }
          });
          const sortedUnrated = sortClips(unrated, sortOption);

          setRatedClips(rated);
          setUnratedClips(sortedUnrated);
        } else {
          const sortedUnrated = sortClips(clipsData, sortOption);
          setRatedClips([]);
          setUnratedClips(sortedUnrated);
          setDeniedClips([]); // Clear denied clips when filter is inactive
        }
      } else {
        // If not 'clipteam' or 'admin', set all clips to unratedClips and clear ratings
        setRatedClips([]);
        const sortedUnrated = sortClips(clipsData, sortOption);
        setUnratedClips(sortedUnrated);
        setRatings({});
        setDeniedClips([]);
      }
    } catch (error) {
      console.error('Error fetching clips and ratings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, sortOption]);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await axios.get('https://api.spoekle.com/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoggedIn(true);
        setUser(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsLoggedIn(false);
        setUser(null);
        return null;
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      return null;
    }
  }, [token]);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    try {
      const userData = await fetchUser();
      getSeason(); // Assuming getSeason is defined elsewhere
      setProgress(50);
      await fetchClipsAndRatings(userData, filterRatedClips);
      setProgress(100);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, [fetchUser, fetchClipsAndRatings, filterRatedClips]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData, location.search]);

  useEffect(() => {
    // Update localStorage whenever filterRatedClips changes
    localStorage.setItem('filterRatedClips', filterRatedClips);

    // Fetch clips and ratings based on the current filter
    fetchClipsAndRatings(user, filterRatedClips);
  }, [filterRatedClips, fetchClipsAndRatings, user]);

  useEffect(() => {
    if (expandedClip && expandedClip !== 'new') {
      setIsClipLoading(true);
      axios
        .get(`https://api.spoekle.com/api/clips/${expandedClip}`)
        .then((response) => {
          setCurrentClip(response.data);
          setIsClipLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching clip:', error);
          setIsClipLoading(false);
        });
    }
  }, [expandedClip]);

  const filterDeniedClips = (clipsData, ratingsData) => {
    const denied = [];
    const threshold = config.denyThreshold || 3;
    clipsData.forEach((clip) => {
      const ratingData = ratingsData[clip._id];
      if (
        ratingData &&
        ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count >= threshold)
      ) {
        denied.push(clip);
      }
    });
    console.log(denied);

    // Sort the denied array
    const sortedDenied = sortClips(denied, sortOption);

    // Set State
    setDeniedClips(sortedDenied);
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get('https://api.spoekle.com/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.length > 0) {
        setConfig(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching deny threshold:', error);
    }
  };

  const sortClips = (clipsToSort, option) => {
    let sortedClips = [...clipsToSort];
    switch (option) {
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
    return sortedClips;
  };

  const getSeason = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    let season = '';

    if (currentMonth >= 0 && currentMonth <= 2) {
      season = 'Winter';
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      season = 'Spring';
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      season = 'Summer';
    } else {
      season = 'Fall';
    }

    setSeasonInfo((prevSeasonInfo) => ({
      ...prevSeasonInfo,
      season,
    }));
  };

  // Pagination and sorting
  const indexOfLastClip = currentPage * itemsPerPage;
  const indexOfFirstClip = indexOfLastClip - itemsPerPage;

  const currentClips = unratedClips.slice(indexOfFirstClip, indexOfLastClip);

  const totalPages = Math.ceil(unratedClips.length / itemsPerPage);

  const paginate = (event, pageNumber) => {
    setCurrentPage(pageNumber);
    setSearchParams({ sort: sortOption, page: pageNumber });
  };

  const renderContent = () => {
    if (expandedClip === 'new') {
      //return <NewClipForm setExpandedPost={setExpandedClip} fetchClips={fetchClipsAndRatings} />;
    } else if (expandedClip) {
      if (isClipLoading) {
        return <div className="text-center py-8">Loading clip...</div>;
      } else if (currentClip) {
        return (
          <ClipContent
            clip={currentClip}
            setExpandedClip={setExpandedClip}
            isLoggedIn={isLoggedIn}
            user={user}
            token={token}
            fetchClipsAndRatings={fetchClipsAndRatings}
            ratings={ratings}
            searchParams={searchParams}
          />
        );
      } else {
        return <div className="text-center py-8">Clip not found.</div>;
      }
    } else {
      if (isLoading) {
        return <div className="text-center py-8">Loading Clips...</div>;
      } else {
        return (
          <div
            className="grid justify-items-center text-white bg-neutral-200 dark:bg-neutral-900 transition duration-200 justify-center items-center animate-fade"
          >
            <div className="text-center py-4 justify-center items-center z-30">
              <div className="mb-4 flex justify-center">
                <select
                  value={sortOptionState}
                  onChange={(e) => {
                    const newSortOption = e.target.value;
                    setSortOptionState(newSortOption);
                    const sorted = sortClips(unratedClips, newSortOption);
                    setUnratedClips(sorted);
                    setSearchParams({ sort: newSortOption, page: currentPage });
                  }}
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
              {user && (user.role === 'clipteam' || user.role === 'admin') && (
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => {
                      setFilterRatedClips((prev) => !prev);
                    }}
                    className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 py-2 px-4 rounded-md border-2 border-neutral-800 dark:border-white"
                  >
                    {filterRatedClips ? 'Show Rated Clips' : 'Hide Rated Clips'}
                  </button>
                </div>
              )}
            </div>
            <div className="container w-full min-w-full mt-4 justify-center items-center rounded-2xl animate-fade animate-delay-500">
              <div className="h-full w-full min-w-full bg-white/30 dark:bg-black/30 dark:text-white transition duration-200 backdrop-blur-lg rounded-2xl">
                <div className="p-4 w-full min-w-full justify-center gap-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <div key={index} className="shadow-2xl relative animate-pulse drop-shadow-md">
                        <div className="overflow-hidden w-full text-center relative shadow-2xl">
                          <div className="rounded-lg bg-white dark:bg-neutral-800 transition duration-200 p-2">
                            <img src={placeholder} alt="Loading..." className="w-full rounded-lg border-white opacity-50" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : currentClips.length > 0 ? (
                    currentClips
                      .filter((clip) => {
                        if (filterRatedClips) {
                          if (user && (user.role === 'clipteam' || user.role === 'admin')) {
                            const ratingData = ratings[clip._id];
                            return (
                              ratingData &&
                              ratingData.ratingCounts.some(
                                (rateData) => rateData.rating === 'deny' && rateData.count < config.denyThreshold
                              )
                            );
                          }
                        }

                        return true;
                      })
                      .map((clip) => {
                        const hasUserRated =
                          user &&
                          ratings[clip._id] &&
                          ratings[clip._id].ratingCounts.some((rateData) =>
                            rateData.users.some((u) => u.userId === user._id)
                          );
          
                        return (
                          <ClipItem
                            key={clip._id}
                            clip={clip}
                            hasUserRated={hasUserRated}
                            setExpandedClip={setExpandedClip}
                          />
                        );
                      })
                  ) : (
                    <div>No clips available.</div>
                  )}
                </div>
                <div className="flex justify-center">
                  <div className="items-center bg-white justify-center rounded-md mb-4 py-2 px-4">
                    <Pagination
                      showFirstButton
                      showLastButton
                      count={totalPages}
                      page={currentPage}
                      onChange={paginate}
                    />
                  </div>
                </div>
              </div>
            </div>
            {filterRatedClips &&
              <DeniedClips
                isLoading={isLoading}
                deniedClips={deniedClips}
                setExpandedClip={setExpandedClip}
                user={user}
              />
            }
          </div>
        );
      };
    };
  };

  return (
    <div className="min-h-screen w-full top-0 text-white absolute bg-neutral-200 dark:bg-neutral-900 transition duration-200 overflow-hidden">
      <div className="w-full">
        <LoadingBar
          color="#f11946"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
        />
      </div>
      <div
        className="flex h-96 justify-center items-center drop-shadow-xl animate-fade"
        style={{
          backgroundImage: `url(${seasonInfo.season === 'Winter'
            ? winterBg
            : seasonInfo.season === 'Spring'
              ? springBg
              : seasonInfo.season === 'Summer'
                ? summerBg
                : fallBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex bg-black/20 backdrop-blur-lg justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Clip Viewer</h1>
            <h1 className="text-3xl mb-4 text-center">Rate the clips!</h1>
          </div>
        </div>
      </div>

      <div className="container justify-self-center text-white p-4 pt-8 bg-neutral-200 dark:bg-neutral-900 transition duration-200 justify-center items-center animate-fade">
        {renderContent()}
      </div>
    </div>
  );
};

export default ClipViewer;