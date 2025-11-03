<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-2">• Profil</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container v-if="!loading && !user" class="text-center py-16">
      <v-avatar size="100" color="error" class="mb-6">
        <v-icon size="50" color="white">mdi-account-off</v-icon>
      </v-avatar>
      <h2 class="text-h5 mb-4">Non connecté</h2>
      <p class="text-medium-emphasis mb-6">
        Vous devez être connecté pour accéder à votre profil
      </p>
      <v-btn color="primary" to="/auth/login" prepend-icon="mdi-login" size="large">
        Se connecter
      </v-btn>
    </v-container>

    <v-container v-else-if="user" class="py-8">
      <!-- Hero Section -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="4" rounded="xl" class="profile-hero-card">
            <v-card-text class="pa-8">
              <v-row align="center">
                <v-col cols="12" md="auto" class="text-center">
                  <v-avatar size="120" color="primary" class="mb-4">
                    <span class="text-h2">{{ userInitials }}</span>
                  </v-avatar>
                </v-col>
                <v-col cols="12" md="8">
                  <h1 class="text-h4 font-weight-bold mb-2">
                    Mon profil
                  </h1>
                  <v-chip :color="getRoleColor(userProfile.role)" variant="flat" size="large"
                    prepend-icon="mdi-shield-check" class="mb-4">
                    {{ getRoleLabel(userProfile.role) }}
                  </v-chip>
                  <p class="text-subtitle-1 text-medium-emphasis mb-2">
                    <v-icon start size="small">mdi-email</v-icon>
                    {{ user.email }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis">
                    <v-icon start size="small">mdi-calendar</v-icon>
                    Membre depuis {{ formatDate(user.created_at) }}
                  </p>
                </v-col>
                <v-col cols="12" md="auto" class="text-center text-md-right">
                  <v-btn color="error" variant="text" prepend-icon="mdi-logout" @click="handleLogout">
                    Déconnexion
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Statistics Section -->
      <v-row class="mb-8">
        <v-col v-for="stat in stats" :key="stat.label" cols="6" md="4">
          <v-card elevation="2" rounded="xl" class="stat-card h-100">
            <v-card-text class="text-center pa-6">
              <v-avatar :color="stat.color" size="60" class="mb-4">
                <v-icon :color="stat.iconColor" size="30">{{ stat.icon }}</v-icon>
              </v-avatar>
              <div class="stat-number mb-2">{{ stat.value }}</div>
              <div class="stat-label text-medium-emphasis">{{ stat.label }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Actions Section -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="d-flex align-center mb-4">
              <v-icon start color="primary">mdi-account-edit</v-icon>
              Informations personnelles
            </v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field v-model="userProfile.username" label="Nom d'utilisateur" variant="outlined"
                  density="comfortable" rounded="lg" prepend-inner-icon="mdi-account" class="mb-4" />
                <v-btn color="primary" block variant="flat" prepend-icon="mdi-content-save">
                  Enregistrer les modifications
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="d-flex align-center mb-4">
              <v-icon start color="success">mdi-account-plus</v-icon>
              Actions rapides
            </v-card-title>
            <v-card-text>
              <v-list bg-color="transparent">
                <v-list-item prepend-icon="mdi-plus-circle" title="Ajouter un produit"
                  subtitle="Contribuez à la base de données" to="/products/add" variant="text" />
                <v-divider class="my-2" />
                <v-list-item prepend-icon="mdi-star" title="Mes favoris" subtitle="Produits sauvegardés" to="/favorites"
                  variant="text" />
                <v-divider class="my-2" />
                <v-list-item prepend-icon="mdi-history" title="Mes contributions" subtitle="Historique de mes ajouts"
                  to="/contributions" variant="text" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Community Badges -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card variant="tonal" color="primary" rounded="xl">
            <v-card-text class="pa-6">
              <div class="d-flex align-center">
                <v-icon size="40" start>mdi-trophy</v-icon>
                <div>
                  <h3 class="text-h6 mb-1">Contributeur actif</h3>
                  <p class="text-body-2 mb-0">
                    Merci de contribuer à la croissance de la communauté IOFD !
                  </p>
                </div>
                <v-spacer />
                <v-chip color="primary" size="large" prepend-icon="mdi-star">
                  Niveau {{ userLevel }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <!-- Logout Dialog -->
  <v-dialog v-model="logoutDialog" max-width="400">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold">
        Confirmer la déconnexion
      </v-card-title>
      <v-card-text>
        Êtes-vous sûr de vouloir vous déconnecter ?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="logoutDialog = false">
          Annuler
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmLogout">
          Déconnexion
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

const { user, fetchUser, signOut, loading } = useSupabaseAuth()
const supabase = useSupabase()
const router = useRouter()

const logoutDialog = ref(false)
const stats = ref([
  { label: 'Produits ajoutés', value: 0, icon: 'mdi-plus-circle', color: 'primary', iconColor: 'white' },
  { label: 'Avis laissés', value: 0, icon: 'mdi-comment', color: 'secondary', iconColor: 'white' },
  { label: 'Favoris', value: 0, icon: 'mdi-heart', color: 'error', iconColor: 'white' }
])

const userProfile = ref({
  username: '',
  role: 'user'
})

const userLevel = computed(() => {
  const contributions = stats.value[0]?.value || 0
  if (contributions >= 50) return 5
  if (contributions >= 30) return 4
  if (contributions >= 15) return 3
  if (contributions >= 5) return 2
  return 1
})

const userInitials = computed(() => {
  if (user.value?.email) {
    return user.value.email.substring(0, 2).toUpperCase()
  }
  return 'IO'
})

const formatDate = (date: string) => {
  if (!date) return 'Date inconnue'
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    contributor: 'Contributeur',
    user: 'Utilisateur'
  }
  return labels[role] || 'Utilisateur'
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
    // Compter les contributions
    const { count: contributions } = await supabase
      .from('product_contributors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)

    // Compter les avis
    const { count: reviews } = await supabase
      .from('community_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)

    stats.value = [
      { label: 'Produits ajoutés', value: contributions || 0, icon: 'mdi-plus-circle', color: 'primary', iconColor: 'white' },
      { label: 'Avis laissés', value: reviews || 0, icon: 'mdi-comment', color: 'secondary', iconColor: 'white' },
      { label: 'Favoris', value: 0, icon: 'mdi-heart', color: 'error', iconColor: 'white' }
    ]

    // Récupérer le profil utilisateur
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (data) {
      userProfile.value = {
        username: data.username || '',
        role: data.role || 'user'
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

onMounted(async () => {
  await fetchUser()
  await fetchStats()
})

const handleLogout = () => {
  logoutDialog.value = true
}

const confirmLogout = async () => {
  logoutDialog.value = false
  await signOut()
  router.push('/')
}
</script>

<style scoped>
.profile-hero-card {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(38, 198, 218, 0.08) 100%);
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
