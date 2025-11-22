<template>
  <v-dialog v-model="isOpen" :fullscreen="$vuetify.display.xs" max-width="500" persistent>
    <v-card rounded="xl">
      <v-toolbar color="primary" density="compact">
        <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
        <v-toolbar-title>Scanner le code-barres</v-toolbar-title>
        <v-spacer />
        <v-btn v-if="hasFlash" icon @click="toggleFlash">
          <v-icon>{{ flashOn ? 'mdi-flash' : 'mdi-flash-off' }}</v-icon>
        </v-btn>
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

          <div v-show="!isInitializing && !error" class="video-wrapper">
            <video ref="videoEl" class="scanner-video" autoplay playsinline muted />
            <canvas ref="canvasEl" class="scanner-canvas" />

            <!-- Ligne de scan au centre -->
            <div class="scan-line-container">
              <div class="scan-target" :class="{ detected: detectedBarcode }">
                <div class="corner tl" />
                <div class="corner tr" />
                <div class="corner bl" />
                <div class="corner br" />
              </div>
              <div v-if="!detectedBarcode" class="scan-laser" />
            </div>

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

            <!-- Debug info -->
            <div v-if="debugMode" class="debug-info">
              <div>Scans: {{ scanCount }}</div>
              <div>Last: {{ lastPattern?.substring(0, 30) }}...</div>
            </div>
          </div>

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

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'detected', barcode: string): void
}>()

const isOpen = ref(false)
const isInitializing = ref(false)
const error = ref('')
const detectedBarcode = ref('')
const manualBarcode = ref('')
const hasFlash = ref(false)
const flashOn = ref(false)
const debugMode = ref(false)
const scanCount = ref(0)
const lastPattern = ref('')

const videoEl = ref<HTMLVideoElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let stream: MediaStream | null = null
let animationId: number | null = null
let ctx: CanvasRenderingContext2D | null = null

const codeBuffer: string[] = []
const CONFIRMATIONS_NEEDED = 2

const L_PATTERNS = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011'
]
const G_PATTERNS = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111'
]
const R_PATTERNS = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100'
]

const FIRST_DIGIT_ENCODING = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
]

function decodeEAN13(binaryLine: string): string | null {
  const startIdx = binaryLine.indexOf('101')
  if (startIdx === -1 || startIdx > 50) return null

  let pos = startIdx + 3

  const leftDigits: number[] = []
  const leftPatternTypes: string[] = []

  for (let i = 0; i < 6; i++) {
    const pattern = binaryLine.substring(pos, pos + 7)
    if (pattern.length < 7) return null

    let found = false
    for (let d = 0; d < 10; d++) {
      if (pattern === L_PATTERNS[d]) {
        leftDigits.push(d)
        leftPatternTypes.push('L')
        found = true
        break
      }
      if (pattern === G_PATTERNS[d]) {
        leftDigits.push(d)
        leftPatternTypes.push('G')
        found = true
        break
      }
    }
    if (!found) return null
    pos += 7
  }

  const middle = binaryLine.substring(pos, pos + 5)
  if (middle !== '01010') return null
  pos += 5

  const rightDigits: number[] = []
  for (let i = 0; i < 6; i++) {
    const pattern = binaryLine.substring(pos, pos + 7)
    if (pattern.length < 7) return null

    let found = false
    for (let d = 0; d < 10; d++) {
      if (pattern === R_PATTERNS[d]) {
        rightDigits.push(d)
        found = true
        break
      }
    }
    if (!found) return null
    pos += 7
  }

  const patternStr = leftPatternTypes.join('')
  let firstDigit = -1
  for (let d = 0; d < 10; d++) {
    if (patternStr === FIRST_DIGIT_ENCODING[d]) {
      firstDigit = d
      break
    }
  }
  if (firstDigit === -1) return null

  const code = [firstDigit, ...leftDigits, ...rightDigits].join('')

  if (!validateEAN13Checksum(code)) return null

  return code
}

function validateEAN13Checksum(code: string): boolean {
  if (code.length !== 13) return false
  let sum = 0
  for (let i = 0; i < 12; i++) {
    // @ts-ignore
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const check = (10 - (sum % 10)) % 10
  // @ts-ignore
  return check === parseInt(code[12])
}

function extractScanLine(imageData: ImageData, y: number): number[] {
  const { data, width } = imageData
  const line: number[] = []

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4
    // @ts-ignore
    const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
    line.push(gray)
  }
  return line
}

function binarizeLine(line: number[]): string {
  const sorted = [...line].sort((a, b) => a - b)
  const low = sorted[Math.floor(sorted.length * 0.1)]
  const high = sorted[Math.floor(sorted.length * 0.9)]
  // @ts-ignore
  const threshold = (low + high) / 2

  return line.map(v => v < threshold ? '1' : '0').join('')
}

