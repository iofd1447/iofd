<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" variant="text" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-6">
      <v-row>
        <v-col cols="12" md="5">
          <v-card elevation="4" rounded="xl" class="sticky-card">
            <v-img v-if="product" :src="product.image_url" height="400" cover class="product-hero-image">
              <div class="pa-4">
                <v-chip :color="getHalalColor(product.halal_status)" size="large" class="font-weight-bold">
                  <v-icon start>{{ getHalalIcon(product.halal_status) }}</v-icon>
                  {{ getHalalLabel(product.halal_status) }}
                </v-chip>
              </div>
            </v-img>

            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-rating v-if="product" :model-value="product.rating" readonly density="compact" color="amber"
                  half-increments />
                <span v-if="product" class="text-subtitle-2 text-medium-emphasis ml-2">
                  {{ product.rating }} ({{ product.reviews_count }} avis)
                </span>
              </div>

              <v-btn block size="large" color="primary" variant="flat" rounded="lg" class="mb-3"
                @click="reviewDialog = true">
                <v-icon start>mdi-star</v-icon>
                Ajoutez un avis
              </v-btn>

              <v-btn block size="large" variant="outlined" rounded="lg">
                <v-icon start>mdi-pencil</v-icon>
                Modifier les informations
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center ga-2 mb-3">
                <v-chip v-if="product.category" size="small" variant="tonal" color="primary">
                  {{ product.category }}
                </v-chip>
                <v-chip size="small" variant="tonal">
                  {{ product.barcode }}
                </v-chip>
              </div>

              <h1 class="text-h4 font-weight-bold mb-2">
                {{ product.name }}
              </h1>

              <p class="text-h6 text-medium-emphasis mb-4">
                {{ product.brand }}
              </p>

              <v-divider class="my-4" />

              <div class="mb-4">
                <div class="text-subtitle-2 text-medium-emphasis mb-2">Description de la portion</div>
                <p class="text-body-1">{{ product.portion_description || 'Non spécifié' }}</p>
              </div>

              <div v-if="product.labels?.length" class="mb-4">
                <div class="text-subtitle-2 text-medium-emphasis mb-2">Labels & Certifications</div>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip v-for="label in product.labels" :key="label" color="success" variant="tonal">
                    <v-icon start size="small">mdi-check-decagram</v-icon>
                    {{ label }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-if="product.certification" elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="success" class="mr-3">mdi-certificate</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Certification Halal</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Informations de certification</p>
                </div>
              </div>

              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Organisme</div>
                    <div class="text-body-1 font-weight-medium">{{ product.certification.body }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Numéro</div>
                    <div class="text-body-1 font-weight-medium">{{ product.certification.number }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Date de certification</div>
                    <div class="text-body-1 font-weight-medium">{{ formatDate(product.certification.certified_date) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Expiration</div>
                    <div class="text-body-1 font-weight-medium">{{ formatDate(product.certification.expiry_date) }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-alert v-if="product.certification.verified_by_community" type="info" variant="tonal" class="mt-4">
                <div class="d-flex align-center">
                  <v-icon start>mdi-account-check</v-icon>
                  <div>
                    <strong>Vérifié par la communauté</strong>
                    <div class="text-caption">{{ product.certification.verification_count }} vérifications</div>
                  </div>
                </div>
              </v-alert>
            </v-card-text>
          </v-card>


          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="primary" class="mr-3">mdi-food-apple</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Valeurs nutritionnelles</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Pour 100g / 100ml</p>
                </div>
              </div>

              <v-row>
                <v-col v-for="nutrient in nutrients" :key="nutrient.key" cols="6" sm="4" md="3">
                  <div class="nutrition-card">
                    <div class="d-flex align-center justify-center mb-2">
                      <v-avatar :color="nutrient.color" size="48" class="elevation-2">
                        <v-icon size="24" color="white">{{ nutrient.icon }}</v-icon>
                      </v-avatar>
                    </div>
                    <div class="text-center">
                      <div class="text-h6 font-weight-bold" :style="{ color: `rgb(var(--v-theme-${nutrient.color}))` }">
                        {{ product.nutrition[nutrient.key] || '0' }}
                        <span class="text-caption">{{ nutrient.unit }}</span>
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">{{ nutrient.label }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="text-caption text-medium-emphasis text-center">
                Les valeurs sont indicatives et peuvent varier selon les lots
              </div>
            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="secondary" class="mr-3">mdi-format-list-bulleted</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Ingrédients</h3>
                  <p class="text-caption text-medium-emphasis mb-0">{{ product.ingredients?.length || 0 }} ingrédients
                    détectés</p>
                </div>
              </div>

              <div>
                {{product.ingredients.map((i: any) => i.name || 'Ingrédient inconnu').join(', ')}}
              </div>
            </v-card-text>
          </v-card>

          <v-card v-if="product.additives?.length" elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="warning" class="mr-3">mdi-flask</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Additifs</h3>
                  <p class="text-caption text-medium-emphasis mb-0">{{ product.additives.length }} additifs détectés</p>
                </div>
              </div>

              <v-list bg-color="transparent">
                <v-list-item v-for="additive in product.additives" :key="additive.code" rounded="lg" class="mb-2">
                  <template #prepend>
                    <v-avatar :color="getIngredientColor(additive.halal_status)" size="40">
                      <span class="text-caption font-weight-bold">{{ additive.code }}</span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold">
                    {{ additive.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ additive.function }} • {{ additive.origin_type }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-chip :color="getIngredientColor(additive.halal_status)" size="small">
                      {{ additive.halal_status }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card v-if="product.allergens?.length" elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="error" class="mr-3">mdi-alert-circle</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Allergènes</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Informations sur les allergènes</p>
                </div>
              </div>

              <v-alert v-for="allergen in product.allergens" :key="allergen.name"
                :type="getAllergenType(allergen.presence_type)" variant="tonal" class="mb-2">
                <div class="d-flex flex-column">
                  <div class="d-flex align-center justify-space-between">
                    <strong>{{ allergen.name }}</strong>
                    <div class="text-caption">{{ getAllergenText(allergen.presence_type) }}</div>
                  </div>
                  <div v-if="allergen.description" class="text-caption text-secondary">
                    {{ allergen.description }}
                  </div>
                </div>
              </v-alert>

            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl">
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon size="32" color="tertiary" class="mr-3">mdi-comment-multiple</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-bold">Avis de la communauté</h3>
                    <p class="text-caption text-medium-emphasis mb-0">{{ product.reviews_count }} avis</p>
                  </div>
                </div>
                <v-btn color="primary" variant="tonal" @click="openReviewDialog">
                  <v-icon start>mdi-plus</v-icon>
                  Ajouter un avis
                </v-btn>
              </div>

              <div v-if="product.reviews?.length" class="reviews-list">
                <v-card v-for="review in product.reviews" :key="review.id" variant="tonal" class="mb-3" rounded="lg">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-2">
                      <v-avatar color="primary" size="32" class="mr-2">
                        <span class="text-caption">{{ review.user_initials }}</span>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold">{{ review.user_name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ formatDate(review.created_at) }}</div>
                      </div>
                      <v-chip :color="getHalalColor(review.halal_vote)" size="small">
                        {{ review.halal_vote }}
                      </v-chip>
                    </div>
                    <p class="text-body-2 mb-2">{{ review.comment }}</p>
                    <v-btn size="small" variant="text" prepend-icon="mdi-thumb-up">
                      Utile ({{ review.helpful_count }})
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>

              <v-alert v-else type="info" variant="tonal">
                Aucun avis pour le moment. Soyez le premier à donner votre avis !
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-dialog v-model="reviewDialog" max-width="600px">
    <v-card rounded="xl">
      <v-card-title class="font-weight-bold">
        <v-icon start color="primary">mdi-star</v-icon>
        Ajouter un avis
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="reviewForm" @submit.prevent="submitReview">
          <v-rating v-model="newReview.rating" color="amber" size="large" half-increments class="mb-4" />

          <v-text-field v-model="newReview.user_name" label="Votre nom" variant="outlined" required class="mb-3" />
          <v-text-field v-model="newReview.user_email" label="Votre email" variant="outlined" type="email"
            class="mb-3" />

          <v-select v-model="newReview.halal_vote" label="Statut halal"
            :items="['halal', 'haram', 'douteux', 'non_verifie']" variant="outlined" class="mb-3" />

          <v-textarea v-model="newReview.comment" label="Commentaire" variant="outlined" rows="3" />

          <v-btn color="primary" block type="submit" class="mt-4">
            <v-icon start>mdi-send</v-icon>
            Envoyer
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useSupabase } from '#imports'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'

const supabase = useSupabase()
const { user, fetchUser } = useSupabaseAuth()

const route = useRoute()
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

const loading = ref(true)
const reviewDialog = ref(false)
const reviewForm = ref()
const newReview = ref({
  rating: 0,
  user_name: '',
  user_email: '',
  halal_vote: 'non_verifie',
  comment: ''
})

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

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

    const reviews = (data.community_reviews || []).map((r: any) => ({
      rating: r.rating ?? 0,
      user_name: r.user_name ?? 'Utilisateur',
      user_email: r.user_email ?? '',
      halal_vote: r.halal_vote ?? 'non_verifie',
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
      category: data.category?.name || 'Autre',
      image_url: data.image_url || 'https://via.placeholder.com/600x400?text=Image+indisponible',
      portion_description: data.portion_description || 'Non spécifiée',
      halal_status: data.halal_certification?.[0]?.halal_status || 'non_verifie',
      certification: data.halal_certification?.[0]
        ? {
          body: data.halal_certification[0].certification_body,
          number: data.halal_certification[0].certificate_number,
          certified_date: data.halal_certification[0].certified_date,
          expiry_date: data.halal_certification[0].expiry_date,
          verified_by_community: data.halal_certification[0].verified_by_community,
          verification_count: data.halal_certification[0].verification_count
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
        code: a.additive?.code,
        name: a.additive?.name,
        halal_status: a.additive?.halal_status,
        origin_type: a.additive?.origin_type,
        function: a.additive?.function
      })),
      allergens: (data.product_allergens || []).map((a: any) => ({
        name: a.allergen?.name,
        description: a.allergen?.description
      })),
      labels: (data.product_labels || []).map((l: any) => l.label?.name),
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
  newReview.value = { rating: 0, user_name: '', user_email: '', halal_vote: 'non_verifie', comment: '' }

  await fetchProduct()
}

type NutrientKey = keyof typeof product.value.nutrition

const nutrients: { key: NutrientKey; label: string; unit: string; icon: string; color: string }[] = [
  { key: 'calories_kcal', label: 'Calories', unit: 'kcal', icon: 'mdi-fire', color: 'primary' },
  { key: 'protein_g', label: 'Protéines', unit: 'g', icon: 'mdi-egg', color: 'success' },
  { key: 'carbs_g', label: 'Glucides', unit: 'g', icon: 'mdi-pasta', color: 'warning' },
  { key: 'sugars_g', label: 'Sucres', unit: 'g', icon: 'mdi-candy', color: 'error' },
  { key: 'fats_g', label: 'Lipides', unit: 'g', icon: 'mdi-oil', color: 'secondary' },
  { key: 'saturated_fats_g', label: 'Graisses saturées', unit: 'g', icon: 'mdi-food-drumstick', color: 'tertiary' },
  { key: 'fibres_g', label: 'Fibres', unit: 'g', icon: 'mdi-barley', color: 'accent' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', icon: 'mdi-shaker', color: 'bonus' },
]

const getHalalColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    douteux: 'warning',
    non_verifie: 'grey',
    variable: 'orange'
  }
  return colors[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    douteux: 'Douteux',
    non_verifie: 'Non vérifié',
    variable: 'Variable'
  }
  return labels[status] || 'Non vérifié'
}

const getHalalIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    douteux: 'mdi-alert-circle',
    non_verifie: 'mdi-help-circle',
    variable: 'mdi-swap-horizontal-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getIngredientColor = (status: string) => {
  return getHalalColor(status)
}

const getAllergenType = (presence: string): 'success' | 'warning' | 'error' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    contient: 'error',
    traces: 'warning',
    peut_contenir: 'info'
  }
  return types[presence] || 'info'
}

const getAllergenText = (presence: string) => {
  const texts: Record<string, string> = {
    contient: 'Contient cet allergène',
    traces: 'Peut contenir des traces',
    peut_contenir: 'Peut contenir'
  }
  return texts[presence] || ''
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const shareProduct = async () => {
  if (!product.value) return
  const shareData = {
    title: product.value.name,
    text: `Découvrez le produit ${product.value.name} (${product.value.brand}) sur notre application Halal Scan.`,
    url: window.location.href
  }
  try {
    if (navigator.share) await navigator.share(shareData)
    else await navigator.clipboard.writeText(shareData.url)
    alert('Lien copié dans le presse-papiers !')
  } catch (err) {
    console.error('Erreur lors du partage :', err)
  }
}

const openReviewDialog = () => {
  // Ouvrir dialog d'ajout d'avis
  console.log('Ouvrir dialog avis')
}

useHead({
  title: 'Chargement...',
  meta: [{ name: 'description', content: 'Chargement du produit...' }]
})

watch(product, (newProduct) => {
  if (newProduct?.name) {
    useHead({
      title: newProduct.name,
      meta: [{ name: 'description', content: newProduct.name }]
    })
  }
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
.sticky-card {
  position: sticky;
  top: 80px;
}

.product-hero-image {
  position: relative;
}

.info-item {
  padding: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
}

.nutrition-grid {
  display: grid;
  gap: 16px;
}

.nutrition-item {
  padding: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reviews-list {
  max-height: 600px;
  overflow-y: auto;
}

/* Smooth scrolling */
.reviews-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.reviews-list::-webkit-scrollbar {
  width: 6px;
}

.reviews-list::-webkit-scrollbar-track {
  background: transparent;
}

.reviews-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.reviews-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-primary), 0.5);
}

@media (max-width: 960px) {
  .sticky-card {
    position: relative;
    top: 0;
  }
}
</style>