<template>
  <v-app-bar elevation="0" class="px-2 px-sm-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.push('/profile')" />
    <v-app-bar-title class="text-subtitle-1 text-sm-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Historique</span>
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container v-if="!loading && !user" class="fill-height justify-center">
      <div class="text-center max-width-400">
        <v-avatar size="80" color="surface-variant" class="mb-6">
          <v-icon size="40" color="medium-emphasis">mdi-history</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-3">Historique inaccessible</h2>
        <p class="text-body-1 text-medium-emphasis mb-8">
          Connectez-vous pour consulter l'historique de vos contributions.
        </p>
        <v-btn color="primary" to="/auth/login" size="large" block rounded="lg" elevation="0">
          Se connecter
        </v-btn>
      </div>
    </v-container>

    <div v-else-if="user">
      <section class="contributions-hero position-relative overflow-hidden pt-8 pb-8">
        <div class="hero-bg-mesh"></div>
        <v-container class="position-relative z-1 text-center">
          <v-chip color="secondary" variant="tonal" size="small" class="mb-4 font-weight-bold">
            <v-icon start size="small">mdi-trophy-outline</v-icon>
            Impact
          </v-chip>
          <h1 class="text-h4 font-weight-black mb-2">Mes Contributions</h1>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Votre impact sur la communauté IOFD en chiffres.
          </p>

          <div class="d-flex justify-center gap-4 mb-2 mt-4">
            <div class="text-center px-4">
              <div class="text-h4 font-weight-black text-primary">{{ contributions.length }}</div>
              <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Produits</div>
            </div>
            <v-divider vertical />
            <div class="text-center px-4">
              <div class="text-h4 font-weight-black text-secondary">{{ reviews.length }}</div>
              <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Avis</div>
            </div>
          </div>
        </v-container>
      </section>

      <v-container class="py-0" style="max-width: 800px;">
        <v-tabs v-model="activeTab" align-tabs="center" color="primary" class="mb-6 bg-surface rounded-xl border"
          height="48">
          <v-tab value="contributions" class="text-none px-8" rounded="xl">Contributions</v-tab>
          <v-tab value="reviews" class="text-none px-8" rounded="xl">Avis</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="contributions">
            <div v-if="loading" class="py-8">
              <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-avatar-two-line"
                class="mb-4 rounded-xl border" />
            </div>

            <div v-else-if="contributions.length === 0" class="text-center py-12">
              <v-icon size="64" color="surface-variant" class="mb-4">mdi-package-variant-closed</v-icon>
              <h3 class="text-h6 font-weight-bold mb-2">Aucune contribution</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">Vous n'avez pas encore ajouté de produits.</p>
              <v-btn color="primary" to="/products/add" prepend-icon="mdi-plus" rounded="lg" elevation="0">
                Ajouter un produit
              </v-btn>
            </div>

            <div v-else class="timeline-container">
              <div v-for="(item, i) in contributions" :key="item.id" class="timeline-item d-flex mb-6">
                <div class="d-flex flex-column align-center mr-4 pt-2">
                  <div class="timeline-dot bg-primary rounded-circle"></div>
                  <div v-if="i < contributions.length - 1" class="timeline-line bg-surface-variant flex-grow-1 my-2"
                    style="width: 2px;"></div>
                </div>

                <v-card elevation="0" rounded="xl" class="flex-grow-1 overflow-hidden"
                  :to="item.product ? `/products/${item.product.id}` : undefined">
                  <div class="d-flex">
                    <v-img v-if="item.product?.image_url" :src="item.product.image_url" width="80" height="100%" cover
                      class="bg-surface-variant d-none d-sm-block" />

                    <div class="pa-4 flex-grow-1">
                      <div class="d-flex justify-space-between align-start mb-1">
                        <div class="d-flex align-center gap-2">
                          <v-chip size="x-small" :color="getChangeTypeColor(item.change_type)" variant="flat"
                            class="font-weight-bold text-uppercase">
                            {{ getChangeTypeLabel(item.change_type) }}
                          </v-chip>
                          <span class="text-caption text-medium-emphasis">{{ formatHijriDate(item.created_at) }}</span>
                        </div>
                      </div>

                      <h3 class="text-subtitle-1 font-weight-bold mb-1">
                        {{ item.product?.name || 'Produit supprimé' }}
                      </h3>

                      <div v-if="item.product" class="d-flex align-center gap-2">
                        <span class="text-caption text-medium-emphasis">{{ item.product.brand }}</span>
                        <span class="text-caption text-disabled">•</span>
                        <span class="text-caption text-medium-emphasis">{{ item.product.barcode }}</span>
                      </div>
                    </div>

                    <div class="d-flex align-center px-4">
                      <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
                    </div>
                  </div>
                </v-card>
              </div>
            </div>
          </v-window-item>

          <v-window-item value="reviews">
            <div v-if="loadingReviews" class="py-8">
              <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-avatar-two-line"
                class="mb-4 rounded-xl border" />
            </div>

            <div v-else-if="reviews.length === 0" class="text-center py-12">
              <v-icon size="64" color="surface-variant" class="mb-4">mdi-comment-outline</v-icon>
              <h3 class="text-h6 font-weight-bold mb-2">Aucun avis</h3>
              <p class="text-body-2 text-medium-emphasis">Vous n'avez pas encore donné votre avis.</p>
            </div>

            <div v-else class="d-flex flex-column gap-4">
              <v-card v-for="review in reviews" :key="review.id" elevation="0" border rounded="xl"
                :to="review.product ? `/products/${review.product.id}` : undefined">
                <div class="pa-4">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="d-flex align-center gap-2">
                      <v-avatar size="24" :color="getHalalColor(review.halal_vote)" variant="tonal">
                        <v-icon size="14">{{ getHalalIcon(review.halal_vote) }}</v-icon>
                      </v-avatar>
                      <span class="text-caption font-weight-bold" :class="`text-${getHalalColor(review.halal_vote)}`">
                        {{ getHalalLabel(review.halal_vote) }}
                      </span>
                      <span class="text-caption text-medium-emphasis">• {{ formatDate(review.created_at) }}</span>
                    </div>
                    <v-rating :model-value="review.rating" readonly density="compact" size="small" color="amber"
                      half-increments />
                  </div>

                  <h3 class="text-subtitle-1 font-weight-bold mb-1">
                    {{ review.product?.name || 'Produit inconnu' }}
                  </h3>

                  <p v-if="review.comment"
                    class="text-body-2 text-medium-emphasis bg-surface-variant-lighten pa-3 rounded-lg mt-2">
                    "{{ review.comment }}"
                  </p>
                </div>
              </v-card>
            </div>
          </v-window-item>
        </v-window>
      </v-container>
    </div>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { onMounted, ref } from 'vue'
