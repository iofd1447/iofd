import { createClient } from '@supabase/supabase-js'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://iofd.org'

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const [productsCount, additivesCount] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('additives').select('*', { count: 'exact', head: true })
  ])

  const productsTotal = productsCount.count || 0
  const additivesTotal = additivesCount.count || 0
  const productsPerSitemap = 50000
  const additivesPerSitemap = 50000

  const productsSitemaps = Math.max(1, Math.ceil(productsTotal / productsPerSitemap))
  const additivesSitemaps = Math.max(1, Math.ceil(additivesTotal / additivesPerSitemap))

  const sitemaps: string[] = [
    `${baseUrl}/sitemap-static.xml`,
  ]

  for (let i = 0; i < productsSitemaps; i++) {
    sitemaps.push(`${baseUrl}/api/sitemap-products/${i + 1}`)
  }

  /*

  for (let i = 0; i < additivesSitemaps; i++) {
    sitemaps.push(`${baseUrl}/sitemap-additives-${i + 1}.xml`)
  }

  sitemaps.push(`${baseUrl}/sitemap-contributions.xml`)
  */

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600')
  return xml
})
