import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import axios from 'axios';
import logo from '../../media/CC250.png';
import LoginModal from '../components/LoginModal';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
                <div className=" items-center text-white ml-6 mr-6 inline hover:scale-110 transition duration-200">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-10 mr-2 block" />
                    </Link>
                </div>
                <div className="block lg:hidden">
                    <button
                        onClick={toggleNavbar}
                        className="flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
                    >
                        <svg
                            className="fill-current h-6 w-6"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>Menu</title>
                            <path d="M0 3h20v2H0zM0 7h20v2H0zM0 11h20v2H0z" />
                        </svg>
                    </button>
                </div>
                <div
                    className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'
                        }`}
                >
                    <div className="text-lg lg:flex-grow lg:flex lg:justify-end">
                        <Link
                            to="/clips"
                            className="block mt-4 lg:inline-block lg:mt-0 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200 py-2 px-3 mx-3"
                            onClick={toggleNavbar}
                        >
                            View Clips!
                        </Link>
                        {user ? (
                            <>
                                {user.isAdmin && (
                                    <>
                                        <Link
                                            to="/upload"
                                            className="block mt-4 font-semibold lg:inline-block lg:mt-0 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200 py-2 px-3 mx-3"
                                            onClick={toggleNavbar}
                                        >
                                            Upload!
                                        </Link>
                                        <Link
                                            to="/admin"
                                            className="block mt-4 font-semibold lg:inline-block lg:mt-0 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200 py-2 px-3 mx-3"
                                            onClick={toggleNavbar}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block mt-4 font-semibold lg:inline-block lg:mt-0 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200 py-2 px-3 mx-3"
                                >
                                    Hello, {user.username}! Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={toggleLoginModal}
                                className="block mt-4 font-semibold lg:inline-block lg:mt-0 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200 py-2 px-3 mx-3"
                            >
                                Login!
                            </button>
                        )}
                        <button onClick={toggleDarkMode} className="py-2 px-3 mx-3 bg-transparent hover:bg-black/20 hover:scale-110 rounded-md transition duration-200">
                            {isDarkMode ? <FaSun className="transition duration-500" /> : <FaMoon className="transition duration-500" />}
                        </button>
                    </div>
                </div>
            </div>
            {isLoginModalOpen && <LoginModal isLoginModalOpen={isLoginModalOpen} setIsLoginModalOpen={setIsLoginModalOpen} fetchUser={fetchUser} />}
        </nav>
    );
}

export default Navbar;