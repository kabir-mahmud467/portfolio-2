import dotenv from 'dotenv'
import connectDB from './config/db.js'
import User from './models/User.js'
import bcrypt from 'bcryptjs'
import { pathToFileURL } from 'url'

dotenv.config()

export async function ensureAdminUser() {
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    throw new Error('Missing ADMIN_USERNAME or ADMIN_PASSWORD in environment variables')
  }

  const hash = await bcrypt.hash(password, 10)
  const existing = await User.collection.findOne({ $or: [{ username }, { email: username }] })
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      {
        $set: {
          username,
          password: hash,
          isAdmin: true,      
        },
        $unset: {
          email: 1,
        },
      }
    )
  } else {
    await User.create({ username, password: hash, isAdmin: true })
  }
  console.log('Admin created:', username)
}

async function seed() {
  await connectDB()
  await ensureAdminUser()
  process.exit(0)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed().catch(err => { console.error(err); process.exit(1) })
}
