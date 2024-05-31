// AdminDash.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDash() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isAdmin: false // Add isAdmin to formData
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api.spoekle.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response && error.response.status === 403) {
        alert('You do not have permission to view this page.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://api.spoekle.com/api/users/register', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User created successfully');
      setFormData({ username: '', password: '', isAdmin: false });
      fetchUsers(); // Refetch users to include the newly created user
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
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
      await axios.put(`https://api.spoekle.com/api/users/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditUser(null);
      alert('User updated successfully');
      fetchUsers(); // Refetch users to reflect the updates
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
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-md shadow-md my-4">
        <h2 className="text-3xl font-bold mb-4">Admin Dashboard - Create User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:bg-gray-600"
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
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:bg-gray-600"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="isAdmin" className="block text-gray-300">Admin:</label>
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600"
          >
            Create User
          </button>
        </form>
      </div>
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-md shadow-md my-4">
        <h2 className="text-3xl font-bold mb-4">Manage Users</h2>
        {users
          .filter(user => user.username !== 'admin') // Exclude the hardcoded admin
          .map(user => (
            <div key={user._id} className="mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300">{user.username}</p>
                  <p className="text-gray-500">{user.isAdmin ? 'Admin' : 'User'}</p>
                </div>
                <div>
                  <button
                    onClick={() => setEditUser(user)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded-md mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      {editUser && (
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-md shadow-md my-4">
          <h2 className="text-3xl font-bold mb-4">Edit User</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-300">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={editUser.username}
                onChange={handleEditChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:bg-gray-600"
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
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:bg-gray-600"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="isAdmin" className="block text-gray-300">Admin:</label>
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                checked={editUser.isAdmin}
                onChange={handleEditChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md focus:outline-none focus:bg-blue-600"
            >
              Update User
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDash;
