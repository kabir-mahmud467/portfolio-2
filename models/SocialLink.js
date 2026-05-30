import mongoose from 'mongoose'

const SocialLinkSchema = new mongoose.Schema({
  platform: String,
  slug: String,
  url: String,
  icon: String,
  image: String,
}, { timestamps: true })

export default mongoose.model('SocialLink', SocialLinkSchema)