function normalizeBarWidths(binary: string): string {
  const runs: { char: string; len: number }[] = []
  let currentChar = binary[0]
  let currentLen = 1

  for (let i = 1; i < binary.length; i++) {
    if (binary[i] === currentChar) {
      currentLen++
    } else {
      // @ts-ignore
      runs.push({ char: currentChar, len: currentLen })
      currentChar = binary[i]
      currentLen = 1
    }
  }
  // @ts-ignore
  runs.push({ char: currentChar, len: currentLen })

  const lengths = runs.map(r => r.len).filter(l => l > 2)
  if (lengths.length === 0) return ''

  lengths.sort((a, b) => a - b)
  const unitWidth = lengths[Math.floor(lengths.length * 0.1)] || lengths[0]

  let normalized = ''
  for (const run of runs) {
    // @ts-ignore
    const units = Math.round(run.len / unitWidth)
    normalized += run.char.repeat(Math.max(1, Math.min(units, 4)))
  }

  return normalized
}

function scanFrame() {
  if (!videoEl.value || !canvasEl.value || !ctx) return
  if (detectedBarcode.value) return

  const video = videoEl.value
  if (video.readyState < 2) {
    animationId = requestAnimationFrame(scanFrame)
    return
  }

  const canvas = canvasEl.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0)

  const centerY = Math.floor(canvas.height / 2)
  const scanLines = [-20, -10, 0, 10, 20].map(offset => centerY + offset)

  for (const y of scanLines) {
    if (y < 0 || y >= canvas.height) continue

    const imageData = ctx.getImageData(0, y, canvas.width, 1)
    const grayLine = extractScanLine(imageData, 0)
    const binary = binarizeLine(grayLine)
    const normalized = normalizeBarWidths(binary)

    lastPattern.value = normalized
    scanCount.value++

    const code = decodeEAN13(normalized)

    if (code) {
      codeBuffer.push(code)
      if (codeBuffer.length > 10) codeBuffer.shift()

      const count = codeBuffer.filter(c => c === code).length
      if (count >= CONFIRMATIONS_NEEDED) {
        handleDetected(code)
        return
      }
    }

    const inverted = normalized.split('').map(c => c === '0' ? '1' : '0').join('')
    const codeInv = decodeEAN13(inverted)
    if (codeInv) {
      codeBuffer.push(codeInv)
      if (codeBuffer.length > 10) codeBuffer.shift()
      const count = codeBuffer.filter(c => c === codeInv).length
      if (count >= CONFIRMATIONS_NEEDED) {
        handleDetected(codeInv)
        return
      }
    }
  }

  animationId = requestAnimationFrame(scanFrame)
}

function handleDetected(code: string) {
  detectedBarcode.value = code
  navigator.vibrate?.(100)
  playBeep()

  setTimeout(() => {
    emit('detected', code)
    close()
  }, 800)
}

function playBeep() {
  try {
    const actx = new AudioContext()
    const osc = actx.createOscillator()
    const gain = actx.createGain()
    osc.connect(gain)
    gain.connect(actx.destination)
    osc.frequency.value = 1200
    gain.gain.value = 0.1
    osc.start()
    osc.stop(actx.currentTime + 0.1)
  } catch { }
}

watch(() => props.modelValue, async (v) => {
  isOpen.value = v
  if (v) {
    await nextTick()
    setTimeout(initScanner, 200)
  } else {
    stopScanner()
  }
})

watch(isOpen, (v) => emit('update:modelValue', v))

async function initScanner() {
  error.value = ''
  isInitializing.value = true
  detectedBarcode.value = ''
  codeBuffer.length = 0
  scanCount.value = 0

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    })

    const track = stream.getVideoTracks()[0]
    // @ts-ignore
    const caps = track.getCapabilities?.() as any
    hasFlash.value = !!caps?.torch

    await nextTick()
    if (!videoEl.value || !canvasEl.value) throw new Error('Elements not found')

    videoEl.value.srcObject = stream
    await videoEl.value.play()

    ctx = canvasEl.value.getContext('2d', { willReadFrequently: true })

    isInitializing.value = false
    animationId = requestAnimationFrame(scanFrame)

  } catch (err: any) {
    isInitializing.value = false
    error.value = err.message || 'Impossible d\'accéder à la caméra'
  }
}

async function toggleFlash() {
  if (!stream) return
  flashOn.value = !flashOn.value
  try {
    // @ts-ignore
    await stream.getVideoTracks()[0].applyConstraints({
      advanced: [{ torch: flashOn.value } as any]
    })
  } catch { }
}

function isValidBarcode(code: string) {
  return /^\d{8,13}$/.test((code || '').replace(/\D/g, ''))
}

function submitManual() {
  if (!isValidBarcode(manualBarcode.value)) return
  emit('detected', manualBarcode.value.replace(/\D/g, ''))
  close()
}

function stopScanner() {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  if (videoEl.value) videoEl.value.srcObject = null
  detectedBarcode.value = ''
  codeBuffer.length = 0
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
}
.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scanner-canvas {
  display: none;
}

.scan-line-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-target {
  width: 260px;
  height: 100px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  position: relative;
  transition: all 0.3s;
}
.scan-target.detected {
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid #69f0ae;
}
.corner.tl {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}
.corner.tr {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}
.corner.bl {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}
.corner.br {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.scan-laser {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 240px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f44336, #f44336, transparent);
  box-shadow: 0 0 10px #f44336;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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
}
.manual-section {
  background: rgb(var(--v-theme-surface));
}

.debug-info {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #0f0;
  font-family: monospace;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .video-wrapper {
    height: 280px;
  }
  .scan-target {
    width: 220px;
    height: 80px;
  }
  .scan-laser {
    width: 200px;
  }
}
</style>