import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export function getMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI || ''
}

async function connectDB() {
  const mongoUri = getMongoUri()

  if (!mongoUri) {
    throw new Error('Missing MONGO_URI or MONGODB_URI in environment variables')
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log('MongoDB connected')
}

export default connectDB
