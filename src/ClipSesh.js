import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './pages/components/Navbar';
import Footer from './pages/components/Footer';
import UploadClip from './pages/UploadClip';
import ClipViewer from './pages/ClipViewer';
import Home from './pages/Home';
import AdminDash from './pages/AdminDash';
import PrivacyStatement from './pages/PrivacyStatement';
import ProfilePage from './pages/ProfilePage';

function ClipSesh() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const extractTokenFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

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

    extractTokenFromURL();
    fetchUser();
  }, []);

  const RequireAuth = ({ children, isAdminRequired = false }) => {
    if (!user) {
      return <Navigate to="/clips" replace state={{ alert: "You must be logged in to view this page." }} />;
    }

    if (isAdminRequired && !user.role === 'user') {
      return <Navigate to="/clips" replace state={{ alert: "You must have admin rights to do this!" }} />;
    }

    return children;
  };

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/upload" element={<RequireAuth isAdminRequired={true}><UploadClip /></RequireAuth>} />
        <Route path="/clips" element={<ClipViewer />} />
        <Route path="/admin" element={<RequireAuth isAdminRequired={true}><AdminDash /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage user={user} setUser={setUser} /></RequireAuth>} />
        <Route path="/privacystatement" element={<PrivacyStatement />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default ClipSesh;
