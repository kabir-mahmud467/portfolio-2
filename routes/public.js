import express from 'express'
import Project from '../models/Project.js'
import Blog from '../models/Blog.js'
import Product from '../models/Product.js'
import Book from '../models/Book.js'
import Resource from '../models/Resource.js'
import SocialLink from '../models/SocialLink.js'
import Contact from '../models/Contact.js'
import { getStripe } from '../config/stripe.js'

const router = express.Router()
const STRIPE_CURRENCY = 'usd'
const MIN_STRIPE_MINOR_AMOUNT = 50

function getPurchasedItems(req, key) {
  const ids = req.session?.[key]
  return new Set(Array.isArray(ids) ? ids : [])
}

function markPurchased(req, key, itemId) {
  if (!req.session) return
  const purchased = new Set(Array.isArray(req.session[key]) ? req.session[key] : [])
  purchased.add(String(itemId))
  req.session[key] = Array.from(purchased)
}

function getBaseUrl(req) {
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`
}

function getPurchaseConfig(kind) {
  const configs = {
    product: { model: Product, sessionKey: 'purchasedProducts', path: 'shop', label: 'Product' },
    book: { model: Book, sessionKey: 'purchasedBooks', path: 'books', label: 'Book' },
    resource: { model: Resource, sessionKey: 'purchasedResources', path: 'resources', label: 'Resource' },
  }

  return configs[kind] || null
}

async function createStripeCheckout(req, res, kind, slug) {
  try {
    const stripe = await getStripe()
    if (!stripe) return res.status(500).send('Stripe is not configured')

    const config = getPurchaseConfig(kind)
    if (!config) return res.status(400).send('Invalid purchase type')

    const item = await config.model.findOne({ slug })
    if (!item) return res.status(404).send(`${config.label} not found`)

  const amount = Math.round((Number.parseFloat(item.price) || 0) * 100)
  if (!amount || amount <= 0) return res.status(400).send('Item price must be greater than 0 to use Stripe checkout')
  if (amount < MIN_STRIPE_MINOR_AMOUNT) {
    return res.status(400).send('Stripe Checkout requires items to be at least $0.50.')
  }

    const baseUrl = getBaseUrl(req)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: req.sessionID,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${config.path}/${item.slug}/?cancelled=1`,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: amount,
          product_data: {
            name: item.title,
            description: item.description || `${config.label} purchase`,
            ...(item.image ? { images: [item.image] } : {}),
          },
        },
      }],
      metadata: {
        kind,
        item_id: String(item._id),
        slug: item.slug,
        session_key: config.sessionKey,
      },
    })

    if (!session.url) return res.status(500).send('Failed to create Stripe checkout session')
    return res.redirect(session.url)
  } catch (error) {
    console.error('Stripe checkout failed:', error?.message || error)
    return res.status(400).send(error?.message || 'Stripe checkout failed')
  }
}

router.get('/', (req, res) => {
  res.render('index', { user: req.currentUser || null })
})

router.get('/home/', (req, res) => {
  res.render('index', { user: req.currentUser || null })
})

router.get('/about/', (req, res) => {
  res.render('pages/about', { user: req.currentUser || null })
})

router.get('/projects/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Project.find().sort('-createdAt').skip(skip).limit(limit),
    Project.countDocuments(),
  ])
  res.render('pages/projects', { user: req.currentUser || null, items, page, total, limit })
})

router.get('/shop/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Product.find().sort('-createdAt').skip(skip).limit(limit),
    Product.countDocuments(),
  ])
  const purchasedProducts = getPurchasedItems(req, 'purchasedProducts')
  res.render('pages/shop', { user: req.currentUser || null, items, page, total, limit, purchasedProducts: Array.from(purchasedProducts) })
})

router.post('/shop/:slug/buy', async (req, res) => {
  return createStripeCheckout(req, res, 'product', req.params.slug)
})

router.get('/shop/:slug/', async (req, res) => {
  const item = await Product.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).send('Product not found')

  const purchasedProducts = getPurchasedItems(req, 'purchasedProducts')
  const purchased = purchasedProducts.has(String(item._id))
  res.render('pages/product', {
    user: req.currentUser || null,
    item,
    purchased,
    title: `${item.title} - Kabir Mahmud`,
    description: item.description || `Product details for ${item.title}.`,
    ogTitle: item.title,
    ogDescription: item.description || `Product details for ${item.title}.`,
    ogImage: item.image || '',
    ogType: 'product',
  })
})

