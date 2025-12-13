import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const barcode = getRouterParam(event, 'barcode')

  if (!barcode) {
    event.node.res.statusCode = 400
    return { error: 'Barcode is required' }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('products')
    .select('*, nutrition_facts(*)')
    .eq('barcode', barcode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
      event.node.res.statusCode = 404
      return { error: 'Product not found' }
    }
    event.node.res.statusCode = 500
    return { error: error.message }
  }

  return { data }
})
