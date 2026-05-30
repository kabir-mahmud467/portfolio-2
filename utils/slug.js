export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function makeUniqueSlug(Model, value, excludeId = null, fallback = 'item') {
  const base = slugify(value) || fallback
  let candidate = base
  let counter = 2

  while (true) {
    const query = { slug: candidate }
    if (excludeId) query._id = { $ne: excludeId }

    const exists = await Model.exists(query)
    if (!exists) return candidate

    candidate = `${base}-${counter}`
    counter += 1
  }
}
