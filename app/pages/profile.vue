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
    <v-container v-if="!loading && !user" class="text-center py-8 py-md-16" style="max-width: 900px;">
      <v-avatar size="80" size-md="100" color="error" class="mb-4 mb-md-6">
        <v-icon size="40" size-md="50" color="white">mdi-account-off</v-icon>
      </v-avatar>
      <h2 class="text-h6 text-md-h5 mb-3 mb-md-4">Non connecté</h2>
      <p class="text-body-2 text-md-subtitle-1 text-medium-emphasis mb-4 mb-md-6 px-4">
        Vous devez être connecté pour accéder à votre profil
      </p>
      <v-btn color="primary" to="/auth/login" prepend-icon="mdi-login" size="large" block class="mx-auto"
        style="max-width: 300px;">
        Se connecter
      </v-btn>
    </v-container>

    <v-container v-else-if="user" class="py-4 py-md-8" style="max-width: 900px;">
      <v-row class="mb-4 mb-md-8">
        <v-col cols="12">
          <v-card elevation="4" rounded="xl" class="profile-hero-card">
            <v-card-text class="pa-4 pa-md-8">
              <v-row align="center">
                <v-col cols="12" md="auto" class="text-center text-md-left">
                  <v-avatar size="80" size-md="120" color="primary" class="mb-4 mb-md-0">
                    <span class="text-h3 text-md-h2">{{ userInitials }}</span>
                  </v-avatar>
                </v-col>
                <v-col cols="12" md="8">
                  <div class="text-center text-md-left">
                    <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">
                      Mon profil
                    </h1>
                    <v-chip :color="getRoleColor(userProfile.role)" variant="flat" size="default" size-md="large"
                      prepend-icon="mdi-shield-check" class="mb-3 mb-md-4">
                      {{ getRoleLabel(userProfile.role) }}
                    </v-chip>
                    <p class="text-body-2 text-md-subtitle-1 text-medium-emphasis mb-2">
                      <v-icon start size="small">mdi-email</v-icon>
                      <span class="word-break">{{ user.email }}</span>
                    </p>
                    <p class="text-caption text-md-body-2 text-medium-emphasis">
                      <v-icon start size="small">mdi-calendar</v-icon>
                      Membre depuis {{ formatDate(user.created_at) }}
                    </p>
                  </div>
                </v-col>
                <v-col cols="12" md="auto" class="text-center text-md-right">
                  <div class="d-flex flex-column flex-md-row ga-2 justify-center justify-md-end">
                    <v-btn color="error" variant="text" prepend-icon="mdi-logout" @click="handleLogout">
                      Déconnexion
                    </v-btn>
                    <v-btn color="error" variant="outlined" prepend-icon="mdi-delete"
                      @click="deleteAccountDialog = true">
                      Supprimer le compte
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4 mb-md-8">
        <v-col v-for="stat in stats" :key="stat.label" cols="6" class="px-2 px-md-3">
          <v-card elevation="2" rounded="xl" class="stat-card h-100">
            <v-card-text class="text-center pa-4 pa-md-6">
              <v-avatar :color="stat.color" size="50" size-md="60" class="mb-2 mb-md-4">
                <v-icon :color="stat.iconColor" size="24" size-md="30">{{ stat.icon }}</v-icon>
              </v-avatar>
              <div class="stat-number mb-1 mb-md-2">{{ stat.value }}</div>
              <div class="stat-label text-medium-emphasis">{{ stat.label }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4 mb-md-0">
        <v-col cols="12" md="6" class="mb-4 mb-md-0">
          <v-card elevation="2" rounded="xl" class="h-100">
            <v-card-title class="d-flex align-center mb-2 mb-md-4 text-h6 text-md-h5">
              <v-icon start color="primary" size="20" size-md="24">mdi-account-edit</v-icon>
              <span class="text-body-1 text-md-h6">Informations personnelles</span>
            </v-card-title>
            <v-card-text class="pa-4 pa-md-6">
              <v-form>
                <v-text-field v-model="userProfile.username" label="Nom d'utilisateur" variant="outlined"
                  density="comfortable" rounded="lg" prepend-inner-icon="mdi-account" class="mb-3 mb-md-4" />
                <v-btn color="primary" block variant="flat" prepend-icon="mdi-content-save" :loading="saving"
                  @click="saveProfile" size="large">
                  Enregistrer
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="2" rounded="xl" class="h-100">
            <v-card-title class="d-flex align-center mb-2 mb-md-4 text-h6 text-md-h5">
              <v-icon start color="success" size="20" size-md="24">mdi-account-plus</v-icon>
              <span class="text-body-1 text-md-h6">Actions rapides</span>
            </v-card-title>
            <v-card-text class="pa-2 pa-md-4">
              <v-list bg-color="transparent" density="comfortable">
                <v-list-item prepend-icon="mdi-plus-circle" title="Ajouter un produit"
                  subtitle="Contribuez à la base de données" to="/products/add" variant="text" class="py-2" />
                <v-divider class="my-1" />
                <v-list-item prepend-icon="mdi-history" title="Mes contributions" subtitle="Historique de mes ajouts"
                  to="/contributions" variant="text" class="py-2" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card variant="tonal" color="primary" rounded="xl">
            <v-card-text class="pa-4 pa-md-6">
              <div class="d-flex flex-column flex-md-row align-start align-md-center">
                <v-icon size="32" size-md="40" start class="mb-2 mb-md-0">mdi-trophy</v-icon>
                <div class="flex-grow-1 mb-3 mb-md-0">
                  <h3 class="text-h6 text-md-h6 mb-1">Contributeur actif</h3>
                  <p class="text-body-2 mb-0">
                    Merci de contribuer à la croissance de la communauté IOFD !
                  </p>
                </div>
                <v-chip color="primary" size="default" size-md="large" prepend-icon="mdi-star" class="mt-auto mt-md-0">
                  Niveau {{ userLevel }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-dialog v-model="logoutDialog" max-width="400" :fullscreen="$vuetify.display.mobile">
    <v-card :rounded="$vuetify.display.mobile ? 't-xl' : 'xl'">
      <v-card-title class="text-h6 font-weight-bold pa-4 pa-md-6">
        Confirmer la déconnexion
      </v-card-title>
      <v-card-text class="pa-4 pa-md-6">
        Êtes-vous sûr de vouloir vous déconnecter ?
      </v-card-text>
      <v-card-actions class="pa-4 pa-md-6">
        <v-spacer />
        <v-btn variant="text" @click="logoutDialog = false" block class="d-md-inline-block mb-2 mb-md-0">
          Annuler
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmLogout" block class="d-md-inline-block">
          Déconnexion
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteAccountDialog" max-width="500" :fullscreen="$vuetify.display.mobile">
    <v-card :rounded="$vuetify.display.mobile ? 't-xl' : 'xl'">
      <v-card-title class="text-h6 font-weight-bold pa-4 pa-md-6">
        <v-icon color="error" start>mdi-alert-circle</v-icon>
        Supprimer définitivement mon compte
      </v-card-title>
      <v-card-text class="pa-4 pa-md-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">
          <strong>Attention : Cette action est irréversible !</strong>
        </v-alert>
        <p class="text-body-1 mb-2">
          La suppression de votre compte entraînera :
        </p>
        <v-list density="compact" bg-color="transparent">
          <v-list-item prepend-icon="mdi-delete" title="Suppression de votre profil utilisateur" />
          <v-list-item prepend-icon="mdi-delete" title="Suppression de toutes vos contributions" />
          <v-list-item prepend-icon="mdi-delete" title="Suppression de tous vos avis" />
          <v-list-item prepend-icon="mdi-delete" title="Suppression de votre historique" />
        </v-list>
        <p class="text-body-2 text-medium-emphasis mt-4">
          Êtes-vous absolument sûr de vouloir continuer ?
        </p>
      </v-card-text>
      <v-card-actions class="pa-4 pa-md-6">
        <v-spacer />
        <v-btn variant="text" @click="deleteAccountDialog = false" block class="d-md-inline-block mb-2 mb-md-0">
          Annuler
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmDeleteAccount" :loading="deleting" block
          class="d-md-inline-block">
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
  title: 'IOFD - Manage my account'
})

