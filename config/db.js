import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI

if (!MONGO_URI) {
  throw new Error('Missing MONGO_URI or MONGODB_URI in environment variables')
}

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log('MongoDB connected')
}

export default connectDB
