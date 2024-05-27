import React, { useState } from 'react';

function Login() {

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-md shadow-md">
        <h2 className="text-3xl font-bold mb-4">ClipSesh! Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300">Username:</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:bg-gray-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300">Password:</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:bg-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