router.get('/books/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Book.find().sort('-createdAt').skip(skip).limit(limit),
    Book.countDocuments(),
  ])
  const purchasedBooks = getPurchasedItems(req, 'purchasedBooks')
  res.render('pages/books', { user: req.currentUser || null, items, page, total, limit, purchasedBooks: Array.from(purchasedBooks) })
})

router.post('/books/:slug/buy', async (req, res) => {
  return createStripeCheckout(req, res, 'book', req.params.slug)
})

router.get('/books/:slug/', async (req, res) => {
  const item = await Book.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).send('Book not found')

  const purchasedBooks = getPurchasedItems(req, 'purchasedBooks')
  const purchased = purchasedBooks.has(String(item._id))
  res.render('pages/book', {
    user: req.currentUser || null,
    item,
    purchased,
    title: `${item.title} - Kabir Mahmud`,
    description: item.description || `Book details for ${item.title}.`,
    ogTitle: item.title,
    ogDescription: item.description || `Book details for ${item.title}.`,
    ogImage: item.image || '',
    ogType: 'book',
  })
})

router.get('/blog/', async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '12')
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Blog.find().sort('-createdAt').skip(skip).limit(limit),
    Blog.countDocuments(),
  ])
  res.render('pages/blog', { user: req.currentUser || null, items, page, total, limit })
})

router.get('/blog/:slug/', async (req, res) => {
  const item = await Blog.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).send('Blog post not found')

  res.render('pages/blogPost', {
    user: req.currentUser || null,
    item,
    title: item.metaTitle || item.title,
    description: item.metaDescription || (item.content ? String(item.content).slice(0, 160) : ''),
    keywords: item.metaKeywords || '',
    ogType: 'article',
    ogTitle: item.metaTitle || item.title,
    ogDescription: item.metaDescription || (item.content ? String(item.content).slice(0, 160) : ''),
    ogImage: item.image || '',
    themeColor: item.backgroundColor || '',
  })
})

router.get('/resources/', async (req, res) => {
  const items = await Resource.find().sort('-createdAt')
  const purchasedResources = getPurchasedItems(req, 'purchasedResources')
  res.render('pages/resources', { user: req.currentUser || null, items, purchasedResources: Array.from(purchasedResources) })
})

router.post('/resources/:slug/buy', async (req, res) => {
  return createStripeCheckout(req, res, 'resource', req.params.slug)
})

router.get('/checkout/success', async (req, res) => {
  try {
    const stripe = await getStripe()
    if (!stripe) return res.status(500).send('Stripe is not configured')

    const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : ''
    if (!sessionId) return res.status(400).send('Missing session_id')

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    const { kind, item_id: itemId, slug, session_key: sessionKey } = checkoutSession.metadata || {}

    if (checkoutSession.payment_status !== 'paid' || checkoutSession.client_reference_id !== req.sessionID || !kind || !itemId || !slug || !sessionKey) {
      return res.status(400).send('Payment not completed')
    }

    markPurchased(req, sessionKey, itemId)

    const config = getPurchaseConfig(kind)
    if (!config) return res.status(400).send('Invalid purchase type')

    res.redirect(`/${config.path}/${slug}/?purchased=1`)
  } catch (error) {
    console.error('Stripe success lookup failed:', error?.message || error)
    return res.status(400).send(error?.message || 'Stripe success lookup failed')
  }
})

router.get('/resources/:slug/', async (req, res) => {
  const item = await Resource.findOne({ slug: req.params.slug })
  if (!item) return res.status(404).send('Resource not found')

  const purchasedResources = getPurchasedItems(req, 'purchasedResources')
  const purchased = purchasedResources.has(String(item._id))
  res.render('pages/resource', {
    user: req.currentUser || null,
    item,
    purchased,
    title: `${item.title} - Kabir Mahmud`,
    description: item.description || `Resource details for ${item.title}.`,
    ogTitle: item.title,
    ogDescription: item.description || `Resource details for ${item.title}.`,
    ogImage: item.image || '',
    ogType: 'article',
  })
})

router.get('/social/', async (req, res) => {
  const items = await SocialLink.find().sort('-createdAt')
  res.render('pages/social', { user: req.currentUser || null, items })
})

router.get('/contact/', (req, res) => {
  res.render('pages/contact', { user: req.currentUser || null })
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
