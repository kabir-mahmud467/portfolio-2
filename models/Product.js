import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  price: Number,
  category: String,
  image: String,
}, { timestamps: true })

export default mongoose.model('Product', ProductSchema)
