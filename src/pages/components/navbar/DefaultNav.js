import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaSun, FaMoon, FaSearch, FaTimes } from 'react-icons/fa';
import LoginModal from '../LoginModal';

function DesktopNavbar({
    toggleLoginModal,
    isLoginModalOpen,
    user,
    isDropdownOpen,
    toggleDropdown,
    handleLogout,
    fetchUser,
    setSearchInput,
    searchInput,
    handleSearch,
    recentSearches,
    removeRecentSearch,
    handleRecentSearch
}) {
    const [showRecentSearched, setShowRecentSearched] = useState(false);

    const toggleRecentSearched = () => {
        setShowRecentSearched((prev) => !prev);
    };

    return (
        <>
            <div className="flex items-center space-x-3">
                <div className="flex space-x-3">
                    <NavLink
                        to="/clips"
                        className={({ isActive }) =>
                            `text-md ${isActive ? 'underline bg-black/20 scale-110' : 'hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 transition duration-200 text-left`
                        }
                    >
                        Clips
                    </NavLink>
                    {user && user.role === 'admin' && (
                        <>
                            <NavLink
                                to="/upload"
                                className={({ isActive }) =>
                                    `text-md font-semibold ${isActive ? 'underline bg-black/20 scale-110' : 'hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 transition duration-200 text-left`
                                }
                            >
                                Upload
                            </NavLink>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `text-md font-semibold ${isActive ? 'underline bg-black/20 scale-110' : 'hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 transition duration-200 text-left`
                                }
                            >
                                Admin Dash
                            </NavLink>
                        </>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    <form onSubmit={handleSearch} className="flex relative">
                        <div className="relative flex">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchInput}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                onFocus={() => setShowRecentSearched(true)}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="px-3 py-2 rounded-md bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                            />
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>
                        {(showRecentSearched || searchInput) && (
                            <div className="absolute top-8 mt-2 w-full bg-white/60 dark:bg-neutral-900 rounded-md shadow-lg py-2 z-10">
                                <button
                                    type="button"
                                    onClick={() => setShowRecentSearched(false)}
                                    className="absolute top-1 right-1 p-2 text-sm hover:text-neutral-200"
                                >
                                    <FaTimes />
                                </button>
                                <h1 className="px-2 text-md font-semibold text-left">Recent Searches</h1>
                                <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />
                                {recentSearches.length === 0 && (
                                    <p className="text-sm text-left px-3">No recent searches.</p>
                                )}
                                <div className="flex flex-col mt-1">
                                    {recentSearches
                                        .filter((search) => search.toLowerCase().includes(searchInput.toLowerCase()))
                                        .slice(0, 4)
                                        .map((search) => (
                                            <div key={search} className="flex items-center bg-black/10 hover:bg-black/20 justify-between px-2 py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchInput(search);
                                                        setShowRecentSearched(false);
                                                    }}
                                                    className="text-sm text-left flex-1"
                                                >
                                                    {search}
                                                </button>
                                                <FaTimes
                                                    onClick={() => removeRecentSearch(search)}
                                                    className="text-red-500 hover:text-red-600 cursor-pointer"
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </form>
                    {user ? (
                        <div className="relative" >
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center py-1 px-1 bg-transparent hover:bg-black/60 rounded-full hover:scale-110 transition duration-200"
                            >
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="h-12 w-12 rounded-full"
                                />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-md shadow-lg py-2">
                                    <NavLink
                                        to="/profile"
                                        className="flex px-4 py-2 text-sm text-neutral-900 dark:text-white hover:bg-black/20"
                                        onClick={toggleDropdown}
                                    >
                                        <img
                                            src={user.profilePicture}
                                            alt={user.username}
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <div className="ml-4">
                                            <p className="font-semibold">{user.username}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                                        </div>
                                    </NavLink>
                                    {(user.role === 'clipteam' || user.role === 'admin') && (
                                        <NavLink
                                            to="/stats"
                                            className="relative block px-4 py-2 text-sm text-neutral-900 dark:text-white hover:bg-black/20"
                                            onClick={toggleDropdown}
                                        >
                                            Stats
                                        </NavLink>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-neutral-900 dark:text-white hover:bg-black/20"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={toggleLoginModal}
                            className="font-semibold py-2 px-3 bg-transparent hover:bg-black/20 rounded-md transition duration-200 text-left"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
            {isLoginModalOpen && (
                <LoginModal
                    isLoginModalOpen={isLoginModalOpen}
                    setIsLoginModalOpen={toggleLoginModal}
                    fetchUser={fetchUser}
                />
            )}
        </>
    );
}

export default DesktopNavbar;