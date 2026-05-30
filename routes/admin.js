import express from 'express'
import { ensureAdmin } from '../middleware/auth.js'
import { upload, uploadToCloudinary } from '../utils/upload.js'
import Project from '../models/Project.js'
import Blog from '../models/Blog.js'
import SocialLink from '../models/SocialLink.js'
import Product from '../models/Product.js'
import Book from '../models/Book.js'
import Resource from '../models/Resource.js'
import Contact from '../models/Contact.js'
import { makeUniqueSlug } from '../utils/slug.js'

const router = express.Router()

async function resolveImage(req, folder, fallback = '') {
  const uploadedImage = req.file
    ? (await uploadToCloudinary(req.file.buffer, folder)).secure_url
    : ''
  const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl.trim() : ''

  return uploadedImage || imageUrl || fallback
}

router.get('/', ensureAdmin, async (req, res) => {
  const counts = {
    projects: await Project.countDocuments(),
    blogs: await Blog.countDocuments(),
    products: await Product.countDocuments(),
    books: await Book.countDocuments(),
    resources: await Resource.countDocuments(),
    socials: await SocialLink.countDocuments(),
    contacts: await Contact.countDocuments(),
  }
  res.render('admin/dashboard', { user: req.currentUser, counts })
})

// Projects
router.get('/projects', ensureAdmin, async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '10')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Project.find().sort('-createdAt').skip(skip).limit(limit),
    Project.countDocuments()
  ])
  res.render('admin/projects', { items, page, total, limit })
})
router.get('/projects/new', ensureAdmin, (req, res) => res.render('admin/newProject'))
router.post('/projects', ensureAdmin, upload.single('image'), async (req, res) => {
  const imageUrl = await resolveImage(req, 'projects')
  if (!req.body.title) return res.render('admin/newProject', { error: 'Title is required' })
  const slug = await makeUniqueSlug(Project, req.body.title, null, 'project')
  await Project.create({ ...req.body, slug, image: imageUrl })
  res.redirect('/admin/projects')
})

router.get('/projects/:id/edit', ensureAdmin, async (req, res) => {
  const item = await Project.findById(req.params.id)
  res.render('admin/editProject', { item })
})
router.post('/projects/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  const updates = { title: req.body.title, description: req.body.description, link: req.body.link, tech: req.body.tech }
  updates.slug = await makeUniqueSlug(Project, req.body.title, req.params.id, 'project')
  updates.image = await resolveImage(req, 'projects', (await Project.findById(req.params.id))?.image || '')
  await Project.findByIdAndUpdate(req.params.id, updates)
  res.redirect('/admin/projects')
})
router.post('/projects/:id/delete', ensureAdmin, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id)
  res.redirect('/admin/projects')
})

// Blogs
router.get('/blogs', ensureAdmin, async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '10')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Blog.find().sort('-createdAt').skip(skip).limit(limit),
    Blog.countDocuments()
  ])
  res.render('admin/blogs', { items, page, total, limit })
})
router.get('/blogs/new', ensureAdmin, (req, res) => res.render('admin/newBlog'))
router.post('/blogs', ensureAdmin, upload.single('image'), async (req, res) => {
  const imageUrl = await resolveImage(req, 'blogs')
  if (!req.body.title) return res.render('admin/newBlog', { error: 'Title required' })
  const slug = await makeUniqueSlug(Blog, req.body.title, null, 'blog')
  await Blog.create({ ...req.body, slug, image: imageUrl })
  res.redirect('/admin/blogs')
})

router.get('/blogs/:id/edit', ensureAdmin, async (req, res) => {
  const item = await Blog.findById(req.params.id)
  res.render('admin/editBlog', { item })
})
router.post('/blogs/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  const updates = { title: req.body.title, content: req.body.content, tags: req.body.tags }
  updates.slug = await makeUniqueSlug(Blog, req.body.title, req.params.id, 'blog')
  updates.image = await resolveImage(req, 'blogs', (await Blog.findById(req.params.id))?.image || '')
  await Blog.findByIdAndUpdate(req.params.id, updates)
  res.redirect('/admin/blogs')
})
router.post('/blogs/:id/delete', ensureAdmin, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id)
  res.redirect('/admin/blogs')
})

// Social links
router.get('/socials', ensureAdmin, async (req, res) => {
  const items = await SocialLink.find().sort('-createdAt')
  res.render('admin/socials', { items })
})
router.post('/socials', ensureAdmin, upload.single('image'), async (req, res) => {
  if (!req.body.platform || !req.body.url) return res.render('admin/socials', { items: await SocialLink.find().sort('-createdAt'), error: 'Platform and URL required' })
  const image = await resolveImage(req, 'socials')
  const slug = await makeUniqueSlug(SocialLink, req.body.platform, null, 'social')
  await SocialLink.create({ ...req.body, slug, image })
  res.redirect('/admin/socials')
})
router.post('/socials/:id/delete', ensureAdmin, async (req, res) => {
  await SocialLink.findByIdAndDelete(req.params.id)
  res.redirect('/admin/socials')
})
router.get('/socials/:id/edit', ensureAdmin, async (req, res) => {
  const item = await SocialLink.findById(req.params.id)
  res.render('admin/editSocial', { item })
})
router.post('/socials/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  const existing = await SocialLink.findById(req.params.id)
  const updates = {
    platform: req.body.platform,
    url: req.body.url,
    icon: req.body.icon,
    slug: await makeUniqueSlug(SocialLink, req.body.platform, req.params.id, 'social'),
    image: await resolveImage(req, 'socials', existing?.image || ''),
  }
  await SocialLink.findByIdAndUpdate(req.params.id, updates)
  res.redirect('/admin/socials')
})

