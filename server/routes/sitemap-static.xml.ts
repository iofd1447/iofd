import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://iofd.netlify.app'
  const currentDate = new Date().toISOString()

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/halal-guide', priority: '0.9', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/products/add', priority: '0.8', changefreq: 'weekly' },
    { url: '/additives', priority: '0.9', changefreq: 'daily' },
    { url: '/contribute', priority: '0.7', changefreq: 'monthly' },
    { url: '/auth/login', priority: '0.6', changefreq: 'monthly' },
    { url: '/auth/signup', priority: '0.6', changefreq: 'monthly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600')
  return xml
})

