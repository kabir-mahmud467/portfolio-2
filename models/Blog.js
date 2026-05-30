import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  image: String,
  author: String,
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  accentColor: String,
  textColor: String,
  backgroundColor: String,
  titleSize: String,
  contentSize: String,
}, { timestamps: true })

export default mongoose.model('Blog', BlogSchema)
