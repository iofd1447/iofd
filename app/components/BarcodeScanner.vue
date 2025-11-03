<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card rounded="xl">
      <!-- Header -->
      <v-card-title class="pa-6 d-flex align-center">
        <v-icon class="mr-3" color="primary" size="32">mdi-barcode-scan</v-icon>
        <div>
          <div class="text-h6 font-weight-bold">Scanner le code-barres</div>
          <div class="text-caption text-medium-emphasis">Placez le code-barres devant la caméra</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-divider />

      <!-- Scanner Area -->
      <v-card-text class="pa-0">
        <div class="scanner-container">
          <!-- Video Preview -->
          <div v-if="!error && (isScanning || detectedBarcode)" class="video-wrapper">
            <video ref="videoElement" class="scanner-video" autoplay playsinline muted />

            <!-- Scanning Overlay -->
            <div class="scanner-overlay">
              <div class="scan-region">
                <div class="corner corner-tl" />
                <div class="corner corner-tr" />
                <div class="corner corner-bl" />
                <div class="corner corner-br" />
                <div class="scan-line" :class="{ 'scanning': isScanning }" />
              </div>

              <!-- Instructions -->
              <div class="scan-instructions">
                <v-chip v-if="!detectedBarcode" color="primary" variant="flat" size="large" class="instruction-chip">
                  <v-icon start>mdi-target</v-icon>
                  Alignez le code-barres
                </v-chip>

                <!-- Success Message -->
                <v-chip v-else color="success" variant="flat" size="large" class="instruction-chip success-chip">
                  <v-icon start>mdi-check-circle</v-icon>
                  Code détecté !
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="isInitializing" class="loading-state">
            <v-progress-circular indeterminate color="primary" size="64" width="6" class="mb-4" />
            <div class="text-h6 mb-2">Initialisation...</div>
            <div class="text-body-2 text-medium-emphasis">
              Autorisation de la caméra requise
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <v-icon size="80" color="error" class="mb-4">mdi-camera-off</v-icon>
            <div class="text-h6 mb-2">Caméra non disponible</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ error }}
            </div>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="initScanner">
              Réessayer
            </v-btn>
          </div>

          <!-- Manual Input Fallback -->
          <div class="manual-input-section pa-6">
            <v-divider class="mb-4" />
            <div class="text-subtitle-2 mb-3 text-center text-medium-emphasis">
              Ou saisissez le code manuellement
            </div>
            <v-text-field v-model="manualBarcode" label="Code-barres (13 chiffres)" prepend-inner-icon="mdi-barcode"
              placeholder="3017620422003" hide-details density="comfortable" @keyup.enter="submitManualBarcode">
              <template #append-inner>
                <v-btn icon="mdi-check" variant="text" color="primary" :disabled="!isValidBarcode(manualBarcode)"
                  @click="submitManualBarcode" />
              </template>
            </v-text-field>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-btn variant="text" prepend-icon="mdi-keyboard" @click="focusManualInput">
          Saisie manuelle
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close">
          Annuler
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'detected', barcode: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isOpen = ref(false)
const isInitializing = ref(false)
const isScanning = ref(false)
const error = ref('')
const detectedBarcode = ref('')
const manualBarcode = ref('')

// Refs
const videoElement = ref<HTMLVideoElement | null>(null)
const codeReader = ref<BrowserMultiFormatReader | null>(null)
const stream = ref<MediaStream | null>(null)

// Watch for dialog open/close
watch(() => props.modelValue, (value) => {
  isOpen.value = value
  if (value) {
    initScanner()
  } else {
    stopScanner()
  }
})

watch(isOpen, (value) => {
  emit('update:modelValue', value)
})

// Initialize scanner
const initScanner = async () => {
  error.value = ''
  isInitializing.value = true
  detectedBarcode.value = ''

  try {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra')
    }

    // Request camera permission
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })

    // Set video source
    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
      await videoElement.value.play()
    }

    // Initialize ZXing reader
    codeReader.value = new BrowserMultiFormatReader()
    isScanning.value = true

    // Start continuous scanning
    startContinuousScanning()

  } catch (err: any) {
    console.error('Scanner initialization error:', err)

    if (err.name === 'NotAllowedError') {
      error.value = 'Autorisation de la caméra refusée. Veuillez autoriser l\'accès dans les paramètres.'
    } else if (err.name === 'NotFoundError') {
      error.value = 'Aucune caméra trouvée sur cet appareil.'
    } else if (err.name === 'NotReadableError') {
      error.value = 'La caméra est déjà utilisée par une autre application.'
    } else {
      error.value = err.message || 'Impossible d\'accéder à la caméra.'
    }
  } finally {
    isInitializing.value = false
  }
}

