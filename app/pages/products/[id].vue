<template>
  <v-app-bar elevation="0" :class="['px-2 px-sm-4']" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.back()" />

    <v-app-bar-title :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• {{ product.name }}</span>
    </v-app-bar-title>

  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container :class="['py-3 py-sm-6', 'px-2 px-sm-4']">
      <v-row>
        <v-col cols="12" md="5">
          <v-card elevation="4" rounded="xl" class="sticky-card mb-3 mb-md-0">
            <v-img v-if="product" :src="product.image_url" :height="$vuetify.display.xs ? '250' : '400'" cover
              class="product-hero-image">
              <div :class="['pa-2 pa-sm-4']">
                <v-chip :color="getHalalColor(product.halal_status)" :size="$vuetify.display.xs ? 'default' : 'large'"
                  class="font-weight-bold">
                  <v-icon start :size="$vuetify.display.xs ? '18' : '20'">
                    {{ getHalalIcon(product.halal_status) }}
                  </v-icon>
                  {{ getHalalLabel(product.halal_status) }}
                </v-chip>
              </div>
            </v-img>

            <v-card-text :class="['pa-3 pa-sm-6']">
              <div v-if="product" class="d-flex align-center mb-3 mb-sm-4">
                <span class="text-caption text-medium-emphasis mr-1"
                  style="align-self: center; line-height: 1; font-size: 14px;">
                  {{ product.rating.toFixed(1) }}
                </span>
                <v-rating :model-value="product.rating" readonly density="compact" color="amber" half-increments
                  :size="$vuetify.display.xs ? 'small' : 'default'" class="mx-1" style="align-self: center;" />
                <span class="text-caption text-medium-emphasis"
                  style="align-self: center; line-height: 1; font-size: 14px;">
                  ({{ product.reviews_count }})
                </span>
              </div>


              <v-btn block :size="$vuetify.display.xs ? 'default' : 'large'" color="primary" variant="flat" rounded="lg"
                class="mb-2 mb-sm-3" @click="reviewDialog = true">
                <v-icon start :size="$vuetify.display.xs ? '18' : '20'">mdi-star</v-icon>
                <span>Ajoutez un avis</span>
              </v-btn>

              <v-btn block :size="$vuetify.display.xs ? 'default' : 'large'" variant="outlined" rounded="lg">
                <v-icon start :size="$vuetify.display.xs ? '18' : '20'">mdi-pencil</v-icon>
                <span>Modifier les informations</span>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center flex-wrap ga-1 ga-sm-2 mb-2 mb-sm-3">
                <v-chip v-if="product.category" size="small" variant="tonal" color="primary" :class="['text-caption']">
                  {{ product.category }}
                </v-chip>
                <v-chip size="small" variant="tonal" :class="['text-caption']">
                  {{ product.barcode }}
                </v-chip>
              </div>

              <h1 :class="['text-h5 text-sm-h4 font-weight-bold mb-1 mb-sm-2']">
                {{ product.name }}
              </h1>

              <p :class="['text-subtitle-1 text-sm-h6 text-medium-emphasis mb-3 mb-sm-4']">
                {{ product.brand }}
              </p>

              <v-divider class="my-3 my-sm-4" />

              <div class="mb-3 mb-sm-4">
                <div class="text-caption text-sm-subtitle-2 text-medium-emphasis mb-1 mb-sm-2">
                  Description de la portion
                </div>
                <p :class="['text-body-2 text-sm-body-1 mb-0']">
                  {{ product.portion_description || 'Non spécifié' }}
                </p>
              </div>

              <div v-if="product.labels?.length" class="mb-3 mb-sm-4">
                <div class="text-caption text-sm-subtitle-2 text-medium-emphasis mb-1 mb-sm-2">
                  Labels & Certifications
                </div>
                <div class="d-flex flex-wrap ga-1 ga-sm-2">
                  <v-chip v-for="label in product.labels" :key="label" color="success" variant="tonal" size="small"
                    :class="['text-caption']">
                    <v-icon start size="small">mdi-check-decagram</v-icon>
                    {{ label }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-if="product.certification" elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon :size="$vuetify.display.xs ? '24' : '32'" color="success" class="mr-2 mr-sm-3">
                  mdi-certificate
                </v-icon>
                <div>
                  <h3 :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">Certification Halal</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Informations de certification</p>
                </div>
              </div>

              <v-row dense>
                <v-col cols="6" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Organisme</div>
                    <div :class="['text-body-2 text-sm-body-1 font-weight-medium']">
                      {{ product.certification.body }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="6" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Numéro</div>
                    <div :class="['text-body-2 text-sm-body-1 font-weight-medium']">
                      {{ product.certification.number }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="6" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Certification</div>
                    <div :class="['text-body-2 text-sm-body-1 font-weight-medium']">
                      {{ formatDate(product.certification.certified_date) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="6" sm="6">
                  <div class="info-item">
                    <div class="text-caption text-medium-emphasis">Expiration</div>
                    <div :class="['text-body-2 text-sm-body-1 font-weight-medium']">
                      {{ formatDate(product.certification.expiry_date) }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-alert v-if="product.certification.verified_by_community" type="info" variant="tonal"
                class="mt-3 mt-sm-4" density="compact">
                <div class="d-flex align-center">
                  <v-icon start size="small">mdi-account-check</v-icon>
                  <div>
                    <strong class="text-body-2">Vérifié par la communauté</strong>
                    <div class="text-caption">{{ product.certification.verification_count }} vérifications</div>
                  </div>
                </div>
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon :size="$vuetify.display.xs ? '24' : '32'" color="primary" class="mr-2 mr-sm-3">
                  mdi-food-apple
                </v-icon>
                <div>
                  <h3 :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">Valeurs nutritionnelles</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Pour 100g / 100ml</p>
                </div>
              </div>

              <v-row dense>
                <v-col v-for="nutrient in nutrients" :key="nutrient.key" cols="6" sm="4" md="3">
                  <div class="nutrition-card">
                    <div class="d-flex align-center justify-center mb-1 mb-sm-2">
                      <v-avatar :color="nutrient.color" :size="$vuetify.display.xs ? '40' : '48'" class="elevation-2">
                        <v-icon :size="$vuetify.display.xs ? '20' : '24'" color="white">
                          {{ nutrient.icon }}
                        </v-icon>
                      </v-avatar>
                    </div>
                    <div class="text-center">
                      <div :class="['text-subtitle-1 text-sm-h6 font-weight-bold']"
                        :style="{ color: `rgb(var(--v-theme-${nutrient.color}))` }">
                        {{ product.nutrition[nutrient.key] || '0' }}
                        <span class="text-caption">{{ nutrient.unit }}</span>
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ nutrient.label }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-3 my-sm-4" />

              <div class="text-caption text-medium-emphasis text-center">
                Les valeurs sont indicatives et peuvent varier selon les lots
              </div>
            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon :size="$vuetify.display.xs ? '24' : '32'" color="secondary" class="mr-2 mr-sm-3">
                  mdi-format-list-bulleted
                </v-icon>
                <div>
                  <h3 :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">Ingrédients</h3>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ product.ingredients?.length || 0 }} ingrédients détectés
                  </p>
                </div>
              </div>

              <div :class="['text-body-2 text-sm-body-1']">
                {{product.ingredients.map((i: any) => i.name || 'Ingrédient inconnu').join(', ')}}
              </div>
            </v-card-text>
          </v-card>

          <v-card v-if="product.additives?.length" elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon :size="$vuetify.display.xs ? '24' : '32'" color="warning" class="mr-2 mr-sm-3">
                  mdi-flask
                </v-icon>
                <div>
                  <h3 :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">Additifs</h3>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ product.additives.length }} additifs détectés
                  </p>
                </div>
              </div>

              <v-list bg-color="transparent" density="compact">
                <v-list-item v-for="additive in product.additives" :key="additive.code" rounded="lg"
                  class="mb-1 mb-sm-2 px-2 px-sm-4">
                  <template #prepend>
                    <v-avatar :color="getIngredientColor(additive.halal_status)"
                      :size="$vuetify.display.xs ? '32' : '40'">
                      <span :class="['text-caption font-weight-bold']">
                        {{ additive.code }}
                      </span>
                    </v-avatar>
                  </template>

                  <v-list-item-title :class="['text-body-2 text-sm-body-1 font-weight-bold']">
                    {{ additive.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ additive.function }}
                    <span class="d-none d-sm-inline"> • {{ additive.origin_type }}</span>
                  </v-list-item-subtitle>

                  <template #append>
                    <v-chip :color="getIngredientColor(additive.halal_status)" size="x-small" class="text-caption">
                      {{ additive.halal_status }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card v-if="product.allergens?.length" elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon :size="$vuetify.display.xs ? '24' : '32'" color="error" class="mr-2 mr-sm-3">
                  mdi-alert-circle
                </v-icon>
                <div>
                  <h3 :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">Allergènes</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Informations sur les allergènes</p>
                </div>
              </div>

              <v-alert v-for="allergen in product.allergens" :key="allergen.name"
                :type="getAllergenType(allergen.presence_type)" variant="tonal" class="mb-2" density="compact">
                <div class="d-flex flex-column">
                  <div class="d-flex align-center justify-space-between">
                    <strong class="text-body-2">{{ allergen.name }}</strong>
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
            <v-card-text :class="['pa-3 pa-sm-6']">
              <div class="d-flex align-center justify-space-between mb-3 mb-sm-4 flex-wrap ga-2">
                <div class="d-flex align-center">
                  <v-icon :size="$vuetify.display.xs ? '24' : '32'" color="tertiary" class="mr-2 mr-sm-3">
                    mdi-comment-multiple
                  </v-icon>
                  <div>
                    <h3 :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">Avis de la communauté</h3>
                    <p class="text-caption text-medium-emphasis mb-0">{{ product.reviews_count }} avis</p>
                  </div>
                </div>
                <v-btn color="primary" variant="tonal" @click="openReviewDialog"
                  :size="$vuetify.display.xs ? 'small' : 'default'">
                  <v-icon start size="small">mdi-plus</v-icon>
                  <span class="d-none d-sm-inline">Ajouter un avis</span>
                  <span class="d-inline d-sm-none">Avis</span>
                </v-btn>
              </div>

              <div v-if="product.reviews?.length" class="reviews-list">
                <v-card v-for="review in product.reviews" :key="review.id" variant="tonal" class="mb-2 mb-sm-3"
                  rounded="lg">
                  <v-card-text :class="['pa-3 pa-sm-4']">
                    <div class="d-flex align-center mb-2">
                      <v-avatar color="primary" :size="$vuetify.display.xs ? '28' : '32'" class="mr-2">
                        <span class="text-caption">{{ review.user_initials }}</span>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div :class="['text-body-2 font-weight-bold']">{{ review.user_name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ formatDate(review.created_at) }}</div>
                      </div>
                      <v-chip :color="getHalalColor(review.halal_vote)" size="x-small">
                        {{ review.halal_vote }}
                      </v-chip>
                    </div>
                    <p :class="['text-body-2 mb-2']">{{ review.comment }}</p>
                  </v-card-text>
                </v-card>
              </div>

              <v-alert v-else type="info" variant="tonal" density="compact">
                Aucun avis pour le moment. Soyez le premier à donner votre avis !
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-dialog v-model="reviewDialog" :max-width="$vuetify.display.xs ? '95%' : '600px'">
    <v-card rounded="xl">
      <v-card-title :class="['font-weight-bold pa-4 pa-sm-6']">
        <v-icon start color="primary" :size="$vuetify.display.xs ? '20' : '24'">mdi-star</v-icon>
        <span :class="['text-subtitle-1 text-sm-h6']">Ajouter un avis</span>
      </v-card-title>

      <v-card-text :class="['pa-3 pa-sm-6 pt-2 pt-sm-4']">
        <v-form ref="reviewForm" @submit.prevent="submitReview">
          <v-rating v-model="newReview.rating" color="amber" :size="$vuetify.display.xs ? 'default' : 'large'"
            half-increments class="mb-3 mb-sm-4" />

          <v-text-field v-model="newReview.user_name" label="Votre nom" variant="outlined" required class="mb-2 mb-sm-3"
            :density="$vuetify.display.xs ? 'comfortable' : 'default'" />

          <v-text-field v-model="newReview.user_email" label="Votre email" variant="outlined" type="email"
            class="mb-2 mb-sm-3" :density="$vuetify.display.xs ? 'comfortable' : 'default'" />

          <v-select v-model="newReview.halal_vote" label="Statut halal"
            :items="['halal', 'haram', 'douteux', 'non_verifie']" variant="outlined" class="mb-2 mb-sm-3"
            :density="$vuetify.display.xs ? 'comfortable' : 'default'" />

          <v-textarea v-model="newReview.comment" label="Commentaire" variant="outlined" rows="3"
            :density="$vuetify.display.xs ? 'comfortable' : 'default'" />

          <v-btn color="primary" block type="submit" class="mt-3 mt-sm-4"
            :size="$vuetify.display.xs ? 'default' : 'large'">
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

const openReviewDialog = () => {
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
@media (max-width: 600px) {

  .sticky-card {
    position: sticky;
    margin-top: 80px;
  }

  .v-card {
    border-radius: 16px !important;
  }

  .product-hero-image {
    border-radius: 16px 16px 0 0 !important;
  }

  .info-item {
    padding: 8px !important;
    border-radius: 8px !important;
  }

  .nutrition-card {
    padding: 8px 4px !important;
  }

  .reviews-list {
    max-height: 400px !important;
  }

  .v-row {
    margin: -4px !important;
  }

  .v-row>.v-col {
    padding: 4px !important;
  }

  .v-list-item {
    min-height: 56px !important;
    padding: 8px 12px !important;
  }

  .v-chip {
    font-size: 0.75rem !important;
    height: 24px !important;
  }

  .v-alert {
    padding: 12px !important;
  }

  .v-dialog>.v-card {
    margin: 8px !important;
    max-height: calc(100vh - 16px) !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
    line-height: 1.3 !important;
  }

  .text-subtitle-1 {
    font-size: 0.95rem !important;
  }

  .v-avatar {
    font-size: 0.75rem !important;
  }

  .v-rating {
    gap: 2px !important;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .sticky-card {
    position: relative !important;
    top: 0 !important;
  }

  .nutrition-card {
    padding: 12px 8px !important;
  }
}

@media (min-width: 961px) {
  .sticky-card {
    position: sticky !important;
    top: 80px !important;
  }
}

@media (max-width: 600px) and (pointer: coarse) {
  .v-btn {
    min-height: 44px !important;
  }

  .v-list-item {
    min-height: 60px !important;
  }

  .v-text-field,
  .v-select,
  .v-textarea {
    min-height: 48px !important;
  }
}

@media (max-width: 600px) {
  .v-main {
    overflow-x: hidden;
  }

  * {
    -webkit-overflow-scrolling: touch;
  }

  .v-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .v-card:active {
    transform: scale(0.98);
  }
}

@media (max-width: 360px) {
  .product-hero-image {
    height: 200px !important;
  }

  .nutrition-card {
    padding: 6px 2px !important;
  }

  .v-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  .text-h5 {
    font-size: 1.1rem !important;
  }
}

.info-item {
  padding: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nutrition-card {
  padding: 12px 8px;
  text-align: center;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.3);
  transition: all 0.2s ease;
}

.nutrition-card:hover {
  background: rgba(var(--v-theme-surface), 0.5);
  transform: translateY(-2px);
}

.reviews-list {
  max-height: 600px;
  overflow-y: auto;
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

@media (max-width: 600px) {
  .v-theme--dark .v-card {
    background: rgba(var(--v-theme-surface), 0.98);
  }

  .v-theme--dark .info-item,
  .v-theme--dark .nutrition-card {
    background: rgba(var(--v-theme-surface), 0.4);
  }

  .v-theme--dark .text-medium-emphasis {
    opacity: 0.85;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card {
  animation: slideInUp 0.3s ease-out;
}

.product-hero-image {
  position: relative;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-secondary), 0.1));
}

@media (pointer: coarse) {
  .nutrition-card:hover {
    transform: none;
  }

  .info-item:hover {
    transform: none;
  }
}

@media (max-width: 600px) {
  .v-container {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

@media (max-width: 600px) {
  .v-chip .v-icon {
    margin-right: 2px !important;
  }

  .v-list-item-subtitle {
    font-size: 0.7rem !important;
    line-height: 1.2 !important;
  }
}

@media (max-width: 600px) {
  .v-divider {
    border-width: 0.5px !important;
  }
}

@media (max-width: 600px) {
  .v-dialog .v-card-title {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgb(var(--v-theme-surface));
  }

  .v-dialog .v-form {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
}

@media (max-width: 600px) {
  .v-card+.v-card {
    margin-top: 12px !important;
  }
}

.v-skeleton-loader {
  border-radius: 16px !important;
}

@media (max-width: 600px) {
  .v-skeleton-loader {
    border-radius: 12px !important;
  }
}

@media (max-width: 600px) {
  .v-rating .v-icon {
    font-size: 18px !important;
  }
}

@media (max-width: 600px) {
  .v-list {
    padding: 4px 0 !important;
  }

  .v-list-item__prepend {
    padding-right: 8px !important;
  }

  .v-list-item__append {
    padding-left: 8px !important;
  }
}

@media (max-width: 600px) {
  .v-alert .v-icon {
    margin-right: 8px !important;
  }

  .v-alert__content {
    font-size: 0.875rem !important;
  }
}

@media (max-width: 600px) {
  .v-list-item-title,
  .v-list-item-subtitle {
    white-space: normal !important;
    word-break: break-word !important;
  }

  h1,
  h2,
  h3 {
    word-break: break-word !important;
  }
}

@media (max-width: 600px) {
  .v-app-bar {
    backdrop-filter: blur(10px);
    background: rgba(var(--v-theme-surface), 0.95) !important;
  }
}

@media (max-width: 600px) and (prefers-reduced-motion: no-preference) {
  * {
    transition-duration: 0.15s !important;
  }
}

@media print {
  .v-app-bar,
  .v-btn,
  .sticky-card .v-card-actions {
    display: none !important;
  }

  .v-card {
    box-shadow: none !important;
    page-break-inside: avoid;
  }
}

.v-btn:focus-visible,
.v-chip:focus-visible,
.v-list-item:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.v-progress-circular {
  display: block;
  margin: 0 auto;
}

.v-alert[type="info"] {
  border-left: 4px solid rgb(var(--v-theme-info));
}

@media (max-width: 600px) {
  .text-medium-emphasis {
    color: rgba(var(--v-theme-on-surface), 0.75) !important;
  }

  .v-theme--dark .text-medium-emphasis {
    color: rgba(var(--v-theme-on-surface), 0.85) !important;
  }
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

@media (max-width: 600px) {
  .v-row.dense {
    margin: -2px !important;
  }

  .v-row.dense>.v-col {
    padding: 2px !important;
  }
}

@media (max-width: 600px) {
  .v-card[elevation="2"],
  .v-card[elevation="4"] {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  }
}

@media (max-width: 600px) {
  .v-btn+.v-btn {
    margin-top: 8px;
  }

  .v-btn-group .v-btn+.v-btn {
    margin-top: 0;
    margin-left: 8px;
  }
}

.v-img {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}

@media (max-width: 600px) {
  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ingredients-text {
    max-height: 200px;
    overflow-y: auto;
  }
}

@supports (padding: max(0px)) {
  @media (max-width: 600px) {
    .v-app-bar {
      padding-left: max(8px, env(safe-area-inset-left));
      padding-right: max(8px, env(safe-area-inset-right));
    }

    .v-container {
      padding-left: max(8px, env(safe-area-inset-left));
      padding-right: max(8px, env(safe-area-inset-right));
    }
  }
}

@media (max-width: 600px) {
  :focus {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
}

@media (max-width: 960px) and (orientation: landscape) {
  .product-hero-image {
    height: 200px !important;
  }

  .reviews-list {
    max-height: 300px !important;
  }
}

@media (max-width: 600px) {
  .v-main {
    padding-top: env(safe-area-inset-top);
  }
}
</style>