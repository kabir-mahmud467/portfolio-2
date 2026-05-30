import express from 'express'
import Project from '../models/Project.js'
import Blog from '../models/Blog.js'
import Product from '../models/Product.js'
import Book from '../models/Book.js'
import Resource from '../models/Resource.js'
import SocialLink from '../models/SocialLink.js'
import Contact from '../models/Contact.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null })
})

router.get('/home/', (req, res) => {
  res.render('index', { user: req.session.user || null })
})

router.get('/about/', (req, res) => {
  res.render('pages/about', { user: req.session.user || null })
})

router.get('/projects/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Project.find().sort('-createdAt').skip(skip).limit(limit),
    Project.countDocuments(),
  ])
  res.render('pages/projects', { user: req.session.user || null, items, page, total, limit })
})

router.get('/shop/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Product.find().sort('-createdAt').skip(skip).limit(limit),
    Product.countDocuments(),
  ])
  res.render('pages/shop', { user: req.session.user || null, items, page, total, limit })
})

router.get('/books/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Book.find().sort('-createdAt').skip(skip).limit(limit),
    Book.countDocuments(),
  ])
  res.render('pages/books', { user: req.session.user || null, items, page, total, limit })
})

router.get('/blog/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Blog.find().sort('-createdAt').skip(skip).limit(limit),
    Blog.countDocuments(),
  ])
  res.render('pages/blog', { user: req.session.user || null, items, page, total, limit })
})

router.get('/resources/', async (req, res) => {
  const items = await Resource.find().sort('-createdAt')
  res.render('pages/resources', { user: req.session.user || null, items })
})

router.get('/social/', async (req, res) => {
  const items = await SocialLink.find().sort('-createdAt')
  res.render('pages/social', { user: req.session.user || null, items })
})

router.get('/contact/', (req, res) => {
  res.render('pages/contact', { user: req.session.user || null })
})

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body
  try {
    await Contact.create({ name, email, message })
    res.redirect('/contact/?sent=1')
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed')
  }
})

export default router
