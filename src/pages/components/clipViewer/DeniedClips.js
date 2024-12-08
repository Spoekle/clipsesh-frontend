import React from 'react';
import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import placeholder from '../../../media/placeholder.png';

const DeniedClips = ({ user, isLoading, deniedClips, setExpandedClip }) => {
    const [visibleDenied, setVisibleDenied] = useState(3);

    const location = useLocation();
    const videoRef = useRef(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const loadMoreDenied = () => {
        setVisibleDenied((prev) => prev + 3);
    };

    return (
        user && user.role && (user.role === 'clipteam' || user.role === 'admin') && (
            <div className="container mt-4 bg-black/30 rounded-md">
                <h2 className="p-4 text-center bg-red-700/50 backdrop-blur-sm rounded-t-md text-2xl font-bold mb-4">{deniedClips.length} Denied Clips</h2>
                <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="m-4 shadow-2xl relative animate-pulse drop-shadow-md">
                                <div className="overflow-hidden w-full text-center relative shadow-2xl">
                                    <div className="rounded-lg bg-white dark:bg-neutral-800 transition duration-200 p-2">
                                        <img src={placeholder} alt="Loading..." className="w-full rounded-lg border-white opacity-50" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : deniedClips.length > 0 ? (
                        deniedClips
                            .slice(0, visibleDenied)
                            .map((clip) => (
                                <Link
                                    to={`/clips/${clip._id}`}
                                    state={{ from: location }}
                                    onClick={() => setExpandedClip(clip._id)}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    className="relative animate-fade hover:scale-105 transition duration-200 rounded-lg overflow-hidden border-4 border-neutral-950"
                                >

                                    {/* Streamer Information */}
                                    <div className="absolute z-30 top-2 left-2 bg-black/50 text-white px-2 py-1 font-bold rounded-md flex items-center backdrop-blur-sm">
                                        <a href={clip.link} className="cursor-pointer">
                                            {clip.streamer}
                                        </a>
                                    </div>

                                    {/* Video Element */}
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover transition duration-200 opacity-50 hover:opacity-100"
                                        src={clip.url}
                                        muted
                                        preload="metadata"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </Link>
                            ))
                    ) : (
                        <div className="my-2 mx-4 text-center bg-black/30 p-4 rounded-md font-semibold text-xl text-white col-span-full">
                            No denied clips available.
                        </div>
                    )}
                </div>
                {deniedClips.length > visibleDenied && (
                    <button
                        onClick={loadMoreDenied}
                        className="p-4 bg-red-700/50 rounded-b-md text-white font-semibold w-full"
                    >
                        Load More
                    </button>
                )}
            </div>
        )
    );
};

export default DeniedClips;