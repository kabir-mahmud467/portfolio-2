import express from 'express'
import session from 'express-session'
import path from 'path'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import publicRoutes from './routes/public.js'
import apiRoutes from './routes/api.js'
import { ensureAdminUser } from './seedAdmin.js'

dotenv.config()
const __dirname = path.resolve()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// sessions (development; for production use a persistent store)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}))

app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// routes FIRST (before static serving) to ensure they take priority
app.use('/auth', authRoutes)
app.use('/admin', adminRoutes)
app.use('/', publicRoutes)
app.use('/api', apiRoutes)

// THEN serve static files
app.use(express.static(path.join(__dirname, 'public')))
// serve original frontend assets from the `src` folder (style, scripts, assets)
app.use('/src', express.static(path.join(__dirname, 'src')))

const PORT = process.env.PORT || 3000

connectDB().then(() => {
  return ensureAdminUser()
}).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}).catch(err => {
  console.error('Failed to connect to DB', err)
})
