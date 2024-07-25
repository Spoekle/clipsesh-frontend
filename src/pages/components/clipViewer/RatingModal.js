import React from 'react';
import ReactDOM from 'react-dom';
import MessageComponent from './MessageComponent';
import { FaAngleDown } from "react-icons/fa";

const RatingModal = ({ expandedClip, clips, setExpandedClip, isLoggedIn, ratings, rateOrDenyClip }) => {
    if (expandedClip === null) return null;
    const clip = clips.find((clip) => clip._id === expandedClip);

    const handleClickOutside = (event) => {
        if (event.target.className.includes('modal-overlay')) {
            setExpandedClip(null);
        }
    };

    const date = new Date(clip.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const readableDate = `${formattedDate} at ${formattedTime}`;

    return ReactDOM.createPortal(
        <div
            className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in duration-300"
            onClick={handleClickOutside}
        >
            <div className="modal-content relative max-h-screen max-w-screen rounded-lg overflow-hidden">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover z-0 hidden md:block"
                    src={`${clip.url}`}
                    autoPlay
                    loop
                    muted
                ></video>
                <div className="relative z-10 flex flex-col max-h-screen max-w-screen bg-gradient-to-b from-white/30 from-40% to-black backdrop-blur-md rounded-lg drop-shadow-xl">
                    <div className="clip-content flex-grow items-center justify-center">
                        <div className='flex bg-black/20 rounded-t-lg drop-shadow-md w-full'>
                            <div className='flex justify-between w-full'>
                                <div className='flex flex-col p-4'>
                                    <h2 className="text-xl text-white font-bold">
                                        {clip.streamer}
                                    </h2>
                                    <h3 className="text-gray-200 text-sm">{clip.title}</h3>
                                    <h3 className="text-sm text-gray-200">Uploaded on: {readableDate}</h3>
                                </div>
                                <div className='flex justify-end m-4'>
                                    <button
                                        className="text-white bg-red-500/60 hover:bg-red-500/80 rounded-md transition duration-300 p-2"
                                        onClick={() => setExpandedClip(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                        {isLoggedIn && (
                            <div className="flex p-4">
                                <div className="flex flex-col w-96">
                                    <div className="bg-black/20 text-white p-4 drop-shadow-md rounded-lg mb-2 w-full">
                                        <p className="text-center font-bold text-2xl mb-4">Ratings:</p>
                                        <div className="flex flex-col w-full">
                                            {ratings[expandedClip] && ratings[expandedClip].ratingCounts ? (
                                                ratings[expandedClip].ratingCounts.map((rateData) => (
                                                    <details key={rateData.rating} className={`mb-2 py-2 px-8 w-full ${rateData.rating === 'deny' ? 'bg-red-500 text-white' : 'bg-neutral-200 text-neutral-900'} rounded-md`}>
                                                        <summary className="font-bold cursor-pointer flex items-center justify-between text-center w-full">
                                                            <div className="flex-1 flex justify-start">
                                                                <h2 className="text-xl">
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
                                    <div className="bg-black/30 text-neutral-900 p-4 drop-shadow-md rounded-lg mb-2">
                                        <div className="flex justify-center w-full">
                                            {[1, 2, 3, 4].map((rate) => (
                                                <button
                                                    key={rate}
                                                    className="bg-neutral-200 hover:bg-blue-300 font-bold py-2 px-4 rounded-md transition duration-300 m-2"
                                                    onClick={() => rateOrDenyClip(clip._id, rate)}
                                                >
                                                    {rate}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-center w-full">
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 mt-2 w-full md:w-auto"
                                                onClick={() => rateOrDenyClip(clip._id, null, true)}
                                            >
                                                Deny
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex md:hidden justify-center items-center">
                                        <p className="text-center bg-white drop-shadow-md rounded-lg p-4 font-bold text-lg mt-4">View this page on a computer to chat!</p>
                                    </div>
                                </div>
                                <div className="flex flex-col max-w-96 items-center ml-4">
                                    <div className="flex-col justify-center items-center hidden md:flex">
                                        <MessageComponent clipId={clip._id} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RatingModal;