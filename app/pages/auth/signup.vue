<template>
  <v-app-bar elevation="0" class="px-4" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/')" />
    <v-app-bar-title class="text-h6 font-weight-bold">
      <span class="text-primary">IOFD</span>
    </v-app-bar-title>
    <v-spacer />
  </v-app-bar>

  <v-main>
    <v-container class="auth-container">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" md="8" lg="6" xl="5">
          <div class="text-center mb-8">
            <v-avatar size="80" color="success" class="mb-4">
              <v-icon size="40" color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <h1 class="text-h3 font-weight-bold mb-2">
              Rejoignez la communauté
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Contribuez à la base de données islamique
            </p>
          </div>

          <v-card elevation="4" rounded="xl" class="auth-card">
            <v-card-text class="pa-8">
              <v-alert v-if="successMessage" type="success" variant="tonal" rounded="lg" class="mb-6">
                {{ successMessage }}
              </v-alert>

              <v-form @submit.prevent="handleSignUp">
                <v-text-field v-model="email" label="Email" type="email" prepend-inner-icon="mdi-email"
                  variant="outlined" rounded="lg" density="comfortable" class="mb-4" :rules="[rules.email]" required
                  autofocus />

                <v-text-field v-model="password" label="Mot de passe" type="password" prepend-inner-icon="mdi-lock"
                  variant="outlined" rounded="lg" density="comfortable" class="mb-4" :rules="[rules.password]" required
                  hint="Au moins 6 caractères" persistent-hint />

                <v-text-field v-model="confirmPassword" label="Confirmer le mot de passe" type="password"
                  prepend-inner-icon="mdi-lock-check" variant="outlined" rounded="lg" density="comfortable" class="mb-6"
                  :rules="[rules.confirmPassword]" required @keyup.enter="handleSignUp" />

                <v-btn type="submit" :loading="loading" @click="handleSignUp" color="primary" size="large"
                  variant="flat" block rounded="lg" class="mb-4" prepend-icon="mdi-account-plus">
                  Créer mon compte
                </v-btn>
              </v-form>

              <v-divider class="my-6" />

              <div class="text-center">
                <p class="text-body-2 text-medium-emphasis mb-2">
                  Déjà un compte ?
                </p>
                <v-btn variant="text" color="primary" to="/auth/login" prepend-icon="mdi-login">
                  Se connecter
                </v-btn>
              </div>

              <v-divider class="my-6" />

              <div class="text-center">
                <p class="text-caption text-medium-emphasis">
                  En créant un compte, vous acceptez nos conditions d'utilisation
                </p>
              </div>
            </v-card-text>
          </v-card>

          <v-card variant="tonal" color="info" rounded="xl" class="mt-4">
            <v-card-text class="text-center pa-4">
              <v-icon start color="info">mdi-information</v-icon>
              <span class="text-body-2">
                Un email de confirmation vous sera envoyé après l'inscription
              </span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { signUp, loading, fetchUser, syncUser } = useSupabaseAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const rules = {
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email invalide'
  },
  password: (value: string) => {
    return value.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères'
  },
  confirmPassword: (value: string) => {
    return value === password.value || 'Les mots de passe ne correspondent pas'
  }
}

const handleSignUp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Veuillez remplir tous les champs'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    await signUp(email.value, password.value)
    successMessage.value = 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'

    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Erreur lors de l\'inscription'
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
}

.auth-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-card:hover {
  transform: translateY(-4px);
}
</style>
