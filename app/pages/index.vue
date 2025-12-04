<template>
  <v-app-bar elevation="0" class="glass-navbar px-2 px-sm-4 navbar-mobile">

    <v-app-bar-title class="text-h6 text-sm-h5 font-weight-bold d-flex align-center">
      <span class="text-primary gradient-text">IOFD</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn variant="text" to="/products" class="nav-btn d-none d-sm-inline-flex" aria-label="Produits">Produits</v-btn>
    <v-btn variant="text" to="/additives" class="nav-btn d-none d-sm-inline-flex" aria-label="Additifs">Additifs</v-btn>
    <v-btn variant="text" to="/about" class="nav-btn d-none d-md-inline-flex" aria-label="A propos">À propos</v-btn>

    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn icon="mdi-menu" variant="text" class="d-sm-none" v-bind="props" />
      </template>
      <v-list>
        <v-list-item to="/products" title="Produits" prepend-icon="mdi-package-variant" />
        <v-list-item to="/additives" title="Additifs" prepend-icon="mdi-flask" />
        <v-list-item to="/about" title="À propos" prepend-icon="mdi-information" />
      </v-list>
    </v-menu>

    <v-btn variant="tonal" :to="isLoggedIn ? '/profile' : '/auth/login'"
      :icon="isLoggedIn ? 'mdi-account-circle' : 'mdi-account'" class="ml-1 ml-sm-2 account-btn" size="small" />
  </v-app-bar>

  <v-main>
    <section class="hero-section-enhanced">
      <div class="animated-bg">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
        <div class="blob blob-3" />
      </div>

      <v-container class="py-8 py-sm-12 py-md-16 px-3 px-sm-4 position-relative">
        <v-row align="center" justify="center">
          <v-col cols="12" md="10" lg="8" class="text-center">
            <div class="hero-badge mb-4 mb-sm-8" data-aos="fade-down">
              <v-chip color="primary" variant="flat" size="small" size-sm="large" class="badge-glow">
                <v-icon start size="x-small" size-sm="small">mdi-check-decagram</v-icon>
                <span class="d-none d-sm-inline">Base de données nutritionnelle islamique</span>
                <span class="d-sm-none">Base de données islamique</span>
              </v-chip>
            </div>

            <h1 class="hero-title-enhanced mb-4 mb-sm-6" data-aos="fade-up" data-aos-delay="100">
              L'alimentation en accord
              <span class="gradient-text-animated">avec les principes de l'islam</span>
            </h1>

            <p class="hero-subtitle-enhanced mb-6 mb-sm-10" data-aos="fade-up" data-aos-delay="200">
              Scannez, consultez et contribuez à la plus grande base de données<br class="d-none d-md-block" />
              <span class="d-md-none"><br /></span>collaborative islamique mondiale
            </p>

            <v-card class="search-card-enhanced mx-auto mb-6 mb-sm-8" elevation="12" max-width="700" data-aos="fade-up"
              data-aos-delay="300">
              <v-card-text class="pa-2 pa-sm-3">
                <v-text-field v-model="searchQuery"
                  :placeholder="$vuetify.display.xs ? 'Rechercher un produit...' : 'Rechercher un produit, une marque ou un code-barres...'"
                  prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable"
                  class="search-input" @keyup.enter="searchProducts">
                  <template #append-inner>
                    <v-btn v-if="isMobile" icon="mdi-barcode-scan" color="primary" variant="flat" class="scan-btn-pulse"
                      to="/products/add" size="small" />
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>

            <div class="d-flex flex-column flex-sm-row justify-center flex-wrap ga-2 ga-sm-3" data-aos="fade-up"
              data-aos-delay="400">
              <v-btn size="large" color="primary" variant="flat" to="/products/add" prepend-icon="mdi-plus-circle"
                class="cta-btn-primary">
                Ajouter un produit
                <v-icon end class="ml-1 ml-sm-2 d-none d-sm-inline">mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn size="large" variant="outlined" color="primary" to="/products" prepend-icon="mdi-magnify"
                class="cta-btn-secondary">
                Explorer la base
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <div class="floating-element element-1">
        <v-icon size="40" color="primary">mdi-leaf</v-icon>
      </div>
      <div class="floating-element element-2">
        <v-icon size="50" color="secondary">mdi-food-apple</v-icon>
      </div>
      <div class="floating-element element-3">
        <v-icon size="35" color="tertiary">mdi-certificate</v-icon>
      </div>
    </section>

    <section class="stats-section py-8 py-sm-12 py-md-16">
      <v-container class="px-3 px-sm-4">
        <v-row>
          <v-col v-for="(stat, i) in stats" :key="stat.label" cols="12" sm="6" md="4" data-aos="zoom-in"
            :data-aos-delay="i * 100">
            <v-card class="stat-card text-center" elevation="8" hover>
              <v-card-text class="py-6 py-sm-8">
                <div class="stat-icon-wrapper mb-3 mb-sm-4">
                  <v-avatar :color="stat.iconColor" size="64" class="stat-avatar">
                    <v-icon size="32" color="white">{{ stat.icon }}</v-icon>
                  </v-avatar>
                  <div class="pulse-ring" />
                </div>
                <div class="stat-number mb-2" :style="{ color: stat.numberColor }">
                  <span class="counter" :data-target="stat.value">0</span>
                </div>
                <div class="stat-label">
                  {{ stat.label }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="how-section-enhanced py-8 py-sm-12 py-md-16">
      <v-container class="px-3 px-sm-4">
        <div class="text-center mb-6 mb-sm-12" data-aos="fade-up">
          <v-chip color="secondary" variant="tonal" size="small" size-sm="large" class="mb-3 mb-sm-4">
            <v-icon start size="x-small" size-sm="small">mdi-lightbulb-on</v-icon>
            Processus simple
          </v-chip>
          <h2 class="section-title-enhanced mb-2 mb-sm-3">Comment ça marche ?</h2>
          <p class="text-body-1 text-sm-h6 text-medium-emphasis">
            Ajoutez votre produit en quelques clics et aidez toute la communauté
          </p>
        </div>

        <v-row>
          <v-col v-for="(step, i) in steps" :key="i" cols="12" sm="6" md="4" data-aos="fade-up"
            :data-aos-delay="i * 100">
            <v-card class="step-card-enhanced h-100" elevation="4" hover>
              <v-card-text class="pa-4 pa-sm-6 pa-md-8 text-center">
                <div class="step-icon-container mb-4 mb-sm-6">
                  <v-avatar :color="step.color" size="70" class="step-avatar">
                    <v-icon size="35" color="white">{{ step.icon }}</v-icon>
                  </v-avatar>
                  <div class="step-number-badge">{{ i + 1 }}</div>
                </div>

                <h3 class="text-h6 text-sm-h5 mb-2 mb-sm-3 font-weight-bold">{{ step.title }}</h3>
                <p class="text-body-2 text-sm-body-1 text-medium-emphasis">{{ step.description }}</p>
              </v-card-text>

              <div v-if="i < steps.length - 1" class="step-connector d-none d-md-block" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="recent-section-enhanced py-8 py-sm-12 py-md-16">
      <v-container class="px-3 px-sm-4">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-6 mb-sm-8 gap-3"
          data-aos="fade-up">
          <div>
            <v-chip color="tertiary" variant="tonal" size="small" class="mb-2 mb-sm-3">
              <v-icon start size="x-small">mdi-fire</v-icon>
              Nouveautés
            </v-chip>
            <h2 class="section-title-enhanced mb-1">Produits récents</h2>
            <p class="text-body-2 text-sm-body-1 text-medium-emphasis mb-2">Derniers ajouts à la base</p>
          </div>
          <v-btn variant="tonal" color="primary" size="default" size-sm="large" to="/products" class="explore-btn">
            Voir tout
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <v-row>
          <v-col v-for="(product, i) in recentProducts" :key="product.id" cols="6" sm="6" md="3" data-aos="fade-up"
            :data-aos-delay="i * 50">
            <v-card class="product-card-enhanced h-100" elevation="4" hover @click="goToProduct(product.id)">
              <div class="product-image-wrapper">
                <v-img :src="product.image_url" class="product-image-enhanced" cover>
                  <div class="image-overlay">
                    <v-chip :color="getHalalColor(product.halal_status)" size="x-small" size-sm="small" variant="flat"
                      class="halal-badge">
                      <v-icon start size="xx-small" size-sm="x-small">{{ getHalalIcon(product.halal_status) }}</v-icon>
                      {{ getHalalLabel(product.halal_status) }}
                    </v-chip>
                  </div>
                </v-img>
                <div class="quick-view-btn">
                  <v-btn icon="mdi-eye" size="x-small" size-sm="small" color="white" variant="flat" />
                </div>
              </div>

              <v-card-text class="pb-2 pb-sm-4 pa-2 pa-sm-3">
                <h4 class="text-subtitle-2 text-sm-h6 mb-1 mb-sm-2 text-truncate font-weight-bold">{{ product.name }}
                </h4>
                <p class="text-caption text-sm-body-2 text-medium-emphasis mb-2 mb-sm-3">{{ product.brand }}</p>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-rating :model-value="product.rating" readonly density="compact" size="x-small" size-sm="small"
                      color="amber" half-increments />
                    <span class="text-caption text-medium-emphasis ml-1">
                      {{ product.rating.toFixed(1) }}
                    </span>
                  </div>
                  <span class="text-caption text-medium-emphasis d-none d-sm-inline">
                    {{ product.reviews_count }} avis
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="cta-banner-enhanced py-8 py-sm-12 py-md-16">
      <v-container class="px-3 px-sm-4">
        <v-card class="cta-card-enhanced" elevation="12" rounded="xl" data-aos="zoom-in">
          <div class="cta-bg-pattern" />
          <v-card-text class="pa-4 pa-sm-8 pa-md-12 position-relative">
            <v-row align="center">
              <v-col cols="12" md="7">
                <v-chip color="white" variant="tonal" size="small" size-md="large" class="mb-3 mb-sm-4">
                  <v-icon start size="x-small" size-md="default">mdi-rocket-launch</v-icon>
                  Rejoignez-nous
                </v-chip>
                <h2 class="text-h5 text-sm-h4 text-md-h3 mb-3 mb-sm-4 text-white font-weight-bold">
                  Rejoignez la communauté
                </h2>
                <p class="text-body-1 text-sm-h6 text-white mb-4 mb-sm-6" style="opacity: 0.95">
                  Aidez-nous à construire la plus grande base de données halal collaborative
                </p>
                <div class="d-flex align-center gap-2 gap-sm-4">
                  <v-icon size="20" size-md="24" color="white">mdi-check-circle</v-icon>
                  <span class="text-body-2 text-sm-body-1 text-white">100% gratuit et open-source</span>
                </div>
              </v-col>
              <v-col cols="12" md="5" class="text-center mt-4 mt-md-0">
                <v-btn size="large" size-md="x-large" color="white" variant="flat"
                  :to="isLoggedIn ? '/profile' : '/auth/login'" prepend-icon="mdi-account-plus" class="cta-final-btn">
                  Commencer maintenant
                  <v-icon end class="d-none d-sm-inline">mdi-arrow-right</v-icon>
                </v-btn>
                <p class="text-white mt-3 mt-sm-4 text-caption text-sm-body-2" style="opacity: 0.8">
                  Déjà {{ stats[2]?.value || 0 }}+ contributeurs actifs
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </section>
  </v-main>

  <v-footer class="footer-enhanced" color="surface">
    <v-container class="py-6 py-sm-12 px-3 px-sm-4">
      <v-row>
        <v-col cols="12" md="4" data-aos="fade-up" class="mb-4 mb-md-0">
          <div class="d-flex align-center mb-3 mb-sm-4">
            <h3 class="text-h6 text-sm-h5 font-weight-bold gradient-text">IOFD</h3>
          </div>
          <p class="text-body-2 text-sm-body-1 text-medium-emphasis mb-4 mb-sm-6">
            Base de données collaborative pour une alimentation halal transparente et accessible à tous.
          </p>
          <div class="d-flex ga-2">
            <v-btn v-for="link in socials" :key="link.href" icon size="x-small" size-sm="small" variant="tonal"
              color="primary" class="social-btn"
              v-bind="link.href.startsWith('http') ? { href: link.href, target: '_blank', rel: 'noopener' } : { to: link.href }">
              <v-icon size="small" size-sm="default">{{ link.icon }}</v-icon>
            </v-btn>
          </div>
        </v-col>

        <v-col cols="6" sm="6" md="2" data-aos="fade-up" data-aos-delay="100">
          <h4 class="text-subtitle-2 text-sm-subtitle-1 mb-3 mb-sm-4 font-weight-bold">Navigation</h4>
          <div class="d-flex flex-column">
            <v-btn v-for="product in productLink" variant="text" size="x-small" size-sm="small" :to="product.path"
              class="justify-start mb-1 footer-link">
              {{ product.title }}
            </v-btn>
          </div>
        </v-col>

        <v-col cols="6" sm="6" md="2" data-aos="fade-up" data-aos-delay="200">
          <h4 class="text-subtitle-2 text-sm-subtitle-1 mb-3 mb-sm-4 font-weight-bold">Communauté</h4>
          <div class="d-flex flex-column">
            <v-btn v-for="com in communityLink" variant="text" size="x-small" size-sm="small" :to="com.path"
              class="justify-start mb-1 footer-link">
              {{ com.title }}
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="4" data-aos="fade-up" data-aos-delay="300" class="mt-4 mt-md-0">
          <h4 class="text-subtitle-2 text-sm-subtitle-1 mb-3 mb-sm-4 font-weight-bold">Newsletter</h4>
          <p class="text-body-2 text-medium-emphasis mb-3 mb-sm-4">
            Recevez les dernières actualités et nouveaux produits
          </p>
          <v-text-field placeholder="Votre email" variant="outlined" density="comfortable" hide-details
            append-inner-icon="mdi-send" class="newsletter-input" />
        </v-col>
      </v-row>

      <v-divider class="my-4 my-sm-8" />

      <div class="text-center text-medium-emphasis">
        <p class="mb-2 text-body-2 text-sm-body-1">© 1447 Islamic Open Food Database</p>
        <p class="text-caption">
          <a href="/privacy" class="footer-link-small">Confidentialité</a> •
          <a href="/terms" class="footer-link-small">Conditions</a> •
          <a href="/contact" class="footer-link-small">Contact</a>
        </p>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { onMounted, ref } from 'vue'
// @ts-ignore
import AOS from 'aos'
import 'aos/dist/aos.css'
import { getHalalColor, getHalalLabel, getHalalIcon } from '@/utils/color'

useHead({
  title: 'IOFD – Islamic Open Food Database',
  htmlAttrs: { lang: 'fr' },
  meta: [
    {
      name: 'description',
      content: 'IOFD est une base de données nutritionnelle ouverte et collaborative, pensée pour apporter transparence et confiance dans les produits consommés par la communauté musulmane.'
    },
    {
      property: 'og:title',
      content: 'IOFD – Islamic Open Food Database'
    },
    {
      property: 'og:description',
      content: 'Base de données nutritionnelle collaborative dédiée à la transparence alimentaire pour la communauté musulmane.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://iofd.org/'
    },
    {
      property: 'og:image',
      content: 'https://iofd.org/logo.png'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'IOFD – Islamic Open Food Database'
    },
    {
      name: 'twitter:description',
      content: 'Base de données nutritionnelle collaborative dédiée à la transparence alimentaire.'
    }
  ],
  link: [
    { rel: 'canonical', href: 'https://iofd.org/' }
  ]
})


const supabase = useSupabase()
const { isLoggedIn, fetchUser } = useSupabaseAuth()
const searchQuery = ref('')
const router = useRouter()

interface StatCard {
  value: number
  label: string
  icon: string
  iconColor: string
  numberColor: string
  bgColor: string
}

const stats = ref<StatCard[]>([
  { value: 0, label: 'Produits', icon: 'mdi-package-variant', iconColor: 'primary', numberColor: '#2e7d32', bgColor: 'rgba(46,125,50,0.05)' },
  { value: 0, label: 'Certifiés', icon: 'mdi-certificate', iconColor: 'secondary', numberColor: '#26a69a', bgColor: 'rgba(38,166,154,0.05)' },
  { value: 0, label: 'Contributeurs', icon: 'mdi-account-group', iconColor: 'tertiary', numberColor: '#ff6f00', bgColor: 'rgba(255,111,0,0.05)' }
])

const socials = ref([
  { icon: 'mdi-linkedin', href: 'https://www.linkedin.com/company/iofd' },
  { icon: 'mdi-twitter', href: 'https://x.com/iofd1447' },
  { icon: 'mdi-github', href: 'https://github.com/iofd1447/iofd' }
])

const productLink = ref([
  { title: 'Produits', path: '/products' },
  { title: 'Additifs', path: '/additives' },
  { title: 'Guide des statuts', path: '/statut-guide' }
])

const communityLink = ref([
  { title: 'Contribuer', path: '/contribute' },
  { title: 'Contact', path: '/contact' },
  { title: 'À propos', path: '/about' }
])

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
})

