import mongoose from 'mongoose'

const SocialLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
  icon: String,
}, { timestamps: true })

export default mongoose.model('SocialLink', SocialLinkSchema)