import { formatHijriDate } from '@/utils/function'

useHead({
  title: 'IOFD - Mes Contributions'
})

const { user, fetchUser } = useSupabaseAuth()
const supabase = useSupabase()

const loading = ref(true)
const loadingReviews = ref(true)
const activeTab = ref('contributions')
const contributions = ref<any[]>([])
const reviews = ref<any[]>([])

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  }

  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const getChangeTypeLabel = (type: string) => {
  const map: Record<string, string> = { create: 'Ajout', update: 'Modif', delete: 'Suppr' }
  return map[type] || type
}

const getChangeTypeColor = (type: string) => {
  const map: Record<string, string> = { create: 'success', update: 'info', delete: 'error' }
  return map[type] || 'grey'
}

const getHalalColor = (status: string) => {
  const map: Record<string, string> = { halal: 'success', mashbuh: 'warning', haram: 'error' }
  return map[status] || 'grey'
}

const getHalalLabel = (status: string) => {
  const map: Record<string, string> = { halal: 'Halal', mashbuh: 'Douteux', haram: 'Haram' }
  return map[status] || '?'
}

const getHalalIcon = (status: string) => {
  const map: Record<string, string> = { halal: 'mdi-check', mashbuh: 'mdi-help', haram: 'mdi-close' }
  return map[status] || 'mdi-help'
}

const fetchData = async () => {
  if (!user.value) return

  loading.value = true
  const { data: contribs } = await supabase
    .from('product_contributors')
    .select('*, product:products(id, name, brand, barcode, image_url)')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  contributions.value = contribs || []
  loading.value = false

  loadingReviews.value = true
  const { data: revs } = await supabase
    .from('community_reviews')
    .select('*, product:products(id, name, brand)')
    .or(`user_email.eq.${user.value.email},user_id.eq.${user.value.id}`)
    .order('created_at', { ascending: false })

  reviews.value = revs || []
  loadingReviews.value = false
}

onMounted(async () => {
  await fetchUser()
  await fetchData()
})
</script>

<style scoped>
.contributions-hero {
  background: linear-gradient(135deg, rgba(var(--v-theme-secondary), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.hero-bg-mesh {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(var(--v-theme-secondary), 0.1) 0%, transparent 50%);
  filter: blur(60px);
  z-index: 0;
}

.z-1 {
  z-index: 1;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border: 2px solid rgb(var(--v-theme-surface));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}
</style>
