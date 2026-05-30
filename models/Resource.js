import mongoose from 'mongoose'

const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  tags: [String],
}, { timestamps: true })

export default mongoose.model('Resource', ResourceSchema)
