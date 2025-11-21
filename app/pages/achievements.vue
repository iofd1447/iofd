<template>
  <v-app-bar elevation="0" class="px-4 app-bar-blur">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Jalons</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main class="main-bg">
    <v-container class="py-8" style="max-width: 900px;">
      <div class="hero-section text-center mb-10">
        <div class="hero-icon-wrapper mb-6">
          <div class="hero-icon-glow"></div>
          <v-avatar size="88" class="hero-icon">
            <v-icon size="44" color="white">mdi-trophy</v-icon>
          </v-avatar>
        </div>
        <h1 class="text-h4 text-md-h3 font-weight-black mb-3">
          Jalons communautaires
        </h1>
        <p class="text-body-1 text-medium-emphasis mx-auto" style="max-width: 400px;">
          Chaque produit ajouté nous rapproche d'une alimentation halal accessible à tous
        </p>
      </div>

      <v-card class="stats-card mb-8" rounded="xl">
        <div class="stats-card-bg"></div>
        <v-card-text class="pa-6 pa-md-8 position-relative">
          <v-skeleton-loader v-if="loading" type="heading, text, button" />

          <template v-else>
            <div class="text-center">
              <p class="text-overline text-primary font-weight-bold mb-2 tracking-wide">
                Total des produits
              </p>
              <h2 class="counter-value mb-1">
                {{ productCount.toLocaleString('fr-FR') }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-6">
                produits vérifiés dans la base IOFD
              </p>

              <div v-if="nextMilestone" class="progress-section mx-auto" style="max-width: 400px;">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">
                    {{ currentMilestone?.toLocaleString('fr-FR') || 0 }}
                  </span>
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                    {{ Math.round(progressToNext) }}%
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ nextMilestone.toLocaleString('fr-FR') }}
                  </span>
                </div>
                <div class="custom-progress">
                  <div class="custom-progress-fill" :style="{ width: progressToNext + '%' }"></div>
                </div>
                <p class="text-caption text-medium-emphasis mt-3">
                  <v-icon size="14" class="mr-1">mdi-flag-checkered</v-icon>
                  Plus que <strong>{{ (nextMilestone - productCount).toLocaleString('fr-FR') }}</strong> produits
                </p>
              </div>
            </div>
          </template>
        </v-card-text>
      </v-card>

      <v-expand-transition>
        <v-card v-if="milestoneUnlocked && !loading" class="share-section mb-8" rounded="xl">
          <v-card-text class="pa-6 pa-md-8">
            <div class="d-flex align-center ga-2 mb-4">
              <v-icon color="success">mdi-party-popper</v-icon>
              <span class="text-h6 font-weight-bold">Palier débloqué !</span>
            </div>

            <div ref="shareCardRef" class="share-preview mb-6">
              <div class="share-preview-content">
                <div class="share-preview-badge">IOFD Community</div>
                <div class="share-preview-number">
                  {{ currentMilestone?.toLocaleString('fr-FR') }}
                </div>
                <div class="share-preview-label">produits halal vérifiés</div>
                <div class="share-preview-tagline">
                  Une étape de plus pour la Ummah
                </div>
                <div class="share-preview-footer">
                  <v-icon size="16" class="mr-1">mdi-leaf</v-icon>
                  Islamic Open Food Database
                </div>
              </div>
            </div>

            <div class="share-buttons">
              <v-btn color="primary" size="large" rounded="lg" class="share-btn" :loading="generatingImage"
                @click="shareOnTwitter">
                <v-icon start>mdi-twitter</v-icon>
                Twitter / X
              </v-btn>
              <v-btn color="#0A66C2" size="large" rounded="lg" class="share-btn" :loading="generatingImage"
                @click="shareOnLinkedIn">
                <v-icon start>mdi-linkedin</v-icon>
                LinkedIn
              </v-btn>
              <v-btn color="#25D366" size="large" rounded="lg" class="share-btn" @click="shareOnWhatsApp">
                <v-icon start>mdi-whatsapp</v-icon>
                WhatsApp
              </v-btn>
              <v-btn variant="tonal" size="large" rounded="lg" class="share-btn" @click="downloadImage"
                :loading="generatingImage">
                <v-icon start>mdi-download</v-icon>
                Télécharger
              </v-btn>
            </div>

            <v-snackbar v-model="snackbar" :color="snackbarColor" rounded="lg">
              {{ snackbarText }}
            </v-snackbar>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <v-card rounded="xl" class="timeline-card">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" size="40" variant="tonal">
              <v-icon>mdi-flag-variant</v-icon>
            </v-avatar>
            <div>
              <p class="text-h6 font-weight-bold mb-0">Parcours</p>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ achievedCount }}/{{ milestones.length }} jalons atteints
              </p>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pa-6 pt-0">
          <div class="milestones-grid">
            <div v-for="(milestone, index) in milestones" :key="milestone" class="milestone-item"
              :class="{ achieved: productCount >= milestone, current: milestone === nextMilestone }">
              <div class="milestone-connector" v-if="index > 0"></div>
              <div class="milestone-dot">
                <v-icon v-if="productCount >= milestone" size="16" color="white">
                  mdi-check
                </v-icon>
                <span v-else class="milestone-number">{{ index + 1 }}</span>
              </div>
              <div class="milestone-content">
                <p class="milestone-value">{{ milestone.toLocaleString('fr-FR') }}</p>
                <p class="milestone-status">
                  <template v-if="productCount >= milestone">
                    <v-icon size="12" color="success" class="mr-1">mdi-check-circle</v-icon>
                    Atteint
                  </template>
                  <template v-else-if="milestone === nextMilestone">
                    <v-icon size="12" color="primary" class="mr-1">mdi-arrow-right</v-icon>
                    En cours
                  </template>
                  <template v-else>
                    <v-icon size="12" color="grey" class="mr-1">mdi-lock</v-icon>
                    {{ (milestone - productCount).toLocaleString('fr-FR') }} restants
                  </template>
                </p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { computed, onMounted, ref } from 'vue'
