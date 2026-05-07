import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const uri = process.env.DB_URL || process.env.MONGO_URI;
console.log('Using DB URI (masked):', uri ? uri.replace(/(mongodb\+srv:\/\/)([^:@]+):(.*?)(@)/, '$1$2:***@') : 'NO_URI');

if (!uri) {
  console.error('No DB URI found in .env');
  process.exit(2);
}

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connection successful');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection error:');
    console.error(err);
    process.exit(1);
  }
})();
