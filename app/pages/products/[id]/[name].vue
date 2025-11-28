<template>
  <div class="product-page">
    <div class="hero-section">
      <div class="hero-bg" :style="{ backgroundImage: `url(${product.image_url})` }"></div>
      <div class="hero-overlay"></div>

      <v-app-bar color="transparent" elevation="0" theme="dark">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
        <v-spacer />
        <v-btn icon="mdi-share-variant" variant="text" @click="shareProduct" />
      </v-app-bar>

      <v-container class="hero-content h-100 d-flex flex-column justify-end pb-6 mt-12">
        <v-row align="end">
          <v-col cols="12" sm="4" md="3" lg="2" class="text-center text-sm-left">
            <v-card elevation="8" rounded="xl" class="product-image-card mx-auto mx-sm-0 mt-2">
              <v-img :src="product.image_url" aspect-ratio="1" cover bg-color="surface-variant" />
            </v-card>
          </v-col>

          <v-col cols="12" sm="8" md="9" lg="10" class="text-white pt-4 pt-sm-0">
            <div class="d-flex flex-wrap align-center gap-2 mb-2 justify-center justify-sm-start">
              <v-chip v-if="product.category" size="small" color="surface" variant="flat"
                class="text-primary font-weight-bold">
                <v-icon start icon="mdi-tag-outline" size="small" />
                {{ typeof product.category === 'object' ? product.category.name : product.category }}
              </v-chip>
              <v-chip :color="getHalalColor(product.halal_status)" size="small" variant="flat" class="font-weight-bold">
                <v-icon start icon="mdi-check-decagram" size="small" />
                {{ getHalalLabel(product.halal_status) }}
              </v-chip>
            </div>

            <h1 class="text-h4 text-md-h3 font-weight-bold mb-1 text-center text-sm-left">
              {{ product.name }}
            </h1>
            <p class="text-h6 text-md-h5 opacity-90 mb-4 text-center text-sm-left">
              {{ product.brand }}
            </p>

            <div class="d-flex align-center gap-4 justify-center justify-sm-start">
              <div class="d-flex align-center">
                <v-rating :model-value="product.rating" readonly density="compact" color="amber" half-increments
                  size="small" />
                <span class="text-body-2 ml-2 font-weight-bold">{{ product.rating.toFixed(1) }}</span>
                <span class="text-caption opacity-70 ml-1">({{ product.reviews_count }} avis)</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-main class="bg-background">
      <v-container class="mt-n4 mt-sm-0">
        <v-row>
          <v-col cols="12">
            <v-card rounded="xl" elevation="0" class="bg-transparent">
              <v-tabs v-model="activeTab" bg-color="transparent" color="primary" align-tabs="start"
                class="mb-6 border-bottom">
                <v-tab value="overview" class="text-body-1 text-capitalize rounded-t-lg">Aperçu</v-tab>
                <v-tab value="nutrition" class="text-body-1 text-capitalize rounded-t-lg">Nutrition</v-tab>
                <v-tab value="ingredients" class="text-body-1 text-capitalize rounded-t-lg">Ingrédients</v-tab>
                <v-tab value="reviews" class="text-body-1 text-capitalize rounded-t-lg">Avis</v-tab>
              </v-tabs>

              <v-window v-model="activeTab" class="pb-10">
                <v-window-item value="overview">
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-card elevation="0" rounded="xl" class="mb-4 bg-surface border">
                        <v-card-text class="pa-6">
                          <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center text-on-surface">
                            <v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
                            Informations clés
                          </h3>

                          <v-row>
                            <v-col v-if="product.barcode" cols="12" sm="6">
                              <div class="info-group mb-4">
                                <div class="text-caption text-medium-emphasis mb-1">Code-barres</div>
                                <div class="text-body-1 font-weight-medium d-flex align-center text-on-surface">
                                  <v-icon icon="mdi-barcode" size="small" class="mr-2 text-medium-emphasis" />
                                  {{ product.barcode }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" :sm="product.barcode ? 6 : 12">
                              <div class="info-group mb-4">
                                <div class="text-caption text-medium-emphasis mb-1">Portion</div>
                                <div class="d-flex align-center">
                                  <div v-if="!editingPortion"
                                    class="text-body-1 font-weight-medium d-flex align-center cursor-pointer text-on-surface"
                                    @click="startEditingPortion">
                                    {{ portionSize }} {{ portionUnit }}
                                    <v-icon icon="mdi-pencil" size="small" class="ml-2 text-primary opacity-50" />
                                  </div>
                                  <v-text-field v-else v-model="portionInput" density="compact" hide-details
                                    variant="outlined" class="portion-input" @keyup.enter="commitPortion"
                                    @blur="commitPortion" auto-focus />
                                </div>
                              </div>
                            </v-col>
                          </v-row>

                          <v-divider class="my-4" />

                          <div v-if="product.labels?.length">
                            <div class="text-caption text-medium-emphasis mb-2">Labels & Certifications</div>
                            <div class="d-flex flex-wrap gap-2">
                              <v-chip v-for="label in product.labels" :key="label.id" variant="outlined" color="success"
                                size="small">
                                <v-icon start icon="mdi-check-decagram" size="small" />
                                {{ label.name }}
                              </v-chip>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>

                      <v-card elevation="0" border rounded="xl" class="bg-surface">
                        <v-card-text class="pa-6">
                          <h3 class="text-h6 font-weight-bold mb-4 text-on-surface">Points forts nutritionnels</h3>
                          <div class="d-flex flex-wrap gap-3">
                            <v-chip v-if="hydrationInsight" class="hydration-chip" variant="flat" size="large">
                              <v-icon start icon="mdi-water" />
                              Hydratation: {{ hydrationInsight.value }}ml
                            </v-chip>
                            <template v-for="(chip, i) in nutritionChips" :key="i">
                              <v-chip v-if="chip.condition" :color="chip.color" variant="tonal" size="large">
                                <v-icon start :icon="chip.icon" />
                                {{ chip.label }}
                              </v-chip>
                            </template>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="4">


                      <v-card v-if="hasCertificationInfo" elevation="0" border rounded="xl" class="mb-4">
                        <v-card-text class="pa-4">
                          <div class="d-flex align-center mb-3">
                            <v-icon color="success" size="large" class="mr-3">mdi-certificate</v-icon>
                            <div>
                              <div class="text-subtitle-1 font-weight-bold text-success-darken-2">Détails
                                supplémentaires
                              </div>
                              <div class="text-caption text-success-darken-1">Bénéfices, certifications...</div>
                            </div>
                          </div>

                          <div v-if="product.certification?.body" class="mb-2">
                            <div class="text-caption text-medium-emphasis">Organisme</div>
                            <div class="text-body-2 font-weight-bold text-on-surface">{{ product.certification.body }}
                            </div>
                          </div>

                          <div v-if="product.certification?.notes"
                            class="mt-3 pa-3 bg-surface rounded-lg text-body-2 text-on-surface">
                            {{ product.certification.notes }}
                          </div>
                        </v-card-text>
                      </v-card>

                      <v-card elevation="0" border rounded="xl" class="mb-4 bg-surface">
                        <v-card-text class="pa-4">
                          <v-btn block color="primary" size="large" variant="flat" rounded="lg" class="mb-3"
                            @click="reviewDialog = true">
                            <v-icon start>mdi-star</v-icon>
                            Noter ce produit
                          </v-btn>
                          <v-btn block variant="outlined" size="large" rounded="lg" @click="editDialog = true">
                            <v-icon start>mdi-pencil</v-icon>
                            Modifier
                          </v-btn>
                        </v-card-text>
                      </v-card>

                    </v-col>
                  </v-row>
                </v-window-item>

                <v-window-item value="nutrition">
                  <v-row>
                    <v-col cols="12">
                      <div class="d-flex align-center justify-space-between mb-6">
                        <h2 class="text-h5 font-weight-bold text-on-surface">Valeurs nutritionnelles</h2>
                        <v-chip variant="outlined" color="primary">
                          Pour {{ portionSize }} {{ portionUnit }}
                        </v-chip>
                      </div>

                      <div class="macros-grid mb-8">
                        <div v-for="macro in mainMacros" :key="macro.key" class="macro-card bg-surface"
                          :style="{ borderColor: `rgb(var(--v-theme-${macro.color}))` }">
                          <div class="macro-icon-wrapper"
                            :style="{ background: `rgba(var(--v-theme-${macro.color}), 0.1)` }">
                            <v-icon :color="macro.color" size="32">{{ macro.icon }}</v-icon>
                          </div>
                          <div class="macro-content">
                            <div class="macro-value" :style="{ color: `rgb(var(--v-theme-${macro.color}))` }">
                              {{ scaledNutrition[macro.key] || 0 }}
                              <span class="macro-unit">{{ macro.unit }}</span>
                            </div>
                            <div class="macro-label text-medium-emphasis">{{ macro.label }}</div>
                            <v-progress-linear
                              :model-value="Math.min((product.nutrition[macro.key] / macro.max) * 100, 100)"
                              :color="macro.color" height="6" rounded />
                          </div>
                        </div>
                      </div>

                      <v-card elevation="0" border rounded="xl" class="bg-surface">
                        <v-card-text class="pa-0">
                          <v-table class="nutrition-table bg-transparent">
                            <thead>
                              <tr>
                                <th class="text-left pl-6 text-medium-emphasis">Nutriment</th>
                                <th class="text-right pr-6 text-medium-emphasis">Quantité</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="nutrient in secondaryNutrients" :key="nutrient.key">
                                <td class="pl-6 py-3">
                                  <div class="d-flex align-center">
                                    <v-icon :color="nutrient.color" size="small" class="mr-3">{{ nutrient.icon
                                    }}</v-icon>
                                    <span class="text-body-2 text-on-surface">{{ nutrient.label }}</span>
                                  </div>
                                </td>
                                <td class="text-right pr-6 font-weight-bold text-on-surface">
                                  {{ scaledNutrition[nutrient.key] || 0 }} {{ nutrient.unit }}
                                </td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-window-item>

                <v-window-item value="ingredients">
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-card elevation="0" rounded="xl" class="mb-4 bg-surface border">
                        <v-card-title class="pa-4 d-flex align-center text-on-surface">
                          <v-icon color="secondary" class="mr-2">mdi-format-list-bulleted</v-icon>
                          Liste des ingrédients
                        </v-card-title>
                        <v-divider />
                        <v-card-text class="pa-6">
                          <p class="text-body-1 text-on-surface" style="line-height: 1.8;">
                            {{product.ingredients.map((i: any) => i.name || 'Ingrédient inconnu').join(', ')}}
                          </p>
                        </v-card-text>
                      </v-card>

                      <div v-if="product.additives?.length">
                        <h3 class="text-h6 font-weight-bold mb-3 mt-6 text-on-surface">Additifs ({{
                          product.additives.length }})</h3>
                        <v-row dense>
                          <v-col v-for="additive in product.additives" :key="additive.code" cols="12" sm="6">
                            <v-card elevation="0" rounded="lg" class="bg-surface border">
                              <v-card-text class="d-flex align-center pa-3">
                                <v-avatar :color="getIngredientColor(additive.halal_status)" size="40"
                                  class="mr-3 text-caption font-weight-bold">
                                  {{ additive.code }}
                                </v-avatar>
                                <div>
                                  <div class="font-weight-bold text-body-2 text-on-surface">{{ additive.name }}</div>
                                  <div class="text-caption text-medium-emphasis">{{ additive.function }}</div>
                                </div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </div>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-card v-if="product.allergens?.length" elevation="0" rounded="xl" color="red-lighten-5"
                        class="border-red-lighten-4 border">
                        <v-card-title class="text-red-darken-2 font-weight-bold">
                          <v-icon color="red-darken-2" class="mr-2">mdi-alert-circle</v-icon>
                          Allergènes
                        </v-card-title>
                        <v-card-text class="pt-2">
                          <v-chip v-for="allergen in product.allergens" :key="allergen.name" color="red-darken-2"
                            variant="outlined" class="mr-2 mb-2 bg-surface">
                            {{ allergen.name }}
                          </v-chip>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-window-item>

                <v-window-item value="reviews">
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-card elevation="0" border rounded="xl" class="text-center pa-6 mb-4 sticky-top bg-surface"
                        style="top: 20px">
                        <div class="text-h2 font-weight-bold text-primary mb-2">{{ product.rating.toFixed(1) }}</div>
                        <v-rating :model-value="product.rating" readonly color="amber" half-increments class="mb-2" />
                        <div class="text-body-2 text-medium-emphasis mb-6">Basé sur {{ product.reviews_count }} avis
                        </div>
                        <v-btn block color="primary" rounded="lg" @click="reviewDialog = true">
                          Écrire un avis
                        </v-btn>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="8">
                      <div v-if="product.reviews?.length" class="d-flex flex-column gap-3">
                        <v-card v-for="review in product.reviews" :key="review.id" elevation="0" border rounded="xl"
                          class="bg-surface">
                          <v-card-text class="pa-4">
                            <div class="d-flex align-center mb-3">
                              <v-avatar color="primary" size="40" class="mr-3 text-h6 font-weight-bold">
                                {{ review.user_name.charAt(0).toUpperCase() }}
                              </v-avatar>
                              <div>
                                <div class="font-weight-bold text-on-surface">{{ review.user_name }}</div>
                                <div class="text-caption text-medium-emphasis">{{ formatHijriDate(review.created_at) }}
                                </div>
                              </div>
                              <v-spacer />
                              <v-chip :color="getHalalColor(review.halal_vote)" size="small" variant="tonal">
                                {{ review.halal_vote }}
                              </v-chip>
                            </div>
                            <v-rating :model-value="review.rating" readonly density="compact" color="amber"
                              half-increments size="small" class="mb-2" />
                            <p class="text-body-1 text-on-surface">{{ review.comment }}</p>
                          </v-card-text>
                        </v-card>
                      </div>
                      <v-alert v-else type="info" variant="tonal" class="text-center">
                        Soyez le premier à donner votre avis sur ce produit !
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-dialog v-model="reviewDialog" max-width="600px">
      <v-card rounded="xl" class="bg-surface">
        <v-card-title class="font-weight-bold pa-6 text-on-surface">
          <v-icon start color="primary">mdi-star</v-icon>
          Ajouter un avis
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <v-form ref="reviewForm" @submit.prevent="submitReview">
            <div class="text-center mb-6">
              <div class="text-caption text-medium-emphasis mb-2">Votre note</div>
              <v-rating v-model="newReview.rating" color="amber" size="large" half-increments hover />
            </div>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="newReview.user_name" label="Votre nom" variant="outlined" density="comfortable"
                  rounded="lg" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="newReview.user_email" label="Email (optionnel)" variant="outlined"
                  density="comfortable" rounded="lg" />
              </v-col>
            </v-row>

            <v-select v-model="newReview.halal_vote" label="Selon vous, ce produit est..."
              :items="['halal', 'haram', 'mashbuh']" variant="outlined" density="comfortable" rounded="lg"
              class="mb-2" />

            <v-textarea v-model="newReview.comment" label="Votre commentaire" variant="outlined" rows="3"
              rounded="lg" />

            <v-btn color="primary" block type="submit" size="large" rounded="lg" class="mt-4">
              Publier l'avis
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="shareDialog" max-width="400px">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Partager</v-card-title>
        <v-card-text>
          <v-btn block variant="flat" color="indigo" class="mb-2"
            :href="`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name)}`" target="_blank">
            WhatsApp
          </v-btn>

          <v-btn block variant="flat" color="blue" class="mb-2"
            :href="`https://t.me/share/text?text=${encodeURIComponent(product.name)}`" target="_blank">
            Telegram
          </v-btn>

          <v-btn block variant="flat" color="cyan" class="mb-2"
            :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}`" target="_blank">
            X (Twitter)
          </v-btn>

          <v-btn block variant="outlined" @click="copyLink">
            Copier le lien
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <ProductEditDialog v-model="editDialog" :product="product" @saved="onProductSaved" />
  </div>
</template>

<script setup lang="ts">
import { useSupabase } from '#imports'
import ProductEditDialog from '@/components/ProductEditDialog.vue'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import {
  formatHijriDate,
  getHalalColor,
  getHalalLabel,
  getIngredientColor
} from '@/utils/function'
import { computed, onMounted, ref } from 'vue'

const supabase = useSupabase()
const { user, fetchUser } = useSupabaseAuth()
const route = useRoute()

const activeTab = ref('overview')
const loading = ref(true)
const reviewDialog = ref(false)
const editDialog = ref(false)
const reviewForm = ref()
const shareDialog = ref(false)

const product = ref<any>({
  certification: null,
  nutrition: {},
  ingredients: [],
  additives: [],
  allergens: [],
  labels: [],
  reviews: [],
  rating: 0,
  reviews_count: 0
})

const newReview = ref({
  rating: 0,
  user_name: '',
  user_email: '',
  halal_vote: 'halal',
  comment: ''
})

const fetchProduct = async () => {
  loading.value = true
  const productId = route.params.id as string

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        nutrition:nutrition_facts!nutrition_facts_product_id_fkey(*),
        halal_certification:halal_certifications(*),
        product_ingredients(ingredient:ingredients(name, description, halal_status)),
        product_additives(additive:additives(code, name, halal_status, origin_type, function)),
        product_allergens(allergen:allergens(name, description)),
        product_labels(label:labels(name)),
        community_reviews(rating, user_name, user_email, halal_vote, comment, helpful_count, created_at)
      `)
      .eq('id', productId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Produit non trouvé')

    const halalCert = Array.isArray(data.halal_certification)
      ? data.halal_certification[0]
      : data.halal_certification

    const reviews = (data.community_reviews || []).map((r: any) => ({
      rating: r.rating ?? 0,
      user_name: r.user_name ?? 'Utilisateur',
      user_email: r.user_email ?? '',
      halal_vote: r.halal_vote ?? '',
      comment: r.comment ?? '',
      helpful_count: r.helpful_count ?? 0,
      created_at: r.created_at
    }))

    const avgRating = reviews.length
      ? (reviews.reduce((a: any, b: any) => a + (b.rating || 0), 0) / reviews.length).toFixed(1)
      : 0

    product.value = {
      id: data.id,
      name: data.name,
      brand: data.brand,
      barcode: data.barcode,
      category_id: data.category_id,
      category: data.category?.name || 'Autre',
      image_url: data.image_url || 'https://via.placeholder.com/600x400?text=Image+indisponible',
      portion_description: data.portion_description || 'Non spécifiée',
      halal_status: halalCert?.halal_status,
      certification: halalCert
        ? {
          body: halalCert.certification_body,
          number: halalCert.certificate_number,
          certified_date: halalCert.certified_date,
          expiry_date: halalCert.expiry_date,
          verified_by_community: halalCert.verified_by_community,
          verification_count: halalCert.verification_count,
          notes: halalCert.notes
        }
        : null,
      nutrition: data.nutrition?.[0] || data.nutrition || {},
      ingredients: (data.product_ingredients || [])
        .filter((i: any) => i.ingredient?.name)
        .map((i: any) => ({
          name: i.ingredient.name,
          description: i.ingredient.description,
          halal_status: i.ingredient.halal_status
        })),
      additives: (data.product_additives || []).map((a: any) => ({
        id: a.additive?.id,
        code: a.additive?.code,
        name: a.additive?.name,
        halal_status: a.additive?.halal_status,
        origin_type: a.additive?.origin_type,
        function: a.additive?.function
      })),
      allergens: (data.product_allergens || []).map((a: any) => ({
        id: a.allergen_id || a.allergen?.id,
        allergen_id: a.allergen_id || a.allergen?.id,
        name: a.allergen?.name,
        description: a.allergen?.description
      })),
      labels: (data.product_labels || []).map((l: any) => ({
        id: l.label_id || l.label?.id,
        label_id: l.label_id || l.label?.id,
        name: l.label?.name
      })),
      reviews,
      rating: Number(avgRating),
      reviews_count: reviews.length
    }
  } catch (err) {
    console.error('Erreur de récupération du produit:', err)
  } finally {
    loading.value = false
  }
}

