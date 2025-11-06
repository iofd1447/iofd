<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />

    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Catalogue</span>
    </v-app-bar-title>

  </v-app-bar>

  <v-main class="bg-surface-variant">
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <v-card elevation="2" rounded="xl" class="mb-4">
            <v-card-text class="pa-4">
              <v-text-field v-model="searchQuery" placeholder="Rechercher un produit, marque ou code-barres..."
                prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable" class="mb-4"
                @input="debouncedSearch">
                <template #append-inner>
                  <v-btn v-if="searchQuery" icon="mdi-close" variant="text" size="small" @click="clearSearch" />
                </template>
              </v-text-field>

              <div class="d-flex flex-wrap ga-2 align-center">
                <v-chip v-for="filter in quickFilters" :key="filter.value"
                  :color="selectedHalalFilter === filter.value ? filter.color : 'default'"
                  :variant="selectedHalalFilter === filter.value ? 'flat' : 'tonal'"
                  @click="toggleHalalFilter(filter.value)">
                  <v-icon start size="small">{{ filter.icon }}</v-icon>
                  {{ filter.label }}
                </v-chip>

                <v-divider vertical class="mx-2" />

                <v-btn variant="tonal" prepend-icon="mdi-filter-variant" @click="filterDrawer = true">
                  Filtres avancés
                  <v-badge v-if="activeFiltersCount > 0" :content="activeFiltersCount" color="primary" inline
                    class="ml-2" />
                </v-btn>

                <v-btn variant="text" prepend-icon="mdi-sort" @click="sortMenu = true">
                  {{ getSortLabel(sortBy) }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6 font-weight-bold">
              {{ filteredProducts.length }} produit{{ filteredProducts.length > 1 ? 's' : '' }}
              <span v-if="searchQuery" class="text-medium-emphasis">
                pour "{{ searchQuery }}"
              </span>
            </div>

            <div class="d-flex ga-2">
              <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined">
                <v-btn value="grid" icon="mdi-view-grid" />
                <v-btn value="list" icon="mdi-view-list" />
              </v-btn-toggle>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="!loading">
        <template v-if="viewMode === 'grid'">
          <v-col v-for="product in paginatedProducts" :key="product.id" cols="12" sm="6" md="4" lg="3">
            <v-card class="product-card h-100" elevation="2" rounded="xl" hover @click="goToProduct(product.id)">
              <v-img :src="product.image_url" height="220" cover class="product-image">
                <div class="pa-3 d-flex justify-space-between">
                  <v-chip :color="getHalalColor(product.halal_status)" size="small" variant="flat"
                    class="font-weight-bold">
                    <v-icon start size="x-small">{{ getHalalIcon(product.halal_status) }}</v-icon>
                    {{ getHalalLabel(product.halal_status) }}
                  </v-chip>

                </div>
              </v-img>

              <v-card-text class="pb-4">
                <div class="d-flex align-center gap-2 mb-2">
                  <v-chip v-if="product.category" size="x-small" variant="tonal" color="primary">
                    {{ product.category }}
                  </v-chip>
                  <v-chip v-if="product.certified" size="x-small" variant="tonal" color="success">
                    <v-icon start size="x-small">mdi-certificate</v-icon>
                    Certifié
                  </v-chip>
                </div>

                <h4 class="mb-1 text-truncate" style="font-size: 1rem;">
                  {{ product.name }}
                </h4>
                <p class="text-caption text-medium-emphasis mb-3">
                  {{ product.brand }}
                </p>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-rating :model-value="product.rating" readonly density="compact" size="x-small" color="amber"
                      half-increments />
                    <span class="text-caption text-medium-emphasis ml-1">
                      {{ product.rating }}
                    </span>
                  </div>
                  <span class="text-caption text-medium-emphasis">
                    {{ product.reviews_count }} avis
                  </span>
                </div>

                <div v-if="product.additives_count > 0" class="mt-2">
                  <v-chip size="x-small" variant="tonal" color="warning">
                    {{ product.additives_count }} additif{{ product.additives_count > 1 ? 's' : '' }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </template>

        <template v-else>
          <v-col cols="12">
            <v-card v-for="product in paginatedProducts" :key="product.id" class="product-list-card mb-3" elevation="2"
              rounded="xl" hover @click="goToProduct(product.id)">
              <v-card-text class="pa-4">
                <v-row align="center">
                  <v-col cols="12" sm="3" md="2">
                    <v-img :src="product.image_url" height="120" cover rounded="lg" class="product-thumbnail" />
                  </v-col>

                  <v-col cols="12" sm="9" md="10">
                    <v-row align="center">
                      <v-col cols="12" md="6">
                        <div class="d-flex align-center gap-2 mb-2">
                          <v-chip :color="getHalalColor(product.halal_status)" size="small" variant="flat">
                            <v-icon start size="small">{{ getHalalIcon(product.halal_status) }}</v-icon>
                            {{ getHalalLabel(product.halal_status) }}
                          </v-chip>
                          <v-chip v-if="product.certified" size="small" variant="tonal" color="success">
                            <v-icon start size="small">mdi-certificate</v-icon>
                            Certifié
                          </v-chip>
                        </div>

                        <h3 class="text-h6 mb-1">{{ product.name }}</h3>
                        <p class="text-body-2 text-medium-emphasis mb-2">
                          {{ product.brand }}
                        </p>

                        <div class="d-flex align-center gap-2">
                          <v-chip v-if="product.category" size="small" variant="tonal">
                            {{ product.category }}
                          </v-chip>
                          <v-chip size="small" variant="tonal">
                            {{ product.barcode }}
                          </v-chip>
                        </div>
                      </v-col>

                      <v-col cols="12" md="3">
                        <div class="mb-2">
                          <div class="d-flex align-center mb-1">
                            <v-rating :model-value="product.rating" readonly density="compact" size="small"
                              color="amber" half-increments />
                            <span class="text-body-2 ml-2">{{ product.rating }}</span>
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ product.reviews_count }} avis
                          </div>
                        </div>

                        <div v-if="product.additives_count > 0">
                          <v-chip size="small" variant="tonal" color="warning">
                            {{ product.additives_count }} additif{{ product.additives_count > 1 ? 's' : '' }}
                          </v-chip>
                        </div>
                      </v-col>

                      <v-col cols="12" md="3" class="text-right">
                        <v-btn color="primary" variant="flat" rounded="lg" @click.stop="goToProduct(product.id)">
                          Voir détails
                          <v-icon end>mdi-arrow-right</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </v-row>

      <v-row v-else>
        <v-col v-for="i in 12" :key="i" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>

      <v-row v-if="!loading && filteredProducts.length === 0">
        <v-col cols="12">
          <v-card elevation="0" class="text-center py-16" rounded="xl">
            <v-icon size="120" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
            <h2 class="text-h5 mt-4 mb-2">Aucun produit trouvé</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <v-btn color="primary" variant="flat" @click="clearAllFilters">
              Réinitialiser les filtres
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="filteredProducts.length > 0">
        <v-col cols="12" class="d-flex justify-center mt-6">
          <v-pagination v-model="page" :length="totalPages" :total-visible="7" rounded="circle" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-navigation-drawer v-model="filterDrawer" location="right" temporary width="400">
    <v-card flat>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Filtres avancés</span>
        <v-btn icon="mdi-close" variant="text" @click="filterDrawer = false" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Catégories</h3>
          <v-chip-group v-model="selectedCategories" multiple column>
            <v-chip v-for="cat in dbCategories" :key="cat.id" :value="cat.id" filter variant="tonal">
              {{ cat.name }}
            </v-chip>
          </v-chip-group>
        </div>

        <v-divider class="my-4" />

        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Certifications</h3>
          <v-checkbox v-model="filters.certified" label="Produits certifiés uniquement" hide-details
            density="compact" />
          <v-checkbox v-model="filters.communityVerified" label="Vérifiés par la communauté" hide-details
            density="compact" />
        </div>

        <v-divider class="my-4" />

        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Labels</h3>
          <v-chip-group v-model="selectedLabels" multiple column>
            <v-chip v-for="label in labels" :key="label.value" :value="label.value" filter variant="tonal">
              <v-icon start size="small">{{ label.icon }}</v-icon>
              {{ label.label }}
            </v-chip>
          </v-chip-group>
        </div>

        <v-divider class="my-4" />

        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Additifs</h3>
          <v-select v-model="filters.additivesFilter" :items="additivesOptions" label="Filtrer par additifs"
            variant="outlined" density="compact" hide-details />
        </div>

        <v-divider class="my-4" />

        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            Note minimale: {{ filters.minRating }}
          </h3>
          <v-slider v-model="filters.minRating" :min="0" :max="5" :step="0.5" thumb-label color="amber">
            <template #thumb-label="{ modelValue }">
              <v-icon size="small">mdi-star</v-icon>
              {{ modelValue }}
            </template>
          </v-slider>
        </div>

        <v-divider class="my-4" />

        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Exclure allergènes</h3>
          <v-chip-group v-model="excludedAllergens" multiple column>
            <v-chip v-for="allergen in allergens" :key="allergen.value" :value="allergen.value" filter variant="tonal"
              color="error">
              {{ allergen.label }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn block color="primary" variant="flat" @click="applyFilters">
          Appliquer les filtres
        </v-btn>
        <v-btn block variant="text" @click="resetFilters">
          Réinitialiser
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>

  <v-menu v-model="sortMenu" :close-on-content-click="false">
    <v-card min-width="300">
      <v-list>
        <v-list-item v-for="option in sortOptions" :key="option.value" @click="changeSortBy(option.value)">
          <template #prepend>
            <v-icon :color="sortBy === option.value ? 'primary' : ''">
              {{ option.icon }}
            </v-icon>
          </template>
          <v-list-item-title :class="{ 'text-primary font-weight-bold': sortBy === option.value }">
            {{ option.label }}
          </v-list-item-title>
          <template #append>
            <v-icon v-if="sortBy === option.value" color="primary">mdi-check</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref, watch } from 'vue'
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