const { user, fetchUser, signOut, loading, deleteAccount, syncUser } = useSupabaseAuth()
const supabase = useSupabase()
const router = useRouter()

const saving = ref(false)

const logoutDialog = ref(false)
const deleteAccountDialog = ref(false)
const deleting = ref(false)
const stats = ref([
  { label: 'Produits ajoutés', value: 0, icon: 'mdi-plus-circle', color: 'primary', iconColor: 'white' },
  { label: 'Avis laissés', value: 0, icon: 'mdi-comment', color: 'secondary', iconColor: 'white' }
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
  if (isNaN(d.getTime())) return 'Date invalide'

  const hijriFormatter = new Intl.DateTimeFormat('fr-FR-u-ca-islamic', {
    year: 'numeric',
    month: 'long'
  })

  let formatted = hijriFormatter.format(d)

  formatted = formatted.replace(/\s?AH$/, '')

  return formatted
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

    const userIdInDB = user.value.id
    const userEmail = user.value.email || ''

    let contributions = 0
    let reviews = 0

    if (userIdInDB) {
      const { count: contribCount } = await supabase
        .from('product_contributors')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userIdInDB)

      const { count: reviewCount } = await supabase
        .from('community_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', userEmail)

      contributions = contribCount || 0
      reviews = reviewCount || 0

    }

    stats.value = [
      { label: 'Produits ajoutés', value: contributions || 0, icon: 'mdi-plus-circle', color: 'primary', iconColor: 'white' },
      { label: 'Avis laissés', value: reviews || 0, icon: 'mdi-comment', color: 'secondary', iconColor: 'white' }
    ]

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
    } else {
      await supabase.from('users').insert([{ id: user.value.id, username: user.value.email.split('@')[0], role: 'user' }])
      userProfile.value.username = user.value.email.split('@')[0]
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

const confirmDeleteAccount = async () => {
  deleting.value = true
  try {
    await deleteAccount()
    deleteAccountDialog.value = false
    router.push('/')
  } catch (error: any) {
    console.error('Erreur lors de la suppression du compte:', error)
    alert('Erreur lors de la suppression du compte. Veuillez réessayer.')
  } finally {
    deleting.value = false
  }
}

const saveProfile = async () => {
  if (!user.value) return
  saving.value = true
  try {
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (userError || !userRecord) throw userError || new Error('Utilisateur introuvable dans la table users')

    const { data, error } = await supabase
      .from('users')
      .update({ username: userProfile.value.username })
      .eq('id', userRecord.id)
      .select()

    if (error) throw error

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { full_name: userProfile.value.username }
    })

    if (metadataError) throw metadataError

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
  } finally {
    saving.value = false
  }
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
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
}

@media (min-width: 960px) {
  .stat-number {
    font-size: 2.5rem;
  }
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
}

@media (min-width: 960px) {
  .stat-label {
    font-size: 0.875rem;
  }
}

.word-break {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
