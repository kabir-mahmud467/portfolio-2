import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import Project from '../models/Project.js'
import Blog from '../models/Blog.js'
import Product from '../models/Product.js'
import Book from '../models/Book.js'
import Resource from '../models/Resource.js'
import SocialLink from '../models/SocialLink.js'
import { makeUniqueSlug } from '../utils/slug.js'

dotenv.config()

async function backfill(Model, label, sourceField) {
  const docs = await Model.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' },
    ],
  }).sort({ createdAt: 1 })

  for (const doc of docs) {
    const slug = await makeUniqueSlug(Model, doc[sourceField], doc._id, label)
    doc.slug = slug
    await doc.save()
    console.log(`Updated ${label}: ${doc._id} -> ${slug}`)
  }
}

async function main() {
  await connectDB()

  await backfill(Project, 'project', 'title')
  await backfill(Blog, 'blog', 'title')
  await backfill(Product, 'product', 'title')
  await backfill(Book, 'book', 'title')
  await backfill(Resource, 'resource', 'title')
  await backfill(SocialLink, 'social', 'platform')

  console.log('Slug backfill complete')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