const fetchStats = async () => {
  try {
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { count: certifiedCount } = await supabase
      .from('halal_certifications')
      .select('*', { count: 'exact', head: true })
      .in('halal_status', ['halal', 'mustahab', 'makruh'])

    const { data: contributors } = await supabase
      .from('product_contributors')
      .select('user_id')
      .not('user_id', 'is', null)

    const uniqueContributors = new Set(contributors?.map(c => c.user_id) || []).size

    stats.value = [
      { value: productCount || 0, label: 'Produits', icon: 'mdi-package-variant', iconColor: 'primary', numberColor: '#2e7d32', bgColor: 'rgba(46,125,50,0.05)' },
      { value: certifiedCount || 0, label: 'Certifiés', icon: 'mdi-certificate', iconColor: 'secondary', numberColor: '#26a69a', bgColor: 'rgba(38,166,154,0.05)' },
      { value: uniqueContributors, label: 'Contributeurs', icon: 'mdi-account-group', iconColor: 'tertiary', numberColor: '#ff6f00', bgColor: 'rgba(255,111,0,0.05)' }
    ]

    setTimeout(() => animateCounters(), 500)
  } catch (error) {
    console.error('Erreur:', error)
  }
}

const animateCounters = () => {
  const counters = document.querySelectorAll('.counter')
  counters.forEach(counter => {
    const target = parseInt((counter as HTMLElement).dataset.target || '0')

    if (target <= 5) {
      counter.textContent = target.toString()
      return
    }

    let current = 0
    const duration = 1500
    const startTime = performance.now()

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      current = Math.floor(target * progress)
      counter.textContent = current.toString()
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  })
}

