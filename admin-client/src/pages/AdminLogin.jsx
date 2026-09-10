import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../App';

export default function AdminLogin() {
  const { login } = useContext(AdminContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/api/admin/seed', {
        username: 'recruiter_' + Math.floor(Math.random() * 1000),
        password: 'AdminPassword123',
        companyName: 'TechSolutions India'
      });
      
      login({ 
        adminId: res.data.admin._id, 
        companyName: res.data.admin.companyName 
      });
      
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create demo environment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Decorative Icon/Logo Placeholder */}
        <div style={styles.iconContainer}>
          <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>

        <div style={styles.header}>
          <h2 style={styles.title}>Recruiter Portal</h2>
          <p style={styles.subtitle}>Demo Environment Access</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Click below to instantly generate a mock recruiter profile and log in to the dashboard.
          </p>
        </div>

        <button 
          onClick={handleSeed} 
          disabled={isLoading}
          style={{
            ...styles.button,
            opacity: isLoading ? 0.8 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <span style={styles.buttonContent}>
              <svg style={styles.spinner} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Workspace...
            </span>
          ) : (
            'Generate & Login Demo Admin'
          )}
        </button>
      </div>
    </div>
  );
}

// Extracted Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    textAlign: 'center',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    backgroundColor: '#0f172a', // Dark enterprise blue
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)',
  },
  icon: {
    width: '32px',
    height: '32px',
    color: '#ffffff',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#64748b',
    fontSize: '0.95rem',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
    fontSize: '0.875rem',
  },
  infoBox: {
    backgroundColor: '#f1f5f9',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  infoText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: '1.5',
  },
  button: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#0f172a', // Matches enterprise icon
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    animation: 'spin 1s linear infinite',
  }
};

// Add this to your global CSS or index.css to make the spinner rotate
const globalStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;