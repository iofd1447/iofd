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

  const { data: exactData, error: exactError } = await supabase
    .from('products')
    .select('*, nutrition_facts(*)')
    .eq('barcode', barcode)
    .single()

  if (exactData) {
    return { data: exactData }
  }

  const { data: ilikeData, error: ilikeError } = await supabase
    .from('products')
    .select('*, nutrition_facts(*)')
    .ilike('barcode', `%${barcode}%`)
    .limit(1)

  if (ilikeError) {
    event.node.res.statusCode = 500
    return { error: ilikeError.message }
  }

  if (ilikeData?.length) {
    return { data: ilikeData[0] }
  }

  event.node.res.statusCode = 404
  return { error: 'Product not found' }
})
