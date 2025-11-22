<template>
  <v-dialog v-model="isOpen" :fullscreen="$vuetify.display.xs" max-width="500" persistent>
    <v-card rounded="xl">
      <v-toolbar color="primary" density="compact">
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Scanner le code-barres</v-toolbar-title>
        <v-spacer />
        <v-btn v-if="hasFlash" icon @click="toggleFlash">
          <v-icon>{{ flashOn ? 'mdi-flash' : 'mdi-flash-off' }}</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-0">
        <div class="scanner-container">

          <!-- Loading -->
          <div v-if="isInitializing" class="state-container">
            <v-progress-circular indeterminate color="primary" size="64" />
            <div class="text-h6 mt-4">Initialisation...</div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="state-container">
            <v-icon size="80" color="error">mdi-camera-off</v-icon>
            <div class="text-h6 mt-4">{{ error.title }}</div>
            <div class="text-body-2 text-medium-emphasis mb-4">{{ error.message }}</div>
            <v-btn color="primary" variant="tonal" @click="initScanner">Réessayer</v-btn>
          </div>

          <!-- Video - TOUJOURS RENDU mais caché si loading/error -->
          <div v-show="!isInitializing && !error" class="video-wrapper">
            <video ref="videoElement" class="scanner-video" autoplay playsinline muted @loadedmetadata="onVideoReady"
              @playing="onVideoPlaying" />

            <!-- Overlay seulement quand vidéo prête -->
            <div v-if="videoReady" class="scanner-overlay">
              <div class="scan-region" :class="{ 'detected': detectedBarcode }">
                <div class="corner corner-tl" />
                <div class="corner corner-tr" />
                <div class="corner corner-bl" />
                <div class="corner corner-br" />
                <div v-if="!detectedBarcode" class="scan-line scanning" />
              </div>

              <div class="scan-status">
                <v-chip v-if="!detectedBarcode" color="white" variant="flat" size="large">
                  <v-icon start color="primary">mdi-target</v-icon>
                  Alignez le code-barres
                </v-chip>
                <v-chip v-else color="success" variant="flat" size="large" class="success-chip">
                  <v-icon start>mdi-check-circle</v-icon>
                  {{ detectedBarcode }}
                </v-chip>
              </div>
            </div>

            <!-- Loading overlay pendant que la vidéo charge -->
            <div v-if="!videoReady && !isInitializing" class="video-loading">
              <v-progress-circular indeterminate color="white" size="48" />
              <div class="text-white mt-2">Chargement caméra...</div>
            </div>
          </div>

          <!-- Manual Input -->
          <div class="manual-section pa-4">
            <div class="text-caption text-center text-medium-emphasis mb-3">
              Ou saisissez manuellement
            </div>
            <v-text-field v-model="manualBarcode" label="Code-barres" prepend-inner-icon="mdi-barcode"
              placeholder="3017620422003" hide-details density="compact" variant="outlined" inputmode="numeric"
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
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'detected', barcode: string): void
}>()

const isOpen = ref(false)
const isInitializing = ref(false)
const videoReady = ref(false)  // NOUVEAU: track si vidéo affiche bien
const error = ref<{ title: string; message: string } | null>(null)
const detectedBarcode = ref('')
const manualBarcode = ref('')
const hasFlash = ref(false)
const flashOn = ref(false)

const videoElement = ref<HTMLVideoElement | null>(null)
const codeReader = ref<BrowserMultiFormatReader | null>(null)
const stream = ref<MediaStream | null>(null)
let scanInterval: number | null = null

watch(() => props.modelValue, async (v) => {
  isOpen.value = v
  if (v) {
    await nextTick()
    // Petit délai pour laisser le DOM se rendre
    setTimeout(() => initScanner(), 100)
  } else {
    stopScanner()
  }
})

watch(isOpen, (v) => emit('update:modelValue', v))

// Quand la vidéo a ses métadonnées
function onVideoReady() {
  console.log('Video metadata loaded')
}

// Quand la vidéo commence vraiment à jouer
function onVideoPlaying() {
  console.log('Video is playing')
  videoReady.value = true
  // Démarrer le scan seulement quand la vidéo joue
  startScanning()
}

