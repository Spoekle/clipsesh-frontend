import React from 'react';
import placeholder from '../../../media/placeholder.png';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const RatedClips = ({ isLoggedIn, isLoading, setExpandedClip, currentClips, ratings, denyThreshold, upvoteClip, downvoteClip, user
}) => {
    return (
        isLoggedIn && (
            <div className="mt-4">
                <h2 className="p-4 text-center text-neutral-800 bg-white dark:bg-neutral-800 dark:text-white transition duration-200 backdrop-blur-sm text-2xl font-bold mb-4">You already rated these clips! Good job!</h2>
                <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="m-4 relative animate-pulse">
                                <div className="overflow-hidden w-full text-center relative shadow-2xl">
                                    {isLoggedIn && (
                                        <div className="flex justify-center">
                                            <div className='absolute top-0 right-0 z-40 p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 rounded-md'>
                                                <button
                                                    className="text-lg font-bold p-1 bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white transition duration-200 hover:text-blue-500 rounded-sm"
                                                >
                                                    Rating!
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute flex justify-center top-0 left-0 z-30 text-lg font-bold bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 p-2 rounded-md text-center">Cube Community</div>
                                    <div className='rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200 p-2'>
                                        <img src={placeholder} alt="Logo" className="w-full rounded-t-lg border-8 border-white opacity-50" />
                                    </div>
                                </div>
                                <div className="w-full flex justify-center bg-white dark:bg-neutral-900 transition duration-200 rounded-b-lg px-4 pt-2 pb-4 shadow-2xl">
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
                                        return ratingData && ratingData.ratingCounts.some(rateData => rateData.users.some(ratingUser => ratingUser.userId === user._id));
                                    } else {
                                        return true;
                                    }
                                })
                                .map(clip => (
                                    <div key={clip._id} className="m-4 relative animate-fade">
                                        <div className="overflow-hidden w-full text-center relative shadow-2xl">
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
                                            <div className="absolute flex justify-center top-0 left-0 z-30 text-lg font-bold bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 p-2 rounded-md text-center">{clip.streamer}</div>
                                            <div className='rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200 p-2'>
                                                <video
                                                    className="w-full rounded-lg border-white dark:border-neutral-800 transition duration-200"
                                                    src={`${clip.url}`}
                                                    controls
                                                >
                                                </video>
                                            </div>
                                        </div>
                                        <div className="w-full flex justify-center bg-white dark:bg-neutral-900 transition duration-200 rounded-b-lg px-4 pt-2 pb-4 shadow-2xl">
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
                            <div className="my-2 mx-4 text-center bg-black/30 p-4 rounded-md font-semibold text-xl text-white col-span-full">No rated clips available.</div>
                        )
                    )}
                </div>
            </div>
        )
    );
};

export default RatedClips;