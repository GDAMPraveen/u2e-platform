import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SeekerContext } from '../App';

export default function Register() {
  const navigate = useNavigate();
  const { saveSeekerId } = useContext(SeekerContext);
  
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    aadharNumber: '',
    panNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // A single handler keeps the JSX clean and easy to read
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
      const res = await axios.post('/api/seeker/register', form);
      saveSeekerId(res.data.seekerId);
      navigate('/upload-selfie');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Candidate Account</h2>
          <p style={styles.subtitle}>Step 1: Basic Information</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="name">Full Name *</label>
            <input 
              id="name"
              name="name"
              placeholder="e.g. Jane Doe" 
              required 
              value={form.name} 
              onChange={handleChange} 
              style={styles.input} 
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="mobile">Mobile Number *</label>
              <input 
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="10-digit mobile number" 
                required 
                value={form.mobile} 
                onChange={handleChange} 
                style={styles.input} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="email">Email Address *</label>
              <input 
                id="email"
                name="email"
                type="email" 
                placeholder="jane@example.com" 
                required 
                value={form.email} 
                onChange={handleChange} 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="aadharNumber">Aadhaar Number *</label>
              <input 
                id="aadharNumber"
                name="aadharNumber"
                placeholder="12-digit number" 
                required 
                value={form.aadharNumber} 
                onChange={handleChange} 
                style={styles.input} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="panNumber">PAN Number (Optional)</label>
              <input 
                id="panNumber"
                name="panNumber"
                placeholder="e.g. ABCDE1234F" 
                value={form.panNumber} 
                onChange={handleChange} 
                style={styles.input} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Continue to Photo Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Extracted styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '600px',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
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
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
    fontSize: '0.875rem',
    textAlign: 'center',
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
    fontSize: '1rem',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: '12px',
    padding: '14px 24px',
    backgroundColor: '#2563eb', // Trustworthy tech blue
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  }
};