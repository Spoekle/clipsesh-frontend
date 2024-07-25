import React from 'react';
import placeholder from '../../../media/placeholder.png';

const DeniedClips = ({ isLoggedIn, isLoading, deniedClips, setExpandedClip }) => {
    return (
        isLoggedIn && (
            <div className="container mt-4 bg-black/30 rounded-md">
                <h2 className="p-4 text-center bg-red-700/50 backdrop-blur-sm rounded-t-md text-2xl font-bold mb-4">Denied Clips</h2>
                <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="p-4 relative animate-fade-in">
                                <div className="bg-red-700/30 p-4 rounded-lg overflow-hidden relative">
                                    <div className="overflow-hidden w-full text-center relative">
                                        <div className="flex justify-center">
                                            <div className='absolute top-0 right-0 z-40 p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 rounded-md'>
                                                <button
                                                    className="text-lg font-bold p-1 bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white transition duration-200 hover:text-blue-500 rounded-sm"
                                                >
                                                    Rating!
                                                </button>
                                            </div>
                                        </div>
                                        <div className="absolute flex justify-center top-0 left-0 z-30 text-lg font-bold bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 p-2 rounded-md text-center">Cube Community</div>
                                        <div className='rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200 p-2'>
                                            <img src={placeholder} alt="Logo" className="w-full rounded-t-lg border-8 border-white opacity-50" />
                                        </div>
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
                        deniedClips.length > 0 ? (
                            deniedClips.map((clip) => (
                                <div key={clip._id} className="p-4 relative animate-fade-in">
                                    <div className="bg-red-700/30 p-4 rounded-lg overflow-hidden relative">
                                        <div className="overflow-hidden w-full text-center relative">
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
                            <div className="my-2 mx-4 text-center bg-black/30 p-4 rounded-md font-semibold text-xl text-white col-span-full">No denied clips available.</div>
                        )
                    )}
                </div>
            </div>
        )
    );
};

export default DeniedClips;