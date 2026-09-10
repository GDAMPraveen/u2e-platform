import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CandidatePipeline() {
  const { jobId } = useParams();
  
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tracks which application is currently being updated to disable its buttons
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/admin/jobs/${jobId}/candidates`)
      .then((res) => {
        setCandidates(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidate pipeline. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [jobId]);

  const updateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    setError(null);
    
    try {
      await axios.patch(`/api/admin/applications/${appId}/status`, { status: newStatus });
      
      // Update local state instantly instead of re-fetching the entire list
      setCandidates((prev) => 
        prev.map((c) => (c._id === appId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update candidate status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper function for styling the status badge
  const getBadgeStyle = (status) => {
    const normalized = (status || '').toLowerCase();
    const styles = {
      selected: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      shortlisted: { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },
      pending: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
    };
    const current = styles[normalized] || styles.pending;
    
    return {
      backgroundColor: current.bg,
      color: current.text,
      border: `1px solid ${current.border}`,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link to="/jobs" style={styles.backLink}>
            &larr; Back to Listings
          </Link>
          <h2 style={styles.title}>Candidate Review Pipeline</h2>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={styles.messageBox}>
          <p style={styles.loadingText}>Loading candidates...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && candidates.length === 0 && (
        <div style={styles.messageBox}>
          <h3 style={styles.emptyTitle}>No candidates yet</h3>
          <p style={styles.emptyText}>When job seekers apply to this role, they will appear here.</p>
        </div>
      )}

      {/* Pipeline List */}
      {!isLoading && candidates.length > 0 && (
        <div style={styles.listContainer}>
          {candidates.map((c) => {
            const isUpdating = updatingId === c._id;
            
            return (
              <div key={c._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.candidateName}>{c.seekerId?.name || 'Unknown Candidate'}</h4>
                    <p style={styles.contactInfo}>
                      {c.seekerId?.email} <span style={styles.dot}>•</span> {c.seekerId?.mobile}
                    </p>
                  </div>
                  <div>
                    <span style={getBadgeStyle(c.status)}>{c.status}</span>
                  </div>
                </div>

                <div style={styles.assetsRow}>
                  {c.seekerId?.selfieUrl && (
                    <a href={c.seekerId.selfieUrl} target="_blank" rel="noreferrer" style={styles.assetLink}>
                      <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      View Photo
                    </a>
                  )}
                  {c.seekerId?.resumeUrl && (
                    <a href={c.seekerId.resumeUrl} target="_blank" rel="noreferrer" style={styles.assetLink}>
                      <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      View Resume
                    </a>
                  )}
                </div>

                <div style={styles.actionsRow}>
                  <p style={styles.actionsLabel}>Update Status:</p>
                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={() => updateStatus(c._id, 'shortlisted')} 
                      disabled={isUpdating}
                      style={{ ...styles.actionBtn, ...styles.btnWarning, opacity: isUpdating ? 0.6 : 1 }}
                    >
                      Shortlist
                    </button>
                    <button 
                      onClick={() => updateStatus(c._id, 'selected')} 
                      disabled={isUpdating}
                      style={{ ...styles.actionBtn, ...styles.btnSuccess, opacity: isUpdating ? 0.6 : 1 }}
                    >
                      Select
                    </button>
                    <button 
                      onClick={() => updateStatus(c._id, 'rejected')} 
                      disabled={isUpdating}
                      style={{ ...styles.actionBtn, ...styles.btnDanger, opacity: isUpdating ? 0.6 : 1 }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Extracted Styles
const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '16px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
    fontSize: '0.875rem',
  },
  messageBox: {
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px dashed #d1d5db',
  },
  loadingText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: '1.1rem',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.25rem',
    color: '#374151',
  },
  emptyText: {
    margin: 0,
    color: '#6b7280',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  candidateName: {
    margin: '0 0 4px 0',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  contactInfo: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  dot: {
    margin: '0 6px',
    color: '#d1d5db',
  },
  assetsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  assetLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    backgroundColor: '#eff6ff',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  icon: {
    width: '16px',
    height: '16px',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '16px',
  },
  actionsLabel: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4b5563',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnWarning: {
    backgroundColor: '#fef08a',
    color: '#854d0e',
  },
  btnSuccess: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
  },
  btnDanger: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  }
};