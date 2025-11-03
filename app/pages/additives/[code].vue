<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn icon="mdi-share-variant" variant="text" @click="shareAdditive" />
    <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" variant="text" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-6">
      <v-row>
        <!-- Left Column - Sticky Info Card -->
        <v-col cols="12" md="4">
          <v-card elevation="4" rounded="xl" class="sticky-card">
            <!-- Code Badge -->
            <div class="code-header" :style="{ background: getStatusGradient(additive.halal_status) }">
              <div class="text-center py-8">
                <div class="code-badge">
                  {{ additive.code }}
                </div>
                <v-chip :color="getStatusColor(additive.halal_status)" size="large" class="mt-4 font-weight-bold">
                  <v-icon start>{{ getStatusIcon(additive.halal_status) }}</v-icon>
                  {{ getStatusLabel(additive.halal_status) }}
                </v-chip>
              </div>
            </div>

            <v-card-text class="pa-6">
              <h2 class="text-h5 font-weight-bold mb-4 text-center">
                {{ additive.name }}
              </h2>

              <v-divider class="my-4" />

              <!-- Quick Info -->
              <div class="info-section mb-4">
                <div class="info-label mb-2">
                  <v-icon size="small" color="primary">mdi-function-variant</v-icon>
                  Fonction
                </div>
                <v-chip color="primary" variant="tonal" class="font-weight-medium">
                  {{ additive.function }}
                </v-chip>
              </div>

              <div class="info-section mb-4">
                <div class="info-label mb-2">
                  <v-icon size="small" color="secondary">{{ getOriginIcon(additive.origin_type) }}</v-icon>
                  Origine
                </div>
                <v-chip color="secondary" variant="tonal" class="font-weight-medium">
                  {{ additive.origin_type }}
                </v-chip>
              </div>

              <!-- Health Warning -->
              <v-alert v-if="additive.health_concerns" type="warning" variant="tonal" rounded="lg" class="mt-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  ⚠️ Préoccupations santé
                </div>
                <div class="text-body-2">
                  {{ additive.health_concerns }}
                </div>
              </v-alert>

              <v-divider class="my-4" />

              <!-- Actions -->
              <v-btn block color="primary" variant="flat" size="large" prepend-icon="mdi-magnify" class="mb-2"
                @click="searchProducts">
                Voir les produits
              </v-btn>

              <v-btn block variant="outlined" size="large" prepend-icon="mdi-bookmark-outline" @click="toggleBookmark">
                Sauvegarder
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Detailed Info -->
        <v-col cols="12" md="8">
          <!-- Description -->
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="primary" class="mr-3">mdi-information</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Description</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Informations générales</p>
                </div>
              </div>

              <p class="text-body-1 mb-0">
                {{ additive.description }}
              </p>
            </v-card-text>
          </v-card>

          <!-- Halal Status Details -->
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" :color="getStatusColor(additive.halal_status)" class="mr-3">
                  {{ getStatusIcon(additive.halal_status) }}
                </v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Statut Halal</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Analyse détaillée</p>
                </div>
              </div>

              <v-alert :type="getAlertType(additive.halal_status)" variant="tonal" rounded="lg" class="mb-4">
                <div class="text-body-1 font-weight-medium mb-2">
                  {{ getStatusTitle(additive.halal_status) }}
                </div>
                <div class="text-body-2">
                  {{ getStatusExplanation(additive.halal_status, additive.origin_type) }}
                </div>
              </v-alert>

              <!-- Detailed Analysis -->
              <div v-if="additive.halal_status === 'variable'" class="analysis-box">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">
                  <v-icon size="small" class="mr-2">mdi-microscope</v-icon>
                  Pourquoi "Variable" ?
                </h4>
                <p class="text-body-2 mb-0">
                  Cet additif peut être d'origine animale ou végétale. Il est crucial de vérifier avec le fabricant
                  la source exacte utilisée. Si elle est animale, vérifiez si l'animal était halal et abattu selon
                  les règles islamiques.
                </p>
              </div>

              <div v-if="additive.halal_status === 'douteux'" class="analysis-box">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">
                  <v-icon size="small" class="mr-2">mdi-help-circle</v-icon>
                  Pourquoi "Douteux" ?
                </h4>
                <p class="text-body-2 mb-0">
                  Cet additif présente des zones d'incertitude concernant son origine, son processus de fabrication
                  ou ses composants. Il est recommandé de consulter un savant ou d'éviter en cas de doute.
                </p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Function Details -->
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="primary" class="mr-3">mdi-beaker</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Fonction & Utilisation</h3>
                  <p class="text-caption text-medium-emphasis mb-0">Rôle dans les produits</p>
                </div>
              </div>

              <v-row>
                <v-col cols="12" sm="6">
                  <div class="function-card">
                    <div class="text-overline text-medium-emphasis mb-1">Fonction principale</div>
                    <div class="text-h6 font-weight-bold text-primary">
                      {{ additive.function }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="function-card">
                    <div class="text-overline text-medium-emphasis mb-1">Type d'origine</div>
                    <div class="text-h6 font-weight-bold text-secondary">
                      {{ additive.origin_type }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="usage-info">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">
                  Utilisation courante
                </h4>
                <v-chip-group column>
                  <v-chip v-for="usage in getCommonUsages(additive.function)" :key="usage" variant="tonal"
                    color="primary">
                    {{ usage }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-card-text>
          </v-card>

          <!-- Products using this additive -->
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon size="32" color="tertiary" class="mr-3">mdi-package-variant</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-bold">Produits contenant cet additif</h3>
                    <p class="text-caption text-medium-emphasis mb-0">
                      {{ relatedProducts.length }} produits référencés
                    </p>
                  </div>
                </div>
                <v-btn variant="text" color="primary" @click="searchProducts">
                  Voir tout
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </div>

              <v-row v-if="relatedProducts.length > 0">
                <v-col v-for="product in relatedProducts.slice(0, 3)" :key="product.id" cols="12" sm="4">
                  <v-card variant="tonal" rounded="lg" hover @click="goToProduct(product.id)">
                    <v-img :src="product.image_url" height="120" cover />
                    <v-card-text class="pa-3">
                      <div class="text-body-2 font-weight-bold text-truncate mb-1">
                        {{ product.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ product.brand }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-else type="info" variant="tonal" class="mt-2">
                Aucun produit référencé avec cet additif pour le moment.
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Similar Additives -->
          <v-card elevation="2" rounded="xl">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="secondary" class="mr-3">mdi-flask-outline</v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">Additifs similaires</h3>
                  <p class="text-caption text-medium-emphasis mb-0">
                    Même fonction ou origine
                  </p>
                </div>
              </div>

              <v-list bg-color="transparent">
                <v-list-item v-for="similar in similarAdditives" :key="similar.id" rounded="lg" class="mb-2"
                  @click="goToAdditive(similar.code)">
                  <template #prepend>
                    <v-avatar :color="getStatusColor(similar.halal_status)" size="48">
                      <span class="text-body-2 font-weight-bold">{{ similar.code }}</span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold">
                    {{ similar.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ similar.function }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-chip :color="getStatusColor(similar.halal_status)" size="small" variant="tonal">
                      {{ getStatusLabel(similar.halal_status) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const supabase = useSupabase()

const theme = useTheme()
const router = useRouter()
const route = useRoute()

const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

// Get code from URL
const code = computed(() => route.params.code as string)

// Mock additive data - À remplacer par appel API
const additive = ref({
  id: '1',
  code: 'E471',
  name: 'Mono- et diglycérides d\'acides gras',
  description: 'Les mono- et diglycérides d\'acides gras sont des émulsifiants largement utilisés dans l\'industrie alimentaire pour améliorer la texture et la consistance des produits. Ils permettent de mélanger des ingrédients qui ne se mélangent pas naturellement, comme l\'eau et l\'huile.',
  halal_status: 'variable',
  origin_type: 'animal/végétal',
  function: 'émulsifiant',
  health_concerns: null
})

// Related products
const relatedProducts = ref([
  {
    id: '1',
    name: 'Pain de mie',
    brand: 'Harrys',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  {
    id: '2',
    name: 'Margarine',
    brand: 'St Hubert',
    image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'
  },
  {
    id: '3',
    name: 'Gâteau au chocolat',
    brand: 'Brossard',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
  }
])

// Similar additives
const similarAdditives = ref([
  {
    id: '2',
    code: 'E322',
    name: 'Lécithine de soja',
    function: 'émulsifiant',
    halal_status: 'halal'
  },
  {
    id: '3',
    code: 'E476',
    name: 'Polyglycérides d\'acides gras estérifiés',
    function: 'émulsifiant',
    halal_status: 'halal'
  },
  {
    id: '4',
    code: 'E472e',
    name: 'Lactylates de mono- et diglycérides',
    function: 'émulsifiant',
    halal_status: 'halal'
  }
])

// Methods
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    douteux: 'warning',
    variable: 'primary'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    douteux: 'Douteux',
    variable: 'Variable'
  }
  return labels[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    douteux: 'mdi-alert-circle',
    variable: 'mdi-swap-horizontal-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusGradient = (status: string) => {
  const gradients: Record<string, string> = {
    halal: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    haram: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
    douteux: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
    variable: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
  }
  return gradients[status] || 'linear-gradient(135deg, #757575 0%, #bdbdbd 100%)'
}

const getOriginIcon = (origin: string) => {
  const icons: Record<string, string> = {
    'végétal': 'mdi-leaf',
    'animal': 'mdi-cow',
    'synthétique': 'mdi-test-tube',
    'minéral': 'mdi-diamond-stone',
    'animal/végétal': 'mdi-swap-horizontal'
  }
  return icons[origin] || 'mdi-help-circle'
}

const getAlertType = (status: string): 'success' | 'error' | 'warning' | 'info' => {
  const types: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
    halal: 'success',
    haram: 'error',
    douteux: 'warning',
    variable: 'info'
  }
  return types[status] || 'info'
}

const getStatusTitle = (status: string) => {
  const titles: Record<string, string> = {
    halal: '✅ Cet additif est considéré comme Halal',
    haram: '❌ Cet additif est considéré comme Haram',
    douteux: '⚠️ Cet additif est douteux',
    variable: '🔄 Cet additif peut être Halal ou Haram'
  }
  return titles[status] || 'Statut inconnu'
}

const getStatusExplanation = (status: string, origin: string) => {
  if (status === 'halal') {
    return `Cet additif provient d'une source ${origin} et ne contient aucun ingrédient interdit par l'Islam. Il peut être consommé sans restriction.`
  }
  if (status === 'haram') {
    return `Cet additif contient ou est dérivé d'ingrédients interdits par l'Islam. Il doit être évité.`
  }
  if (status === 'douteux') {
    return `Il existe des incertitudes concernant l'origine ou le processus de fabrication de cet additif. La prudence est recommandée.`
  }
  if (status === 'variable') {
    return `Cet additif peut provenir de sources animales ou végétales. Il est essentiel de vérifier auprès du fabricant la source exacte utilisée dans chaque produit.`
  }
  return ''
}

const getCommonUsages = (func: string) => {
  const usages: Record<string, string[]> = {
    'colorant': ['Confiseries', 'Boissons', 'Desserts', 'Produits laitiers'],
    'conservateur': ['Viandes', 'Charcuterie', 'Produits transformés', 'Sauces'],
    'émulsifiant': ['Margarines', 'Pains', 'Pâtisseries', 'Chocolat', 'Glaces'],
    'stabilisant': ['Yaourts', 'Desserts', 'Sauces', 'Soupes'],
    'antioxydant': ['Huiles', 'Céréales', 'Fruits secs', 'Viandes']
  }
  return usages[func] || ['Divers produits alimentaires']
}

const shareAdditive = () => {
  console.log('Partager l\'additif')
  // TODO: Implement share functionality
}

const toggleBookmark = () => {
  console.log('Toggle bookmark')
  // TODO: Implement bookmark functionality
}

const searchProducts = () => {
  router.push(`/products?additive=${code.value}`)
}

const goToProduct = (id: string) => {
  router.push(`/products/${id}`)
}

const goToAdditive = (additiveCode: string) => {
  router.push(`/additives/${additiveCode}`)
}

onMounted(async () => {
  const { data: additiveData } = await supabase
    .from('additives')
    .select('*')
    .eq('code', code.value)
    .single()

  additive.value = additiveData

  // Charger les produits contenant cet additif
  const { data: products } = await supabase
    .from('product_additives')
    .select(`
      product:products (
        id, name, brand, image_url
      )
    `)
    .eq('additive_id', additiveData.id)

  const allProducts: { id: string, name: string, brand: string, image_url: string }[] = []
  products?.forEach(p => {
    if (Array.isArray(p.product)) {
      allProducts.push(...p.product)
    } else if (p.product) {
      allProducts.push(p.product)
    }
  })
  relatedProducts.value = allProducts

  // Charger les additifs similaires
  const { data: similar } = await supabase
    .from('additives')
    .select('*')
    .eq('function', additiveData.function)
    .neq('id', additiveData.id)
    .limit(3)

  similarAdditives.value = similar || []
})
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 80px;
}

.code-header {
  position: relative;
  overflow: hidden;
}

.code-badge {
  display: inline-block;
  font-size: 3rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.info-section {
  padding: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}

.analysis-box {
  padding: 16px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.function-card {
  padding: 16px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  height: 100%;
}

.usage-info {
  padding: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
}

/* Smooth animations */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-2px);
}

@media (max-width: 960px) {
  .sticky-card {
    position: relative;
    top: 0;
  }

  .code-badge {
    font-size: 2rem;
  }
}
</style>