async function initScanner() {
  error.value = null
  isInitializing.value = true
  videoReady.value = false
  detectedBarcode.value = ''

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw { name: 'NotSupported' }
    }

    // D'abord obtenir le stream
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 }
      }
    })

    const track = stream.value.getVideoTracks()[0]
    // @ts-ignore
    const caps = track.getCapabilities?.() as any
    hasFlash.value = !!caps?.torch

    await nextTick()

    if (!videoElement.value) {
      console.error('Video element not found!')
      throw { name: 'NotFound', message: 'Element video introuvable' }
    }

    videoElement.value.srcObject = stream.value

    try {
      await videoElement.value.play()
      console.log('Video play() success')
    } catch (playErr) {
      console.error('Play error:', playErr)
    }

    codeReader.value = new BrowserMultiFormatReader()

    isInitializing.value = false

  } catch (err: any) {
    console.error('Init error:', err)
    isInitializing.value = false

    const errors: Record<string, { title: string; message: string }> = {
      NotAllowedError: { title: 'Accès refusé', message: 'Autorisez la caméra dans les paramètres' },
      NotFoundError: { title: 'Caméra introuvable', message: 'Aucune caméra détectée' },
      NotReadableError: { title: 'Caméra occupée', message: 'Fermez les autres apps utilisant la caméra' },
      NotSupported: { title: 'Non supporté', message: 'Navigateur incompatible' },
      OverconstrainedError: { title: 'Caméra incompatible', message: 'Résolution non supportée' }
    }
    error.value = errors[err.name] || { title: 'Erreur', message: err.message || String(err) }
  }
}

function startScanning() {
  if (!codeReader.value || !videoElement.value || scanInterval) return

  console.log('Starting barcode scanning...')

  scanInterval = window.setInterval(async () => {
    if (!codeReader.value || !videoElement.value || detectedBarcode.value) return

    if (videoElement.value.readyState < 2) return

    try {
      const result = await codeReader.value.decodeFromVideoElement(videoElement.value)
      if (result) {
        handleDetected(result.getText())
      }
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        console.warn('Scan error:', err)
      }
    }
  }, 200)
}

function handleDetected(barcode: string) {
  if (!barcode || detectedBarcode.value) return

  console.log('Barcode detected:', barcode)
  detectedBarcode.value = barcode

  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }

  navigator.vibrate?.(100)
  playBeep()

  setTimeout(() => {
    emit('detected', barcode)
    close()
  }, 800)
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 1200
    gain.gain.value = 0.1
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch { }
}

async function toggleFlash() {
  if (!stream.value) return
  const track = stream.value.getVideoTracks()[0]
  flashOn.value = !flashOn.value
  try {
    // @ts-ignore
    await track.applyConstraints({ advanced: [{ torch: flashOn.value } as any] })
  } catch (e) {
    console.warn('Flash toggle failed:', e)
  }
}

function isValidBarcode(code: string): boolean {
  const clean = (code || '').replace(/\D/g, '')
  return [8, 10, 12, 13].includes(clean.length)
}

function submitManual() {
  if (!isValidBarcode(manualBarcode.value)) return
  emit('detected', manualBarcode.value.replace(/\D/g, ''))
  close()
}

function stopScanner() {

  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }

  if (stream.value) {
    stream.value.getTracks().forEach(t => {
      t.stop()
    })
    stream.value = null
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }

  codeReader.value?.reset()
  codeReader.value = null

  videoReady.value = false
  detectedBarcode.value = ''
  manualBarcode.value = ''
  flashOn.value = false
}

function close() {
  stopScanner()
  isOpen.value = false
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
  background: #000;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* FIX iOS: forcer l'affichage */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.video-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-region {
  position: relative;
  width: 260px;
  height: 120px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.scan-region.detected {
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #69f0ae;
  border-style: solid;
}
.corner-tl {
  top: -2px;
  left: -2px;
  border-width: 3px 0 0 3px;
  border-radius: 8px 0 0 0;
}
.corner-tr {
  top: -2px;
  right: -2px;
  border-width: 3px 3px 0 0;
  border-radius: 0 8px 0 0;
}
.corner-bl {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 3px 3px;
  border-radius: 0 0 0 8px;
}
.corner-br {
  bottom: -2px;
  right: -2px;
  border-width: 0 3px 3px 0;
  border-radius: 0 0 8px 0;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #69f0ae, transparent);
  box-shadow: 0 0 8px #69f0ae;
}
.scan-line.scanning {
  animation: scan 1.5s ease-in-out infinite;
}

@keyframes scan {
  0%,
  100% {
    top: 0;
  }
  50% {
    top: calc(100% - 2px);
  }
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
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  background: rgb(var(--v-theme-surface));
}

.manual-section {
  background: rgb(var(--v-theme-surface));
}

@media (max-width: 600px) {
  .video-wrapper {
    height: 280px;
  }
  .scan-region {
    width: 220px;
    height: 100px;
  }
}
</style>