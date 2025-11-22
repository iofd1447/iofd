<template>
  <v-dialog v-model="isOpen" :fullscreen="$vuetify.display.xs" max-width="500" persistent>
    <v-card rounded="xl">

      <v-toolbar color="primary" density="compact">
        <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
        <v-toolbar-title>Scanner le code-barres</v-toolbar-title>
        <v-spacer />
      </v-toolbar>

      <v-card-text class="pa-0">
        <div class="scanner-container">

          <div v-if="isInitializing" class="state-container">
            <v-progress-circular indeterminate color="primary" size="64" />
            <div class="text-h6 mt-4">Initialisation...</div>
          </div>

          <div v-else-if="error" class="state-container">
            <v-icon size="80" color="error">mdi-camera-off</v-icon>
            <div class="text-h6 mt-4">{{ error }}</div>
            <v-btn color="primary" variant="tonal" class="mt-4" @click="initScanner">Réessayer</v-btn>
          </div>

          <div v-else class="video-wrapper">
            <div ref="scannerEl" class="scanner-view"></div>

            <div class="scan-status">
              <v-chip v-if="!detectedBarcode" color="white" size="large">
                <v-icon start color="primary">mdi-target</v-icon>
                Alignez le code-barres
              </v-chip>

              <v-chip v-else color="success" size="large" class="success-chip">
                <v-icon start>mdi-check-circle</v-icon>
                {{ detectedBarcode }}
              </v-chip>
            </div>
          </div>

          <div class="manual-section pa-4">
            <div class="text-caption text-center text-medium-emphasis mb-3">
              Ou saisissez manuellement
            </div>
            <v-text-field v-model="manualBarcode" label="Code-barres" prepend-inner-icon="mdi-barcode" hide-details
              placeholder="3017620422003" density="compact" variant="outlined" inputmode="numeric"
              @keyup.enter="submitManual">
              <template #append-inner>
                <v-btn icon="mdi-arrow-right" variant="text" color="primary" size="small"
                  :disabled="!isValidBarcode(manualBarcode)" @click="submitManual" />
              </template>
            </v-text-field>
          </div>

        </div>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
let Quagga: any
if (process.client) {
  Quagga = (await import('@ericblade/quagga2')).default
}

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'detected', code: string): void
}>()

const isOpen = ref(false)
const isInitializing = ref(false)
const error = ref('')
const detectedBarcode = ref('')
const manualBarcode = ref('')
const scannerEl = ref<HTMLElement | null>(null)

let quaggaRunning = false

watch(() => props.modelValue, async (v) => {
  isOpen.value = v
  if (v) {
    await nextTick()
    initScanner()
  } else {
    stopScanner()
  }
})

watch(isOpen, (v) => emit('update:modelValue', v))

async function initScanner() {
  error.value = ''
  detectedBarcode.value = ''
  isInitializing.value = true

  try {
    await Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        // @ts-ignore
        target: scannerEl.value,
        constraints: { facingMode: "environment" }
      },
      decoder: {
        readers: ["ean_reader", "ean_8_reader"]
      },
      locate: true
    }, (err: any) => {
      if (err) {
        error.value = err.message || "Erreur lors de l'accès à la caméra"
        isInitializing.value = false
        return
      }
      Quagga.start()
      quaggaRunning = true
      isInitializing.value = false
    })

    Quagga.onDetected(onDetected)

  } catch (e: any) {
    error.value = e.message || "Impossible d'initialiser le scanner"
    isInitializing.value = false
  }
}

function onDetected(result: any) {
  if (!result?.codeResult?.code) return
  const code = result.codeResult.code
  detectedBarcode.value = code
  navigator.vibrate?.(100)

  setTimeout(() => {
    emit('detected', code)
    close()
  }, 600)
}

function stopScanner() {
  if (quaggaRunning) {
    Quagga.stop()
    quaggaRunning = false
  }
  detectedBarcode.value = ''
}

function close() {
  stopScanner()
  isOpen.value = false
}

function isValidBarcode(code: string) {
  return /^\d{8,13}$/.test((code || '').replace(/\D/g, ''))
}

function submitManual() {
  if (!isValidBarcode(manualBarcode.value)) return
  emit('detected', manualBarcode.value.replace(/\D/g, ''))
  close()
}

onUnmounted(stopScanner)
</script>

<style scoped>
.scanner-container {
  background: #000;
  min-height: 350px;
}
.video-wrapper {
  position: relative;
  height: 300px;
  overflow: hidden;
}
.scanner-view {
  width: 100%;
  height: 100%;
}
.scan-status {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}
.success-chip {
  animation: pop 0.3s ease-out;
}
@keyframes pop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: white;
}
</style>
