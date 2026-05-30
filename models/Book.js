import mongoose from 'mongoose'

const BookSchema = new mongoose.Schema({
  title: String,
  slug: String,
  author: String,
  price: Number,
  image: String,
  pdf: String,
  description: String,
}, { timestamps: true })

export default mongoose.model('Book', BookSchema)
