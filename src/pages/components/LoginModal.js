import React, { useState } from 'react';
import axios from 'axios';

const LoginModal = ({ setIsLoginModalOpen, isLoginModalOpen, fetchUser }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginClickOutside = (event) => {
    if (event.target.className.includes('login-modal-overlay')) {
        setIsLoginModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? 'https://api.spoekle.com/api/users/register' : 'https://api.spoekle.com/api/users/login';
    try {
      const response = await axios.post(url, formData);
      if (isRegister) {
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        setIsLoginModalOpen(false);
        fetchUser();
      }
    } catch (error) {
      console.error('Error during submission:', error);
      if (error.response) {
        if (error.response.status === 403) {
          alert('Account awaiting admin approval.');
        } else if (error.response.status === 400) {
          alert('Invalid username or password.');
        } else {
          alert('Submission failed. Please try again.');
        }
      } else {
        alert('Submission failed. Please try again.');
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleFormToggle = () => {
    setIsRegister(!isRegister);
  };

  return (
    <>
      {isLoginModalOpen && (
        <div
          className="login-modal-overlay fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={handleLoginClickOutside}
        >
          <div className="modal-content rounded-lg relative animate-jump-in animate-duration-300 flex">
            <div className="text-white flex items-center justify-center">
              <div className="max-w-md w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white backdrop-blur-lg p-8 rounded-md shadow-md">
                <h2 className="text-3xl font-bold mb-4">{isRegister ? 'Register' : 'ClipSesh! Login'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-neutral-900 dark:text-gray-300">Username:</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onKeyDown={handleKeyDown}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-neutral-200 dark:bg-neutral-900 dark:text-white text-neutral-900 rounded-md focus:outline-none focus:bg-neutral-300 dark:focus:bg-neutral-700"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-neutral-900 dark:text-gray-300">Password:</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onKeyDown={handleKeyDown}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-neutral-200 dark:bg-neutral-900 dark:text-white text-neutral-900 rounded-md focus:outline-none focus:bg-neutral-300 dark:focus:bg-neutral-700"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600 transition duration-300"
                  >
                    {isRegister ? 'Register' : 'Login'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleFormToggle}
                    className="text-blue-500 hover:underline"
                  >
                    {isRegister ? 'Already have an account? Login' : 'Don’t have an account? Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;