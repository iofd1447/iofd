import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {

  const SUPABASE_URL = process.env.SUPABASE_URL || ''
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const client = createClient(SUPABASE_URL, SUPABASE_KEY)
  const body = await readBody(event)

  const {
    barcode, name, brand, image_url, category_id,
    nutrition, ingredients, additives, allergens, labels, halal
  } = body

  if (!barcode || !name) {
    throw createError({ statusCode: 400, message: 'Barcode et Name sont obligatoires' })
  }

  try {
    const { data: prod, error: prodError } = await client
      .from('products')
      .upsert({
        barcode,
        name,
        brand: brand || null,
        image_url: image_url || null,
        category_id: category_id || null,
      }, { onConflict: 'barcode' })
      .select().single()

    if (prodError) throw prodError
    const productId = prod.id

    if (nutrition) {
      await client.from('nutrition_facts').upsert({
        product_id: productId,
        calories: nutrition.calories,
        fat: nutrition.fat,
        saturated_fat: nutrition.saturated_fat,
        carbs: nutrition.carbs,
        sugars: nutrition.sugars,
        proteins: nutrition.proteins,
        sodium: nutrition.sodium,
      }, { onConflict: 'product_id' })
    }

    if (ingredients && Array.isArray(ingredients)) {
      await client.from('ingredients').delete().eq('product_id', productId)
      const ingData = ingredients.map(name => ({ product_id: productId, name }))
      await client.from('ingredients').insert(ingData)
    }

    if (additives && Array.isArray(additives)) {
      for (const code of additives) {
        const cleanCode = code.toUpperCase()
        const { data: addRef } = await client
          .from('additives')
          .upsert({ code: cleanCode, name: cleanCode }, { onConflict: 'code' })
          .select().single()

        if (addRef) {
          await client.from('product_additives').upsert({
            product_id: productId,
            additive_id: addRef.id
          })
        }
      }
    }

    if (allergens && Array.isArray(allergens)) {
      const allergenData = allergens.map(a => ({
        product_id: productId,
        allergen_id: a,
        presence_type: 'contient'
      }))
      await client.from('product_allergens').upsert(allergenData)
    }

    if (labels && Array.isArray(labels)) {
      const labelData = labels.map(l => ({
        product_id: productId,
        label_id: l
      }))
      await client.from('product_labels').upsert(labelData)
    }

    await client.from('halal_certifications').upsert({
      product_id: productId,
      halal_status: halal?.status || 'non_verifie',
      certification_body: halal?.body || (brand === 'Isla Mondial' ? 'AVS' : null),
      verified_by_community: false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'product_id' })

    return { success: true, productId: productId, barcode: barcode }

  } catch (error: any) {
    console.error('Erreur API insertion:', error.message)
    throw createError({ statusCode: 500, message: error.message })
  }
})