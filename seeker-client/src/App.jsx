import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

// Page Imports
import Register from './pages/Register';
import UploadSelfie from './pages/UploadSelfie';
import CompleteProfile from './pages/CompleteProfile';
import JobListings from './pages/JobListings';
import ApplicationTracker from './pages/ApplicationTracker';

// Context Export
export const SeekerContext = createContext();

// Security Wrapper for Private Routes
const ProtectedRoute = ({ seekerId, children }) => {
  if (!seekerId) {
    return <Navigate to="/register" replace />;
  }
  return children;
};

export default function App() {
  // Lazy initialize state from localStorage
  const [seekerId, setSeekerId] = useState(() => localStorage.getItem('seekerId') || '');
  const [profile, setProfile] = useState(null);

  const saveSeekerId = (id) => {
    setSeekerId(id);
    localStorage.setItem('seekerId', id);
  };

  const logout = () => {
    setSeekerId('');
    setProfile(null);
    localStorage.removeItem('seekerId');
  };

  return (
    <SeekerContext.Provider value={{ seekerId, saveSeekerId, profile, setProfile, logout }}>
      <BrowserRouter>
        <div style={styles.appContainer}>
          
          {/* Main Navigation */}
          <nav style={styles.navbar}>
            <div style={styles.logoContainer}>
              <span style={styles.logoEmoji}>💼</span>
              <span style={styles.logoText}>JobBoard</span>
            </div>

            <div style={styles.navLinks}>
              {/* Jobs can be viewed whether logged in or not */}
              <NavLink 
                to="/jobs" 
                style={({ isActive }) => isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
              >
                Jobs
              </NavLink>
              
              {/* Only show these links if the user is registered/logged in */}
              {seekerId ? (
                <>
                  <NavLink 
                    to="/tracker" 
                    style={({ isActive }) => isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
                  >
                    My Status
                  </NavLink>
                  <NavLink 
                    to="/profile" 
                    style={({ isActive }) => isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
                  >
                    Profile
                  </NavLink>
                  <div style={styles.divider}></div>
                  <button onClick={logout} style={styles.logoutButton}>
                    Logout
                  </button>
                </>
              ) : (
                <NavLink 
                  to="/register" 
                  style={({ isActive }) => isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
                >
                  Register
                </NavLink>
              )}
            </div>
          </nav>

          {/* Main Content Area */}
          <main style={styles.mainContent}>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to={seekerId ? "/jobs" : "/register"} replace />} />
              
              {/* Public/Auth Routes */}
              <Route path="/register" element={seekerId ? <Navigate to="/jobs" replace /> : <Register />} />
              <Route path="/jobs" element={<JobListings />} />
              
              {/* Protected Registration Flow */}
              <Route 
                path="/upload-selfie" 
                element={<ProtectedRoute seekerId={seekerId}><UploadSelfie /></ProtectedRoute>} 
              />
              <Route 
                path="/profile" 
                element={<ProtectedRoute seekerId={seekerId}><CompleteProfile /></ProtectedRoute>} 
              />
              
              {/* Protected App Features */}
              <Route 
                path="/tracker" 
                element={<ProtectedRoute seekerId={seekerId}><ApplicationTracker /></ProtectedRoute>} 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SeekerContext.Provider>
  );
}

// Extracted Styles
const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '16px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoEmoji: {
    fontSize: '1.5rem',
  },
  logoText: {
    fontWeight: '700',
    fontSize: '1.25rem',
    color: '#1d4ed8', // Vibrant blue
    letterSpacing: '-0.025em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  navLink: {
    textDecoration: 'none',
    color: '#4b5563',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: '600',
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#d1d5db',
    margin: '0 4px',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b7280',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px 16px',
  }
};