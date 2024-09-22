import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { BiLoaderCircle } from 'react-icons/bi';
import LoadingBar from 'react-top-loading-bar';
import background from '../media/background.jpg';
import { FaDiscord } from "react-icons/fa";

function AdminDash() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [config, setConfig] = useState({ denyThreshold: 5 });
  const [clips, setClips] = useState([]);
  const [ratings, setRatings] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      await fetchUsers();
      setProgress(10);
      await fetchConfig();
      setProgress(50);
      await fetchClipsAndRatings();
      setProgress(100);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api.spoekle.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allUsers = response.data;
      setUsers(allUsers.filter(user => user.status === 'approved'));
      setPendingUsers(allUsers.filter(user => user.status === 'pending'));
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response && error.response.status === 403) {
        window.location.href = '/clips';
        alert('You do not have permission to view this page.');
      }
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://api.spoekle.com/api/users/approve', { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api.spoekle.com/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Extract the first element from the array
      if (response.data.length > 0) {
        setConfig(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchClipsAndRatings = async () => {
    try {
      const clipResponse = await axios.get('https://api.spoekle.com/api/clips');
      setClips(clipResponse.data);
      const token = localStorage.getItem('token');
      if (token) {
        const ratingPromises = clipResponse.data.map(clip =>
          axios.get(`https://api.spoekle.com/api/ratings/${clip._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        const ratingResponses = await Promise.all(ratingPromises);
        const ratingsData = ratingResponses.reduce((acc, res, index) => {
          acc[clipResponse.data[index]._id] = res.data;
          return acc;
        }, {});
        setRatings(ratingsData);
      }
    } catch (error) {
      console.error('Error fetching clips and ratings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: Number(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://api.spoekle.com/api/admin/create-user', { ...formData, status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User created successfully');
      setFormData({ username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://api.spoekle.com/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Config updated successfully');
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update config. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser({
      ...editUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSubmit = { ...editUser };

      // Remove password if it is empty
      if (!dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      await axios.put(`https://api.spoekle.com/api/admin/users/${editUser._id}`, dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditUser(null);
      alert('User updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://api.spoekle.com/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user._id !== id));
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const downloadClips = async () => {
    if (!window.confirm("Are you sure you want to download the clips? This might take a while so please stay on this page.")) {
      return;
    }

    setDownloading(true);

    const filteredClips = clips.filter((clip) => {
      const ratingData = ratings[clip._id];
      return (
        ratingData &&
        ratingData.ratingCounts.every(
          (rateData) => rateData.rating !== 'deny' || rateData.count < config.denyThreshold
        )
      );
    });

    try {
      const response = await axios.post('https://api.spoekle.com/download-clips-zip', {
        clips: filteredClips.map(clip => {
          const ratingData = ratings[clip._id];
          const mostChosenRating = ratingData.ratingCounts.reduce((max, rateData) =>
            rateData.count > max.count ? rateData : max, ratingData.ratingCounts[0]
          );
          return { ...clip, rating: mostChosenRating.rating };
        }),
      }, {
        responseType: 'blob',
      });

      if (response.status !== 200) {
        throw new Error('Failed to download clips');
      }

      const blob = new Blob([response.data], { type: 'application/zip' });
      const currentDate = getCurrentDate();
      saveAs(blob, `clips-${currentDate}.zip`);
    } catch (error) {
      console.error('Error downloading clips:', error);
    }
    finally {
      setDownloading(false);
    }
  };

  const handleDeleteAllClips = async () => {
    if (!window.confirm("Are you sure you want to delete all clips?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete('https://api.spoekle.com/api/clips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClipsAndRatings();
      console.log('All clips deleted successfully');
    } catch (error) {
      console.error('Error deleting all clips:', error);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col justify-center items-center bg-neutral-900">
      <div className='w-full'>
        <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
      </div>
      <div className="w-full flex h-96 justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="flex bg-white/20 backdrop-blur-lg justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Admin Dashboard</h1>
            <h1 className="text-3xl mb-4 text-center">Manage the unmanaged...</h1>
          </div>
        </div>
      </div>
      <div className="container grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 pt-20 bg-neutral-900 text-white min-h-screen justify-items-center">
        <div className="max-w-md w-full bg-neutral-800 p-8 m-4 rounded-md shadow-md my-4">
          <h2 className="text-3xl font-bold mb-4">Create Users</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-300">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:bg-neutral-600"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-300">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:bg-neutral-600"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-300">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:bg-neutral-600"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="uploader">Uploader</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600"
            >
              Create User
            </button>
          </form>
        </div>
        <div className="col-span-2 w-full bg-neutral-800 p-8 m-4 rounded-md shadow-md my-4">
          <h2 className="text-3xl font-bold mb-4">Manage Users</h2>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            {!users.length ? (
              <div className="flex justify-center items-center space-x-2">
                <BiLoaderCircle className="animate-spin h-5 w-5 text-white" />
                <span>Loading Users...</span>
              </div>
            ) : (
              users.filter(user => user.username !== 'admin')
                .map(user => (
                  <div
                    key={user._id}
                    className="relative bg-neutral-900 p-4 w-full rounded-lg hover:bg-neutral-950 transition duration-200 overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-sm"
                      style={{
                        backgroundImage: `url(${user.profilePicture})`,
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <div className='relative flex justify-between items-center overflow-hidden'>
                          <div className='flex-col justify-between items-center'>
                            <p className="flex justify-between items-center text-white">{user.username}
                              <FaDiscord className="ml-2" style={{ color: user.discordId ? '#7289da' : '#747f8d' }} />
                            </p>
                            <p className="text-gray-300">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => setEditUser(user)}
                          className="bg-orange-500/50 hover:bg-orange-600 backdrop-blur-2xl text-white font-bold py-1 px-2 rounded-md mr-2 transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-500/50 hover:bg-red-600 backdrop-blur-2xl text-white font-bold py-1 px-2 rounded-md transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          {editUser && (
            <div className="max-w-md w-full bg-neutral-700 p-8 rounded-md shadow-md my-4">
              <h2 className="text-3xl font-bold mb-4">Edit {editUser.username}</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-gray-300">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editUser.username}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-neutral-800 text-white rounded-md focus:outline-none focus:bg-neutral-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-300">Password (leave blank to keep unchanged):</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={editUser.password || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-neutral-800 text-white rounded-md focus:outline-none focus:bg-neutral-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="role" className="block text-gray-300">Role:</label>
                  <select
                    id="role"
                    name="role"
                    value={editUser.role}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-neutral-800 text-white rounded-md focus:outline-none focus:bg-neutral-900"
                  >
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="uploader">Uploader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600 transition duration-200"
                >
                  Update User
                </button>
                <button
                  onClick={() => setEditUser(null)}
                  className="w-full bg-neutral-800 hover:bg-neutral-600 text-white py-2 rounded-md focus:outline-none focus:bg-neutral-600 mt-2 transition duration-200"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="max-w-md w-full bg-neutral-800 p-8 m-4 rounded-md shadow-md my-4">
          <h2 className="text-3xl font-bold mb-4">Pending User Approvals</h2>
          {!pendingUsers.length ? (
            <p className="text-gray-300">No pending users.</p>
          ) : (
            pendingUsers.map(user => (
              <div key={user._id} className="mb-4 bg-neutral-950 p-4 rounded-lg hover:bg-neutral-900 transition duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-300">{user.username}</p>
                  </div>
                  <button
                    onClick={() => handleApproveUser(user._id)}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 hover:red-600 text-white py-1 px-2 rounded-md"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="max-w-md w-full bg-neutral-800 p-8 m-4 rounded-md shadow-md my-4">
          <h2 className="text-3xl font-bold mb-4">Admin Config</h2>
          <form onSubmit={handleConfigSubmit}>
            <div className="mb-4">
              <label htmlFor="denyThreshold" className="block text-gray-300">Deny Threshold:</label>
              <input
                type="number"
                id="denyThreshold"
                name="denyThreshold"
                value={config.denyThreshold}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:bg-neutral-600"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600"
            >
              Update Config
            </button>
          </form>
        </div>
        <div className="max-w-md w-full bg-neutral-800 p-8 m-4 rounded-md shadow-md my-4">
          <h2 className="text-3xl font-bold mb-4">Download Clips</h2>
          {downloading && (
            <div className="flex justify-center items-center space-x-2">
              <BiLoaderCircle className="animate-spin h-5 w-5 text-white" />
              <span>Downloading Clips...</span>
            </div>
          )}
          <button
            onClick={downloadClips}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-md focus:outline-none focus:bg-green-600"
          >
            Download All Clips
          </button>
          <h2 className="text-3xl font-bold my-4">Reset Database</h2>
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-md focus:outline-none focus:bg-red-600"
            onClick={handleDeleteAllClips}
          >
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDash;
