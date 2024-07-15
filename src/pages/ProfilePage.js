import React, { useState } from 'react';
import axios from 'axios';
import background from '../media/background.jpg';

function ProfilePage({ user, setUser }) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);

    try {
      const response = await axios.post('https://api.spoekle.com/api/users/uploadProfilePicture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setUser({ ...user, profilePicture: response.data.profilePictureUrl });
        setMessage('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage('Error uploading profile picture');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const updateData = { username };
    if (password) updateData.password = password;

    try {
      const response = await axios.put(`https://api.spoekle.com/api/users/${user._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.message) {
        setUser({ ...user, username });
        setMessage('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <div className="flex h-96 justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="flex bg-white/20 backdrop-blur-lg justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Profile Page</h1>
            <h1 className="text-4xl font-bold mb-4 text-center">{user.username}</h1>
          </div>
        </div>
      </div> 
       
      {message && <p className="text-green-500">{message}</p>}
      <form onSubmit={handleProfileUpdate}>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Profile
        </button>
      </form>
      <form onSubmit={handleProfilePictureUpload} className="mt-4">
        <div className="mb-4">
          <label className="block text-gray-700">Profile Picture</label>
          <input type="file" onChange={handleProfilePictureChange} accept="image/*" className="mt-1 block w-full" />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Upload Profile Picture
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;