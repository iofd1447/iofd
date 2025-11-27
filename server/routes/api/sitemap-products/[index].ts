import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, getRouterParam } from 'h3'

function normalizeName(name: string) {
  if (!name) return ''
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default defineEventHandler(async (event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://iofd.org'
  const index = parseInt(getRouterParam(event, 'index') || '1')

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const itemsPerSitemap = 50000
  const from = (index - 1) * itemsPerSitemap
  const to = from + itemsPerSitemap - 1

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url, updated_at, created_at')
    .range(from, to)
    .order('updated_at', { ascending: false })

  if (error) {
    event.node.res.statusCode = 500
    return `Error: ${error.message}`
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${(products || []).map(product => {
    const lastmod = product.updated_at || product.created_at || new Date().toISOString()
    const slug = normalizeName(product.name)
    const imageUrl = product.image_url || `${baseUrl}/placeholder.png`
    return `  <url>
    <loc>${baseUrl}/products/${product.id}/${slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:caption>${product.name}</image:caption>
      <image:title>${product.name}</image:title>
    </image:image>
  </url>`
  }).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600')
  return xml
})
