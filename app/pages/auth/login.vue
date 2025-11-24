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
            Bon retour !
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            Connectez-vous pour accéder à votre espace.
          </p>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="lg" class="mb-6" density="comfortable">
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleLogin">
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

          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-1">
              <label class="text-caption font-weight-bold text-medium-emphasis">Mot de passe</label>
              <a href="#" class="text-caption text-primary font-weight-bold text-decoration-none">Oublié ?</a>
            </div>
            <v-text-field v-model="password" placeholder="••••••••" type="password" variant="outlined" rounded="lg"
              density="comfortable" hide-details="auto" :rules="[rules.password]" required @keyup.enter="handleLogin"
              bg-color="surface" color="primary">
              <template #prepend-inner>
                <v-icon color="medium-emphasis" size="small">mdi-lock-outline</v-icon>
              </template>
            </v-text-field>
          </div>

          <v-btn type="submit" :loading="loading" color="primary" size="large" variant="flat" block rounded="lg"
            class="mb-6 text-none font-weight-bold" height="48" elevation="0">
            Se connecter
          </v-btn>

          <!-- <div class="d-flex align-center mb-6">
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
            Pas encore de compte ?
            <router-link to="/auth/signup" class="text-primary font-weight-bold text-decoration-none ml-1">
              Créer un compte
            </router-link>
          </p>
        </div>
      </div>
    </v-col>

    <v-col cols="12" md="6" lg="7" class="d-none d-md-flex position-relative bg-surface-variant overflow-hidden">
      <div class="auth-mesh-bg"></div>
      <div class="d-flex flex-column justify-end pa-12 position-relative z-1 fill-height text-white">
        <div class="glass-card pa-8 rounded-xl max-width-600">
          <div class="d-flex align-center mb-4">
            <v-avatar color="white" size="48" class="mr-4">
              <v-icon color="primary" size="28">mdi-format-quote-close</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">La transparence avant tout</div>
              <div class="text-caption opacity-80">Open Food Database</div>
            </div>
          </div>
          <p class="text-h5 font-weight-medium leading-relaxed">
            "Une base de données collaborative pour aider chacun à faire des choix alimentaires éclairés, en toute
            confiance."
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

const { signIn, loading } = useSupabaseAuth()
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
.auth-mesh-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(at 0% 0%, rgba(var(--v-theme-primary), 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(var(--v-theme-secondary), 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(var(--v-theme-primary), 0.6) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(var(--v-theme-secondary), 0.6) 0px, transparent 50%);
  background-color: rgb(var(--v-theme-surface-variant));
  filter: blur(80px);
  opacity: 0.8;
  animation: mesh-pulse 10s ease-in-out infinite alternate;
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
