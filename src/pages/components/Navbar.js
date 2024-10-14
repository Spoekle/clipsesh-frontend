import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import axios from 'axios';
import logo from '../../media/CC250.png';
import LoginModal from '../components/LoginModal';

function Navbar({ setUser, user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
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
                localStorage.removeItem('token');
                console.error('Error fetching user:', error);
            }
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/clips';
    };

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', closeDropdown);
        return () => {
            document.removeEventListener('mousedown', closeDropdown);
        };
    }, []);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' ? true : false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <nav className="p-2 z-50 sticky text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-900 transition duration-200">
            <div className="container mx-auto flex items-center justify-between flex-wrap">
                <div className="items-center text-white ml-6 mr-6 inline hover:scale-110 transition duration-200">
                    <NavLink to="/">
                        <img src={logo} alt="Logo" className="h-10 mr-2 block" />
                    </NavLink>
                </div>
                <div className="block lg:hidden">
                    <button
                        onClick={toggleNavbar}
                        className="flex items-center px-3 py-2 hover:border rounded border-white hover: hover:border-white"
                    >
                        <svg
                            className="fill-current h-6 w-6"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M0 3h20v2H0zM0 7h20v2H0zM0 11h20v2H0z" />
                        </svg>
                    </button>
                </div>
                <div
                    className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'
                        }`}
                >
                    <div className="text-md items-center lg:flex-grow lg:flex lg:justify-end">
                        <NavLink
                            to="/clips"
                            className={({ isActive }) =>
                                `block mt-4 lg:inline-block lg:mt-0 ${isActive ? 'underline bg-black/20 scale-110' : 'bg-transparent hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 mx-3 transition duration-200`
                            }
                            onClick={toggleNavbar}
                        >
                            View Clips!
                        </NavLink>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <NavLink
                                            to="/upload"
                                            className={({ isActive }) =>
                                                `block mt-4 lg:inline-block font-semibold lg:mt-0 ${isActive ? 'underline bg-black/20 scale-110' : 'bg-transparent hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 mx-3 transition duration-200`
                                            }
                                            onClick={toggleNavbar}
                                        >
                                            Upload!
                                        </NavLink>
                                        <NavLink
                                            to="/admin"
                                            className={({ isActive }) =>
                                                `block mt-4 lg:inline-block font-semibold lg:mt-0 ${isActive ? 'underline bg-black/20 scale-110' : 'bg-transparent hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 mx-3 transition duration-200`
                                            }
                                            onClick={toggleNavbar}
                                        >
                                            Admin Dashboard
                                        </NavLink>
                                    </>
                                )}
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={toggleDropdown} className="flex items-center mt-4 lg:mt-0 py-2 px-3 mx-3 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200">
                                        <img src={user.profilePicture} alt={user.username} className="h-10 w-10 rounded-full mr-2" />
                                        {user.username}
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute lg:right-0 mt-2 w-48 backdrop-blur-md bg-white/30 dark:bg-neutral-900/30 rounded-md shadow-lg py-2">
                                            <NavLink
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-neutral-900 dark:text-white hover:bg-black/20 transition duration-200"
                                                onClick={() => {
                                                    toggleDropdown();
                                                    toggleNavbar();
                                                }}
                                            >
                                                Profile
                                            </NavLink>
                                            <NavLink
                                                to="/stats"
                                                className="relative block px-4 py-2 text-sm text-neutral-900 dark:text-white hover:bg-black/20 transition duration-200"
                                                onClick={() => {
                                                    toggleDropdown();
                                                    toggleNavbar();
                                                }}
                                            >
                                                Stats
                                                <span className="absolute top-1 right-0 p-1 mr-2 bg-blue-500 text-white rounded-md">New!</span>
                                            </NavLink>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-neutral-900 dark:text-white hover:bg-black/20 transition duration-200"
                                            >
                                                Logout
                                            </button>
                                        </div>

                                    )}

                                </div>
                            </>
                        ) : (
                            <button
                                onClick={toggleLoginModal}
                                className={({ isActive }) =>
                                    `block mt-4 lg:inline-block font-semibold lg:mt-0 ${isActive ? 'underline bg-black/20 scale-110' : 'bg-transparent hover:bg-black/20 hover:scale-110'} rounded-md py-2 px-3 mx-3 transition duration-200`
                                }
                            >
                                Login!
                            </button>
                        )}
                        <button onClick={toggleDarkMode} className="py-2 px-3 mt-4 mx-3 lg:mt-0 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200">
                            {isDarkMode ? <FaSun className="transition duration-200" /> : <FaMoon className="transition duration-200" />}
                        </button>
                    </div>
                </div>
            </div>
            {isLoginModalOpen && <LoginModal isLoginModalOpen={isLoginModalOpen} setIsLoginModalOpen={setIsLoginModalOpen} fetchUser={fetchUser} />}
        </nav>
    );
}

export default Navbar;