// Products
router.get('/products', ensureAdmin, async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '10')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Product.find().sort('-createdAt').skip(skip).limit(limit),
    Product.countDocuments()
  ])
  res.render('admin/products', { items, page, total, limit })
})
router.get('/products/new', ensureAdmin, (req, res) => res.render('admin/newProduct'))
router.post('/products', ensureAdmin, upload.single('image'), async (req, res) => {
  const imageUrl = await resolveImage(req, 'products')
  const price = parseFloat(req.body.price || 0)
  const slug = await makeUniqueSlug(Product, req.body.title, null, 'product')
  await Product.create({ ...req.body, slug, price, image: imageUrl })
  res.redirect('/admin/products')
})
router.get('/products/:id/edit', ensureAdmin, async (req, res) => {
  const item = await Product.findById(req.params.id)
  res.render('admin/editProduct', { item })
})
router.post('/products/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  const updates = { title: req.body.title, description: req.body.description, category: req.body.category, price: parseFloat(req.body.price || 0) }
  updates.slug = await makeUniqueSlug(Product, req.body.title, req.params.id, 'product')
  updates.image = await resolveImage(req, 'products', (await Product.findById(req.params.id))?.image || '')
  await Product.findByIdAndUpdate(req.params.id, updates)
  res.redirect('/admin/products')
})
router.post('/products/:id/delete', ensureAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
  res.redirect('/admin/products')
})

// Books
router.get('/books', ensureAdmin, async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '10')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Book.find().sort('-createdAt').skip(skip).limit(limit),
    Book.countDocuments()
  ])
  res.render('admin/books', { items, page, total, limit })
})
router.get('/books/new', ensureAdmin, (req, res) => res.render('admin/newBook'))
router.post('/books', ensureAdmin, upload.single('image'), async (req, res) => {
  const imageUrl = await resolveImage(req, 'books')
  const price = parseFloat(req.body.price || 0)
  const slug = await makeUniqueSlug(Book, req.body.title, null, 'book')
  await Book.create({ ...req.body, slug, price, image: imageUrl })
  res.redirect('/admin/books')
})
router.get('/books/:id/edit', ensureAdmin, async (req, res) => {
  const item = await Book.findById(req.params.id)
  res.render('admin/editBook', { item })
})
router.post('/books/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  const updates = { title: req.body.title, author: req.body.author, description: req.body.description, price: parseFloat(req.body.price || 0) }
  updates.slug = await makeUniqueSlug(Book, req.body.title, req.params.id, 'book')
  updates.image = await resolveImage(req, 'books', (await Book.findById(req.params.id))?.image || '')
  await Book.findByIdAndUpdate(req.params.id, updates)
  res.redirect('/admin/books')
})
router.post('/books/:id/delete', ensureAdmin, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id)
  res.redirect('/admin/books')
})

// Resources
router.get('/resources', ensureAdmin, async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '10')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Resource.find().sort('-createdAt').skip(skip).limit(limit),
    Resource.countDocuments()
  ])
  res.render('admin/resources', { items, page, total, limit })
})
router.get('/resources/new', ensureAdmin, (req, res) => res.render('admin/newResource'))
router.post('/resources', ensureAdmin, upload.single('image'), async (req, res) => {
  const image = await resolveImage(req, 'resources')
  const price = parseFloat(req.body.price || 0)
  const slug = await makeUniqueSlug(Resource, req.body.title, null, 'resource')
  await Resource.create({ ...req.body, slug, price, image })
  res.redirect('/admin/resources')
})
router.get('/resources/:id/edit', ensureAdmin, async (req, res) => {
  const item = await Resource.findById(req.params.id)
  res.render('admin/editResource', { item })
})
router.post('/resources/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  const existing = await Resource.findById(req.params.id)
  const updates = {
    title: req.body.title,
    description: req.body.description,
    link: req.body.link,
    slug: await makeUniqueSlug(Resource, req.body.title, req.params.id, 'resource'),
    price: parseFloat(req.body.price || 0),
    image: await resolveImage(req, 'resources', existing?.image || ''),
  }
  await Resource.findByIdAndUpdate(req.params.id, updates)
  res.redirect('/admin/resources')
})
router.post('/resources/:id/delete', ensureAdmin, async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id)
  res.redirect('/admin/resources')
})

// Contacts
router.get('/contacts', ensureAdmin, async (req, res) => {
  const items = await Contact.find().sort('-createdAt')
  res.render('admin/contacts', { items })
})

export default router
