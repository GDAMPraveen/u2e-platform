const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // Required for secure login
const { Seeker, Admin, Job, Application } = require('./models');

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Secure Multer Storage & Limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// Security: Restrict file types and size (5MB max)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, PDF, and DOCX are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter 
});

// ===================================================
// USER (SEEKER) FLOW
// ===================================================

// 1. Initial Sign-up
router.post('/seeker/register', async (req, res) => {
  try {
    const { name, mobile, email, aadharNumber, panNumber } = req.body;

    if (!name || !mobile || !email || !aadharNumber) {
      return res.status(400).json({ error: 'Name, Mobile, Email, and Aadhaar are mandatory.' });
    }

    const seeker = new Seeker({
      name,
      mobile,
      isMobileVerified: true,
      email,
      isEmailVerified: true,
      aadharNumber,
      panNumber
    });

    await seeker.save();
    res.status(201).json({ message: 'Registration initial step completed', seekerId: seeker._id });
  } catch (error) {
    // Handle MongoDB duplicate key errors cleanly
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User with this Email, Mobile, or Aadhaar already exists.' });
    }
    res.status(400).json({ error: error.message });
  }
});

// 2. Upload Selfie (Strictly expects a 'selfie' file field)
router.post('/seeker/upload-selfie', upload.single('selfie'), async (req, res) => {
  try {
    const seekerId = req.body?.seekerId;
    if (!seekerId) {
      return res.status(400).json({ error: 'seekerId is required' });
    }

    // req.file is populated by upload.single()
    const selfieUrl = req.file ? `/uploads/${req.file.filename}` : req.body?.selfieUrl;

    if (!selfieUrl) {
      return res.status(400).json({ error: 'No image provided.' });
    }

    const seeker = await Seeker.findByIdAndUpdate(
      seekerId,
      { selfieUrl },
      { returnDocument: 'after' }
    );

    if (!seeker) {
      return res.status(404).json({ error: 'Seeker not found' });
    }

    res.json({ message: 'Selfie uploaded successfully!', seeker });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Complete Profile Details + Resume Upload (Strictly expects a 'resume' file field)
const handleProfileUpdate = async (req, res) => {
  try {
    let { education, address, experience } = req.body;

    // Parse incoming stringified JSON from FormData
    if (typeof education === 'string') try { education = JSON.parse(education); } catch (e) {}
    if (typeof address === 'string') try { address = JSON.parse(address); } catch (e) {}
    if (typeof experience === 'string') try { experience = JSON.parse(experience); } catch (e) {}

    const existing = await Seeker.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Seeker not found' });
    }

    // Assign new resume URL if a file was uploaded, otherwise keep existing
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : existing.resumeUrl;
    
    const finalEducation = education || existing.education;
    const finalAddress = address || existing.address;
    const finalExperience = experience || existing.experience;

    // Verify minimum requirements for a "Complete Profile"
    const isComplete = Boolean(
      finalEducation?.length > 0 &&
      finalAddress && (finalAddress.city || finalAddress.street) &&
      resumeUrl
    );

    const updatedSeeker = await Seeker.findByIdAndUpdate(
      req.params.id,
      {
        education: finalEducation,
        address: finalAddress,
        experience: finalExperience,
        resumeUrl: resumeUrl,
        isProfileComplete: isComplete
      },
      { returnDocument: 'after' }
    );

    res.json({ message: 'Profile updated successfully', profile: updatedSeeker });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

router.post('/seeker/profile/:id', upload.single('resume'), handleProfileUpdate);
router.put('/seeker/profile/:id', upload.single('resume'), handleProfileUpdate);


// 4. Job Listings
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Apply for a Job
router.post('/jobs/apply', async (req, res) => {
  try {
    const { seekerId, jobId } = req.body;

    const seeker = await Seeker.findById(seekerId);
    if (!seeker) {
      return res.status(404).json({ error: 'Seeker not found' });
    }

    if (!seeker.isProfileComplete) {
      return res.status(403).json({ 
        error: 'Incomplete profile. Please complete your education, address, and resume upload before applying.' 
      });
    }

    const application = new Application({ jobId, seekerId });
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }
    res.status(400).json({ error: error.message });
  }
});

// 6. User Application Tracker
router.get('/seeker/:seekerId/applications', async (req, res) => {
  try {
    const applications = await Application.find({ seekerId: req.params.seekerId })
      .populate('jobId', 'title companyName location salaryRange status')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===================================================
// ADMIN FLOW
// ===================================================

router.post('/admin/seed', async (req, res) => {
  try {
    const { username, password, companyName } = req.body;
    const admin = new Admin({ username, password, companyName });
    await admin.save();
    res.status(201).json({ message: 'Admin account created', admin });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Username already exists.' });
    res.status(400).json({ error: error.message });
  }
});

// 🔐 SECURE ADMIN LOGIN
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // We must use `.select('+password')` because we hid it in the Schema
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Securely compare the plain text password with the hashed database password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    res.json({ message: 'Admin login successful', adminId: admin._id, companyName: admin.companyName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/jobs', async (req, res) => {
  try {
    const { adminId, companyName, title, description, skillsRequired, location, salaryRange } = req.body;
    const job = new Job({ adminId, companyName, title, description, skillsRequired, location, salaryRange });
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/admin/:adminId/jobs-overview', async (req, res) => {
  try {
    const jobs = await Job.find({ adminId: req.params.adminId }).sort({ createdAt: -1 });
    
    // Using Promise.all to fetch applicant counts concurrently for better performance
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return { ...job.toObject(), totalApplicants: count };
      })
    );
    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/jobs/:jobId/candidates', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('seekerId', 'name mobile email panNumber selfieUrl resumeUrl education address experience')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/admin/applications/:applicationId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { returnDocument: 'after' }
    );
    
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    res.json({ message: `Candidate status changed to ${status}`, application });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;