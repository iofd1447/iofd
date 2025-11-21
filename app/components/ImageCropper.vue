<template>
  <v-dialog v-model="dialog" fullscreen persistent>
    <v-card class="d-flex flex-column" style="height: 100vh;">
      <v-toolbar color="primary" density="compact">
        <v-btn icon @click="cancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Sélectionner la zone</v-toolbar-title>
        <v-spacer />
        <v-btn variant="text" @click="resetCrop">
          <v-icon left>mdi-refresh</v-icon>
          Reset
        </v-btn>
      </v-toolbar>

      <v-card-text class="flex-grow-1 pa-0 d-flex align-center justify-center"
        style="background: #1a1a1a; overflow: hidden;">
        <div ref="containerRef" class="crop-container" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag"
          @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">

          <img ref="imageRef" :src="imageSrc" class="crop-image" @load="onImageLoad" draggable="false" />

          <div class="crop-overlay">
            <svg width="100%" height="100%">
              <defs>
                <mask id="cropMask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect :x="cropArea.x" :y="cropArea.y" :width="cropArea.width" :height="cropArea.height"
                    fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cropMask)" />
            </svg>
          </div>

          <div class="crop-box" :style="cropBoxStyle">->
            <div class="crop-handle nw" @mousedown.stop="startResize('nw', $event)"
              @touchstart.stop="startResize('nw', $event)"></div>
            <div class="crop-handle ne" @mousedown.stop="startResize('ne', $event)"
              @touchstart.stop="startResize('ne', $event)"></div>
            <div class="crop-handle sw" @mousedown.stop="startResize('sw', $event)"
              @touchstart.stop="startResize('sw', $event)"></div>
            <div class="crop-handle se" @mousedown.stop="startResize('se', $event)"
              @touchstart.stop="startResize('se', $event)"></div>

            <div class="crop-grid">
              <div class="grid-line horizontal" style="top: 33.33%"></div>
              <div class="grid-line horizontal" style="top: 66.66%"></div>
              <div class="grid-line vertical" style="left: 33.33%"></div>
              <div class="grid-line vertical" style="left: 66.66%"></div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4" style="background: #1a1a1a;">
        <v-btn variant="outlined" color="white" @click="cancel" size="large">
          Annuler
        </v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="confirmCrop" size="large">
          <v-icon left>mdi-crop</v-icon>
          Valider la sélection
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  imageSrc: string
}>()

const emit = defineEmits(['update:modelValue', 'crop'])

const dialog = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const containerRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

const imageSize = ref({ width: 0, height: 0 })
const cropArea = ref({ x: 50, y: 50, width: 200, height: 150 })

const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref('')
const dragStart = ref({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })

const cropBoxStyle = computed(() => ({
  left: `${cropArea.value.x}px`,
  top: `${cropArea.value.y}px`,
  width: `${cropArea.value.width}px`,
  height: `${cropArea.value.height}px`
}))

function onImageLoad() {
  if (!imageRef.value || !containerRef.value) return

  const img = imageRef.value
  const container = containerRef.value

  const containerRect = container.getBoundingClientRect()
  const imgRatio = img.naturalWidth / img.naturalHeight
  const containerRatio = containerRect.width / containerRect.height

  let displayWidth, displayHeight
  if (imgRatio > containerRatio) {
    displayWidth = containerRect.width
    displayHeight = containerRect.width / imgRatio
  } else {
    displayHeight = containerRect.height
    displayWidth = containerRect.height * imgRatio
  }

  imageSize.value = { width: displayWidth, height: displayHeight }

  const margin = 0.2
  cropArea.value = {
    x: displayWidth * margin,
    y: displayHeight * margin,
    width: displayWidth * (1 - 2 * margin),
    height: displayHeight * (1 - 2 * margin)
  }
}

