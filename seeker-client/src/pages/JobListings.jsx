import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { SeekerContext } from '../App';

export default function JobListings() {
  const { seekerId } = useContext(SeekerContext);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get('/api/jobs').then(res => setJobs(res.data)).catch(console.error);
  }, []);

  const handleApply = async (jobId) => {
    if (!seekerId) return alert('Please register and log in first');
    try {
      await axios.post('/api/jobs/apply', { seekerId, jobId });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h2>Explore Open Roles</h2>
      {jobs.map(job => (
        <div key={job._id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{job.title}</h3>
          <p style={{ margin: '4px 0', color: '#666' }}>{job.companyName} &bull; {job.location}</p>
          <p><strong>Package:</strong> {job.salaryRange}</p>
          <p>{job.description}</p>
          <button onClick={() => handleApply(job._id)} style={{ padding: '8px 16px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Apply</button>
        </div>
      ))}
    </div>
  );
}
