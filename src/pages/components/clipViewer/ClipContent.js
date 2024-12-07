import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaThumbsUp, FaThumbsDown, FaAngleDown } from 'react-icons/fa';
import MessageComponent from './MessageComponent';

const ClipContent = ({ clip, setExpandedClip, isLoggedIn, user, token, fetchClipsAndRatings, ratings, searchParams }) => {
  const [currentClip, setCurrentClip] = useState(clip);
  const [newComment, setNewComment] = useState('');
  const [popout, setPopout] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || { pathname: '/clips', search: '' };

  useEffect(() => {
    console.log(from.search)
  }, [from])

  if (!currentClip) {
    return <div>Loading...</div>;
  }

  const closeExpandedClip = () => {
    setExpandedClip(null);
    navigate({
      pathname: from.pathname,
      search: from.search
    });
  };

  const rateOrDenyClip = async (id, rating = null, deny = false) => {
    try {
      const data = rating !== null ? { rating } : { deny };
      await axios.post(`https://api.spoekle.com/api/rate/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchClipsAndRatings(user, isLoggedIn);
    } catch (error) {
      alert('Error rating/denying clip:', error);
    }
  };

  const handleUpvote = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `https://api.spoekle.com/api/clips/${currentClip._id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentClip(response.data);
    } catch (error) {
      console.error('Error upvoting clip:', error);
    }
  };

  const handleDownvote = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `https://api.spoekle.com/api/clips/${currentClip._id}/downvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentClip(response.data);
    } catch (error) {
      console.error('Error downvoting clip:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `https://api.spoekle.com/api/clips/${currentClip._id}/comment`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentClip(response.data);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.delete(
          `https://api.spoekle.com/api/clips/${currentClip._id}/comment/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentClip(response.data);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleDeleteClip = async () => {
    if (window.confirm('Are you sure you want to delete this clip?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`https://api.spoekle.com/api/clips/${currentClip._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        closeExpandedClip();
      } catch (error) {
        console.error('Error deleting clip:', error);
      }
    }
  };

  return (
    <div className="p-4 animate-fade">
      <div className="flex justify-between items-center bg-neutral-950 p-2 rounded-t-xl">
        <Link
          className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg"
          to={from}
          onClick={closeExpandedClip}
        >
          Back
        </Link>
      </div>
      <div className="bg-neutral-800 flex-grow p-4 overflow-auto">
        <div className="flex-col flex-grow">
          <div className="rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200">
            <video
              className="w-full rounded-lg border-white dark:border-neutral-800 transition duration-200"
              src={`${clip.url}`}
              controls
            >
            </video>
          </div>
        </div>
        <div className="flex flex-col justify-between my-2">
          <h1 className="text-2xl text-white font-bold mb-2">Clip Info:</h1>
          <a
            href={currentClip.link}
            className="text-xl text-white font-bold underline hover:text-blue-600"
            target="_blank"
            rel="noreferrer"
          >
            {currentClip.title}
          </a>
          <h2 className="text-xl text-white font-semibold">{currentClip.streamer}</h2>
          <p className="text-sm text-white">Uploaded on: {new Date(currentClip.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-between p-4 bg-neutral-700 rounded-b-xl">
        <div className="flex justify-center md:justify-start items-center">
          <button
            className="flex items-center bg-green-600 hover:bg-white p-4 px-6 rounded-l-lg text-white hover:text-green-600 transition duration-200"
            onClick={handleUpvote}
          >
            <FaThumbsUp className="mr-1" /> {currentClip.upvotes}
          </button>
          <button
            className="flex items-center bg-red-600 hover:bg-white p-4 px-6 rounded-r-lg text-white hover:text-red-600 transition duration-200"
            onClick={handleDownvote}
          >
            <FaThumbsDown className="mr-1" /> {currentClip.downvotes}
          </button>
        </div>
        {user && user.role && (user.role === 'clipteam' || user.role === 'admin') && (
          <div className="text-neutral-900 p-2 drop-shadow-md rounded-lg mb-2">
            <div className="flex justify-center w-full">
              {[1, 2, 3, 4].map((rate) => {
                // Find if the user has rated and with which rating
                const userRatingData = ratings[clip._id]?.ratingCounts.find(
                  (rateData) => rateData.users.some((u) => u.userId === user._id)
                );

                const userCurrentRating = userRatingData?.rating;

                return (
                  <button
                    key={rate}
                    className={`font-bold py-2 px-6 rounded-md transition duration-300 m-2 ${userCurrentRating === rate
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-200 hover:bg-blue-300'
                      }`}
                    onClick={() => {
                        rateOrDenyClip(clip._id, rate);
                    }}
                  >
                    {rate}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center w-full mt-2">

              {ratings[clip._id]?.ratingCounts.find(
                (rateData) => rateData.rating === 'deny'
              )?.users.some((u) => u.userId === user._id) ? (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 m-2"
                  onClick={() => {
                    rateOrDenyClip(clip._id, null, true);
                }}
                >
                  Denied
                </button>
              ) : (
                <button
                  className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 m-2`}
                  onClick={() => {
                      rateOrDenyClip(clip._id, null, true);
                  }}
                >
                  Deny
                </button>
              )}
            </div>
          </div>
        )}
        {user && user.role === 'admin' && (
          <button
            className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
            onClick={handleDeleteClip}
          >
            Delete Clip
          </button>
        )}
      </div>

      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl mt-4">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Comments</h3>
        <div className="space-y-4">
          {currentClip.comments && currentClip.comments.length > 0 ? (
            currentClip.comments.map((comment, index) => (
              <div key={index} className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <p className="font-semibold text-neutral-900 dark:text-white mr-2">
                      {comment.username}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      on {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {user && (user.username === comment.username || user.role === 'admin') && (
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-neutral-800 dark:text-gray-200">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-700 dark:text-gray-300">No comments yet.</p>
          )}
        </div>
        {isLoggedIn ? (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Add Comment</h3>
            <form className="flex flex-col" onSubmit={handleAddComment}>
              <textarea
                placeholder="Write your comment here..."
                className="p-3 mb-2 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-md border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                maxLength={300}
              ></textarea>
              <p className={`text-sm self-end ${newComment.length === 300 ? 'text-red-500 animate-jump' : 'text-gray-500 dark:text-gray-400'}`}>
                {newComment.length}/300
              </p>
              <button
                type="submit"
                className="self-end bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Post Comment
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-neutral-700 dark:text-gray-300">
              You must be logged in to add a comment.
            </p>
          </div>
        )}

      </div>

      {popout === 'chat' ? (
        <MessageComponent clipId={clip._id} setPopout={setPopout} />
      ) : popout === 'ratings' ? (
        <div className="fixed bottom-0 right-4">
          <div className="flex flex-col w-64">
            <div className="bg-neutral-950 text-white p-4 drop-shadow-md rounded-t-xl w-full justify-items-center">
              <button
                className="text-center font-bold text-2xl mb-2 bg-white/30 p-2 px-8 rounded-md"
                onClick={() => setPopout('')}
              >
                Ratings:
              </button>
              <div className="flex flex-col w-full">
                {ratings[clip._id]?.ratingCounts ? (
                  ratings[clip._id].ratingCounts.map((rateData) => (
                    <details
                      key={rateData.rating}
                      className={`mb-2 py-2 px-4 w-full ${rateData.rating === 'deny'
                        ? 'bg-red-500 text-white'
                        : 'bg-neutral-200 text-neutral-900'
                        } rounded-md`}
                    >
                      <summary className="font-bold cursor-pointer flex items-center justify-between text-center w-full">
                        <div className="flex-1 flex justify-start">
                          <h2 className="text-lg">
                            {rateData.rating === 'deny' ? 'Denied' : rateData.rating}
                          </h2>
                        </div>
                        <span className="flex-1 text-center">
                          Total: {rateData.count}
                        </span>
                        <div className="flex justify-end flex-1">
                          <FaAngleDown />
                        </div>
                      </summary>
                      <div className="mt-2 px-6 text-center items-center justify-center">
                        {rateData.users.length > 0 ? (
                          <div>
                            <p className="text-md font-semibold">Users:</p>
                            <div className="grid grid-cols-2">
                              {rateData.users.map((user) => (
                                <p className="text-sm mx-2" key={user.userId}>
                                  {user.username}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-2">
                            {rateData.rating === 'deny' ? 'No denies' : 'No users'}
                          </p>
                        )}
                      </div>
                    </details>
                  ))
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        user && user.role && (user.role === 'clipteam' || user.role === 'admin') && (
          <div className="flex space-x-2 fixed bottom-0 right-4">
            <button
              className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-t-xl"
              onClick={() => setPopout('chat')}
            >
              Open Chat
            </button>
            <button
              className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-t-xl"
              onClick={() => setPopout('ratings')}
            >
              Open Ratings
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default ClipContent;