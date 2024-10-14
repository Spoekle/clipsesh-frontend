import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { BiLoaderCircle } from 'react-icons/bi';
import LoadingBar from 'react-top-loading-bar';
import background from '../media/admin.jpg';
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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [userRatings, setUserRatings] = useState([]);
  const [seasonInfo, setSeasonInfo] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      await fetchUsers();
      setProgress(10);
      await fetchConfig();
      setProgress(30);
      getSeason();
      setProgress(50);
      await fetchClipsAndRatings();   
      setProgress(100);
      setLoading(false);
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
      setProgress(5);
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
      setProgress(65);
      const token = localStorage.getItem('token');
      if (token) {
        const ratingPromises = clipResponse.data.map(clip =>
          axios.get(`https://api.spoekle.com/api/ratings/${clip._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        setProgress(80);
        const ratingResponses = await Promise.all(ratingPromises);
        const ratingsData = ratingResponses.reduce((acc, res, index) => {
          acc[clipResponse.data[index]._id] = res.data;
          setProgress(90);
          return acc;
        }, {});
        setRatings(ratingsData);
      }
    } catch (error) {
      console.error('Error fetching clips and ratings:', error);
    }
  };

  //get the count of denied clips
  const deniedClips = clips.filter(clip => {
    const ratingData = ratings[clip._id];
    return ratingData && ratingData.ratingCounts.some(rateData => rateData.rating === 'deny' && rateData.count >= config.denyThreshold);
  }).length;

  useEffect(() => {
    if (Object.keys(ratings).length > 0) {
      countRatingsPerUser();
    }
  }, [ratings]);

  const countRatingsPerUser = () => {
  const userRatingCount = {};

  // Initialize userRatingCount with all users, except UploadBot and roles editor and uploader
  users
  .filter(user => user.username !== 'UploadBot' && !['editor', 'uploader'].includes(user.role))
  .forEach(user => {
    userRatingCount[user.username] = { '1': 0, '2': 0, '3': 0, '4': 0, 'deny': 0, total: 0, percentageRated: 0 };
  });

  const clipLength = Object.keys(ratings).length;
  setSeasonInfo(prevSeasonInfo => ({
    ...prevSeasonInfo,
    clipAmount: clipLength
  }));

  Object.keys(ratings).forEach(clipId => {
    const clipRatingCounts = ratings[clipId].ratingCounts;

    // Check if clipRatingCounts is an array
    if (!Array.isArray(clipRatingCounts)) {
      console.error(`clipRatingCounts for Clip ID ${clipId} is not an array:`, clipRatingCounts);
      return;
    }

    // Loop through each rating count entry in the array
    clipRatingCounts.forEach(ratingData => {
      if (ratingData.users && ratingData.users.length > 0) {
        // Iterate over the users who rated this clip
        ratingData.users.forEach(user => {
          if (userRatingCount[user.username]) {
            if (userRatingCount[user.username][ratingData.rating] !== undefined) {
              userRatingCount[user.username][ratingData.rating]++;
              userRatingCount[user.username].total++;
            } else {
              console.error(`Unknown rating type: ${ratingData.rating}`);
            }
            userRatingCount[user.username].percentageRated = (userRatingCount[user.username].total / clipLength) * 100;
          }
        });
      } else {
        console.log(`No users found for ratingData:`, ratingData);
      }
    });
  });

  // Convert userRatingCount object into an array of objects with username and rating counts
  const userRatingCounts = Object.keys(userRatingCount).map(username => ({
    username,
    ...userRatingCount[username]
  }));

  // Sort userRatingCounts by total count in descending order
  userRatingCounts.sort((a, b) => b.total - a.total);

  setUserRatings(userRatingCounts);
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

  const toggleEditUser = (user) => {
    if (editUser && editUser._id === user._id) {
      setEditUser(null);
    } else {
      setEditUser(user);
    }
  };

  const getSeason = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    let season = '';
  
    if (currentMonth >= 0 && currentMonth <= 2) {
      season = 'Winter';
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      season = 'Spring';
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      season = 'Summer';
    } else {
      season = 'Fall';
    }
  
    setSeasonInfo(prevSeasonInfo => ({
      ...prevSeasonInfo,
      season
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-neutral-700 p-4 rounded-md drop-shadow-lg">
          <p className="text-lg font-bold">{`${payload[0].payload.username}`}</p>
          <p className="text-sm">{`Clips Rated: ${payload[0].value}`}</p>
          <p className="text-sm">{`Percentage Rated: ${((payload[0].value / seasonInfo.clipAmount) * 100).toFixed(2)}%`}</p>
          <div className="grid grid-cols-2 w-full rounded-md p-2 mt-2 bg-black/20 justify-center">
            <p className="text-sm text-center">{`Rated 1: ${payload[1].value}`}</p>
            <p className="text-sm text-center">{`Rated 2: ${payload[2].value}`}</p>
            <p className="text-sm text-center">{`Rated 3: ${payload[3].value}`}</p>
            <p className="text-sm text-center">{`Rated 4: ${payload[4].value}`}</p>
            <p className="col-span-2 text-sm text-center text-red-600">{`Denied: ${payload[5].value}`}</p>
          </div>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center bg-neutral-200 dark:bg-neutral-900 transition duration-200">
      <div className='w-full'>
        <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
      </div>
      <div className="w-full flex h-96 justify-center items-center animate-fade" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="flex bg-black/20 backdrop-blur-md justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Admin Dashboard</h1>
            <h1 className="text-3xl mb-4 text-center">Manage the unmanaged...</h1>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container pt-20 mb-4 text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-900 flex flex-col items-center justify-center animate-fade">
          <h1 className="text-5xl font-bold mb-8 text-center">Loading...</h1>
          <BiLoaderCircle className="animate-spin text-7xl" />
        </div>
      ) : (

        <div className="container pt-20 mb-4 text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-900 transition duration-200 justify-center justify-items-center animate-fade">
          <div className="w-full p-8 bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 rounded-md shadow-md">
            <h2 className="text-3xl font-bold mb-4">Season info</h2>
            <div className="grid grid-cols-2 text-center justify-center">
              <h2 className="text-2xl font-bold mb-4">Season: {seasonInfo.season}</h2>
              <div>
                <h2 className="text-2xl font-bold mb-4">Clip Amount: {seasonInfo.clipAmount}</h2>
                <h2 className="text-xl font-semibold mb-4 text-red-600">Denied Clips: {deniedClips}</h2>
              </div>
            </div>
          </div>

          <div className="w-full p-8 mt-8 bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 rounded-md shadow-md animate-fade animate-delay-100">
            <h2 className="text-3xl font-bold mb-4">User Performance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={userRatings} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar name="Total Rated" dataKey="total" fill="#237aeb" />
                <Bar name="Rated 1" dataKey="1" fill="#32d14d" />
                <Bar name="Rated 2" dataKey="2" fill="#e6db10" />
                <Bar name="Rated 3" dataKey="3" fill="#e6a910" />
                <Bar name="Rated 4" dataKey="4" fill="#eb8723" />
                <Bar name="Denied" dataKey="deny" fill="#e64040" />
              </BarChart>
            </ResponsiveContainer>
            <div className="">
              <h3 className="text-2xl font-bold mb-4">User Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userRatings && users
                .map(user => {
                  const userRating = userRatings.find(rating => rating.username === user.username) || { '1': 0, '2': 0, '3': 0, '4': 0, 'deny': 0, total: 0 };
                  const percentageRated = ((userRating.total / seasonInfo.clipAmount) * 100).toFixed(2);
                  return { ...user, ...userRating, percentageRated, total: Number(userRating.total) };
                })
                .filter(user => user.username !== 'UploadBot' && !['editor', 'uploader'].includes(user.role))
                .sort((a, b) => b.total - a.total)
                .map(user => (
                  <div key={user.username} className="p-4 bg-neutral-400 dark:bg-neutral-700 text-neutral-900 dark:text-white transition duration-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold mb-2">{user.username}</h4>
                      <p className={`text-md px-2 py-1 rounded-lg ${user.total > 0 ? 'bg-green-600' : 'bg-red-600'} origin-top`}>{user.total > 0 ? 'Active' : 'Inactive'}</p>
                    </div>
                    <p className="text-sm">Clips Rated: {user.total}</p>
                    <p className="text-sm">Percentage Rated: {user.percentageRated}%</p>
                    <p className="text-sm">Denied: {user.deny}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid mt-8 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 w-full">
            <div className="col-span-1 min-w-full w-full bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 p-8 rounded-md shadow-md animate-fade animate-delay-200">
              <h2 className="text-3xl font-bold mb-4">Create Users</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-neutral-900 dark:text-gray-300">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 dark:text-white text-neutral-900 rounded-md focus:outline-none focus:bg-neutral-200 dark:focus:bg-neutral-700"
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
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 dark:text-white text-neutral-900 rounded-md focus:outline-none focus:bg-neutral-200 dark:focus:bg-neutral-700"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="role" className="block text-neutral-900 dark:text-gray-300">Role:</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 dark:text-white text-neutral-900 rounded-md focus:outline-none focus:bg-neutral-200 dark:focus:bg-neutral-700"
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
            
            <div className="col-span-1 min-w-full w-full bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 p-8 rounded-md shadow-md animate-fade animate-delay-300">
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

            <div className="lg:col-span-3 md:col-span-2 col-span-1 min-w-full bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 p-8 rounded-md shadow-md animate-fade animate-delay-[400ms]">
              <h2 className="text-3xl font-bold mb-4">Manage Users</h2>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
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
                        className={`relative bg-neutral-900 p-4 w-full rounded-lg hover:bg-neutral-950 transition-all duration-300 overflow-hidden ${editUser && editUser._id === user._id ? 'max-h-screen' : 'max-h-32'}`}
                        style={{ transition: 'max-height 0.3s ease-in-out' }}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center filter blur-sm"
                          style={{
                            backgroundImage: `url(${user.profilePicture})`,
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
                        <div className="relative z-10 flex justify-between items-center">
                          <div className='flex-col justify-between items-center'>
                            <p className="flex justify-between items-center text-white">{user.username}
                              <FaDiscord className="ml-2" style={{ color: user.discordId ? '#7289da' : '#747f8d' }} />
                            </p>
                            <p className="text-gray-300">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                          </div>
                          <div>
                            <button
                              onClick={() => toggleEditUser(user)}
                              className="bg-blue-500/50 hover:bg-blue-600 backdrop-blur-2xl text-white font-bold py-1 px-2 rounded-md mr-2 transition duration-200"
                            >
                              {editUser && editUser._id === user._id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="bg-red-500/50 hover:bg-red-600 backdrop-blur-2xl text-white font-bold py-1 px-2 rounded-md transition duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className={`transition-transform duration-300 ${editUser && editUser._id === user._id ? 'scale-y-100' : 'scale-y-0'} origin-top`}>
                          {editUser && editUser._id === user._id && (
                            <div className="max-w-md w-full bg-black/20 mt-4 p-4 rounded-md shadow-md backdrop-blur-xl">
                              <h2 className="text-2xl font-bold text-white">Edit {editUser.username}</h2>
                              <div className="w-full h-1 rounded-full my-2 bg-white"/>
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
                                <div className="flex justify-end">
                                  <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md transition duration-200"
                                  >
                                    Save
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="col-span-1 w-full bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 p-8 rounded-md shadow-md animate-fade animate-delay-500">
              <h2 className="text-3xl font-bold mb-4">Admin Config</h2>
              <form onSubmit={handleConfigSubmit}>
                <div className="mb-4">
                  <label htmlFor="denyThreshold" className="block text-neutral-900 dark:text-gray-300">Deny Threshold:</label>
                  <input
                    type="number"
                    id="denyThreshold"
                    name="denyThreshold"
                    value={config.denyThreshold}
                    onChange={handleConfigChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 dark:text-white text-neutral-900 rounded-md focus:outline-none focus:bg-neutral-200 dark:focus:bg-neutral-700"
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

            <div className="col-span-1 w-full bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white transition duration-200 p-8 rounded-md shadow-md animate-fade animate-delay-[600ms]">
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
      )}
    </div>
    
  );
}

export default AdminDash;
