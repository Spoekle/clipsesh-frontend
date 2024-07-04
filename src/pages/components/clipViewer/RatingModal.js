import React from 'react';
import ReactDOM from 'react-dom';
import MessageComponent from './MessageComponent';

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
            className="modal-overlay fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={handleClickOutside}
        >
            <div className="modal-content bg-neutral-700 p-4 rounded-lg relative animate-fade-up flex">
                <div className="clip-content flex-grow">
                    <button
                        className="absolute top-0 right-0 m-4 text-white bg-red-700 hover:bg-red-800 transition duration-300 rounded-md p-2"
                        onClick={() => setExpandedClip(null)}
                    >
                        Close
                    </button>
                    <h2 className="text-2xl text-white font-bold">{clip.streamer}
                        <span className="text-lg font-normal"> - {clip.title}</span>
                    </h2>
                    <h3 className="text-md text-neutral-200 mb-4">Uploaded on: {readableDate}</h3>
                    <div className="flex flex-col justify-center items-center">
                        {isLoggedIn && (
                            <div className="flex flex-col items-center mt-2">
                                <div className="bg-black/30 text-white p-4 rounded-lg mb-2">
                                    <p className="text-center font-bold text-2xl mb-4">Ratings:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {ratings[expandedClip] && ratings[expandedClip].ratingCounts ? (
                                            ratings[expandedClip].ratingCounts.map((rateData) => (
                                                <div
                                                    key={rateData.rating}
                                                    className={`bg-${rateData.rating === 'deny' ? 'red' : 'blue'
                                                        }-700 text-white font-bold py-4 px-6 rounded-md text-center transition duration-300`}
                                                >
                                                    <p className="text-xl">
                                                        {rateData.rating === 'deny' ? 'Denied' : rateData.rating}
                                                    </p>
                                                    <p className="text-lg mt-2">Total: {rateData.count}</p>
                                                    {rateData.users.length > 0 && (
                                                        <div>
                                                            <p className="text-sm mt-2">Users:</p>
                                                            {rateData.users.map((user) => (
                                                                <p className="text-sm" key={user.userId}>
                                                                    {user.username}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {rateData.users.length === 0 && (
                                                        <p className="text-sm mt-2">
                                                            {rateData.rating === 'deny' ? 'No denies' : 'No users'}
                                                        </p>
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
                        )}
                    </div>
                    <div className="flex md:hidden justify-center items-center">
                        <p className="text-center bg-white rounded-md p-4 font-bold text-lg mt-4">View this page on a computer to chat!</p>
                    </div>
                </div>
                <div className="ml-4 w-1/3 flex-col justify-center items-center hidden md:flex">
                    <MessageComponent clipId={clip._id} />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RatingModal;