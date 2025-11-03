<template>
  <v-app-bar elevation="0" class="glass-navbar px-4" height="70">
    <v-app-bar-title class="text-h5 font-weight-bold d-flex align-center">
      <span class="text-primary gradient-text">IOFD</span>
    </v-app-bar-title>

    <v-spacer />

    <v-btn variant="text" to="/products" class="nav-btn">Produits</v-btn>
    <v-btn variant="text" to="/additives" class="nav-btn">Additifs</v-btn>
    <v-btn variant="text" to="/about" class="nav-btn">À propos</v-btn>

    <v-btn variant="tonal" :to="isLoggedIn ? '/profile' : '/auth/login'"
      :icon="isLoggedIn ? 'mdi-account-circle' : 'mdi-account'" class="ml-2" />
  </v-app-bar>

  <v-main>
    <section class="hero-section-enhanced">
      <div class="animated-bg">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
        <div class="blob blob-3" />
      </div>

      <v-container class="py-16 position-relative">
        <v-row align="center" justify="center">
          <v-col cols="12" md="10" lg="8" class="text-center">
            <div class="hero-badge mb-8" data-aos="fade-down">
              <v-chip color="primary" variant="flat" size="large" class="badge-glow">
                <v-icon start size="small" class="rotating-icon">mdi-check-decagram</v-icon>
                Base de données nutritionnelle islamique
              </v-chip>
            </div>

            <h1 class="hero-title-enhanced mb-6" data-aos="fade-up" data-aos-delay="100">
              L'alimentation en accord<br />
              <span>avec les principes de l'islam</span>
            </h1>

            <p class="hero-subtitle-enhanced mb-10" data-aos="fade-up" data-aos-delay="200">
              Scannez, consultez et contribuez à la plus grande base de données<br class="d-none d-md-block" />
              collaborative islamique mondiale
            </p>

            <v-card class="search-card-enhanced mx-auto mb-8" elevation="12" max-width="700" data-aos="fade-up"
              data-aos-delay="300">
              <v-card-text class="pa-3">
                <v-text-field v-model="searchQuery" placeholder="Rechercher un produit, marque ou code-barres..."
                  prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details density="comfortable"
                  class="search-input" @keyup.enter="searchProducts">
                  <template #append-inner>
                    <v-btn icon="mdi-barcode-scan" color="primary" variant="flat" class="scan-btn-pulse"
                      to="/products/add" />
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>

            <div class="d-flex justify-center flex-wrap ga-3" data-aos="fade-up" data-aos-delay="400">
              <v-btn size="x-large" color="primary" variant="flat" to="/products/add" prepend-icon="mdi-plus-circle"
                class="cta-btn-primary">
                Ajouter un produit
                <v-icon end class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn size="x-large" variant="outlined" color="primary" to="/products" prepend-icon="mdi-magnify"
                class="cta-btn-secondary">
                Explorer la base
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="stats-section-enhanced py-16">
      <v-container>
        <v-row>
          <v-col v-for="(stat, i) in stats" :key="stat.label" cols="6" md="4" data-aos="zoom-in"
            :data-aos-delay="i * 100">
            <v-card class="stat-card-enhanced text-center" elevation="8" hover>
              <v-card-text class="py-8">
                <div class="stat-icon-wrapper mb-4">
                  <v-avatar :color="stat.iconColor" size="80" class="stat-avatar">
                    <v-icon size="40" color="white">{{ stat.icon }}</v-icon>
                  </v-avatar>
                  <div class="pulse-ring" />
                </div>
                <div class="stat-number-enhanced mb-2" :style="{ color: stat.numberColor }">
                  <span class="counter" :data-target="stat.value">0</span>
                </div>
                <div class="stat-label-enhanced">
                  {{ stat.label }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- How It Works Section -->
    <section class="how-section-enhanced py-16">
      <v-container>
        <div class="text-center mb-12" data-aos="fade-up">
          <v-chip color="secondary" variant="tonal" size="large" class="mb-4">
            <v-icon start>mdi-lightbulb-on</v-icon>
            Processus simple
          </v-chip>
          <h2 class="section-title-enhanced mb-3">Comment ça marche ?</h2>
          <p class="text-h6 text-medium-emphasis">
            Ajoutez votre produit en quelques clics et aidez toute la communauté
          </p>
        </div>

        <v-row>
          <v-col v-for="(step, i) in steps" :key="i" cols="12" md="4" data-aos="fade-up" :data-aos-delay="i * 100">
            <v-card class="step-card-enhanced h-100" elevation="4" hover>
              <v-card-text class="pa-8 text-center">
                <div class="step-icon-container mb-6">
                  <v-avatar :color="step.color" size="90" class="step-avatar">
                    <v-icon size="45" color="white">{{ step.icon }}</v-icon>
                  </v-avatar>
                  <div class="step-number-badge">{{ i + 1 }}</div>
                </div>

                <h3 class="text-h5 mb-3 font-weight-bold">{{ step.title }}</h3>
                <p class="text-body-1 text-medium-emphasis">{{ step.description }}</p>
              </v-card-text>

              <!-- Progress connector (sauf pour le dernier) -->
              <div v-if="i < steps.length - 1" class="step-connector d-none d-md-block" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Recent Products Section -->
    <section class="recent-section-enhanced py-16">
      <v-container>
        <div class="d-flex justify-space-between align-center mb-8" data-aos="fade-up">
          <div>
            <v-chip color="tertiary" variant="tonal" size="small" class="mb-3">
              <v-icon start size="small">mdi-fire</v-icon>
              Nouveautés
            </v-chip>
            <h2 class="section-title-enhanced mb-1">Produits récents</h2>
            <p class="text-medium-emphasis">Derniers ajouts à la base</p>
          </div>
          <v-btn variant="tonal" color="primary" size="large" to="/products" class="explore-btn">
            Voir tout
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <v-row>
          <v-col v-for="(product, i) in recentProducts" :key="product.id" cols="12" sm="6" md="3" data-aos="fade-up"
            :data-aos-delay="i * 50">
            <v-card class="product-card-enhanced h-100" elevation="4" hover @click="goToProduct(product.id)">
              <div class="product-image-wrapper">
                <v-img :src="product.image_url" height="220" cover class="product-image-enhanced">
                  <div class="image-overlay">
                    <v-chip :color="getHalalColor(product.halal_status)" size="small" variant="flat"
                      class="halal-badge">
                      <v-icon start size="x-small">{{ getHalalIcon(product.halal_status) }}</v-icon>
                      {{ getHalalLabel(product.halal_status) }}
                    </v-chip>
                  </div>
                </v-img>
                <div class="quick-view-btn">
                  <v-btn icon="mdi-eye" size="small" color="white" variant="flat" />
                </div>
              </div>

              <v-card-text class="pb-4">
                <h4 class="text-h6 mb-2 text-truncate font-weight-bold">{{ product.name }}</h4>
                <p class="text-body-2 text-medium-emphasis mb-3">{{ product.brand }}</p>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-rating :model-value="product.rating" readonly density="compact" size="small" color="amber"
                      half-increments />
                    <span class="text-caption text-medium-emphasis ml-1">
                      {{ product.rating.toFixed(1) }}
                    </span>
                  </div>
                  <span class="text-caption text-medium-emphasis">
                    {{ product.reviews_count }} avis
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA Banner Section -->
    <section class="cta-banner-enhanced py-16">
      <v-container>
        <v-card class="cta-card-enhanced" elevation="12" rounded="xl" data-aos="zoom-in">
          <div class="cta-bg-pattern" />
          <v-card-text class="pa-12 position-relative">
            <v-row align="center">
              <v-col cols="12" md="7">
                <v-chip color="white" variant="tonal" size="large" class="mb-4">
                  <v-icon start>mdi-rocket-launch</v-icon>
                  Rejoignez-nous
                </v-chip>
                <h2 class="text-h3 mb-4 text-white font-weight-bold">
                  Rejoignez la communauté
                </h2>
                <p class="text-h6 text-white mb-6" style="opacity: 0.95">
                  Aidez-nous à construire la plus grande base de données halal collaborative
                </p>
                <div class="d-flex align-center gap-4">
                  <v-icon size="24" color="white">mdi-check-circle</v-icon>
                  <span class="text-white">100% gratuit et open-source</span>
                </div>
              </v-col>
              <v-col cols="12" md="5" class="text-center">
                <v-btn size="x-large" color="white" variant="flat" to="/products/add" prepend-icon="mdi-account-plus"
                  class="cta-final-btn">
                  Commencer maintenant
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
                <p class="text-white mt-4 text-body-2" style="opacity: 0.8">
                  Déjà {{ stats[2]?.value || 0 }}+ contributeurs actifs
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </section>
  </v-main>

  <!-- Footer modernisé -->
  <v-footer class="footer-enhanced" color="surface">
    <v-container class="py-12">
      <v-row>
        <v-col cols="12" md="4" data-aos="fade-up">
          <div class="d-flex align-center mb-4">
            <v-icon size="40" color="primary" class="mr-3">mdi-leaf-circle</v-icon>
            <h3 class="text-h5 font-weight-bold gradient-text">IOFD</h3>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Base de données collaborative pour une alimentation halal transparente et accessible à tous.
          </p>
          <div class="d-flex gap-2">
            <v-btn icon size="small" variant="tonal" color="primary" class="social-btn">
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="tonal" color="primary" class="social-btn">
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="tonal" color="primary" class="social-btn">
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="tonal" color="primary" class="social-btn">
              <v-icon>mdi-github</v-icon>
            </v-btn>
          </div>
        </v-col>

        <v-col cols="6" md="2" data-aos="fade-up" data-aos-delay="100">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold">Navigation</h4>
          <div class="d-flex flex-column">
            <v-btn variant="text" size="small" to="/products" class="justify-start mb-1 footer-link">
              Produits
            </v-btn>
            <v-btn variant="text" size="small" to="/additives" class="justify-start mb-1 footer-link">
              Additifs
            </v-btn>
            <v-btn variant="text" size="small" to="/halal-guide" class="justify-start footer-link">
              Guide Halal
            </v-btn>
          </div>
        </v-col>

        <v-col cols="6" md="2" data-aos="fade-up" data-aos-delay="200">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold">Communauté</h4>
          <div class="d-flex flex-column">
            <v-btn variant="text" size="small" to="/contribute" class="justify-start mb-1 footer-link">
              Contribuer
            </v-btn>
            <v-btn variant="text" size="small" to="/certification" class="justify-start mb-1 footer-link">
              Certification
            </v-btn>
            <v-btn variant="text" size="small" to="/about" class="justify-start footer-link">
              À propos
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="4" data-aos="fade-up" data-aos-delay="300">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold">Newsletter</h4>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Recevez les dernières actualités et nouveaux produits
          </p>
          <v-text-field placeholder="Votre email" variant="outlined" density="comfortable" hide-details
            append-inner-icon="mdi-send" class="newsletter-input" />
        </v-col>
      </v-row>

      <v-divider class="my-8" />

      <div class="text-center text-medium-emphasis">
        <p class="mb-2">© 1447 Islamic Open Food Database - Made with ❤️ for the Ummah</p>
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

useHead({
  title: 'IOFD - Islamic Open Food Database',
  meta: [
    { name: 'description', content: 'IOFD (Islamic Open Food Database) is a collaborative nutrition database specifically designed for the Ummah.' },
  ]
})

const supabase = useSupabase()
const { isLoggedIn, fetchUser } = useSupabaseAuth()
const searchQuery = ref('')

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

const fetchStats = async () => {
  try {
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { count: certifiedCount } = await supabase
      .from('halal_certifications')
      .select('*', { count: 'exact', head: true })
      .eq('halal_status', 'halal')

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

    // Animate counters
    setTimeout(() => animateCounters(), 500)
  } catch (error) {
    console.error('Erreur:', error)
  }
}

const animateCounters = () => {
  const counters = document.querySelectorAll('.counter')
  counters.forEach(counter => {
    const target = parseInt((counter as HTMLElement).dataset.target || '0')
    let current = 0
    const increment = target / 50
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        counter.textContent = target.toString()
        clearInterval(timer)
      } else {
        counter.textContent = Math.floor(current).toString()
      }
    }, 30)
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
    description: 'Ajoutez les données nutritionnelles de votre produit avec notre scanner intelligent',
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
        halal_info:halal_certifications(halal_status)
      `)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) throw error

    recentProducts.value = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      image_url: p.image_url || 'https://via.placeholder.com/400x400?text=Produit',
      halal_status: p.halal_info?.[0]?.halal_status || 'non_verifie',
      rating: Math.random() * 2 + 3,
      reviews_count: Math.floor(Math.random() * 200) + 10
    }))
  } catch (err) {
    console.error('Erreur lors du chargement des produits récents:', err)
  } finally {
    loading.value = false
  }
}

const getHalalColor = (status: string) => {
  const colors: Record<string, string> = {
    halal: 'success',
    haram: 'error',
    douteux: 'warning',
    non_verifie: 'grey',
  }
  return colors[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const labels: Record<string, string> = {
    halal: 'Halal',
    haram: 'Haram',
    douteux: 'Douteux',
    non_verifie: 'Non vérifié',
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

const router = useRouter()

const goToProduct = (id: string) => {
  router.push({
    name: 'products-id',
    params: { id }
  })
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

.hero-title-enhanced {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.gradient-text-animated {
  background: linear-gradient(135deg, #2e7d32, #26c6da, #ff6f00);
}
</style>