import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  image: String,
  tech: [String],
}, { timestamps: true })

export default mongoose.model('Project', ProjectSchema)
