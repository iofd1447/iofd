<template>
  <v-app-bar elevation="0" class="px-2 px-sm-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="$router.push('/')" />
    <v-app-bar-title class="text-subtitle-1 text-sm-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Profil</span>
    </v-app-bar-title>
    <v-spacer />
    <v-btn icon="mdi-logout" variant="text" color="error" size="small" @click="handleLogout">
      <v-tooltip activator="parent" location="bottom">Déconnexion</v-tooltip>
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>

  <v-main>
    <v-container v-if="!loading && !user" class="fill-height justify-center">
      <div class="text-center max-width-400">
        <v-avatar size="80" color="surface-variant" class="mb-6">
          <v-icon size="40" color="medium-emphasis">mdi-account-lock-outline</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-3">Accès restreint</h2>
        <p class="text-body-1 text-medium-emphasis mb-8">
          Connectez-vous pour accéder à votre profil et gérer vos contributions.
        </p>
        <v-btn color="primary" to="/auth/login" size="large" block rounded="lg" elevation="0">
          Se connecter
        </v-btn>
        <v-btn variant="text" to="/auth/signup" block rounded="lg" class="mt-4">
          Créer un compte
        </v-btn>
      </div>
    </v-container>

    <div v-else-if="user">
      <section class="profile-hero position-relative overflow-hidden pt-8 pb-12">
        <div class="hero-bg-mesh"></div>
        <v-container class="position-relative z-1">
          <div class="d-flex flex-column align-center text-center">
            <div class="position-relative mb-6">
              <v-avatar size="100" color="surface" class="elevation-2">
                <span class="text-h3 font-weight-black text-primary">{{ userInitials }}</span>
              </v-avatar>
              <v-chip :color="getRoleColor(userProfile.role)" size="small" variant="flat"
                class="position-absolute bottom-0 right-0 font-weight-bold border-2 border-surface">
                {{ getRoleLabel(userProfile.role) }}
              </v-chip>
            </div>

            <h1 class="text-h4 font-weight-bold mb-1">{{ userProfile.username || 'Utilisateur' }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-6">{{ user.email }}</p>

            <div class="d-flex gap-4 mb-8">
              <v-card v-for="stat in stats" :key="stat.label" class="px-6 py-3 d-flex flex-column align-center"
                elevation="0" rounded="xl" color="surface">
                <span class="text-h5 font-weight-black text-primary">{{ stat.value }}</span>
                <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">{{ stat.label }}</span>
              </v-card>
            </div>

            <div class="w-100 max-width-400 mb-4">
              <div class="d-flex justify-space-between text-caption font-weight-bold mb-1">
                <span>Niveau {{ userLevel }}</span>
                <span class="text-medium-emphasis">{{ nextLevelProgress }}%</span>
              </div>
              <v-progress-linear :model-value="nextLevelProgress" color="primary" height="8" rounded />
              <div class="text-caption text-medium-emphasis mt-2">
                Plus que {{ itemsToNextLevel }} contributions pour le niveau {{ userLevel + 1 }}
              </div>
            </div>
          </div>
        </v-container>
      </section>

      <v-container class="py-6" style="max-width: 900px;">
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="0" rounded="xl" class="h-100">
              <v-card-title class="d-flex align-center py-4 px-6">
                <v-icon start color="primary" class="mr-3">mdi-account-cog-outline</v-icon>
                Informations
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-6">
                <v-form @submit.prevent="saveProfile">
                  <div class="mb-4">
                    <label class="text-caption font-weight-bold text-medium-emphasis mb-1 d-block">Nom
                      d'utilisateur</label>
                    <v-text-field v-model="userProfile.username" variant="outlined" density="comfortable" hide-details
                      rounded="lg" bg-color="surface-variant-lighten">
                      <template #append-inner>
                        <v-icon size="small" color="medium-emphasis">mdi-pencil</v-icon>
                      </template>
                    </v-text-field>
                  </div>

                  <div class="mb-6">
                    <label class="text-caption font-weight-bold text-medium-emphasis mb-1 d-block">Membre depuis</label>
                    <div class="text-body-2 d-flex align-center text-medium-emphasis">
                      <v-icon start size="small" class="mr-2">mdi-calendar</v-icon>
                      {{ formatDate(user.created_at) }}
                    </div>
                  </div>

                  <v-btn type="submit" color="primary" variant="flat" block rounded="lg" :loading="saving">
                    Enregistrer les modifications
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="0" rounded="xl" class="h-100">
              <v-card-title class="d-flex align-center py-4 px-6">
                <v-icon start color="success" class="mr-3">mdi-flash-outline</v-icon>
                Actions rapides
              </v-card-title>
              <v-divider />
              <v-list class="pa-2">
                <v-list-item to="/products/add" rounded="lg" class="mb-1">
                  <template #prepend>
                    <v-avatar color="primary-lighten-5" class="mr-3">
                      <v-icon color="primary">mdi-plus</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">Ajouter un produit</v-list-item-title>
                  <v-list-item-subtitle>Contribuer à la base de données</v-list-item-subtitle>
                  <template #append>
                    <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>

                <v-list-item to="/contributions" rounded="lg">
                  <template #prepend>
                    <v-avatar color="secondary-lighten-5" class="mr-3">
                      <v-icon color="secondary">mdi-history</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">Mes contributions</v-list-item-title>
                  <v-list-item-subtitle>Voir l'historique de mes ajouts</v-list-item-subtitle>
                  <template #append>
                    <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider class="mx-4 my-2" />

              <div class="pa-4">
                <v-btn variant="text" color="error" block rounded="lg" class="justify-start px-4"
                  prepend-icon="mdi-delete-outline" @click="deleteAccountDialog = true">
                  Supprimer mon compte
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-main>

  <v-dialog v-model="logoutDialog" max-width="400">
    <v-card rounded="xl" elevation="0">
      <v-card-title class="text-h6 font-weight-bold pa-6 pb-2">
        Déconnexion
      </v-card-title>
      <v-card-text class="px-6 pb-6 text-medium-emphasis">
        Êtes-vous sûr de vouloir vous déconnecter ?
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="logoutDialog = false">Annuler</v-btn>
        <v-btn color="error" variant="flat" rounded="lg" @click="confirmLogout">Déconnexion</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteAccountDialog" max-width="500">
    <v-card rounded="xl" elevation="0">
      <v-card-title class="text-h6 font-weight-bold pa-6 pb-2 text-error d-flex align-center">
        <v-icon start class="mr-2">mdi-alert-circle-outline</v-icon>
        Supprimer le compte
      </v-card-title>
      <v-card-text class="px-6 pb-6">
        <p class="text-body-1 mb-4">Cette action est <strong>irréversible</strong>. Toutes vos données personnelles
          seront
          supprimées.</p>
        <v-alert type="warning" variant="tonal" rounded="lg" density="compact" class="mb-0">
          Vos contributions à la base de données (produits ajoutés) seront conservées mais anonymisées.
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="deleteAccountDialog = false">Annuler</v-btn>
        <v-btn color="error" variant="flat" rounded="lg" :loading="deleting" @click="confirmDeleteAccount">
          Supprimer définitivement
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

useHead({
  title: 'IOFD - Mon Profil'
})

const { user, fetchUser, signOut, loading, deleteAccount } = useSupabaseAuth()
const supabase = useSupabase()
const router = useRouter()

const saving = ref(false)
const logoutDialog = ref(false)
const deleteAccountDialog = ref(false)
const deleting = ref(false)

const stats = ref([
  { label: 'Produits', value: 0 },
  { label: 'Avis', value: 0 }
])

const userProfile = ref({
  username: '',
  role: 'user'
})

const totalStats = computed(() => {
  const products = stats.value[0]?.value || 0
  const reviews = stats.value[1]?.value || 0
  return products + reviews
})

const userLevel = computed(() => {
  const total = totalStats.value
  if (total >= 50) return 5
  if (total >= 30) return 4
  if (total >= 15) return 3
  if (total >= 5) return 2
  return 1
})

const itemsToNextLevel = computed(() => {
  const total = totalStats.value
  if (total >= 50) return 0
  if (total >= 30) return 50 - total
  if (total >= 15) return 30 - total
  if (total >= 5) return 15 - total
  return 5 - total
})

const nextLevelProgress = computed(() => {
  const total = totalStats.value
  const currentLevelBase = [0, 5, 15, 30, 50]
  const level = userLevel.value

  if (level >= 5) return 100

  const start = currentLevelBase[level - 1]
  const end = currentLevelBase[level]
  // @ts-ignore
  const progress = ((total - start) / (end - start)) * 100

  return Math.min(100, Math.max(0, Math.round(progress)))
})

const userInitials = computed(() => {
  if (userProfile.value.username) {
    return userProfile.value.username.substring(0, 2).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.substring(0, 2).toUpperCase()
  }
  return 'IO'
})

const formatDate = (date: string) => {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Admin',
    contributor: 'Contributeur',
    user: 'Membre'
  }
  return labels[role] || 'Membre'
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'error',
    contributor: 'primary',
    user: 'secondary'
  }
  return colors[role] || 'secondary'
}

