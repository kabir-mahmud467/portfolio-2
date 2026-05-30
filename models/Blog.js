import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  image: String,
  author: String,
  tags: [String],
}, { timestamps: true })

export default mongoose.model('Blog', BlogSchema)
