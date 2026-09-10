import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';

// Page Imports
import AdminLogin from './pages/AdminLogin';
import PostJob from './pages/PostJob';
import JobsOverview from './pages/JobsOverview';
import CandidatePipeline from './pages/CandidatePipeline';

// Context Export
export const AdminContext = createContext();

// Security Wrapper for Private Routes
const ProtectedRoute = ({ admin, children }) => {
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  // Lazy initialize state from localStorage
  const [admin, setAdmin] = useState(() => 
    JSON.parse(localStorage.getItem('adminInfo') || 'null')
  );

  const login = (data) => {
    setAdmin(data);
    localStorage.setItem('adminInfo', JSON.stringify(data));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('adminInfo');
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout }}>
      <BrowserRouter>
        <div style={styles.appContainer}>
          
          {/* Dashboard Header - Only render navigation if logged in */}
          <header style={styles.header}>
            <div style={styles.logoContainer}>
              <div style={styles.logoIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h1 style={styles.brandName}>Employer Portal</h1>
                {admin && (
                  <p style={styles.companyName}>
                    Workspace: <strong>{admin.companyName}</strong>
                  </p>
                )}
              </div>
            </div>

            {admin && (
              <nav style={styles.navContainer}>
                {/* NavLink allows us to style the active tab automatically */}
                <NavLink 
                  to="/jobs" 
                  style={({ isActive }) => isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
                >
                  Dashboard
                </NavLink>
                
                <NavLink 
                  to="/post-job" 
                  style={({ isActive }) => isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
                >
                  Post a Job
                </NavLink>
                
                <div style={styles.divider}></div>

                <button onClick={logout} style={styles.logoutButton}>
                  <svg style={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Sign Out
                </button>
              </nav>
            )}
          </header>

          {/* Main Content Area */}
          <main style={styles.mainContent}>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to={admin ? "/jobs" : "/login"} replace />} />
              
              {/* Public Route */}
              <Route 
                path="/login" 
                element={admin ? <Navigate to="/jobs" replace /> : <AdminLogin />} 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/jobs" 
                element={<ProtectedRoute admin={admin}><JobsOverview /></ProtectedRoute>} 
              />
              <Route 
                path="/post-job" 
                element={<ProtectedRoute admin={admin}><PostJob /></ProtectedRoute>} 
              />
              <Route 
                path="/candidates/:jobId" 
                element={<ProtectedRoute admin={admin}><CandidatePipeline /></ProtectedRoute>} 
              />
            </Routes>
          </main>

        </div>
      </BrowserRouter>
    </AdminContext.Provider>
  );
}

// Extracted Styles
const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '16px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  companyName: {
    margin: '2px 0 0 0',
    fontSize: '0.85rem',
    color: '#64748b',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontWeight: '600',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#e2e8f0',
    margin: '0 8px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logoutIcon: {
    width: '16px',
    height: '16px',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px',
  }
};