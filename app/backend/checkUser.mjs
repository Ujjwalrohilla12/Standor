import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });

const uri = process.env.DB_URL || process.env.MONGO_URI;

if (!uri) {
  console.error('No DB URI in .env');
  process.exit(2);
}

const run = async () => {
  try {
    await mongoose.connect(uri, { dbName: 'standor', serverSelectionTimeoutMS: 5000 });
    console.log('Connected to Mongo');
    const User = (await import('./models/User.js')).default;
    const AuthSession = (await import('./models/AuthSession.js')).default;

    const email = 'standorqinterview@gmail.com';
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log('User not found for', email);
    } else {
      console.log('User found:');
      console.log({ id: user._id.toString(), email: user.email, googleId: user.googleId, name: user.name, profileImage: user.profileImage });
      const sessions = await AuthSession.find({ userId: user._id }).lean();
      console.log('Auth sessions count:', sessions.length);
      sessions.slice(-5).forEach((s, i) => {
        console.log(i, { userAgent: s.userAgent, ip: s.ip, createdAt: s.createdAt });
      });
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