onMounted(async () => {
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
  })

  await fetchUser()
  fetchStats()
  fetchRecentProducts()
})

const steps = [
  {
    icon: 'mdi-barcode-scan',
    title: 'Nutrition',
    description: 'Ajoutez les données nutritionnelles de votre produit',
    color: 'primary',
  },
  {
    icon: 'mdi-shield-check',
    title: 'Vérifiez',
    description: 'Consultez le statut halal, les ingrédients et les additifs en temps réel',
    color: 'success',
  },
  {
    icon: 'mdi-account-multiple',
    title: 'Partagez',
    description: 'Contribuez en ajoutant de nouveaux produits à la base collaborative',
    color: 'secondary',
  },
]

const recentProducts = ref<any[]>([])
const loading = ref(false)

const fetchRecentProducts = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand,
        image_url,
        created_at,
        halal_info:halal_certifications(halal_status),
        community_reviews(rating, user_name, user_email, halal_vote, comment, helpful_count, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) throw error

    recentProducts.value = data.map((p: any) => {
      const ratings = p.community_reviews?.map((r: any) => r.rating) || []
      const reviews_count = ratings.length
      const rating = reviews_count
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / reviews_count
        : 0

      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        image_url: p.image_url || '',
        halal_status: p.halal_info?.halal_status,
        rating,
        reviews_count,
        reviews: p.community_reviews || []
      }
    })
  } catch (err) {
    console.error('Erreur lors du chargement des produits récents:', err)
  } finally {
    loading.value = false
  }
}