const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('grid')
const page = ref(1)
const itemsPerPage = 24
const filterDrawer = ref(false)
const sortMenu = ref(false)
const sortBy = ref('recent')
const selectedHalalFilter = ref<string | null>(null)
const selectedCategories = ref<string[]>([])
const selectedLabels = ref<string[]>([])
const excludedAllergens = ref<string[]>([])

const filters = ref({
  certified: false,
  communityVerified: false,
  additivesFilter: 'all',
  minRating: 0
})

const quickFilters = [
  { label: 'Halal', value: 'halal', icon: 'mdi-check-circle', color: 'success' },
  { label: 'Douteux', value: 'douteux', icon: 'mdi-alert-circle', color: 'warning' },
  { label: 'Haram', value: 'haram', icon: 'mdi-close-circle', color: 'error' },
  { label: 'Non vérifié', value: 'non_verifie', icon: 'mdi-help-circle', color: 'grey' }
]

type Category = { id: string; name: string; description?: string }
const dbCategories = ref<Category[]>([])

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

const labels = [
  { label: 'Bio', value: 'bio', icon: 'mdi-leaf' },
  { label: 'Sans OGM', value: 'sans-ogm', icon: 'mdi-dna' },
  { label: 'Commerce équitable', value: 'equitable', icon: 'mdi-scale-balance' },
  { label: 'Sans gluten', value: 'sans-gluten', icon: 'mdi-barley-off' },
  { label: 'Végétarien', value: 'vegetarien', icon: 'mdi-leaf' },
  { label: 'Vegan', value: 'vegan', icon: 'mdi-sprout' }
]

