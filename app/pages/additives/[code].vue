<template>
  <v-app-bar elevation="0" class="glass-navbar px-2 px-sm-4" color="transparent">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
    <v-spacer />
    <v-btn icon="mdi-share-variant" variant="text" @click="shareAdditive" />
  </v-app-bar>

  <v-main class="bg-background">
    <section class="hero-section-additive position-relative overflow-hidden">
      <div class="hero-bg-gradient" :style="{ background: getStatusGradient(additive.halal_status) }"></div>

      <v-container class="py-12 py-md-16 position-relative z-1">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8" class="text-center">
            <v-chip :color="getStatusColor(additive.halal_status)" variant="flat" size="large"
              class="mb-6 font-weight-bold px-6">
              <v-icon start>{{ getStatusIcon(additive.halal_status) }}</v-icon>
              {{ getStatusLabel(additive.halal_status) }}
            </v-chip>

            <h1 class="text-display-1 font-weight-black mb-2 text-white"
              style="font-size: clamp(4rem, 10vw, 8rem); line-height: 1;">
              {{ additive.code }}
            </h1>

            <h2 class="text-h4 text-sm-h3 font-weight-bold text-white opacity-90 mb-8">
              {{ additive.name }}
            </h2>

            <div class="d-flex flex-wrap justify-center gap-3">
              <v-chip variant="outlined" color="white" class="px-4">
                <v-icon start size="small">mdi-function-variant</v-icon>
                {{ additive.function }}
              </v-chip>
              <v-chip variant="outlined" color="white" class="px-4">
                <v-icon start size="small">{{ getOriginIcon(additive.origin_type) }}</v-icon>
                {{ additive.origin_type }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <v-container class="mt-n8 mt-md-n12 position-relative z-2">
      <v-row>
        <v-col cols="12" md="4" order="2" order-md="1">
          <div class="sticky-top" style="top: 100px">
            <v-card elevation="0" rounded="xl" class="bg-surface mb-4">
              <v-card-text class="pa-6">
                <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-clipboard-text-outline</v-icon>
                  En bref
                </h3>

                <div class="info-row mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">Fonction principale</div>
                  <div class="text-body-1 font-weight-medium">{{ additive.function }}</div>
                </div>

                <div class="info-row mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">Origine</div>
                  <div class="text-body-1 font-weight-medium d-flex align-center">
                    <v-icon size="small" class="mr-2 text-medium-emphasis">{{ getOriginIcon(additive.origin_type)
                    }}</v-icon>
                    {{ additive.origin_type }}
                  </div>
                </div>

                <v-divider class="my-4" />

                <v-btn block color="primary" variant="flat" size="large" rounded="lg" class="mb-3"
                  @click="searchProducts">
                  <v-icon start>mdi-magnify</v-icon>
                  Produits contenant {{ additive.code }}
                </v-btn>

                <v-btn block variant="outlined" size="large" rounded="lg" @click="shareAdditive">
                  <v-icon start>mdi-share-variant</v-icon>
                  Partager
                </v-btn>
              </v-card-text>
            </v-card>

            <v-card v-if="additive.health_concerns" elevation="0" rounded="xl" color="warning" variant="tonal"
              class="mb-4">
              <v-card-text class="pa-6">
                <div class="d-flex align-center mb-2 text-warning-darken-2">
                  <v-icon class="mr-2">mdi-alert-outline</v-icon>
                  <span class="font-weight-bold">Préoccupations santé</span>
                </div>
                <p class="text-body-2 mb-0 text-warning-darken-1">
                  {{ additive.health_concerns }}
                </p>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <v-col cols="12" md="8" order="1" order-md="2">
          <v-card elevation="0" rounded="xl" class="bg-surface mb-6">
            <v-card-text class="pa-6 pa-md-8">
              <div class="d-flex align-center mb-6">
                <div class="rounded-circle bg-primary-lighten-5 pa-3 mr-4">
                  <v-icon color="primary" size="24">mdi-information-variant</v-icon>
                </div>
                <div>
                  <h3 class="text-h6 font-weight-bold">Description</h3>
                  <div class="text-caption text-medium-emphasis">Informations générales</div>
                </div>
              </div>
              <p class="text-body-1 text-on-surface" style="line-height: 1.8;">
                {{ additive.description }}
              </p>
            </v-card-text>
          </v-card>

          <v-card elevation="0" rounded="xl" class="bg-surface mb-6">
            <v-card-text class="pa-6 pa-md-8">
              <div class="d-flex align-center mb-6">
                <div class="rounded-circle pa-3 mr-4" :class="`bg-${getStatusColor(additive.halal_status)}-lighten-5`">
                  <v-icon :color="getStatusColor(additive.halal_status)" size="24">{{
                    getStatusIcon(additive.halal_status) }}</v-icon>
                </div>
                <div>
                  <h3 class="text-h6 font-weight-bold">Analyse Halal</h3>
                  <div class="text-caption text-medium-emphasis">Statut détaillé</div>
                </div>
              </div>

              <v-alert :type="getAlertType(additive.halal_status)" variant="tonal" border="start" class="mb-6">
                <div class="text-subtitle-1 font-weight-bold mb-1">
                  {{ getStatusTitle(additive.halal_status) }}
                </div>
                <div class="text-body-2 opacity-90">
                  {{ getStatusExplanation(additive.halal_status, additive.origin_type) }}
                </div>
              </v-alert>

              <div v-if="additive.halal_status === 'mashbuh'" class="rounded-lg pa-4">
                <h4 class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-help-circle-outline</v-icon>
                  Pourquoi "Mashbuh" ?
                </h4>
                <p class="text-body-2 mb-0 text-medium-emphasis">
                  Cet additif présente des zones d'incertitude concernant son origine, son processus de fabrication
                  ou ses composants. Il est recommandé de consulter un savant ou d'éviter en cas de doute.
                </p>
              </div>
            </v-card-text>
          </v-card>

          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-bold">Produits contenant {{ additive.code }}</h3>
            <v-btn variant="text" color="primary" to="/products" append-icon="mdi-arrow-right">
              Voir tout
            </v-btn>
          </div>

          <v-row v-if="relatedProducts.length > 0">
            <v-col v-for="product in relatedProducts.slice(0, 4)" :key="product.id" cols="12" sm="6">
              <v-card elevation="0" rounded="xl" class="bg-surface h-100 product-card-hover"
                @click="goToProduct(product.id)">
                <div class="d-flex align-center pa-4">
                  <v-avatar size="64" rounded="lg" color="grey-lighten-4" class="mr-4">
                    <v-img :src="product.image_url" cover>
                      <template #placeholder>
                        <v-icon color="grey-lighten-1">mdi-image-off-outline</v-icon>
                      </template>
                    </v-img>
                  </v-avatar>
                  <div class="overflow-hidden">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">{{ product.name }}</div>
                    <div class="text-caption text-medium-emphasis text-truncate">{{ product.brand }}</div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert v-else type="info" variant="tonal" icon="mdi-information-outline" class="mt-4">
            Aucun produit référencé avec cet additif pour le moment.
          </v-alert>

        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const supabase = useSupabase()
const router = useRouter()
const route = useRoute()

const code = computed(() => route.params.code as string)

const additive = ref({
  id: '1',
  code: 'E471',
  name: 'Mono- et diglycérides d\'acides gras',
  description: 'Chargement...',
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
    haram: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)',
    mashbuh: 'linear-gradient(135deg, #ef6c00 0%, #ff9800 100%)'
  }
  return gradients[status] || 'linear-gradient(135deg, #424242 0%, #757575 100%)'
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
    mashbuh: 'Le statut de cet additif est douteux (Mashbuh)'
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
  meta: [{ name: 'description', content: 'Chargement de l\'additif...' }]
})

