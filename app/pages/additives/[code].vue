<template>
  <v-app-bar elevation="0" class="px-2 px-sm-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />

    <v-app-bar-title class="text-subtitle-1 text-sm-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
    </v-app-bar-title>

  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-3 py-sm-6 px-3 px-sm-4">
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="4" rounded="xl" class="sticky-card">
            <div class="code-header" :style="{ background: getStatusGradient(additive.halal_status) }">
              <div
                class="d-flex flex-column flex-sm-row justify-space-between align-center align-sm-start gap-3 py-3 py-sm-4 px-4 px-sm-6">
                <div class="code-badge">
                  {{ additive.code }}
                </div>
                <v-chip :color="getStatusColor(additive.halal_status)" size="small"
                  class="font-weight-bold chip-status">
                  <v-icon start size="x-small" class="chip-icon">{{ getStatusIcon(additive.halal_status) }}</v-icon>
                  {{ getStatusLabel(additive.halal_status) }}
                </v-chip>
              </div>
            </div>


            <v-card-text class="pa-4 pa-sm-6">
              <h2 class="text-h6 text-sm-h5 font-weight-bold mb-3 mb-sm-4 text-center">
                {{ additive.name }}
              </h2>

              <v-divider class="my-3 my-sm-4" />

              <div class="info-section mb-3 mb-sm-4">
                <div class="info-label mb-2">
                  <v-icon size="small" color="primary">mdi-function-variant</v-icon>
                  Fonction
                </div>
                <v-chip color="primary" variant="tonal" class="font-weight-medium" size="small">
                  {{ additive.function }}
                </v-chip>
              </div>

              <div class="info-section mb-3 mb-sm-4">
                <div class="info-label mb-2">
                  <v-icon size="small" color="secondary">{{ getOriginIcon(additive.origin_type) }}</v-icon>
                  Origine
                </div>
                <v-chip color="secondary" variant="tonal" class="font-weight-medium" size="small">
                  {{ additive.origin_type }}
                </v-chip>
              </div>

              <v-alert v-if="additive.health_concerns" type="warning" variant="tonal" rounded="lg" class="mt-3 mt-sm-4"
                density="compact">
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  ⚠️ Préoccupations santé
                </div>
                <div class="text-body-2 text-sm-body-2">
                  {{ additive.health_concerns }}
                </div>
              </v-alert>

              <v-divider class="my-3 my-sm-4" />

              <v-btn block color="primary" variant="flat" size="default" size-md="large" prepend-icon="mdi-magnify"
                class="mb-2 btn-action" @click="searchProducts">
                Voir les produits
              </v-btn>

              <v-btn block variant="outlined" size="default" size-md="large" prepend-icon="mdi-share-variant"
                class="btn-action" @click="shareAdditive">
                Partager
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon size="24" size-md="32" color="primary" class="mr-2 mr-sm-3">mdi-information</v-icon>
                <div>
                  <h3 class="text-subtitle-1 text-sm-h6 font-weight-bold">Description</h3>
                  <p class="text-caption text-medium-emphasis mb-0 d-none d-sm-block">Informations générales</p>
                </div>
              </div>

              <p class="text-body-2 text-sm-body-1 mb-0">
                {{ additive.description }}
              </p>
            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon size="24" size-md="32" :color="getStatusColor(additive.halal_status)" class="mr-2 mr-sm-3">
                  {{ getStatusIcon(additive.halal_status) }}
                </v-icon>
                <div>
                  <h3 class="text-subtitle-1 text-sm-h6 font-weight-bold">Statut Halal</h3>
                  <p class="text-caption text-medium-emphasis mb-0 d-none d-sm-block">Analyse détaillée</p>
                </div>
              </div>

              <v-alert :type="getAlertType(additive.halal_status)" variant="tonal" rounded="lg" class="mb-3 mb-sm-4"
                density="compact" density-sm="default">
                <div class="text-body-2 text-sm-body-1 font-weight-medium mb-2">
                  {{ getStatusTitle(additive.halal_status) }}
                </div>
                <div class="text-body-2 text-sm-body-2">
                  {{ getStatusExplanation(additive.halal_status, additive.origin_type) }}
                </div>
              </v-alert>

              <div v-if="additive.halal_status === 'mashbuh'" class="analysis-box">
                <h4 class="text-subtitle-2 text-sm-subtitle-1 font-weight-bold mb-2 mb-sm-3">
                  <v-icon size="x-small" size-sm="small" class="mr-1 mr-sm-2">mdi-help-circle</v-icon>
                  Pourquoi "Mashbuh" ?
                </h4>
                <p class="text-body-2 text-sm-body-2 mb-0">
                  Cet additif présente des zones d'incertitude concernant son origine, son processus de fabrication
                  ou ses composants. Il est recommandé de consulter un savant ou d'éviter en cas de doute.
                </p>
              </div>
            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-center mb-3 mb-sm-4">
                <v-icon size="24" size-md="32" color="primary" class="mr-2 mr-sm-3">mdi-beaker</v-icon>
                <div>
                  <h3 class="text-subtitle-1 text-sm-h6 font-weight-bold">Fonction & Utilisation</h3>
                  <p class="text-caption text-medium-emphasis mb-0 d-none d-sm-block">Rôle dans les produits</p>
                </div>
              </div>

              <v-row>
                <v-col cols="12" sm="6" class="mb-2 mb-sm-0">
                  <div class="function-card">
                    <div class="text-overline text-medium-emphasis mb-1">Fonction principale</div>
                    <div class="text-subtitle-1 text-sm-h6 font-weight-bold text-primary">
                      {{ additive.function }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="function-card">
                    <div class="text-overline text-medium-emphasis mb-1">Type d'origine</div>
                    <div class="text-subtitle-1 text-sm-h6 font-weight-bold text-secondary">
                      {{ additive.origin_type }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card elevation="2" rounded="xl" class="mb-3 mb-sm-4">
            <v-card-text class="pa-4 pa-sm-6">
              <div
                class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between mb-3 mb-sm-4 gap-2">
                <div class="d-flex align-center">
                  <v-icon size="24" size-md="32" color="tertiary" class="mr-2 mr-sm-3">mdi-package-variant</v-icon>
                  <div>
                    <h3 class="text-subtitle-1 text-sm-h6 font-weight-bold">Produits contenant cet additif</h3>
                    <p class="text-caption text-medium-emphasis mb-0">
                      {{ relatedProducts.length }} produits référencés
                    </p>
                  </div>
                </div>
                <v-btn variant="text" color="primary" size="small" size-md="default" @click="searchProducts">
                  Voir tout
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </div>

              <v-row v-if="relatedProducts.length > 0">
                <v-col v-for="product in relatedProducts.slice(0, 3)" :key="product.id" cols="6" sm="4">
                  <v-card variant="tonal" rounded="lg" hover @click="goToProduct(product.id)">
                    <v-img :src="product.image_url" class="product-image" cover />
                    <v-card-text class="pa-2 pa-sm-3">
                      <div class="text-body-2 text-sm-body-2 font-weight-bold text-truncate mb-1">
                        {{ product.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ product.brand }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-else type="info" variant="tonal" class="mt-2" density="compact">
                Aucun produit référencé avec cet additif pour le moment.
              </v-alert>
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

const supabase = useSupabase()

const router = useRouter()
const route = useRoute()

const code = computed(() => route.params.code as string)

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

interface Products {
  id: string,
  name: string,
  brand: string,
  image_url: string
}

const relatedProducts = ref<Products[]>([])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    mashbuh: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    mashbuh: 'Mashbuh'
  }
  return labels[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    mashbuh: 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusGradient = (status: string) => {
  const gradients: Record<string, string> = {
    halal: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    haram: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
    mashbuh: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
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
    mashbuh: 'warning',
  }
  return types[status] || 'info'
}

const getStatusTitle = (status: string) => {
  const titles: Record<string, string> = {
    halal: 'Cet additif est considéré comme Halal',
    haram: 'Cet additif est considéré comme Haram',
    mashbuh: 'Cet additif est douteux'
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
  if (status === 'mashbuh') {
    return `Il existe des incertitudes concernant l'origine ou le processus de fabrication de cet additif. La prudence est recommandée.`
  }
  return ''
}

const shareAdditive = async () => {
  if (!additive.value) return
  const shareData = {
    title: additive.value.name,
    text: `Découvrez l'additif ${additive.value.name} (${additive.value.code}).`,
    url: window.location.href
  }
  try {
    if (navigator.share) await navigator.share(shareData)
    else await navigator.clipboard.writeText(shareData.url)
  } catch (err) {
    console.error('Erreur lors du partage :', err)
  }
}

const searchProducts = () => {
  router.push(`/products?additive=${code.value}`)
}

const goToProduct = (id: string) => {
  router.push(`/products/${id}`)
}

useHead({
  title: 'Chargement...',
  meta: [{ name: 'description', content: 'Chargement du produit...' }]
})

watch(additive, (newAdditive) => {
  if (newAdditive?.name) {
    useHead({
      title: `${newAdditive.code} - ${newAdditive.name}`,
      meta: [{ name: 'description', content: newAdditive.name }]
    })
  }
})

onMounted(async () => {
  const { data: additiveData } = await supabase
    .from('additives')
    .select('*')
    .eq('code', code.value)
    .single()

  additive.value = additiveData

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
  font-size: 2rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
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

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-2px);
}

.info-section {
  padding: 10px;
}

.function-card {
  padding: 12px;
}

.analysis-box {
  padding: 12px;
}

@media (max-width: 960px) {
  .sticky-card {
    position: relative;
    top: 0;
  }
}

.product-image {
  height: 100px;
}

.chip-status {
  font-size: 0.75rem;
}

@media (min-width: 600px) {
  .code-badge {
    font-size: 3rem;
    letter-spacing: 2px;
  }

  .info-section {
    padding: 12px;
  }

  .function-card {
    padding: 16px;
  }

  .analysis-box {
    padding: 16px;
  }

  .product-image {
    height: 120px;
  }

  .chip-status {
    font-size: 1rem;
  }
}

@media (min-width: 960px) {
  .btn-action {
    font-size: 1rem;
    padding: 12px 24px;
  }
}
</style>