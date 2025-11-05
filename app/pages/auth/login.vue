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
            <v-avatar size="80" color="primary" class="mb-4">
              <v-icon size="40" color="white">mdi-account-circle</v-icon>
            </v-avatar>
            <h1 class="text-h3 font-weight-bold mb-2">
              Bienvenue sur IOFD
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Connectez-vous pour accéder à la base de données
            </p>
          </div>

          <v-card elevation="4" rounded="xl" class="auth-card">
            <v-card-text class="pa-8">
              <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="lg" class="mb-6">
                {{ errorMessage }}
              </v-alert>

              <v-form @submit.prevent="handleLogin">
                <v-text-field v-model="email" label="Email" type="email" prepend-inner-icon="mdi-email"
                  variant="outlined" rounded="lg" density="comfortable" class="mb-4" :rules="[rules.email]" required
                  autofocus />

                <v-text-field v-model="password" label="Mot de passe" type="password" prepend-inner-icon="mdi-lock"
                  variant="outlined" rounded="lg" density="comfortable" class="mb-6" :rules="[rules.password]" required
                  @keyup.enter="handleLogin" />

                <v-btn type="submit" :loading="loading" @click="handleLogin" color="primary" size="large" variant="flat"
                  block rounded="lg" class="mb-4" prepend-icon="mdi-login">
                  Se connecter
                </v-btn>
              </v-form>

              <v-divider class="my-6" />

              <div class="text-center">
                <p class="text-body-2 text-medium-emphasis mb-2">
                  Pas encore de compte ?
                </p>
                <v-btn variant="text" color="primary" to="/auth/signup" prepend-icon="mdi-account-plus">
                  Créer un compte
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <div class="text-center mt-4">
            <v-btn variant="text" size="small" color="medium-emphasis">
              Mot de passe oublié ?
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { signIn, loading, fetchUser, syncUser } = useSupabaseAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const rules = {
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email invalide'
  },
  password: (value: string) => {
    return value.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères'
  }
}

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs'
    return
  }

  try {
    await signIn(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err.message || 'Erreur de connexion'
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
