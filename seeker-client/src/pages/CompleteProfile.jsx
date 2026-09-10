import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SeekerContext } from '../App';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { seekerId, setProfile } = useContext(SeekerContext);
  
  // Clean, empty initial state for a production app
  const [form, setForm] = useState({
    degree: '', institution: '', yearOfPassing: '', percentageOrCgpa: '',
    street: '', city: '', state: '', pincode: '',
    company: '', designation: '', years: ''
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reusable handler to keep JSX clean
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('education', JSON.stringify([{ 
      degree: form.degree, 
      institution: form.institution, 
      yearOfPassing: Number(form.yearOfPassing), 
      percentageOrCgpa: form.percentageOrCgpa 
    }]));
    data.append('address', JSON.stringify({ 
      street: form.street, 
      city: form.city, 
      state: form.state, 
      pincode: form.pincode 
    }));
    data.append('experience', JSON.stringify([{ 
      company: form.company, 
      designation: form.designation, 
      years: Number(form.years) 
    }]));

    if (resumeFile) data.append('resume', resumeFile);

    try {
      const res = await axios.post(`/api/seeker/profile/${seekerId}`, data);
      setProfile(res.data.profile);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Complete Your Profile</h2>
        <p style={styles.subtitle}>Step 3: Background & Resume</p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Education Section */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Education</h4>
          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Degree</label>
              <input name="degree" placeholder="e.g. B.Tech CSE" value={form.degree} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Institution</label>
              <input name="institution" placeholder="e.g. ABC College" value={form.institution} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Year of Passing</label>
              <input name="yearOfPassing" type="number" placeholder="e.g. 2024" value={form.yearOfPassing} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>CGPA / Percentage</label>
              <input name="percentageOrCgpa" placeholder="e.g. 8.5" value={form.percentageOrCgpa} onChange={handleChange} required style={styles.input} />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Experience</h4>
          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Company</label>
              <input name="company" placeholder="e.g. Tech Corp" value={form.company} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Designation</label>
              <input name="designation" placeholder="e.g. Frontend Intern" value={form.designation} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Years of Experience</label>
              <input name="years" type="number" step="0.1" placeholder="e.g. 1.5" value={form.years} onChange={handleChange} style={styles.input} />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Address</h4>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Street Address</label>
            <input name="street" placeholder="e.g. 100 Feet Rd" value={form.street} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City</label>
              <input name="city" placeholder="e.g. Bengaluru" value={form.city} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>State</label>
              <input name="state" placeholder="e.g. Karnataka" value={form.state} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pincode</label>
              <input name="pincode" placeholder="e.g. 560038" value={form.pincode} onChange={handleChange} required style={styles.input} />
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Resume Document</h4>
          <div style={styles.fileUploadContainer}>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={e => setResumeFile(e.target.files[0])} 
              style={styles.fileInput}
              required
            />
            <small style={styles.helperText}>Accepted formats: PDF, DOC, DOCX. Max size: 5MB.</small>
          </div>
        </div>

        {/* Submit Action */}
        <button 
          type="submit" 
          style={{ 
            ...styles.submitButton, 
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving Profile...' : 'Complete Profile'}
        </button>
      </form>
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
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
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
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.125rem',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  fileUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fileInput: {
    padding: '8px 0',
  },
  helperText: {
    color: '#6b7280',
    fontSize: '0.75rem',
  },
  submitButton: {
    padding: '14px 24px',
    backgroundColor: '#2563eb', // Modern blue
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'background-color 0.2s',
  }
};