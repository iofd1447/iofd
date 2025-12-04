import { type Unit, getPortionDescription } from '@/utils/PortionManagement'
import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export type EditableProductFields = {
  barcode: string
  name: string
  brand?: string | null
  category_id?: string | null
  portion: {
    amount: number | null
    unit: Unit
    extraInfo: string
  }
  image_file?: File | null
  image_url?: string | null
  halal_status?: string
  certification_body?: string | null
  certificate_number?: string | null
  certified_date?: string | null
  expiry_date?: string | null
  halal_notes?: string | null
  nutrition?: {
    calories_kcal?: number | null
    protein_g?: number | null
    carbs_g?: number | null
    sugars_g?: number | null
    fats_g?: number | null
    saturated_fats_g?: number | null
    trans_fats_g?: number | null
    fibres_g?: number | null
    sodium_mg?: number | null
    calcium_mg?: number | null
    water_ml?: number | null
  }
  ingredients?: string[]
  additives?: (string | { id: string; code?: string })[]
  allergens?: string[]
  labels?: string[]
}

export function useProductEditor() {
  const supabase = useSupabase()
  const saving = ref(false)
  const errorMessage = ref<string | null>(null)

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error('Erreur upload image:', uploadError)
      return null
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicData?.publicUrl || null
  }

  async function updateProduct(productId: string, fields: EditableProductFields) {
    saving.value = true
    errorMessage.value = null
    try {
      let nextImageUrl = fields.image_url ?? null
      if (fields.image_file) {
        const uploadedUrl = await uploadImage(fields.image_file)
        if (uploadedUrl) nextImageUrl = uploadedUrl
      }

      const { error: productError } = await supabase
        .from('products')
        .update({
          barcode: fields.barcode || null,
          name: fields.name,
          brand: fields.brand ?? null,
          category_id: fields.category_id ?? null,
          portion_description: getPortionDescription(fields.portion as { amount: number | null; unit: Unit; extraInfo: string }) ?? null,
          image_url: nextImageUrl,
        })
        .eq('id', productId)

      if (productError) throw productError

      if (fields.halal_status !== undefined) {
        const { error: halalError } = await supabase
          .from('halal_certifications')
          .upsert([{
            product_id: productId,
            halal_status: fields.halal_status,
            certification_body: fields.certification_body || null,
            certificate_number: fields.certificate_number || null,
            certified_date: fields.certified_date || null,
            expiry_date: fields.expiry_date || null,
            notes: fields.halal_notes || null,
          }], { onConflict: 'product_id' })
        if (halalError) throw halalError
      }

      if (fields.nutrition) {
        const hasNutritionData = Object.values(fields.nutrition).some(v => {
          if (typeof v === 'string') return v !== ''
          return v !== null && v !== undefined && v !== 0
        })
        if (hasNutritionData) {
          const { error: nutritionError } = await supabase
            .from('nutrition_facts')
            .upsert([{ product_id: productId, ...fields.nutrition }], { onConflict: 'product_id' })
          if (nutritionError) throw nutritionError
        }
      }

      if (fields.ingredients !== undefined) {
        await supabase.from('ingredients').delete().eq('product_id', productId)

        if (fields.ingredients.length > 0) {
          const rows = fields.ingredients.map((name, index) => ({
            product_id: productId,
            name
          }))

          const { error: ingError } = await supabase.from('ingredients').insert(rows)
          if (ingError) throw ingError
        }
      }


      if (fields.additives !== undefined) {
        await supabase.from('product_additives').delete().eq('product_id', productId)

        const additiveMappings = []
        for (const additive of fields.additives) {
          let additiveId: string

          if (typeof additive === 'object' && additive.id) {
            additiveId = additive.id
          }
          else if (typeof additive === 'string') {
            const isUUID = additive.length === 36 && additive.includes('-')

            if (isUUID) {
              additiveId = additive
            } else {
              const code = additive.toUpperCase()
              const { data: existingAdditive, error: searchError } = await supabase
                .from('additives')
                .select('id')
                .eq('code', code)
                .maybeSingle()

              if (existingAdditive) {
                additiveId = existingAdditive.id
              } else {
                const { data: newAdditive, error: insertError } = await supabase
                  .from('additives')
                  .insert([{ code, name: code }])
                  .select()
                  .single()

                if (insertError) {
                  console.error(`Error creating additive ${code}:`, insertError)
                  continue
                }
                additiveId = newAdditive.id
              }
            }
          } else {
            continue
          }

          additiveMappings.push({ product_id: productId, additive_id: additiveId })
        }
        if (additiveMappings.length) {
          await supabase.from('product_additives').upsert(additiveMappings, { ignoreDuplicates: true })
        }
      }

      if (fields.allergens !== undefined) {
        await supabase.from('product_allergens').delete().eq('product_id', productId)

        if (fields.allergens.length > 0) {
          const allergenMappings = fields.allergens.map(id => ({
            product_id: productId,
            allergen_id: id,
            presence_type: 'contient'
          }))
          await supabase.from('product_allergens').upsert(allergenMappings, { ignoreDuplicates: true })
        }
      }

      if (fields.labels !== undefined) {
        await supabase.from('product_labels').delete().eq('product_id', productId)

        if (fields.labels.length > 0) {
          const labelMappings = fields.labels.map(id => ({ product_id: productId, label_id: id }))
          await supabase.from('product_labels').upsert(labelMappings, { ignoreDuplicates: true })
        }
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error
      return data
    } catch (e: any) {
      console.error('Erreur updateProduct:', e)
      errorMessage.value = e?.message || 'Mise à jour impossible'
      throw e
    } finally {
      saving.value = false
    }
  }

  return { saving, errorMessage, updateProduct, uploadImage }
}


