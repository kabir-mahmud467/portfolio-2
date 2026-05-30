export function ensureAdmin(req, res, next) {
  const user = req.currentUser
  if (user && user.isAdmin) return next()
  return res.redirect('/auth/login')
}
