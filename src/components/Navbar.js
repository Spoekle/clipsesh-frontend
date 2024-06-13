import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../media/CC250.png';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
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
        fetchUser();
      }, []);
    
      const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
      };
    
      const toggleNavbar = () => {
        setIsOpen(!isOpen);
      };

    return (
        <nav className="p-4 m-4 z-50 relative bg-opacity-20 bg-white rounded-md">
            <div className="container mx-auto flex items-center justify-between flex-wrap">
                <div className=" items-center text-white ml-6 mr-6 inline">
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
                            className="fill-current h-3 w-3"
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
                            to="/view"
                            className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300 bg-transparent hover:bg-black/20 rounded-md transition duration-200 py-2 px-3 mr-6"
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
                                            className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white hover:text-gray-300 bg-transparent hover:bg-black/20 rounded-md transition duration-200 py-2 px-3 mr-6"
                                            onClick={toggleNavbar}
                                        >
                                            Upload!
                                        </Link>
                                        <Link
                                            to="/admin"
                                            className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white hover:text-gray-300 bg-transparent hover:bg-black/20 rounded-md transition duration-200 py-2 px-3 mr-6"
                                            onClick={toggleNavbar}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    </>
                                )}
                                <span className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white py-2 px-3 mr-4">
                                    Hello, {user.username}!
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white hover:text-gray-300 bg-transparent hover:bg-black/20 rounded-md transition duration-200 py-2 px-3"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300 bg-transparent hover:bg-black/20 rounded-md transition duration-200 py-2 px-3 mr-4"
                                    onClick={toggleNavbar}
                                >
                                    Login!
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );


}

export default Navbar;