import mongoose from 'mongoose'

const ResourceSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  link: String,
  image: String,
  pdf: String,
  price: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true })

export default mongoose.model('Resource', ResourceSchema)
