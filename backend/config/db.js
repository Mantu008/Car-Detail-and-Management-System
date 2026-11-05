const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/car-management-system';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Locally there's nothing useful to do without a database; on serverless let the platform retry.
    if (process.env.VERCEL !== '1') process.exit(1);
  }
};

module.exports = connectDB;