function getEventPos(e: MouseEvent | TouchEvent) {
  if ('touches' in e) {
    // @ts-ignore
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  return { x: e.clientX, y: e.clientY }
}

function startDrag(e: MouseEvent | TouchEvent) {
  if (isResizing.value) return
  const pos = getEventPos(e)
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  const relX = pos.x - rect.left
  const relY = pos.y - rect.top

  if (relX >= cropArea.value.x && relX <= cropArea.value.x + cropArea.value.width &&
    relY >= cropArea.value.y && relY <= cropArea.value.y + cropArea.value.height) {
    isDragging.value = true
    dragStart.value = {
      x: pos.x, y: pos.y,
      cropX: cropArea.value.x, cropY: cropArea.value.y,
      cropW: cropArea.value.width, cropH: cropArea.value.height
    }
  }
}

function startResize(handle: string, e: MouseEvent | TouchEvent) {
  isResizing.value = true
  resizeHandle.value = handle
  const pos = getEventPos(e)
  dragStart.value = {
    x: pos.x, y: pos.y,
    cropX: cropArea.value.x, cropY: cropArea.value.y,
    cropW: cropArea.value.width, cropH: cropArea.value.height
  }
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value && !isResizing.value) return
  e.preventDefault()

  const pos = getEventPos(e)
  const dx = pos.x - dragStart.value.x
  const dy = pos.y - dragStart.value.y

  if (isDragging.value) {
    cropArea.value.x = Math.max(0, Math.min(
      imageSize.value.width - cropArea.value.width,
      dragStart.value.cropX + dx
    ))
    cropArea.value.y = Math.max(0, Math.min(
      imageSize.value.height - cropArea.value.height,
      dragStart.value.cropY + dy
    ))
  } else if (isResizing.value) {
    const minSize = 50
    const h = resizeHandle.value

    if (h.includes('e')) {
      cropArea.value.width = Math.max(minSize,
        Math.min(imageSize.value.width - cropArea.value.x, dragStart.value.cropW + dx))
    }
    if (h.includes('w')) {
      const newX = dragStart.value.cropX + dx
      const newW = dragStart.value.cropW - dx
      if (newW >= minSize && newX >= 0) {
        cropArea.value.x = newX
        cropArea.value.width = newW
      }
    }
    if (h.includes('s')) {
      cropArea.value.height = Math.max(minSize,
        Math.min(imageSize.value.height - cropArea.value.y, dragStart.value.cropH + dy))
    }
    if (h.includes('n')) {
      const newY = dragStart.value.cropY + dy
      const newH = dragStart.value.cropH - dy
      if (newH >= minSize && newY >= 0) {
        cropArea.value.y = newY
        cropArea.value.height = newH
      }
    }
  }
}

function endDrag() {
  isDragging.value = false
  isResizing.value = false
}

function resetCrop() {
  onImageLoad()
}

function cancel() {
  dialog.value = false
}

async function confirmCrop() {
  if (!imageRef.value) return

  const img = imageRef.value
  const scaleX = img.naturalWidth / imageSize.value.width
  const scaleY = img.naturalHeight / imageSize.value.height

  const realCrop = {
    x: cropArea.value.x * scaleX,
    y: cropArea.value.y * scaleY,
    width: cropArea.value.width * scaleX,
    height: cropArea.value.height * scaleY
  }

  const canvas = document.createElement('canvas')
  canvas.width = realCrop.width
  canvas.height = realCrop.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img,
    realCrop.x, realCrop.y, realCrop.width, realCrop.height,
    0, 0, realCrop.width, realCrop.height
  )

  const croppedDataUrl = canvas.toDataURL('image/png')
  emit('crop', croppedDataUrl)
  dialog.value = false
}
</script>

<style scoped>
.crop-container {
  position: relative;
  display: inline-block;
  user-select: none;
  touch-action: none;
}

.crop-image {
  max-width: 100%;
  max-height: calc(100vh - 140px);
  display: block;
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 2px solid #2196F3;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0);
  cursor: move;
}

.crop-handle {
  position: absolute;
  width: 24px;
  height: 24px;
  background: #2196F3;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 10;
}

.crop-handle.nw {
  top: -12px;
  left: -12px;
  cursor: nw-resize;
}
.crop-handle.ne {
  top: -12px;
  right: -12px;
  cursor: ne-resize;
}
.crop-handle.sw {
  bottom: -12px;
  left: -12px;
  cursor: sw-resize;
}
.crop-handle.se {
  bottom: -12px;
  right: -12px;
  cursor: se-resize;
}

.crop-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.grid-line.horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.grid-line.vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}
</style>