const allergens = [
  { label: 'Gluten', value: 'gluten' },
  { label: 'Lactose', value: 'lactose' },
  { label: 'Arachides', value: 'arachides' },
  { label: 'Fruits à coque', value: 'fruits-coque' },
  { label: 'Œufs', value: 'oeufs' },
  { label: 'Soja', value: 'soja' },
  { label: 'Poisson', value: 'poisson' },
  { label: 'Crustacés', value: 'crustaces' }
]

const additivesOptions = [
  { title: 'Tous les produits', value: 'all' },
  { title: 'Sans additifs', value: 'none' },
  { title: 'Avec additifs halal uniquement', value: 'halal-only' },
  { title: 'Avec additifs douteux', value: 'has-doubtful' }
]

const sortOptions = [
  { label: 'Plus récents', value: 'recent', icon: 'mdi-clock-outline' },
  { label: 'Mieux notés', value: 'rating', icon: 'mdi-star' },
  { label: 'Nom (A-Z)', value: 'name-asc', icon: 'mdi-sort-alphabetical-ascending' },
  { label: 'Nom (Z-A)', value: 'name-desc', icon: 'mdi-sort-alphabetical-descending' },
  { label: 'Marque (A-Z)', value: 'brand-asc', icon: 'mdi-sort-alphabetical-ascending' },
  { label: 'Plus commentés', value: 'reviews', icon: 'mdi-comment-multiple' }
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
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur de fetch:', error)
    return
  }

  allProducts.value = (data as SupabaseProductRow[]).map(p => {
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
      category_id: p.category?.[0]?.id || null,
      category: p.category?.[0]?.name || 'Autre',
      image_url: p.image_url || 'https://via.placeholder.com/400x400?text=Produit',
      // @ts-ignore
      halal_status: p.halal_info?.halal_status || 'non_verifie',
      certified: !!p.halal_info?.[0]?.certification_body,
      rating,
      reviews_count,
      reviews,
      additives_count: p.additives?.length || 0
    }
  })
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

  if (filters.value.additivesFilter === 'none') {
    products = products.filter(p => p.additives_count === 0)
  }

  products = sortProducts(products)

  return products
})

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedCategories.value.length > 0) count += selectedCategories.value.length
  if (selectedLabels.value.length > 0) count += selectedLabels.value.length
  if (excludedAllergens.value.length > 0) count += excludedAllergens.value.length
  if (filters.value.certified) count++
  if (filters.value.communityVerified) count++
  if (filters.value.additivesFilter !== 'all') count++
  if (filters.value.minRating > 0) count++
  return count
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
    case 'brand-asc':
      return products.sort((a, b) => a.brand.localeCompare(b.brand))
    case 'reviews':
      return products.sort((a, b) => b.reviews_count - a.reviews_count)
    default:
      return products
  }
}

const getHalalColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    douteux: 'warning',
    non_verifie: 'grey'
  }
  return colors[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    douteux: 'Douteux',
    non_verifie: 'Non vérifié'
  }
  return labels[status] || 'Non vérifié'
}

const getHalalIcon = (status: string) => {
  const icons: Record<string, string> = {
    halal: 'mdi-check-circle',
    haram: 'mdi-close-circle',
    douteux: 'mdi-alert-circle',
    non_verifie: 'mdi-help-circle'
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
  selectedLabels.value = []
  excludedAllergens.value = []
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
  selectedLabels.value = []
  excludedAllergens.value = []
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