const fetchStats = async () => {
  if (!user.value) return

  try {
    const userId = user.value.id
    const userEmail = user.value.email

    // Get contributions count
    const { count: contribCount } = await supabase
      .from('product_contributors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get reviews count
    const { count: reviewCount } = await supabase
      .from('community_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', userEmail)

    stats.value = [
      { label: 'Produits', value: contribCount || 0 },
      { label: 'Avis', value: reviewCount || 0 }
    ]

    // Get profile data
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      userProfile.value = {
        username: data.username || userEmail?.split('@')[0] || '',
        role: data.role || 'user'
      }
    } else {
      const username = userEmail?.split('@')[0] || 'User'
      await supabase.from('users').insert([{ id: userId, username, role: 'user' }])
      userProfile.value = { username, role: 'user' }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const saveProfile = async () => {
  if (!user.value) return
  saving.value = true

  try {
    const { error } = await supabase
      .from('users')
      .update({ username: userProfile.value.username })
      .eq('id', user.value.id)

    if (error) throw error

    await supabase.auth.updateUser({
      data: { full_name: userProfile.value.username }
    })

  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    saving.value = false
  }
}

const handleLogout = () => {
  logoutDialog.value = true
}

const confirmLogout = async () => {
  logoutDialog.value = false
  await signOut()
  router.push('/')
}

const confirmDeleteAccount = async () => {
  deleting.value = true
  try {
    await deleteAccount()
    deleteAccountDialog.value = false
    router.push('/')
  } catch (error) {
    console.error('Error deleting account:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await fetchUser()
  await fetchStats()
})
</script>

<style scoped>
.profile-hero {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
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

.border-2 {
  border-width: 2px !important;
}
.gap-4 {
  gap: 16px;
}
.bottom-0 {
  bottom: 0;
}
.right-0 {
  right: 0;
}
</style>