watch(additive, (newAdditive) => {
  if (!newAdditive?.name) return

  useHead({
    title: `${newAdditive.code} - ${newAdditive.name}`,
    meta: [
      { name: 'description', content: newAdditive.description || newAdditive.name },
      { name: 'keywords', content: `${newAdditive.code}, ${newAdditive.name}, additif alimentaire` },
      { property: 'og:title', content: `${newAdditive.code} - ${newAdditive.name}` },
      { property: 'og:description', content: newAdditive.description || newAdditive.name },
    ]
  })
})

onMounted(async () => {
  const { data: additiveData } = await supabase
    .from('additives')
    .select('*')
    .eq('code', code.value)
    .single()

  if (additiveData) {
    additive.value = additiveData
  }

  const { data: products } = await supabase
    .from('product_additives')
    .select(`
      product:products (
        id, name, brand, image_url
      )
    `)
    .eq('additive_id', additiveData?.id)

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
.glass-navbar {
  backdrop-filter: blur(12px);
  background: transparent !important;
}

.hero-section-additive {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.z-1 {
  z-index: 1;
}
.z-2 {
  z-index: 2;
}

.text-display-1 {
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.05em;
}

.gap-3 {
  gap: 12px;
}

.sticky-top {
  position: sticky;
  z-index: 10;
}

.product-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.product-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}
</style>