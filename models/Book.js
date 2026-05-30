import mongoose from 'mongoose'

const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  price: Number,
  image: String,
  description: String,
}, { timestamps: true })

export default mongoose.model('Book', BookSchema)
