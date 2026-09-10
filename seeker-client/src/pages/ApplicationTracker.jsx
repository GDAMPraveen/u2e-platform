import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { SeekerContext } from '../App';

export default function ApplicationTracker() {
  const { seekerId } = useContext(SeekerContext);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!seekerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    axios
      .get(`/api/seeker/${seekerId}/applications`)
      .then((res) => {
        setApplications(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [seekerId]);

  // Helper function to return beautiful, modern badge colors based on status
  const getBadgeStyle = (status = 'pending') => {
    const normalizedStatus = status.toLowerCase();
    
    const styles = {
      selected: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      interview: { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },
      pending: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
    };

    const currentStyle = styles[normalizedStatus] || styles.pending;

    return {
      backgroundColor: currentStyle.bg,
      color: currentStyle.text,
      border: `1px solid ${currentStyle.border}`,
      padding: '4px 12px',
      borderRadius: '20px', // Pill shape for modern look
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Applications</h2>

      {/* Loading State */}
      {isLoading && (
        <div style={styles.messageBox}>
          <p style={styles.loadingText}>Loading your applications...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div style={{ ...styles.messageBox, backgroundColor: '#fef2f2', color: '#991b1b' }}>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && applications.length === 0 && (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyStateTitle}>No applications yet</h3>
          <p style={styles.emptyStateText}>When you apply for jobs, they will appear here.</p>
        </div>
      )}

      {/* Data List */}
      {!isLoading && !error && applications.length > 0 && (
        <div style={styles.listContainer}>
          {applications.map((app) => (
            <div key={app._id} style={styles.card}>
              <div style={styles.cardContent}>
                <h4 style={styles.jobTitle}>{app.jobId?.title || 'Unknown Job Title'}</h4>
                <p style={styles.companyName}>{app.jobId?.companyName || 'Company unlisted'}</p>
                {/* Optional: Add a date here if your DB provides it, e.g., app.createdAt */}
              </div>
              <div style={styles.badgeContainer}>
                <span style={getBadgeStyle(app.status)}>{app.status || 'Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Extracted styles for a cleaner component and easier maintenance
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '12px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px', // Modern spacing between cards
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  jobTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  companyName: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  badgeContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  messageBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px dashed #d1d5db',
  },
  loadingText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px dashed #d1d5db',
  },
  emptyStateTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.125rem',
    color: '#374151',
  },
  emptyStateText: {
    margin: 0,
    color: '#6b7280',
  },
};