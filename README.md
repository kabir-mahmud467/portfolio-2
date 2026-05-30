# Portfolio (Kabir Mahmud) - Node/Express + EJS

This repo was migrated to a Node.js + Express backend with EJS views, MongoDB for storage, and Cloudinary for image uploads. It includes an admin area to manage projects, blogs, social links, products, books, resources, and contacts.

Quick setup

1. Copy `.env.example` to `.env` and fill values (MongoDB and Cloudinary credentials).

2. Install dependencies:

```bash
npm install
```

3. Create admin user:

```bash
npm run seed
```

4. Run dev server:

```bash
npm run dev
```

Deployment

This project includes a `vercel.json` to deploy the Node server on Vercel. Set environment variables in the Vercel dashboard.
