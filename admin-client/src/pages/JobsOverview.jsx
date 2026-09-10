import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../App';

export default function JobsOverview() {
  const { admin } = useContext(AdminContext);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!admin?.adminId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    axios
      .get(`/api/admin/${admin.adminId}/jobs-overview`)
      .then((res) => {
        setJobs(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err);
        setError('Failed to load your job postings. Please try refreshing.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [admin]);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Active Job Postings</h2>
          <p style={styles.subtitle}>Manage your listings and review candidates.</p>
        </div>
        <Link to="/post-job" style={styles.primaryButton}>
          <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Post New Job
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={styles.messageBox}>
          <p style={styles.loadingText}>Loading your dashboard...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && jobs.length === 0 && (
        <div style={styles.emptyState}>
          <svg style={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <h3 style={styles.emptyTitle}>No job listings yet</h3>
          <p style={styles.emptyText}>Get started by creating your first job posting to attract top talent.</p>
          <Link to="/post-job" style={{ ...styles.primaryButton, marginTop: '16px', display: 'inline-flex' }}>
            Create Job Post
          </Link>
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && jobs.length > 0 && (
        <div style={styles.listContainer}>
          {jobs.map((job) => (
            <div key={job._id} style={styles.card}>
              <div style={styles.cardInfo}>
                <h4 style={styles.jobTitle}>{job.title || 'Untitled Role'}</h4>
                <div style={styles.metaContainer}>
                  <span style={styles.metaItem}>
                    <svg style={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {job.location || 'Remote'}
                  </span>
                  <span style={styles.dot}>•</span>
                  <span style={styles.metaItem}>
                    <svg style={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {job.salaryRange || 'Salary unlisted'}
                  </span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <div style={styles.applicantBadge}>
                  <span style={styles.applicantCount}>{job.totalApplicants || 0}</span>
                  <span style={styles.applicantLabel}>Applicants</span>
                </div>
                
                <Link to={`/candidates/${job._id}`} style={styles.secondaryButton}>
                  Review Candidates &rarr;
                </Link>
              </div>
            </div>
          ))}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '1rem',
    color: '#6b7280',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    backgroundColor: '#16a34a', // Professional green
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
  },
  btnIcon: {
    width: '18px',
    height: '18px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
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
    fontSize: '1.1rem',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#94a3b8',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.25rem',
    color: '#1e293b',
  },
  emptyText: {
    margin: 0,
    color: '#64748b',
    maxWidth: '400px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: '1 1 min-content',
  },
  jobTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  metaContainer: {
    display: 'flex',
    alignItems: 'center',
    color: '#6b7280',
    fontSize: '0.9rem',
    flexWrap: 'wrap',
    gap: '8px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metaIcon: {
    width: '16px',
    height: '16px',
  },
  dot: {
    color: '#d1d5db',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  applicantBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  applicantCount: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2563eb', // Prominent blue
    lineHeight: '1',
  },
  applicantLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
  },
  secondaryButton: {
    padding: '10px 16px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  }
};