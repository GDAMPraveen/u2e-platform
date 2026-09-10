import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../App';

export default function PostJob() {
  const { admin } = useContext(AdminContext);
  const navigate = useNavigate();
  
  // Clean, empty initial state
  const [form, setForm] = useState({
    title: '', 
    location: '', 
    salaryRange: '', 
    skillsRequired: '', 
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Centralized change handler keeps JSX clean
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post('/api/admin/jobs', {
        adminId: admin.adminId,
        companyName: admin.companyName,
        title: form.title,
        location: form.location,
        salaryRange: form.salaryRange,
        skillsRequired: form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
        description: form.description
      });
      
      // Redirect back to dashboard on success
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/jobs" style={styles.backLink}>
          &larr; Back to Dashboard
        </Link>
        <h2 style={styles.title}>Post a New Job Role</h2>
        <p style={styles.subtitle}>Create a listing to attract top talent for {admin?.companyName || 'your company'}.</p>
      </div>

      <div style={styles.card}>
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="title">Job Title *</label>
            <input 
              id="title"
              name="title"
              placeholder="e.g. Senior Frontend Developer" 
              required 
              value={form.title} 
              onChange={handleChange} 
              style={styles.input} 
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="location">Location *</label>
              <input 
                id="location"
                name="location"
                placeholder="e.g. Bengaluru / Remote" 
                required 
                value={form.location} 
                onChange={handleChange} 
                style={styles.input} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="salaryRange">Salary Range *</label>
              <input 
                id="salaryRange"
                name="salaryRange"
                placeholder="e.g. ₹8-12 LPA or $90k-$110k" 
                required 
                value={form.salaryRange} 
                onChange={handleChange} 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="skillsRequired">Required Skills *</label>
            <input 
              id="skillsRequired"
              name="skillsRequired"
              placeholder="e.g. React, Node.js, MongoDB (comma separated)" 
              required 
              value={form.skillsRequired} 
              onChange={handleChange} 
              style={styles.input} 
            />
            <small style={styles.helperText}>Separate each skill with a comma.</small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="description">Job Description *</label>
            <textarea 
              id="description"
              name="description"
              placeholder="Describe the responsibilities, requirements, and benefits of the role..." 
              required 
              value={form.description} 
              onChange={handleChange} 
              style={styles.textarea} 
            />
          </div>

          <div style={styles.footer}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Job Post'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Extracted Styles
const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '24px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#4f46e5', // Indigo link
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
  subtitle: {
    margin: '8px 0 0 0',
    color: '#6b7280',
    fontSize: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  helperText: {
    color: '#6b7280',
    fontSize: '0.75rem',
    marginTop: '-4px',
  },
  footer: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#16a34a', // Professional green
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  }
};