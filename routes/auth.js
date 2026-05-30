import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router = express.Router()

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value)
}

router.get('/login', (req, res) => {
  res.render('auth/login', { error: null })
})

router.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim()
  const { password } = req.body
  const user = await User.findOne({ username }) || await User.findOne({ email: username })
  if (!user) return res.render('auth/login', { error: 'Invalid credentials' })
  const ok = isBcryptHash(user.password)
    ? await bcrypt.compare(password, user.password)
    : password === user.password
  if (!ok) return res.render('auth/login', { error: 'Invalid credentials' })

  if (!isBcryptHash(user.password)) {
    user.password = await bcrypt.hash(password, 10)
    await user.save()
  }

  req.session.user = { id: user._id, isAdmin: user.isAdmin, username: user.username }
  res.redirect('/admin')
})

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'))
})

export default router
