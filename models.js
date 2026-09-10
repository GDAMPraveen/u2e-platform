const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Make sure to: npm install bcryptjs

// 1. Job Seeker (User) Schema
const seekerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  mobile: { 
    type: String, 
    required: [true, 'Mobile number is required'], 
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  isMobileVerified: { type: Boolean, default: false },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  isEmailVerified: { type: Boolean, default: false },
  
  // Government IDs with strict formatting rules
  aadharNumber: { 
    type: String, 
    required: [true, 'Aadhaar number is required'], 
    unique: true,
    match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits']
  },
  panNumber: { 
    type: String, 
    default: null,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format'] 
  },
  selfieUrl: { type: String, default: null },

  // Profile Data
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    yearOfPassing: { type: Number, required: true },
    percentageOrCgpa: { type: String, required: true }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: { 
      type: String,
      match: [/^[0-9]{6}$/, 'Pincode must be 6 digits']
    }
  },
  experience: [{
    company: String,
    designation: String,
    years: Number
  }],
  resumeUrl: { type: String, default: null },
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });


// 2. Admin / Company Schema
const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true,
    select: false // SECURITY: Prevents password from being returned in standard queries
  },
  companyName: { type: String, required: true, trim: true },
  role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] }
}, { timestamps: true });

// Auto-hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// 3. Job Listing Schema
const jobSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true,
    index: true // Faster queries when dashboard loads company jobs
  },
  companyName: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skillsRequired: [{ type: String, trim: true }],
  location: { type: String, required: true },
  salaryRange: { type: String, default: 'Not disclosed' },
  status: { 
    type: String, 
    enum: ['open', 'closed'], 
    default: 'open',
    index: true // Speeds up the public job board query (find all 'open')
  }
}, { timestamps: true });


// 4. Job Application Schema
const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true,
    index: true // Speeds up recruiter loading pipeline for a specific job
  },
  seekerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seeker', 
    required: true,
    index: true // Speeds up seeker loading their applied jobs dashboard
  },
  status: { 
    type: String, 
    enum: ['applied', 'under_review', 'shortlisted', 'selected', 'rejected'], 
    default: 'applied' 
  }
}, { timestamps: true });

// Prevent duplicate applications (Compound Index)
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

module.exports = {
  Seeker: mongoose.model('Seeker', seekerSchema),
  Admin: mongoose.model('Admin', adminSchema),
  Job: mongoose.model('Job', jobSchema),
  Application: mongoose.model('Application', applicationSchema)
};