function shareProduct() {
  const url = window.location.href

  if (navigator.share) {
    navigator.share({
      title: product.value.name,
      text: `Regarde ce produit : ${product.value.name}`,
      url
    }).catch(() => { })
  } else {
    shareDialog.value = true
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
}

const submitReview = async () => {
  const productId = product.value.id
  const reviewData = {
    product_id: productId,
    rating: newReview.value.rating,
    user_name: newReview.value.user_name,
    user_email: newReview.value.user_email,
    halal_vote: newReview.value.halal_vote,
    comment: newReview.value.comment,
    helpful_count: 0
  }

  const { error } = await supabase.from('community_reviews').insert([reviewData])
  if (error) {
    console.error('Erreur lors de l’ajout de l’avis:', error)
    return
  }

  reviewDialog.value = false
  newReview.value = { rating: 0, user_name: '', user_email: '', halal_vote: 'halal', comment: '' }
  await fetchProduct()
}

const editingPortion = ref(false)
const portionInput = ref('')

function startEditingPortion() {
  portionInput.value = String(portionSize.value)
  editingPortion.value = true
}

function commitPortion() {
  const parsed = Number.parseFloat((portionInput.value || '').replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed <= 0) {
    portionInput.value = String(portionSize.value)
  } else {
    portionSize.value = parsed
  }
  editingPortion.value = false
}

const onProductSaved = async () => {
  await fetchProduct()
}

const mainMacros = [
  { key: 'calories_kcal', label: 'Énergie', unit: 'kcal', icon: 'mdi-fire', color: 'error', max: 500 },
  { key: 'protein_g', label: 'Protéines', unit: 'g', icon: 'mdi-dumbbell', color: 'primary', max: 50 },
  { key: 'carbs_g', label: 'Glucides', unit: 'g', icon: 'mdi-grain', color: 'warning', max: 300 },
  { key: 'fats_g', label: 'Lipides', unit: 'g', icon: 'mdi-water', color: 'secondary', max: 70 },
]

const secondaryNutrients = [
  { key: 'sugars_g', label: 'dont Sucres', unit: 'g', icon: 'mdi-candy', color: 'error', max: 90 },
  { key: 'starch_g', label: 'dont amidons', unit: 'g', icon: 'mdi-rice', color: 'brown', max: 300 },
  { key: 'saturated_fats_g', label: 'Graisses saturées', unit: 'g', icon: 'mdi-food-drumstick', color: 'warning', max: 20 },
  { key: 'fibres_g', label: 'Fibres', unit: 'g', icon: 'mdi-leaf', color: 'success', max: 30 },
  { key: 'vitamin_c_mg', label: 'Vit. C', unit: 'mg', icon: 'mdi-pill', color: 'info', max: 90 },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', icon: 'mdi-shaker', color: 'tertiary', max: 2400 },
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg', icon: 'mdi-water', color: 'info', max: 1000 },
  { key: 'iron_mg', label: 'Fer', unit: 'mg', icon: 'mdi-hospital-box', color: 'info', max: 18 },
]


function parsePortion(desc: string | undefined | null): { size: number, unit: 'g' | 'ml' } {
  const text = String(desc || '').trim()
  const unit = /ml/i.test(text) ? 'ml' : 'g'
  const numMatch = text.match(/([\d.,]+)/)
  const matched = numMatch?.[1] ?? '100'
  const raw = matched.replace(',', '.')
  const size = Math.max(1, Number.parseFloat(raw) || 100)
  return { size, unit }
}

const portionUnit = computed<'g' | 'ml'>(() => parsePortion(product.value?.portion_description).unit)
const portionSize = computed<number>({
  get() {
    return parsePortion(product.value?.portion_description).size
  },
  set(val: number) {
    const safe = Math.max(1, Number(val) || 100)
    product.value.portion_description = `${safe} ${portionUnit.value}`
  }
})

const scaledNutrition = computed<Record<string, number>>(() => {
  const base = product.value?.nutrition || {}
  const factor = (portionSize.value || 100) / 100
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(base)) {
    if (typeof v === 'number') out[k] = Number((v * factor).toFixed(2))
  }
  return out
})

