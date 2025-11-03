<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn icon="mdi-share-variant" variant="text" @click="shareProduct" />
    <v-btn icon="mdi-heart-outline" variant="text" @click="toggleFavorite" />
    <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" variant="text" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-6">
      <!-- Hero Section -->
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

              <v-btn block size="large" color="primary" variant="flat" rounded="lg" class="mb-3">
                <v-icon start>mdi-barcode-scan</v-icon>
                Scanner un autre produit
              </v-btn>

              <v-btn block size="large" variant="outlined" rounded="lg">
                <v-icon start>mdi-pencil</v-icon>
                Modifier les informations
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <!-- Product Info -->
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center gap-2 mb-3">
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

              <!-- Labels -->
              <div v-if="product.labels?.length" class="mb-4">
                <div class="text-subtitle-2 text-medium-emphasis mb-2">Labels & Certifications</div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="label in product.labels" :key="label" color="success" variant="tonal">
                    <v-icon start size="small">mdi-check-decagram</v-icon>
                    {{ label }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Halal Certification Details -->
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

          <!-- Nutrition Facts -->
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="primary" class="mr-3">mdi-food-apple</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Valeurs nutritionnelles</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Pour 100g / 100ml</p>
                </div>
              </div>

              <div class="nutrition-grid">
                <div v-for="nutrient in nutrients" :key="nutrient.key" class="nutrition-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-body-2">{{ nutrient.label }}</span>
                    <span class="text-body-1 font-weight-bold">
                      {{ product.nutrition[nutrient.key] || '-' }} {{ nutrient.unit }}
                    </span>
                  </div>
                  <v-progress-linear :model-value="getNutrientPercentage(product.nutrition[nutrient.key], nutrient.max)"
                    :color="nutrient.color" height="4" rounded class="mt-1" />
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Ingredients -->
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

              <div class="ingredients-list">
                <v-chip v-for="(ingredient, i) in product.ingredients" :key="i"
                  :color="getIngredientColor(ingredient.halal_status)" variant="tonal" size="small" class="ma-1">
                  {{ ingredient.name }}
                  <v-tooltip activator="parent" location="top">
                    <div class="pa-2">
                      <div class="font-weight-bold mb-1">{{ ingredient.name }}</div>
                      <div class="text-caption">{{ ingredient.description }}</div>
                      <v-chip size="x-small" :color="getIngredientColor(ingredient.halal_status)" class="mt-1">
                        {{ ingredient.halal_status }}
                      </v-chip>
                    </div>
                  </v-tooltip>
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Additives -->
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

          <!-- Allergens -->
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
                <div class="d-flex align-center">
                  <v-icon start>{{ getAllergenIcon(allergen.presence_type) }}</v-icon>
                  <div>
                    <strong>{{ allergen.name }}</strong>
                    <div class="text-caption">{{ getAllergenText(allergen.presence_type) }}</div>
                  </div>
                </div>
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Community Reviews -->
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useSupabase } from '#imports'

const supabase = useSupabase()
const route = useRoute()
const product = ref<any>({
  rating: 0,
  reviews_count: 0,
  certification: null,
  nutrition: {},
  ingredients: [],
  additives: [],
  allergens: [],
  labels: [],
  reviews: [],
})
const loading = ref(true)

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const fetchProduct = async () => {
  loading.value = true
  const productId = route.params.id as string // ✅ Correction ici

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        nutrition:nutrition_facts(*),
        halal_certification:halal_certifications(*),
        product_ingredients(ingredient:ingredients(name, description, halal_status)),
        product_additives(additive:additives(code, name, halal_status, origin_type, function)),
        product_allergens(allergen:allergens(name, description)),
        product_labels(label:labels(name)),
        community_reviews(halal_vote, comment, helpful_count, created_at)
      `)
      .eq('id', productId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Produit non trouvé')

    // 🧩 Remappage cohérent avec ta DB
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
      ingredients: (data.product_ingredients || []).map((i: any) => ({
        name: i.ingredient?.name,
        description: i.ingredient?.description,
        halal_status: i.ingredient?.halal_status
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
      reviews: (data.community_reviews || []).map((r: any) => ({
        halal_vote: r.halal_vote,
        comment: r.comment,
        helpful_count: r.helpful_count,
        created_at: r.created_at
      })),
      rating: Math.random() * 2 + 3,
      reviews_count: Math.floor(Math.random() * 200)
    }
  } catch (err) {
    console.error('Erreur de récupération du produit:', err)
  } finally {
    loading.value = false
  }
};

onMounted(async () => {
  await fetchProduct()
})

type NutrientKey = keyof typeof product.value.nutrition

const nutrients: { key: NutrientKey; label: string; unit: string; max: number; color: string }[] = [
  { key: 'calories_kcal', label: 'Calories', unit: 'kcal', max: 2000, color: 'primary' },
  { key: 'protein_g', label: 'Protéines', unit: 'g', max: 50, color: 'success' },
  { key: 'carbs_g', label: 'Glucides', unit: 'g', max: 300, color: 'warning' },
  { key: 'sugars_g', label: 'Sucres', unit: 'g', max: 90, color: 'error' },
  { key: 'fats_g', label: 'Lipides', unit: 'g', max: 70, color: 'orange' },
  { key: 'saturated_fats_g', label: 'Graisses saturées', unit: 'g', max: 20, color: 'deep-orange' },
  { key: 'fibres_g', label: 'Fibres', unit: 'g', max: 25, color: 'teal' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', max: 2300, color: 'purple' }
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

const getNutrientPercentage = (value: number, max: number) => {
  if (!value || !max) return 0
  return Math.min((value / max) * 100, 100)
}

const getAllergenType = (presence: string): 'success' | 'warning' | 'error' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    contient: 'error',
    traces: 'warning',
    peut_contenir: 'info'
  }
  return types[presence] || 'info'
}

const getAllergenIcon = (presence: string) => {
  const icons: Record<string, string> = {
    contient: 'mdi-alert-circle',
    traces: 'mdi-information',
    peut_contenir: 'mdi-help-circle'
  }
  return icons[presence] || 'mdi-help-circle'
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

const toggleFavorite = () => {
  // Logique favoris
  console.log('Toggle favorite')
}

const openReviewDialog = () => {
  // Ouvrir dialog d'ajout d'avis
  console.log('Ouvrir dialog avis')
}
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