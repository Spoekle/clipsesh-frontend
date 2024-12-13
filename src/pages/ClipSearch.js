// src/pages/ClipSearch.js

import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ClipSearch = () => {
    const query = useQuery();
    const searchTerm = query.get('query') || '';
    const page = parseInt(query.get('page')) || 1;
    const [clips, setClips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);

    const location = useLocation();

    useEffect(() => {
        const fetchClips = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`https://api.spoekle.com/api/clips/search`, {
                    params: { q: searchTerm, page },
                });
                setClips(response.data.clips);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error('Error fetching search results:', err);
                setError(err.response?.data?.message || 'An error occurred while fetching clips.');
            } finally {
                setLoading(false);
            }
        };

        if (searchTerm.trim() !== '') {
            fetchClips();
        } else {
            setClips([]);
            setLoading(false);
        }
    }, [searchTerm, page]);

    // Handler for pagination
    const handlePageChange = (newPage) => {
        window.history.pushState({}, '', `/search?query=${encodeURIComponent(searchTerm)}&page=${newPage}`);
        window.dispatchEvent(new Event('popstate'));
    };

    return (
        <div className="min-h-screen w-full text-white bg-neutral-200 dark:bg-neutral-900 transition duration-200 p-4">
            <h1 className="text-2xl font-bold mb-4">Search Results for "{searchTerm}"</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : clips.length > 0 ? (
                <>
                    <ul className="space-y-4 container mx-auto">
                        {clips.map((clip, index) => (
                            <Link
                                key={clip._id}
                                to={`/clips/${clip._id}`}
                                state={{ from: location }}
                                className={`flex items-center bg-white hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md p-4 shadow-md animate-fade-left`}
                                style={{ animationDelay: `${index * 70}ms` }}
                            >
                                <video
                                    src={clip.url}
                                    alt={clip.title}
                                    className="h-24 aspect-video object-cover rounded-md mr-4"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <h1 className="text-xl font-semibold text-neutral-800 dark:text-white truncate">
                                        {clip.title}
                                    </h1>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                                        Streamer: {clip.streamer}
                                    </p>
                                    <div className="flex items-center mt-2 text-neutral-600 dark:text-neutral-300">
                                        <span className="text-sm mr-4">Upvotes: {clip.upvotes}</span>
                                        <span className="text-sm">Downvotes: {clip.downvotes}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </ul>
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className={`mx-2 px-4 py-2 rounded-md ${page <= 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            Previous
                        </button>
                        <span className="mx-2 py-2 text-neutral-800 dark:text-neutral-300">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className={`mx-2 px-4 py-2 rounded-md ${page >= totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No clips found for "{searchTerm}".</p>
            )}
        </div>
    );
};

export default ClipSearch;