const hasCertificationInfo = computed(() => {
  const cert = product.value?.certification
  if (!cert) return false
  return !!(cert.body || cert.number || cert.certified_date || cert.expiry_date || (cert.notes && cert.notes.trim()) || cert.verified_by_community)
})

const hydrationInsight = computed(() => {
  const waterValue = scaledNutrition.value.water_ml
  if (typeof waterValue !== 'number' || waterValue <= 0) return null
  const rounded = Number(waterValue.toFixed(0))
  return { value: rounded }
})

const nutritionChips = computed(() => [
  {
    condition: (scaledNutrition.value.calories_kcal as number) < 100,
    label: "Faible en calories",
    color: "success",
    icon: "mdi-fire-circle",
  },
  {
    condition: (scaledNutrition.value.protein_g as number) > 10,
    label: "Riche en protéines",
    color: "primary",
    icon: "mdi-arm-flex",
  },
  {
    condition: (scaledNutrition.value.sugars_g as number) < 5,
    label: "Faible en sucres",
    color: "success",
    icon: "mdi-candy-off",
  },
  {
    condition: (scaledNutrition.value.fibres_g as number) > 5,
    label: "Source de fibres",
    color: "tertiary",
    icon: "mdi-leaf",
  },
])

useHead({
  title: 'Chargement...',
  meta: [{ name: 'description', content: 'Chargement du produit...' }]
})

