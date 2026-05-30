export function ensureAdmin(req, res, next) {
  const user = req.session.user
  if (user && user.isAdmin) return next()
  return res.redirect('/auth/login')
}
