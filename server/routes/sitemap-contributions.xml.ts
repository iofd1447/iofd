import { createClient } from '@supabase/supabase-js'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || process.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || 'https://iofd.org'

  const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: contributions, error } = await supabase
    .from('product_contributors')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    event.node.res.statusCode = 500
    return `Error: ${error.message}`
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${(contributions || []).map(contribution => {
    const lastmod = contribution.created_at || new Date().toISOString()
    return `  <url>
    <loc>${baseUrl}/contributions/${contribution.id}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  }).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600')
  return xml
})

