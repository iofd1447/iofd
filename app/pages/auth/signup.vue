<template>
  <v-row no-gutters class="fill-height">
    <v-col cols="12" md="6" lg="5" class="d-flex flex-column bg-surface position-relative">
      <div class="pa-6 pa-md-12 d-flex flex-column flex-grow-1 justify-center">
        <div class="mb-8">
          <div class="d-flex align-center mb-6 cursor-pointer" @click="$router.push('/')">
            <v-icon color="primary" size="32" class="mr-2">mdi-cube-outline</v-icon>
            <span class="text-h5 font-weight-black text-primary">IOFD</span>
          </div>

          <h1 class="text-h3 font-weight-bold mb-2 text-on-surface">
            Rejoignez-nous
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            Créez votre compte pour contribuer à la base de données.
          </p>
        </div>

        <v-alert v-if="successMessage" type="success" variant="tonal" rounded="lg" class="mb-6" density="comfortable">
          {{ successMessage }}
        </v-alert>

        <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="lg" class="mb-6" density="comfortable">
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleSignUp">
          <div class="mb-4">
            <label class="text-caption font-weight-bold text-medium-emphasis mb-1 d-block">Email</label>
            <v-text-field v-model="email" placeholder="nom@exemple.com" type="email" variant="outlined" rounded="lg"
              density="comfortable" hide-details="auto" :rules="[rules.email]" required autofocus bg-color="surface"
              color="primary">
              <template #prepend-inner>
                <v-icon color="medium-emphasis" size="small">mdi-email-outline</v-icon>
              </template>
            </v-text-field>
          </div>

          <div class="mb-4">
            <label class="text-caption font-weight-bold text-medium-emphasis mb-1 d-block">Mot de passe</label>
            <v-text-field v-model="password" placeholder="••••••••" type="password" variant="outlined" rounded="lg"
              density="comfortable" hide-details="auto" :rules="[rules.password]" required hint="Au moins 6 caractères"
              persistent-hint bg-color="surface" color="primary">
              <template #prepend-inner>
                <v-icon color="medium-emphasis" size="small">mdi-lock-outline</v-icon>
              </template>
            </v-text-field>
          </div>

          <div class="mb-6">
            <label class="text-caption font-weight-bold text-medium-emphasis mb-1 d-block">Confirmer le mot de
              passe</label>
            <v-text-field v-model="confirmPassword" placeholder="••••••••" type="password" variant="outlined"
              rounded="lg" density="comfortable" hide-details="auto" :rules="[rules.confirmPassword]" required
              @keyup.enter="handleSignUp" bg-color="surface" color="primary">
              <template #prepend-inner>
                <v-icon color="medium-emphasis" size="small">mdi-lock-check-outline</v-icon>
              </template>
            </v-text-field>
          </div>

          <v-btn type="submit" :loading="loading" color="primary" size="large" variant="flat" block rounded="lg"
            class="mb-6 text-none font-weight-bold" height="48" elevation="0">
            Créer mon compte
          </v-btn>

          <!--<div class="d-flex align-center mb-6">
            <v-divider class="flex-grow-1" />
            <span class="text-caption text-medium-emphasis mx-4">OU</span>
            <v-divider class="flex-grow-1" />
          </div>

          <div class="d-flex gap-3 mb-8">
            <v-btn variant="outlined" block rounded="lg" color="medium-emphasis" class="text-none" height="44">
              <v-icon start>mdi-google</v-icon>
              Google
            </v-btn>
          </div>
        -->
        </v-form>

        <div class="text-center mt-auto">
          <p class="text-body-2 text-medium-emphasis">
            Déjà un compte ?
            <router-link to="/auth/login" class="text-primary font-weight-bold text-decoration-none ml-1">
              Se connecter
            </router-link>
          </p>
          <p class="text-caption text-disabled mt-4">
            En vous inscrivant, vous acceptez nos <a href="#" class="text-disabled">Conditions d'utilisation</a>.
          </p>
        </div>
      </div>
    </v-col>

    <v-col cols="12" md="6" lg="7" class="d-none d-md-flex position-relative bg-surface-variant overflow-hidden">
      <div class="auth-mesh-bg-signup"></div>
      <div class="d-flex flex-column justify-end pa-12 position-relative z-1 fill-height text-white">
        <div class="glass-card pa-8 rounded-xl max-width-600">
          <div class="d-flex align-center mb-4">
            <v-avatar color="white" size="48" class="mr-4">
              <v-icon color="success" size="28">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">Communauté active</div>
              <div class="text-caption opacity-80">Rejoignez la communauté IOFD</div>
            </div>
          </div>
          <p class="text-h5 font-weight-medium leading-relaxed">
            "Ensemble, construisons la base de données alimentaire la plus fiable et accessible pour la communauté."
          </p>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'blank'
})

useHead({
  title: 'Inscription - IOFD',
  meta: [
    { name: 'description', content: 'Inscrivez-vous pour accéder à votre espace.' },
    { name: 'keywords', content: 'inscription, IOFD, Open Food Database' }
  ]
})

const { signUp, loading } = useSupabaseAuth()
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
    successMessage.value = 'Inscription réussie ! Redirection...'

    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Erreur lors de l\'inscription'
  }
}
</script>

<style scoped>
.auth-mesh-bg-signup {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(at 100% 0%, rgba(var(--v-theme-success), 0.6) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(var(--v-theme-primary), 0.6) 0px, transparent 50%),
    radial-gradient(at 0% 0%, rgba(var(--v-theme-info), 0.4) 0px, transparent 50%);
  background-color: rgb(var(--v-theme-surface-variant));
  filter: blur(80px);
  opacity: 0.8;
  animation: mesh-pulse 12s ease-in-out infinite alternate-reverse;
}

@keyframes mesh-pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.z-1 {
  z-index: 1;
}
.gap-3 {
  gap: 12px;
}
.leading-relaxed {
  line-height: 1.6;
}
.opacity-80 {
  opacity: 0.8;
}
</style>