watch(product, (p) => {
  if (!p?.name) return

  const brand = p.brand || ''
  const category = p.category || ''
  const image = p.image_url || 'https://via.placeholder.com/600x400?text=Image+indisponible'
  const description = `${p.name}${brand ? ' de la marque ' + brand : ''}.`
  const url = window.location.href
  const keywords = [p.name, brand, category, p.halal_status].filter(Boolean).join(', ')

  useHead({
    title: `${p.name}${brand ? ' - ' + brand : ''}`,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },

      { property: 'og:title', content: `${p.name}${brand ? ' - ' + brand : ''}` },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'product' },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${p.name}${brand ? ' - ' + brand : ''}` },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: url }
    ]
  })
})

onMounted(async () => {
  await fetchProduct()
  const u = await fetchUser()
  if (u) {
    newReview.value.user_name = u.user_metadata?.full_name || u.email?.split('@')[0] || ''
    newReview.value.user_email = u.user_metadata?.email || u.email || ''
  }
})
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 400px;
  background-color: rgb(var(--v-theme-surface));
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(10px) brightness(0.5);
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.6));
}

.hero-content {
  position: relative;
  z-index: 2;
}

.product-image-card {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

.macros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.macro-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  border-bottom: 4px solid;
  transition: transform 0.2s;
}

.macro-card:hover {
  transform: translateY(-4px);
}

.macro-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.macro-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}

.macro-unit {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.7;
}

.macro-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 8px;
}

.nutrition-table th {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.05em;
}

.hydration-chip {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
  color: #0d47a1 !important;
}

.sticky-top {
  position: sticky;
  z-index: 1;
}

@media (max-width: 600px) {
  .hero-section {
    min-height: auto;
    padding-bottom: 24px;
  }

  .product-image-card {
    width: 160px;
    margin-top: 20px;
  }
}
</style>