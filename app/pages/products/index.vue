<template>
  <v-app-bar elevation="0" class="px-2 px-sm-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.push('/')" />

    <v-app-bar-title class="text-subtitle-1 text-sm-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Catalogue</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn icon="mdi-magnify" variant="text" size="small" class="d-sm-none" @click="showMobileSearch = true" />
    <v-btn icon="mdi-filter-variant" variant="text" size="small" @click="filterDrawer = true">
      <v-badge v-if="activeFiltersCount > 0" :content="activeFiltersCount" color="primary" dot />
      <v-icon>mdi-filter-variant</v-icon>
    </v-btn>
  </v-app-bar>

  <v-main>
    <section class="hero-section-products position-relative overflow-hidden">
      <div class="hero-bg-mesh"></div>
      <v-container class="py-6 py-sm-12 position-relative z-1">
        <div class="text-center max-width-800 mx-auto">
          <v-chip color="primary" variant="tonal" size="small" class="mb-4 font-weight-bold">
            <v-icon start size="small">mdi-package-variant</v-icon>
            Catalogue
          </v-chip>
          <h1 class="text-h4 text-sm-h3 font-weight-black mb-4 text-on-surface">
            Explorez nos <span class="text-primary">produits</span>
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-8" style="max-width: 600px; margin: 0 auto;">
            Découvrez des milliers de produits alimentaires, vérifiez leur statut halal et consultez les avis de la
            communauté.
          </p>

          <v-card elevation="0" class="search-card mx-auto" max-width="600" border rounded="xl">
            <v-text-field v-model="searchQuery" placeholder="Rechercher un produit, une marque..."
              prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable" height="56"
              @input="debouncedSearch" class="search-input">
              <template #append-inner>
                <v-fade-transition>
                  <v-btn v-if="searchQuery" icon="mdi-close" variant="text" size="small" @click="clearSearch" />
                </v-fade-transition>
                <v-divider vertical class="mx-2 my-3" />
                <v-btn icon="mdi-barcode-scan" variant="text" color="primary" @click="openScanner">
                  <v-tooltip activator="parent" location="top">Scanner un produit</v-tooltip>
                </v-btn>
              </template>
            </v-text-field>
          </v-card>
        </div>
      </v-container>
    </section>

    <v-container class="py-6">
      <div class="d-flex flex-column flex-sm-row justify-space-between align-center mb-6 gap-4">
        <div class="d-flex flex-wrap justify-center justify-sm-start gap-2 w-100 w-sm-auto">
          <v-chip v-for="filter in quickFilters" :key="filter.value"
            :color="selectedHalalFilter === filter.value ? filter.color : undefined"
            :variant="selectedHalalFilter === filter.value ? 'flat' : 'outlined'"
            :class="{ 'text-medium-emphasis': selectedHalalFilter !== filter.value }" class="filter-chip" filter
            @click="toggleHalalFilter(filter.value)">
            <v-icon start size="18">{{ filter.icon }}</v-icon>
            {{ filter.label }}
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2 w-100 w-sm-auto justify-end">
          <span class="text-caption text-medium-emphasis d-none d-sm-block">
            {{ filteredProducts.length }} résultats
          </span>
          <v-divider vertical class="mx-2 d-none d-sm-block" />
          <v-menu v-model="sortMenu" :close-on-content-click="true">
            <template #activator="{ props }">
              <v-btn variant="text" v-bind="props" prepend-icon="mdi-sort" class="text-none">
                {{ getSortLabel(sortBy) }}
              </v-btn>
            </template>
            <v-list density="compact" nav rounded="lg" elevation="4">
              <v-list-subheader>Trier par</v-list-subheader>
              <v-list-item v-for="option in sortOptions" :key="option.value" :value="option.value"
                @click="changeSortBy(option.value)" :active="sortBy === option.value" color="primary">
                <template #prepend>
                  <v-icon size="small">{{ option.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ option.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <div class="d-flex bg-surface-variant rounded-lg pa-1">
            <v-btn :variant="viewMode === 'grid' ? 'flat' : 'text'" :color="viewMode === 'grid' ? 'white' : undefined"
              size="x-small" icon="mdi-view-grid" @click="viewMode = 'grid'" class="rounded" />
            <v-btn :variant="viewMode === 'list' ? 'flat' : 'text'" :color="viewMode === 'list' ? 'white' : undefined"
              size="x-small" icon="mdi-view-list" @click="viewMode = 'list'" class="rounded" />
          </div>
        </div>
      </div>

      <v-row v-if="!loading">
        <template v-if="viewMode === 'grid'">
          <v-col v-for="product in paginatedProducts" :key="product.id" cols="12" sm="6" md="4" lg="3">
            <v-card class="product-card h-100 d-flex flex-column" elevation="0" border rounded="xl"
              @click="goToProduct(product.id)">
              <div class="position-relative">
                <v-img :src="product.image_url" height="200" cover class="bg-surface-variant">
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary" size="24" />
                    </div>
                  </template>
                </v-img>
                <div class="product-badges">
                  <v-chip :color="getHalalColor(product.halal_status)" size="small" variant="flat"
                    class="font-weight-bold shadow-sm">
                    <v-icon start size="14">{{ getHalalIcon(product.halal_status) }}</v-icon>
                    {{ getHalalLabel(product.halal_status) }}
                  </v-chip>
                </div>
              </div>

              <v-card-text class="flex-grow-1 pt-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span v-if="product.brand"
                    class="text-caption text-medium-emphasis text-uppercase font-weight-medium ls-1">
                    {{ product.brand }}
                  </span>
                  <div class="d-flex align-center" v-if="product.rating > 0">
                    <v-icon color="amber" size="14" class="mr-1">mdi-star</v-icon>
                    <span class="text-caption font-weight-bold">{{ product.rating.toFixed(1) }}</span>
                    <span class="text-caption text-disabled ml-1">({{ product.reviews_count }})</span>
                  </div>
                </div>

                <h3 class="text-subtitle-1 font-weight-bold mb-1 line-clamp-2" style="min-height: 3rem;">
                  {{ product.name }}
                </h3>

                <div class="d-flex flex-wrap gap-1 mt-2">
                  <v-chip v-if="product.category" size="x-small" variant="tonal" color="secondary">
                    {{ product.category }}
                  </v-chip>
                  <v-chip v-if="product.certified" size="x-small" variant="tonal" color="success">
                    <v-icon start size="10">mdi-certificate</v-icon>
                    Certifié
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </template>

        <template v-else>
          <v-col cols="12">
            <v-card v-for="product in paginatedProducts" :key="product.id" class="product-list-card mb-3" elevation="0"
              rounded="xl" @click="goToProduct(product.id)">
              <div class="d-flex flex-column flex-sm-row">
                <v-img :src="product.image_url" width="100%" max-width="180" height="180" cover
                  class="bg-surface-variant rounded-t-xl rounded-sm-s-xl rounded-sm-e-0" />

                <div class="pa-4 flex-grow-1 d-flex flex-column">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div>
                      <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1">
                        {{ product.brand }}
                      </div>
                      <h3 class="text-h6 font-weight-bold mb-1">{{ product.name }}</h3>
                    </div>
                    <v-chip :color="getHalalColor(product.halal_status)" size="small" variant="flat">
                      {{ getHalalLabel(product.halal_status) }}
                    </v-chip>
                  </div>

                  <div class="d-flex align-center gap-2 mb-4">
                    <v-chip v-if="product.category" size="small" variant="tonal" color="secondary">
                      {{ product.category }}
                    </v-chip>
                    <v-chip v-if="product.certified" size="small" variant="tonal" color="success">
                      Certifié
                    </v-chip>
                    <v-spacer />
                    <div class="d-flex align-center">
                      <v-rating :model-value="product.rating" readonly density="compact" size="small" color="amber"
                        half-increments />
                      <span class="text-caption text-medium-emphasis ml-2">({{ product.reviews_count }} avis)</span>
                    </div>
                  </div>

                  <v-spacer />

                  <div class="d-flex justify-end">
                    <v-btn variant="text" color="primary" append-icon="mdi-arrow-right" class="px-0">
                      Voir les détails
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </template>
      </v-row>

      <v-row v-else>
        <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="image, article" class="rounded-xl border" elevation="0" />
        </v-col>
      </v-row>

      <v-row v-if="!loading && filteredProducts.length === 0">
        <v-col cols="12">
          <v-card elevation="0" rounded="xl" class="text-center py-16 bg-surface-variant-lighten">
            <div class="mb-6">
              <v-avatar color="surface" size="80" class="elevation-1">
                <v-icon size="40" color="medium-emphasis">mdi-magnify-remove-outline</v-icon>
              </v-avatar>
            </div>
            <h2 class="text-h5 font-weight-bold mb-2">Aucun produit trouvé</h2>
            <p class="text-body-1 text-medium-emphasis mb-8 max-width-500 mx-auto">
              Nous n'avons pas trouvé de produits correspondant à votre recherche. Essayez d'autres mots-clés ou
              filtres.
            </p>
            <div class="d-flex justify-center gap-4">
              <v-btn variant="outlined" rounded="lg" @click="clearAllFilters">
                Effacer les filtres
              </v-btn>
              <v-btn color="primary" variant="flat" rounded="lg" to="/products/add" prepend-icon="mdi-plus">
                Ajouter un produit
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="filteredProducts.length > 0" class="d-flex justify-center mt-8">
        <v-pagination v-model="page" :length="totalPages" :total-visible="5" rounded="circle" active-color="primary" />
      </div>
    </v-container>
  </v-main>

  <v-navigation-drawer v-model="filterDrawer" location="right" temporary width="360" class="filter-drawer">
    <div class="d-flex flex-column h-100">
      <div class="pa-4 border-b d-flex align-center justify-space-between bg-surface">
        <span class="text-h6 font-weight-bold">Filtres</span>
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="filterDrawer = false" />
      </div>

      <div class="flex-grow-1 overflow-y-auto pa-4">
        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-medium-emphasis ls-1">Catégories</div>
          <v-chip-group v-model="selectedCategories" multiple column class="category-chips">
            <v-chip v-for="cat in dbCategories" :key="cat.id" :value="cat.id" filter variant="outlined" size="small"
              class="ma-1">
              {{ cat.name }}
            </v-chip>
          </v-chip-group>
        </div>

        <v-divider class="mb-6" />

        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-medium-emphasis ls-1">Préférences</div>
          <v-checkbox v-model="filters.certified" label="Certifié Halal uniquement" hide-details density="compact"
            color="primary" class="mb-2">
            <template #label>
              <span class="text-body-2">Certifié Halal uniquement</span>
            </template>
          </v-checkbox>
          <v-checkbox v-model="filters.communityVerified" label="Vérifié par la communauté" hide-details
            density="compact" color="primary">
            <template #label>
              <span class="text-body-2">Vérifié par la communauté</span>
            </template>
          </v-checkbox>
        </div>

        <v-divider class="mb-6" />

        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-medium-emphasis ls-1">Note minimale
          </div>
          <div class="px-2">
            <v-slider v-model="filters.minRating" :min="0" :max="5" :step="1" thumb-label show-ticks="always"
              color="amber" track-color="grey-lighten-2">
              <template #thumb-label="{ modelValue }">
                {{ modelValue }}
              </template>
            </v-slider>
          </div>
        </div>
      </div>

      <div class="pa-4 border-t bg-surface">
        <div class="d-flex gap-3">
          <v-btn flex-grow-1 variant="outlined" height="48" rounded="lg" @click="resetFilters">
            Réinitialiser
          </v-btn>
          <v-btn flex-grow-1 color="primary" variant="flat" height="48" rounded="lg" @click="applyFilters"
            class="flex-grow-1">
            Voir {{ filteredProducts.length }} résultats
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>

  <v-dialog v-model="showMobileSearch" fullscreen transition="dialog-bottom-transition">
    <v-card class="bg-background">
      <v-toolbar color="surface" elevation="1">
        <v-btn icon="mdi-arrow-left" @click="showMobileSearch = false" />
        <v-text-field v-model="searchQuery" placeholder="Rechercher..." variant="plain" hide-details autofocus
          class="mx-2" @input="debouncedSearch" clearable />
      </v-toolbar>
      <v-card-text class="pa-0">
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

useHead({
  title: 'Produits - IOFD',
  meta: [
    { name: 'description', content: 'Découvrez les produits, leurs status, leurs valeur nutritionnelle et contribuez au besoin.' },
    { name: 'keywords', content: 'produits, halal, haram, IOFD, Open Food Database' }
  ]
})

const supabase = useSupabase()
const theme = useTheme()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const searchQuery = ref('')
const showMobileSearch = ref(false)
const viewMode = ref('grid')
const page = ref(1)
const itemsPerPage = 24
const filterDrawer = ref(false)
const sortMenu = ref(false)
const sortBy = ref('recent')
const selectedHalalFilter = ref<string | null>(null)
const selectedCategories = ref<string[]>([])

const filters = ref({
  certified: false,
  communityVerified: false,
  additivesFilter: 'all',
  minRating: 0
})

const quickFilters = [
  { label: 'Halal', value: 'halal', icon: 'mdi-check-circle', color: 'success' },
  { label: 'Mashbuh', value: 'mashbuh', icon: 'mdi-alert-circle', color: 'warning' },
  { label: 'Haram', value: 'haram', icon: 'mdi-close-circle', color: 'error' },
]

type Category = { id: string; name: string; description?: string }
const dbCategories = ref<Category[]>([])

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  const count = allProducts.value.length
  return Math.ceil(count / itemsPerPage)
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedCategories.value.length > 0) count += selectedCategories.value.length
  if (filters.value.certified) count++
  if (filters.value.communityVerified) count++
  if (filters.value.minRating > 0) count++
  return count
})

const loadCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name')

    if (error) throw error
    dbCategories.value = data || []
  } catch (err) {
    console.error('Erreur chargement catégories:', err)
  }
}

const sortOptions = [
  { label: 'Plus récents', value: 'recent', icon: 'mdi-clock-outline' },
  { label: 'Mieux notés', value: 'rating', icon: 'mdi-star' },
  { label: 'Nom (A-Z)', value: 'name-asc', icon: 'mdi-sort-alphabetical-ascending' },
  { label: 'Nom (Z-A)', value: 'name-desc', icon: 'mdi-sort-alphabetical-descending' },
]

const allProducts = ref<any[]>([])

type SupabaseProductRow = {
  id: string
  barcode: string
  name: string
  brand: string
  image_url: string
  created_at: string
  category?: { id: string; name: string }[] | null
  halal_info?: { halal_status: string; certification_body: string }[] | null
  additives?: { count: number }[] | null,
  community_reviews?: {
    rating: number
    user_name: string
    user_email: string
    halal_vote: string
    comment: string
    helpful_count: number
    created_at: string
  }[]
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const from = (page.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data, count, error } = await supabase
      .from('products')
      .select(`
        id,
        barcode,
        name,
        brand,
        image_url,
        created_at,
        category:categories(id, name),
        halal_info:halal_certifications(halal_status, certification_body),
        additives:product_additives(count),
        community_reviews:community_reviews(rating, user_name, user_email, halal_vote, comment, helpful_count, created_at)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur de fetch:', error)
      return
    }

    const mappedProducts = (data as SupabaseProductRow[]).map(p => {
      const reviews = p.community_reviews || []
      const reviews_count = reviews.length
      const rating = reviews_count
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews_count
        : 0

      return {
        id: p.id,
        barcode: p.barcode,
        name: p.name,
        brand: p.brand,
        // @ts-ignore
        category_id: p.category?.id ?? null,
        // @ts-ignore
        category: p.category?.name ?? 'Autre',
        image_url: p.image_url || '',
        // @ts-ignore
        halal_status: p.halal_info?.halal_status || 'non_verifie',
        certified: !!p.halal_info?.[0]?.certification_body,
        rating,
        reviews_count,
        reviews,
        additives_count: p.additives?.length || 0
      }
    })

    allProducts.value = mappedProducts
  } catch (err) {
    console.error('Erreur fetchProducts:', err)
  } finally {
    loading.value = false
  }
}

watch(page, () => fetchProducts())

const filteredProducts = computed(() => {
  let products = [...allProducts.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p =>
      (p.name || '').toLowerCase().includes(query) ||
      (p.brand || '').toLowerCase().includes(query) ||
      (p.barcode || '').toLowerCase().includes(query)
    )
  }

  if (selectedHalalFilter.value) {
    products = products.filter(p => p.halal_status === selectedHalalFilter.value)
  }

  if (selectedCategories.value.length > 0) {
    products = products.filter(p =>
      selectedCategories.value.includes(p.category_id)
    )
  }

  if (filters.value.certified) {
    products = products.filter(p => p.certified)
  }

  if (filters.value.minRating > 0) {
    products = products.filter(p => p.rating >= filters.value.minRating)
  }

  products = sortProducts(products)

  return products
})

const sortProducts = (products: any[]) => {
  switch (sortBy.value) {
    case 'recent':
      return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'rating':
      return products.sort((a, b) => b.rating - a.rating)
    case 'name-asc':
      return products.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return products.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return products
  }
}

const getHalalColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    mashbuh: 'warning'
  }
  return colors[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    mashbuh: 'Mashbuh'
  }
  return labels[status] || 'Non vérifié'
}

const getHalalIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    mashbuh: 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getSortLabel = (value: string) => {
  const option = sortOptions.find(opt => opt.value === value)
  return option ? option.label : 'Trier par'
}

const toggleHalalFilter = (value: string) => {
  if (selectedHalalFilter.value === value) {
    selectedHalalFilter.value = null
  } else {
    selectedHalalFilter.value = value
  }
  page.value = 1
}

const changeSortBy = (value: string) => {
  sortBy.value = value
  sortMenu.value = false
  page.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  page.value = 1
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedHalalFilter.value = null
  selectedCategories.value = []
  filters.value = {
    certified: false,
    communityVerified: false,
    additivesFilter: 'all',
    minRating: 0
  }
  page.value = 1
}

const resetFilters = () => {
  selectedCategories.value = []
  filters.value = {
    certified: false,
    communityVerified: false,
    additivesFilter: 'all',
    minRating: 0
  }
}

const applyFilters = () => {
  filterDrawer.value = false
  page.value = 1
}

const goToProduct = (id: string) => {
  router.push(`/products/${id}`)
}

const openScanner = () => {
  router.push('/products/scan')
}

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
  }, 300)
}

watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery as string
  }
}, { immediate: true })

watch([selectedHalalFilter, selectedCategories, filters], () => {
  page.value = 1
}, { deep: true })

onMounted(async () => {
  loading.value = true
  await loadCategories()
  await fetchProducts()
  setTimeout(() => {
    loading.value = false
  }, 500)
})

</script>

<style scoped>
.hero-section-products {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
  padding-bottom: 2rem;
}

.hero-bg-mesh {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(var(--v-theme-primary), 0.1) 0%, transparent 50%);
  filter: blur(60px);
  z-index: 0;
}

.z-1 {
  z-index: 1;
}

.search-input :deep(.v-field) {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.product-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.shadow-sm {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ls-1 {
  letter-spacing: 1px;
}

.gap-1 {
  gap: 4px;
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

.filter-chip {
  transition: all 0.2s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .hero-section-products {
    border-radius: 0 0 24px 24px;
  }
}
</style>