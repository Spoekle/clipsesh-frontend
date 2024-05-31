import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import UploadClip from './components/UploadClip';
import ClipViewer from './components/ClipViewer';
import Login from './components/login/Login';
import Home from './components/Home';
import AdminDash from './components/AdminDash';
import logo from './media/CC250.png';

function App() {
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
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between flex-wrap">
            <div className=" items-center text-white mr-6 inline">
              <Link to="/">
                <img src={logo} alt="Logo" className="h-8 mr-2 block" />
                <div className='inline flex-col'>
                  <span className="font-semibold text-xl tracking-tight">ClipSesh!</span>
                </div>
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
              className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${
                isOpen ? 'block' : 'hidden'
              }`}
            >
              <div className="text-sm lg:flex-grow lg:flex lg:justify-end">
                <Link
                  to="/view"
                  className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300 mr-4"
                  onClick={toggleNavbar}
                >
                  View Clips!
                </Link>
                <Link
                  to="/upload"
                  className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300 mr-4"
                  onClick={toggleNavbar}
                >
                  Upload Clips!
                </Link>
                {user ? (
                  <>
                    <span className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white mr-4">
                      Hello, {user.username}!
                    </span>
                    {user.isAdmin && (
                      <>
                        <Link
                          to="/upload"
                          className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white hover:text-gray-300 mr-4"
                          onClick={toggleNavbar}
                        >
                          Upload!
                        </Link>
                        <Link
                          to="/admin"
                          className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white hover:text-gray-300 mr-4"
                          onClick={toggleNavbar}
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block mt-4 font-semibold lg:inline-block lg:mt-0 text-white hover:text-gray-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300 mr-4"
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

        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/upload" element={<UploadClip />} />
          <Route path="/view" element={<ClipViewer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDash />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