// Continuous scanning loop
const startContinuousScanning = () => {
  if (!codeReader.value || !videoElement.value || !isScanning.value) return

  const scanFrame = async () => {
    if (!isScanning.value || !videoElement.value) return

    try {
      const result = await codeReader.value!.decodeFromVideoElement(videoElement.value)

      if (result) {
        const barcode = result.getText()

        // Validate barcode (must be 13 digits for EAN-13)
        if (isValidBarcode(barcode)) {
          handleBarcodeDetected(barcode)
          return // Stop scanning after successful detection
        }
      }
    } catch (err) {
      // NotFoundException is normal when no barcode is in frame
      if (!(err instanceof NotFoundException)) {
        console.error('Scan error:', err)
      }
    }

    // Continue scanning
    if (isScanning.value) {
      requestAnimationFrame(scanFrame)
    }
  }

  scanFrame()
}

// Handle barcode detection
const handleBarcodeDetected = (barcode: string) => {
  detectedBarcode.value = barcode
  isScanning.value = false

  // Vibrate if supported
  if (navigator.vibrate) {
    navigator.vibrate(200)
  }

  // Play success sound (optional)
  playSuccessSound()

  // Emit after a short delay to show success animation
  setTimeout(() => {
    emit('detected', barcode)
    close()
  }, 1000)
}

// Validate barcode format
const isValidBarcode = (barcode: string): boolean => {
  const cleaned = barcode.replace(/\D/g, '')
  return cleaned.length === 13 || cleaned.length === 8 // EAN-13 or EAN-8
}

// Submit manual barcode
const submitManualBarcode = () => {
  if (isValidBarcode(manualBarcode.value)) {
    const cleaned = manualBarcode.value.replace(/\D/g, '')
    emit('detected', cleaned)
    close()
  }
}

// Focus manual input
const focusManualInput = () => {
  // Find and focus the input field
  setTimeout(() => {
    const input = document.querySelector('input[placeholder="3017620422003"]') as HTMLInputElement
    input?.focus()
  }, 100)
}

// Play success sound
const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.1

    oscillator.start()

    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      oscillator.stop(audioContext.currentTime + 0.1)
    }, 50)
  } catch (err) {
    // Sound not critical, ignore errors
  }
}

// Stop scanner and cleanup
const stopScanner = () => {
  isScanning.value = false

  // Stop video stream
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }

  // Clear video element
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }

  // Reset code reader
  if (codeReader.value) {
    codeReader.value.reset()
    codeReader.value = null
  }

  // Reset state
  detectedBarcode.value = ''
  manualBarcode.value = ''
  error.value = ''
}

// Close dialog
const close = () => {
  stopScanner()
  isOpen.value = false
}

// Cleanup on unmount
onUnmounted(() => {
  stopScanner()
})
</script>

<style scoped>
.scanner-container {
  position: relative;
  background: #000;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: #000;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-region {
  position: relative;
  width: 280px;
  height: 140px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #69f0ae;
  border-style: solid;
}

.corner-tl {
  top: -2px;
  left: -2px;
  border-width: 4px 0 0 4px;
  border-radius: 12px 0 0 0;
}

.corner-tr {
  top: -2px;
  right: -2px;
  border-width: 4px 4px 0 0;
  border-radius: 0 12px 0 0;
}

.corner-bl {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 12px;
}

.corner-br {
  bottom: -2px;
  right: -2px;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 12px 0;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #69f0ae, transparent);
  box-shadow: 0 0 10px #69f0ae;
  opacity: 0;
}

.scan-line.scanning {
  animation: scanning 2s ease-in-out infinite;
  opacity: 1;
}

@keyframes scanning {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(137px);
  }
}

.scan-instructions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.instruction-chip {
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.success-chip {
  animation: successPop 0.5s ease-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes successPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.manual-input-section {
  background: rgba(var(--v-theme-surface), 1);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .video-wrapper {
    height: 300px;
  }

  .scan-region {
    width: 240px;
    height: 120px;
  }

  .loading-state,
  .error-state {
    min-height: 300px;
  }
}

/* Dark mode adjustments */
.v-theme--dark .scan-region {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
}

.v-theme--dark .corner {
  border-color: #18ffff;
}

.v-theme--dark .scan-line {
  background: linear-gradient(90deg, transparent, #18ffff, transparent);
  box-shadow: 0 0 10px #18ffff;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .scan-line.scanning {
    animation: none;
    opacity: 0.5;
  }

  .instruction-chip {
    animation: none;
  }
}
</style>