import html2canvas from 'html2canvas'

useHead({
  title: 'IOFD - Jalons communautaires',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Suivez les jalons IOFD et voyez les succès de la communauté.' }
  ]
})

const milestones = [10, 100, 1000, 10000, 100000, 1000000]
const supabase = useSupabase()
const loading = ref(true)
const productCount = ref(0)
const generatingImage = ref(false)
const shareCardRef = ref<HTMLElement | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// @ts-ignore
const milestoneUnlocked = computed(() => productCount.value >= milestones[0])
const currentMilestone = computed(() =>
  [...milestones].reverse().find(m => productCount.value >= m)
)
const nextMilestone = computed(() =>
  milestones.find(m => m > productCount.value)
)
const progressToNext = computed(() => {
  if (!nextMilestone.value) return 100
  const base = currentMilestone.value || 0
  const range = nextMilestone.value - base
  return Math.min(100, ((productCount.value - base) / range) * 100)
})
const achievedCount = computed(() =>
  milestones.filter(m => productCount.value >= m).length
)

const fetchProductCount = async () => {
  loading.value = true
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    productCount.value = count || 0
  } catch (e) {
    console.error('Erreur chargement:', e)
  } finally {
    loading.value = false
  }
}

const generateShareImage = async (): Promise<Blob | null> => {
  if (!shareCardRef.value) return null
  generatingImage.value = true
  try {
    const canvas = await html2canvas(shareCardRef.value, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    })
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  } finally {
    generatingImage.value = false
  }
}

const getShareText = () => {
  const count = currentMilestone.value?.toLocaleString('fr-FR')
  return `🎯 IOFD vient d'atteindre ${count} produits halal vérifiés !\n\nUne base de données ouverte pour faciliter les choix alimentaires de l'Ummah.\n`
}

const getShareUrl = () => `${window.location.origin}/achievements`

