const mongoose = require('mongoose');
const dns = require('node:dns');

// Safely apply the DNS SRV hack ONLY in local development.
// Applying this in production can break container routing (Docker, AWS, Vercel, etc.)
if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DNS === 'true') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.warn('⚠️ Running with custom DNS servers (Local Dev Only)');
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in environment variables.');
    }

    // Connect with enterprise-grade connection options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,             // Maintain up to 10 active socket connections
      serverSelectionTimeoutMS: 5000, // Fail fast: Timeout after 5 seconds instead of hanging
      family: 4                    // Force IPv4, prevents slow connection issues on some networks
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Startup Error: ${error.message}`);
    // Exit process with failure (1) so your hosting platform knows it crashed and restarts it
    process.exit(1); 
  }
};

// Listeners to monitor database health AFTER the initial connection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Connection lost.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Runtime Error: ${err.message}`);
});

module.exports = connectDB;