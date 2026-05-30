import express from 'express'
import Project from '../models/Project.js'
import Blog from '../models/Blog.js'
import Product from '../models/Product.js'
import Book from '../models/Book.js'
import Resource from '../models/Resource.js'
import SocialLink from '../models/SocialLink.js'
import { ensureAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public APIs with pagination
router.get('/projects', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '10')
  const skip = (page - 1) * limit
  const items = await Project.find().sort('-createdAt').skip(skip).limit(limit)
  const total = await Project.countDocuments()
  res.json({ items, page, total, limit })
})

router.get('/projects/:id', async (req, res) => {
  const item = await Project.findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

router.get('/blogs', async (req, res) => {
  const items = await Blog.find().sort('-createdAt').limit(20)
  res.json(items)
})

router.get('/products', async (req, res) => {
  const items = await Product.find().sort('-createdAt').limit(50)
  res.json(items)
})

router.get('/books', async (req, res) => {
  const items = await Book.find().sort('-createdAt').limit(50)
  res.json(items)
})

router.get('/resources', async (req, res) => {
  const items = await Resource.find().sort('-createdAt')
  res.json(items)
})

router.get('/socials', async (req, res) => {
  const items = await SocialLink.find().sort('-createdAt')
  res.json(items)
})

// Admin CRUD APIs (protected)
router.delete('/projects/:id', ensureAdmin, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

router.delete('/blogs/:id', ensureAdmin, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router