const shareOnTwitter = async () => {
  const text = encodeURIComponent(getShareText())
  const url = encodeURIComponent(getShareUrl())
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}

const shareOnLinkedIn = async () => {
  const text = getShareText()
  const url = getShareUrl()
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  await navigator.clipboard.writeText(text)
  showSnackbar('Texte copié ! Collez-le dans votre post LinkedIn.', 'info')
  window.open(linkedInUrl, '_blank')
}

const shareOnWhatsApp = () => {
  const text = encodeURIComponent(`${getShareText()}\n\n${getShareUrl()}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

const downloadImage = async () => {
  const blob = await generateShareImage()
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `iofd-milestone-${currentMilestone.value}.png`
  a.click()
  URL.revokeObjectURL(url)
  showSnackbar('Image téléchargée !', 'success')
}

const showSnackbar = (text: string, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(fetchProductCount)
</script>

<style scoped>
.app-bar-blur {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.8) !important;
}

.main-bg {
  background: linear-gradient(180deg,
      rgba(var(--v-theme-primary), 0.03) 0%,
      rgba(var(--v-theme-surface-variant), 1) 100%);
  min-height: 100vh;
}

.hero-section {
  padding-top: 1rem;
}

.hero-icon-wrapper {
  position: relative;
  display: inline-block;
}

.hero-icon {
  background: linear-gradient(135deg,
      rgb(var(--v-theme-primary)) 0%,
      rgba(var(--v-theme-primary), 0.7) 100%);
  position: relative;
  z-index: 1;
}

.hero-icon-glow {
  position: absolute;
  inset: -8px;
  background: rgb(var(--v-theme-primary));
  opacity: 0.2;
  border-radius: 50%;
  filter: blur(16px);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
}

.stats-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.stats-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right,
      rgba(var(--v-theme-primary), 0.08) 0%,
      transparent 60%);
}

.counter-value {
  font-size: clamp(3rem, 10vw, 5rem);
  font-weight: 900;
  background: linear-gradient(135deg,
      rgb(var(--v-theme-primary)) 0%,
      rgba(var(--v-theme-primary), 0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.tracking-wide {
  letter-spacing: 2px;
}

.custom-progress {
  height: 8px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.custom-progress-fill {
  height: 100%;
  background: linear-gradient(90deg,
      rgb(var(--v-theme-primary)) 0%,
      rgba(var(--v-theme-primary), 0.7) 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.share-section {
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  background: linear-gradient(135deg,
      rgba(var(--v-theme-success), 0.03) 0%,
      rgba(var(--v-theme-surface), 1) 100%);
}

.share-preview {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 2rem;
  max-width: 480px;
  margin: 0 auto;
}

.share-preview-content {
  text-align: center;
  color: white;
}

.share-preview-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.share-preview-number {
  font-size: 3.5rem;
  font-weight: 900;
  color: rgb(var(--v-theme-primary));
  line-height: 1.1;
}

.share-preview-label {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.share-preview-tagline {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.share-preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.5;
}

.share-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.share-btn {
  text-transform: none;
  font-weight: 600;
}

/* Timeline */
.timeline-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.milestones-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.milestone-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  padding: 1rem 0;
}

.milestone-connector {
  position: absolute;
  left: 15px;
  top: -0.5rem;
  width: 2px;
  height: calc(100% - 1rem);
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.milestone-item.achieved .milestone-connector {
  background: rgb(var(--v-theme-primary));
}

.milestone-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.1);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.milestone-item.achieved .milestone-dot {
  background: rgb(var(--v-theme-primary));
}

.milestone-item.current .milestone-dot {
  background: rgba(var(--v-theme-primary), 0.2);
  border: 2px solid rgb(var(--v-theme-primary));
}

.milestone-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.milestone-content {
  flex: 1;
  padding-top: 4px;
}

.milestone-value {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.milestone-item.achieved .milestone-value {
  color: rgb(var(--v-theme-primary));
}

.milestone-status {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  display: flex;
  align-items: center;
}
</style>