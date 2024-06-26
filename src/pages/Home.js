import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';

const HomePage = () => {
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

  return (
    <>
      <div className="bg-gradient-to-r from-cc-red to-cc-blue min-h-screen flex flex-col justify-center items-center text-white">
        <div className='absolute top-0 w-full'>
          <Navbar />
        </div>
        <div className="flex-grow flex flex-col justify-center items-center">
          <h1 className="text-5xl font-bold mb-8 text-center animate-jump-in">Welcome to ClipSesh!</h1>
          <p className="text-xl mb-8 text-center">A new generation for Seasonal Highlights!</p>
          <p className="text-xl mb-8 text-center">Content Cubes come together to rate YOUR clips for the highlights!</p>
          <p className="text-xl mb-8 text-center">Now everyone can upvote or downvote clips to influence how the highlights will play out</p>
          <div className="flex justify-between w-2/5 mt-8">
            {user ? (
              <button className="bg-cc-red text-white font-bold py-3 px-6 mr-4 rounded-lg shadow-lg transition duration-300">
                Hello, {user.username}!
              </button>
            ) : (
              <>
                <Link to="/login">
                  <button className="bg-white text-cc-blue hover:bg-cc-red hover:text-white font-bold py-3 px-6 mr-4 rounded-lg shadow-lg transition duration-300">
                    Login!
                  </button>
                </Link>
              </>
            )}
            <Link to="/clips">
              <button className="bg-white text-cc-blue hover:bg-cc-red hover:text-white font-bold py-3 px-6 mr-4 rounded-lg shadow-lg transition duration-300">
                View Clips
              </button>
            </Link>
          </div>
        </div>
        <footer className="bg-neutral-800 w-full text-white py-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Spoekle. All rights reserved.
            <Link to="/privacystatement">
              <p className='ml-2 underline'>
                Privacy Statement
              </p>
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}

export default HomePage;