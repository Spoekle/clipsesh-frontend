import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import UploadClip from './components/UploadClip';
import ClipViewer from './components/ClipViewer';
import Login from './components/login/Login';
import Home from './components/Home';
import AdminDash from './components/AdminDash';



function App() {
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

  const requireAuth = (Component, isAdminRequired = false) => {
    return user ? (
      isAdminRequired && !user.isAdmin ? (
        <Navigate to="/login" />
      ) : (
        <Component />
      )
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <Router>
      <Routes>
          <Route exact path="/" element={<Home />} />
          <Route
            path="/upload"
            element={requireAuth(UploadClip, true)}
          />
          <Route
            path="/view"
            element={<ClipViewer />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={requireAuth(AdminDash, true)}
          />
        </Routes>
    </Router>
  );
}

export default App;
