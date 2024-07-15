import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './pages/components/Navbar';
import Footer from './pages/components/Footer';
import UploadClip from './pages/UploadClip';
import ClipViewer from './pages/ClipViewer';
import Home from './pages/Home';
import AdminDash from './pages/AdminDash';
import PrivacyStatement from './pages/PrivacyStatement';



function ClipSesh() {
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

  const RequireAuth = ({ component: Component, isAdminRequired = false, ...props }) => {

    if (!user) {
      return <Navigate to="/clips" replace state={{ alert: "You must be logged in to view this page." }} />;
    }

    if (isAdminRequired && !user.isAdmin) {
      return <Navigate to="/clips" replace state={{ alert: "You must have admin rights to do this!" }} />;
    }

    return <Component {...props} />;
  };

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          exact path="/"
          element={<Home />}
        />
        <Route
          path="/upload"
          element={<RequireAuth component={UploadClip} isAdminRequired={true} />}
        />
        <Route
          path="/clips"
          element={<ClipViewer />}
        />
        <Route
          path="/admin"
          element={<RequireAuth component={AdminDash} isAdminRequired={true} />}
        />
        <Route
          path="/privacystatement"
          element={<PrivacyStatement />}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default ClipSesh;