function normalizeName(name: string) {
  if (!name) return ''
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const goToProduct = (productOrId: any) => {
  const product = typeof productOrId === 'object' ? productOrId : recentProducts.value.find(p => p.id === productOrId)
  if (!product?.name || !product?.id) return

  const slug = normalizeName(product.name)

  router.push(`/products/${product.id}/${slug}`)
}

const searchProducts = () => {
  router.push({
    path: '/products',
    query: { q: searchQuery.value }
  })
}
</script>

<style scoped>
.glass-navbar {
  backdrop-filter: blur(20px);
  background: rgba(var(--v-theme-surface), 0.8) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.logo-pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.gradient-text {
  background: linear-gradient(135deg, #2e7d32 0%, #26c6da 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-btn {
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-btn:hover::before {
  width: 80%;
}

.hero-section-enhanced {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #26c6da, #18ffff);
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #ff6f00, #ff9800);
  top: 50%;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(100px, -100px) rotate(90deg);
  }
  50% {
    transform: translate(-50px, 100px) rotate(180deg);
  }
  75% {
    transform: translate(-100px, -50px) rotate(270deg);
  }
}

.hero-badge {
  animation: slideDown 0.8s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge-glow {
  box-shadow: 0 0 30px rgba(46, 125, 50, 0.4);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(46, 125, 50, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(46, 125, 50, 0.6);
  }
}

.rotating-icon {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-title-enhanced {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.gradient-text-animated {
  background: linear-gradient(135deg, #2e7d32, #26c6da, #ff6f00);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-subtitle-enhanced {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 400;
  opacity: 0.85;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-card-enhanced {
  border-radius: 60px !important;
  backdrop-filter: blur(20px);
  background: rgba(var(--v-theme-surface), 0.95) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.search-card-enhanced:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
}

.search-input {
  font-size: 1.1rem;
}

.scan-btn-pulse {
  animation: pulse-shadow 2s ease-in-out infinite;
}

@keyframes pulse-shadow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
  }
}

.cta-btn-primary {
  background: linear-gradient(135deg, #2e7d32, #43a047) !important;
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.4);
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.cta-btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(46, 125, 50, 0.6);
}

.cta-btn-secondary {
  border-width: 2px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-btn-secondary:hover {
  transform: translateY(-4px);
  background: rgba(var(--v-theme-primary), 0.1) !important;
}

.floating-element {
  position: absolute;
  opacity: 0.3;
  pointer-events: none;
}

.element-1 {
  top: 15%;
  left: 10%;
  animation: float-slow 8s ease-in-out infinite;
}

.element-2 {
  top: 60%;
  right: 15%;
  animation: float-slow 10s ease-in-out infinite 2s;
}

.element-3 {
  bottom: 20%;
  left: 20%;
  animation: float-slow 12s ease-in-out infinite 4s;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.stats-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.stat-card {
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background: rgba(var(--v-theme-surface), 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(38, 198, 218, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.stat-icon-wrapper {
  position: relative;
  display: inline-block;
}

.stat-avatar {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-avatar {
  transform: scale(1.1) rotate(10deg);
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 3px solid rgb(var(--v-theme-primary));
  border-radius: 50%;
  opacity: 0;
}

.stat-card:hover .pulse-ring {
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
}

@media (min-width: 600px) {
  .stat-number {
    font-size: 2.5rem;
  }
}

@media (min-width: 960px) {
  .stat-number {
    font-size: 3rem;
  }
}

.stat-label {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.how-section-enhanced {
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-surface-variant), 0.5) 100%);
}

.section-title-enhanced {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #2e7d32, #26c6da);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.step-card-enhanced {
  border-radius: 28px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(var(--v-border-color), 0.1);
  background: rgba(var(--v-theme-surface), 1);
  position: relative;
  overflow: visible;
}

.step-card-enhanced:hover {
  transform: translateY(-16px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.step-icon-container {
  position: relative;
  display: inline-block;
}

.step-avatar {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
}

.step-card-enhanced:hover .step-avatar {
  transform: scale(1.15) rotate(-10deg);
}

.step-number-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6f00, #ff9800);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
  box-shadow: 0 4px 16px rgba(255, 111, 0, 0.4);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.step-connector {
  position: absolute;
  top: 50%;
  right: -20%;
  width: 40%;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), transparent);
  transform: translateY(-50%);
  z-index: -1;
}

.recent-section-enhanced {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.explore-btn {
  font-weight: 600;
  transition: all 0.3s ease;
}

.explore-btn:hover {
  transform: translateX(4px);
}

.product-card-enhanced {
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;
  background: rgba(var(--v-theme-surface), 1);
}

.product-card-enhanced:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
}

.product-image-enhanced {
  transition: transform 0.5s ease;
  height: 160px;
}

@media (min-width: 600px) {
  .product-image-enhanced {
    height: 200px;
  }
}

@media (min-width: 960px) {
  .product-image-enhanced {
    height: 220px;
  }
}

.product-card-enhanced:hover .product-image-enhanced {
  transform: scale(1.15);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  z-index: 1;
}

.halal-badge {
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.quick-view-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 2;
}

.product-card-enhanced:hover .quick-view-btn {
  opacity: 1;
  transform: translateY(0);
}

.cta-banner-enhanced {
  position: relative;
  overflow: hidden;
}

.cta-card-enhanced {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 50%, #26c6da 100%);
  border-radius: 32px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.cta-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.cta-final-btn {
  background: white !important;
  color: #2e7d32 !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.cta-final-btn:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.footer-enhanced {
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-surface-variant), 0.5) 100%);
  border-top: 1px solid rgba(var(--v-border-color), 0.1);
}

.social-btn {
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-4px) rotate(5deg);
}

.footer-link {
  position: relative;
  transition: all 0.2s ease;
}

.footer-link:hover {
  transform: translateX(4px);
  color: rgb(var(--v-theme-primary)) !important;
}

.footer-link-small {
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0 8px;
}

.footer-link-small:hover {
  color: rgb(var(--v-theme-primary));
}

.newsletter-input {
  transition: all 0.3s ease;
}

.newsletter-input:focus-within {
  transform: translateY(-2px);
}

@media (max-width: 960px) {
  .hero-section-enhanced {
    min-height: 80vh;
  }

  .blob {
    filter: blur(60px);
  }

  .floating-element {
    display: none;
  }

  .stat-number-enhanced {
    font-size: 2rem;
  }

  .step-connector {
    display: none !important;
  }

  .cta-card-enhanced .pa-12 {
    padding: 2rem !important;
  }
}

@media (max-width: 600px) {
  .hero-title-enhanced {
    font-size: 2.2rem;
  }

  .search-card-enhanced {
    border-radius: 30px !important;
  }

  .cta-btn-primary,
  .cta-btn-secondary {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .stat-card-enhanced:hover {
    transform: translateY(-6px) scale(1);
  }

  .product-card-enhanced:hover {
    transform: translateY(-6px);
  }
}

.v-theme--dark .glass-navbar {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .search-card-enhanced {
  background: rgba(var(--v-theme-surface), 0.98) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.v-theme--dark .stat-card-enhanced,
.v-theme--dark .step-card-enhanced,
.v-theme--dark .product-card-enhanced {
  background: rgba(var(--v-theme-surface), 0.95);
  border-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .blob {
  opacity: 0.2;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media print {
  .hero-section-enhanced,
  .cta-banner-enhanced,
  .footer-enhanced {
    background: white !important;
  }

  .animated-bg,
  .floating-element,
  .blob {
    display: none !important;
  }
}
</style>