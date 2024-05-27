import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadClip from './components/UploadClip';
import ClipViewer from './components/ClipViewer';
import Login from './components/login/Login';
import logo from './media/CC250.png';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
              <img src={logo} alt="Logo" className="h-8 mr-2" />
              <span className="font-semibold text-xl tracking-tight">ClipSesh!</span>
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
                  View Clips
                </Link>
                <Link
                  to="/upload"
                  className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300 mr-4"
                  onClick={toggleNavbar}
                >
                  Upload Clip
                </Link>
                <Link
                  to="/login"
                  className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-300"
                  onClick={toggleNavbar}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/upload" element={<UploadClip />} />
          <Route path="/view" element={<ClipViewer />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
