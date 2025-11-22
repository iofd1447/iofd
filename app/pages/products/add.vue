<template>
  <v-app-bar elevation="0" :class="['px-2 px-sm-4']" color="surface">
    <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="goBack" />

    <v-app-bar-title :class="['text-subtitle-1 text-sm-h6 font-weight-bold']">
      <span class="text-primary">IOFD</span>
      <span class="text-medium-emphasis ml-1 ml-sm-2 d-none d-sm-inline">• Nouveau produit</span>
    </v-app-bar-title>

    <v-spacer />
    <v-btn icon="mdi-help-circle-outline" variant="text" size="small" @click="showHelp = true" />
  </v-app-bar>

  <v-main>
    <section class="hero-section">
      <v-container class="py-4 py-sm-6" style="max-width: 900px;">
        <div class="text-center mb-4 mb-sm-6">
          <v-chip color="primary" variant="tonal" :size="$vuetify.display.xs ? 'default' : 'large'"
            class="mb-3 mb-sm-4">
            <v-icon start :size="$vuetify.display.xs ? '18' : '20'">mdi-plus-circle</v-icon>
            <span class="d-none d-sm-inline">Contribution communautaire</span>
            <span class="d-inline d-sm-none">Contribuer</span>
          </v-chip>
          <h1 class="hero-title mb-2">
            Ajouter un produit
          </h1>
          <p class="text-body-2 text-sm-subtitle-1 text-medium-emphasis px-2">
            Partagez vos connaissances
          </p>
        </div>

        <v-stepper v-model="step" :items="steps" hide-actions flat color="primary" class="elevation-0 mb-4 mb-sm-6"
          :mobile="$vuetify.display.xs" />
      </v-container>
    </section>

    <v-container style="max-width: 900px;" class="py-4">

      <v-alert v-if="!user" type="warning" variant="tonal" rounded="xl" class="mb-4" prominent>
        <template #prepend>
          <v-icon :size="$vuetify.display.xs ? '24' : '32'">mdi-alert-circle</v-icon>
        </template>
        <div class="d-flex flex-column align-start">
          <div class="text-subtitle-1 text-sm-h6 font-weight-bold mb-1">Connexion requise</div>
          <div class="text-caption text-sm-body-2 mb-3">
            Connectez-vous pour ajouter un produit
          </div>
          <div class="d-flex flex-column flex-sm-row ga-2 w-100">
            <v-btn color="primary" variant="flat" prepend-icon="mdi-login" to="/auth/login"
              :size="$vuetify.display.xs ? 'small' : 'default'" block class="mb-2 mb-sm-0">
              Se connecter
            </v-btn>
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-account-plus" to="/auth/signup"
              :size="$vuetify.display.xs ? 'small' : 'default'" block>
              Créer un compte
            </v-btn>
          </div>
        </div>
      </v-alert>

      <v-card v-show="step === 1" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-4 mb-sm-6">
            <v-avatar color="primary" :size="$vuetify.display.xs ? '40' : '48'" class="mr-3 mr-sm-4">
              <v-icon color="white" :size="$vuetify.display.xs ? '20' : '24'">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 text-sm-h5 font-weight-bold mb-1">Informations de base</h2>
              <p class="text-caption text-sm-body-2 text-medium-emphasis mb-0 d-none d-sm-block">
                Commençons par les détails essentiels
              </p>
            </div>
          </div>

          <v-row>

            <v-col cols="12" md="6">
              <v-text-field :model-value="displayBarcode" label="Code-barres" prepend-inner-icon="mdi-barcode"
                placeholder="3017620422003" hint="Jusqu'à 32 caractères" persistent-hint :rules="[rules.barcode]"
                maxlength="32" />
            </v-col>


            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Nom du produit *" prepend-inner-icon="mdi-tag"
                placeholder="Coca-Cola Zero" :rules="[rules.required]" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.brand" label="Marque" prepend-inner-icon="mdi-store"
                placeholder="Coca-Cola" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="form.category_id" :items="categories" item-title="name" item-value="id"
                label="Catégorie *" prepend-inner-icon="mdi-shape" :rules="[rules.required]"
                :loading="loadingCategories" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="form.portion_description" label="Description de la portion"
                prepend-inner-icon="mdi-scale" placeholder="100g, 330ml, 1 pièce..."
                hint="Précisez la taille de référence pour les valeurs nutritionnelles" persistent-hint />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Photo du produit</div>
              <v-card variant="outlined" class="image-upload" rounded="lg" :class="{ 'has-image': imagePreview }">
                <v-card-text class="pa-6">
                  <div v-if="uploadingImage" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
                    <div class="text-subtitle-1">Upload en cours...</div>
                  </div>
                  <div v-else-if="!imagePreview" class="text-center">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-image-plus</v-icon>
                    <div class="text-h6 mb-2">Ajouter une photo</div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      PNG, JPG jusqu'à 5MB
                    </div>
                    <v-btn color="primary" variant="tonal" prepend-icon="mdi-upload" @click="selectImage">
                      Choisir une image
                    </v-btn>
                    <input ref="fileInput" type="file" accept="image/*" capture="environment" hidden
                      @change="handleImageUpload">
                  </div>
                  <div v-else class="position-relative">
                    <v-img :src="imagePreview" height="200" cover rounded="lg" />
                    <v-btn icon="mdi-close" size="small" color="error" class="position-absolute"
                      style="top: 8px; right: 8px;" @click="removeImage" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pa-sm-6 pt-0 flex-column flex-sm-row">
          <v-spacer class="d-none d-sm-flex" />
          <v-btn :size="$vuetify.display.xs ? 'default' : 'large'" color="primary" variant="flat"
            append-icon="mdi-arrow-right" @click="nextStep" :disabled="!isStep1Valid" block class="w-100 w-sm-auto">
            Continuer
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-show="step === 2" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="success" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-shield-check</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Statut Halal</h2>
              <p class="text-medium-emphasis mb-0">Informations sur la certification halal</p>
            </div>
          </div>

          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Statut Halal *</div>
              <v-chip-group v-model="form.halal_status" mandatory column>
                <v-chip v-for="status in halalStatuses" :key="status.value" :value="status.value" :color="status.color"
                  size="large" filter variant="outlined" class="px-6">
                  <v-icon start>{{ status.icon }}</v-icon>
                  {{ status.label }}
                </v-chip>
              </v-chip-group>
            </v-col>

            <v-col cols="12">
              <v-combobox v-model="form.certification_body" :items="certificationBodies" label="Organisme certificateur"
                prepend-inner-icon="mdi-certificate" placeholder="AVS, SFCVH..." hint="Laissez vide si non certifié"
                persistent-hint clearable />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="form.halal_notes" label="Notes additionnelles" prepend-inner-icon="mdi-note-text"
                placeholder="Informations complémentaires sur la certification..." rows="3" auto-grow />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 d-flex flex-column flex-sm-row">
          <v-btn size="large" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep" class="mb-2 mb-sm-0">
            Retour
          </v-btn>
          <v-spacer />
          <v-btn size="large" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextStep">
            Continuer
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-show="step === 3" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="secondary" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-flask</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Ingrédients & Additifs</h2>
              <p class="text-medium-emphasis mb-0">Composition détaillée du produit</p>
            </div>
          </div>

          <v-row>
            <v-col cols="12">
              <v-text-field v-if="!isMobile" v-model="ingredientsInput" label="Ingrédients"
                prepend-inner-icon="mdi-leaf" placeholder="Eau, sucre, arômes..."
                hint="Séparez par des virgules. Dans l'ordre de la liste" persistent-hint />

              <div v-else>
                <v-text-field v-model="ingredientsInput" label="Ingrédients" prepend-inner-icon="mdi-leaf"
                  placeholder="Scannez ou tapez les ingrédients..." hint="Utilisez le scan OCR ou tapez manuellement"
                  persistent-hint :loading="isScanning">
                  <template #append-inner>
                    <v-btn icon variant="text" color="primary" @click="openCamera" :disabled="isScanning">
                      <v-icon>mdi-camera</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>

                <v-dialog v-model="cameraDialog" :max-width="500" persistent>
                  <v-card>
                    <v-toolbar color="primary">
                      <v-btn icon @click="closeCamera">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      <v-toolbar-title>Scanner les ingrédients</v-toolbar-title>
                    </v-toolbar>

                    <v-card-text class="pa-0 d-flex flex-column align-center">
                      <video ref="videoRef" autoplay playsinline class="camera-preview" />

                      <canvas ref="canvasRef" style="display: none;" />

                      <v-img v-if="capturedImage" :src="capturedImage" max-height="300" class="my-4" />

                      <v-progress-linear v-if="isScanning" :model-value="scanProgress" color="primary" class="mx-4 my-2"
                        style="width: 90%;" />
                      <p v-if="isScanning" class="text-center text-body-2">
                        {{ scanStatus }}
                      </p>
                    </v-card-text>

                    <v-card-actions class="justify-center pb-4" :max-width="400">
                      <v-btn v-if="!capturedImage" color="primary" size="large" @click="capturePhoto"
                        :disabled="!cameraReady">
                        <v-icon left>mdi-camera</v-icon>
                        Capturer
                      </v-btn>

                      <template v-else>
                        <div class="d-flex flex-column flex-sm-row justify-center"
                          style="gap: 8px; max-width: 300px; width: 100%;">
                          <v-btn size="small" variant="outlined" @click="retakePhoto" :disabled="isScanning">
                            Reprendre
                          </v-btn>
                          <v-btn size="small" color="primary" @click="processImage" :loading="isScanning">
                            <v-icon left>mdi-text-recognition</v-icon>
                            Analyser
                          </v-btn>
                        </div>
                      </template>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Additifs</div>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-flask-outline" append-icon="mdi-chevron-right"
                block size="large" @click="showAdditivesDialog = true" class="additives-select-btn">
                <span v-if="selectedAdditives.length === 0">Sélectionner des additifs</span>
                <span v-else>{{ selectedAdditives.length }} additif{{ selectedAdditives.length > 1 ? 's' : '' }}
                  sélectionné{{
                    selectedAdditives.length > 1 ? 's' : '' }}</span>
              </v-btn>
              <div v-if="selectedAdditives.length > 0" class="mt-3">
                <v-chip-group>
                  <v-chip v-for="additive in selectedAdditives"
                    :key="typeof additive === 'string' ? additive : additive.id" :color="getAdditiveColor(additive)"
                    closable @click:close="removeAdditive(additive)" size="small">
                    <v-icon start size="16">{{ getAdditiveIcon(additive) }}</v-icon>
                    {{ typeof additive === 'string' ? additive : additive.code }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Allergènes</div>
              <v-chip-group v-model="selectedAllergens" multiple column>
                <v-chip v-for="allergen in allergensList" :key="allergen.id" :value="allergen.id" filter
                  variant="outlined" color="warning">
                  {{ allergen.name }}
                </v-chip>
              </v-chip-group>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Labels & Certifications</div>
              <v-chip-group v-model="selectedLabels" multiple column>
                <v-chip v-for="label in labelsList" :key="label.id" :value="label.id" filter variant="outlined"
                  color="tertiary">
                  {{ label.name }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 d-flex flex-column flex-sm-row">
          <v-btn size="large" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep" class="mb-2 mb-sm-0">
            Retour
          </v-btn>
          <v-spacer />
          <v-btn size="large" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextStep">
            Continuer
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-show="step === 4" class="mb-4 card-enhanced" elevation="4" rounded="xl">
        <v-card-text class="pa-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="tertiary" size="48" class="mr-4">
              <v-icon color="white" size="24">mdi-nutrition</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Valeurs nutritionnelles</h2>
              <p class="text-medium-emphasis mb-0">Pour {{ form.portion_description || '100g' }}</p>
            </div>
          </div>

          <v-alert type="info" variant="tonal" class="mb-2">Laissez vide si aucune valeur à fournir</v-alert>

          <v-row class="mb-2">
            <v-col v-for="field in nutritionFields" :key="field.key" cols="12" sm="6" md="4">
              <v-text-field v-model="form.nutrition[field.key]" :label="`${field.label} (${field.suffix})`"
                type="number" step="any" inputmode="decimal" :prepend-inner-icon="field.icon" variant="outlined"
                density="compact" clearable />
            </v-col>
          </v-row>

        </v-card-text>

        <v-card-actions class="pa-6 pt-0 d-flex flex-column flex-sm-row">
          <v-btn size="large" variant="text" prepend-icon="mdi-arrow-left" @click="prevStep" class="mb-2 mb-sm-0">
            Retour
          </v-btn>
          <v-spacer />
          <v-btn size="large" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="submitProduct"
            :loading="loading">
            Publier le produit
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-container>
  </v-main>

  <v-dialog v-model="successDialog" max-width="500">
    <v-card rounded="xl">
      <v-card-text class="pa-8 text-center">
        <v-avatar color="success" size="80" class="mb-4">
          <v-icon size="48" color="white">mdi-check-circle</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-3">Produit ajouté !</h2>
        <p class="text-medium-emphasis mb-6">
          Merci pour votre contribution. Le produit a été ajouté avec succès.
        </p>
        <v-btn color="primary" variant="flat" block size="large" @click="goToProduct">
          Voir le produit
        </v-btn>
        <v-btn variant="text" block class="mt-2" @click="addAnother">
          Ajouter un autre produit
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="errorSnackbar" color="error" :timeout="5000">
    {{ errorMessage }}
    <template #actions>
      <v-btn variant="text" @click="errorSnackbar = false">Fermer</v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="showAdditivesDialog" :fullscreen="$vuetify.display.xs"
    :max-width="$vuetify.display.xs ? '100%' : '800'" scrollable>
    <v-card rounded="xl">
      <v-card-title class="pa-4 pa-sm-6 d-flex align-center">
        <v-icon class="mr-3" color="primary" size="24">mdi-flask-outline</v-icon>
        <span class="text-h6">Sélectionner des additifs</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="showAdditivesDialog = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4 pa-sm-6">
        <div class="dialog-sticky">
          <v-text-field v-model="additiveSearchQuery" prepend-inner-icon="mdi-magnify"
            placeholder="Rechercher par code (E330) ou nom..." variant="outlined" density="compact" clearable
            class="mb-3" />
          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-chip v-for="status in additiveFilterStatuses" :key="status.value" :color="status.color"
              :variant="selectedAdditiveFilter === status.value ? 'flat' : 'outlined'" filter size="small"
              @click="selectedAdditiveFilter = selectedAdditiveFilter === status.value ? null : status.value">
              <v-icon start size="14">{{ status.icon }}</v-icon>
              {{ status.label }}
            </v-chip>
            <v-spacer />
            <v-btn size="small" variant="text"
              @click="selectedAdditiveFilter = null; additiveSearchQuery = ''">Réinitialiser</v-btn>
          </div>
        </div>
        <div class="text-caption text-medium-emphasis mb-3">
          {{ filteredAdditives.length }} additif{{ filteredAdditives.length > 1 ? 's' : '' }} trouvé{{
            filteredAdditives.length > 1 ? 's' : '' }}
        </div>
        <v-divider class="mb-4" />
        <div class="additives-list">
          <v-list>
            <v-list-item v-for="additive in filteredAdditives" :key="additive.id" :value="additive.id"
              @click="toggleAdditive(additive)" class="additive-item" density="compact">
              <template #prepend>
                <v-checkbox :model-value="isAdditiveSelected(additive)" @click.stop="toggleAdditive(additive)"
                  color="primary" hide-details density="compact" />
              </template>
              <v-list-item-title class="d-flex align-center">
                <v-chip :color="getAdditiveColor(additive)" size="x-small" variant="tonal" class="mr-2">
                  {{ additive.code }}
                </v-chip>
                <span class="font-weight-medium">{{ additive.name }}</span>
              </v-list-item-title>
              <v-list-item-subtitle v-if="additive.description" class="mt-1 text-truncate">
                {{ additive.description }}
              </v-list-item-subtitle>
              <template #append>
                <v-icon :color="getAdditiveColor(additive)" size="18">
                  {{ getAdditiveIcon(additive) }}
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 pa-sm-6">
        <v-spacer />
        <v-btn variant="text" @click="showAdditivesDialog = false">Annuler</v-btn>
        <v-btn color="primary" variant="flat" @click="showAdditivesDialog = false">
          Valider ({{ selectedAdditives.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showHelp" :max-width="$vuetify.display.xs ? '95%' : '600'">
    <v-card rounded="xl">
      <v-card-title class="pa-4 pa-sm-6 d-flex align-center">
        <v-icon class="mr-2 mr-sm-3" color="primary" :size="$vuetify.display.xs ? '20' : '24'">
          mdi-help-circle
        </v-icon>
        <span class="text-subtitle-1 text-sm-h6">Aide</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="showHelp = false" />
      </v-card-title>
      <v-card-text class="pa-4 pa-sm-6 pt-0">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="Comment trouver le code-barres ?">
            <v-expansion-panel-text>
              Le code-barres (EAN-13) est généralement situé au dos du produit. Il se compose de 13 chiffres.
              Vous pouvez le scanner avec votre appareil photo ou le saisir manuellement.
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Qu'est-ce qu'un additif ?">
            <v-expansion-panel-text>
              Les additifs sont des substances ajoutées aux aliments (colorants, conservateurs, etc.).
              Ils sont identifiés par un code E suivi de chiffres (ex: E471, E330).
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Comment vérifier le statut halal ?">
            <v-expansion-panel-text>
              Vérifiez si le produit possède une certification halal reconnue (AVS, SFCVH, etc.).
              En cas de doute, marquez-le comme "Douteux" et ajoutez des notes explicatives.
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>

  <ImageCropper v-model="showCropper" :image-src="imageToCrop || ''" @crop="onImageCropped"
    @update:model-value="(v) => { if (!v) onCropCancel() }" />

</template>

<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { rules } from '@/utils/rules'
import Tesseract from 'tesseract.js'
import ImageCropper from '@/components/ImageCropper.vue'

useHead({
  title: 'IOFD - Add a product to the database'
})

const supabase = useSupabase()
const { user, fetchUser, logContribution } = useSupabaseAuth()

const step = ref(1)
const steps = [
  { title: 'Informations', value: 1 },
  { title: 'Statut Halal', value: 2 },
  { title: 'Composition', value: 3 },
  { title: 'Nutrition', value: 4 },
]

const form = ref({
  barcode: '',
  name: '',
  brand: '',
  category_id: null,
  portion_description: '',
  image_url: '',
  halal_status: 'halal',
  certification_body: '',
  certificate_number: '',
  certified_date: '',
  expiry_date: '',
  halal_notes: '',
  nutrition: {
    calories_kcal: null,
    protein_g: null,
    carbs_g: null,
    sugars_g: null,
    fats_g: null,
    saturated_fats_g: null,
    trans_fats_g: null,
    fibres_g: null,
    sodium_mg: null,
    calcium_mg: null,
    water_ml: null,
  }
})

type NutritionKey = keyof typeof form.value.nutrition

const nutritionFields: { key: NutritionKey, label: string, icon: string, suffix: string, color?: string, reference?: number }[] = [
  { key: 'calories_kcal', label: 'Calories', icon: 'mdi-fire', suffix: 'kcal', color: 'orange', reference: 2000 },
  { key: 'water_ml', label: 'Water', icon: 'mdi-water', suffix: 'ml', color: 'blue', reference: 100 },
  { key: 'protein_g', label: 'Protéines', icon: 'mdi-food-steak', suffix: 'g', color: 'blue', reference: 50 },
  { key: 'carbs_g', label: 'Glucides', icon: 'mdi-pasta', suffix: 'g', color: 'purple', reference: 260 },
  { key: 'sugars_g', label: 'Sucres', icon: 'mdi-candy', suffix: 'g', color: 'pink', reference: 90 },
  { key: 'fats_g', label: 'Lipides', icon: 'mdi-oil', suffix: 'g', color: 'amber', reference: 70 },
  { key: 'saturated_fats_g', label: 'Graisses saturées', icon: 'mdi-food-drumstick', suffix: 'g', color: 'red', reference: 20 },
  { key: 'fibres_g', label: 'Fibres', icon: 'mdi-barley', suffix: 'g', color: 'green', reference: 25 },
  { key: 'sodium_mg', label: 'Sodium', icon: 'mdi-shaker', suffix: 'mg', color: 'cyan', reference: 2300 },
  { key: 'calcium_mg', label: 'Calcium', icon: 'mdi-egg', suffix: 'mg', color: 'blue-darken-2', reference: 900 },
]

const loading = ref(false)
const successDialog = ref(false)
const showHelp = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')
const imagePreview = ref('')
const imageFile = ref<File | null>(null)
const uploadingImage = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const createdProductId = ref('')
const displayBarcode = ref('')
const showAdditivesDialog = ref(false)
const additiveSearchQuery = ref('')
const selectedAdditiveFilter = ref<string | null>(null)

const loadingCategories = ref(false)
const loadingIngredients = ref(false)
const loadingAdditives = ref(false)

const categories = ref<any[]>([])
const ingredients = ref<any[]>([])
const additives = ref<any[]>([])
const allergensList = ref<any[]>([])
const labelsList = ref<any[]>([])

const selectedIngredients = ref<any[]>([])
const ingredientsInput = ref('')
const selectedAdditives = ref<any[]>([])
const selectedAllergens = ref<string[]>([])
const selectedLabels = ref<string[]>([])

const showCropper = ref(false)
const imageToCrop = ref<string | null>(null)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cameraDialog = ref(false)
const capturedImage = ref<string | null>(null)
const isScanning = ref(false)
const scanProgress = ref(0)
const scanStatus = ref('')

const videoRef = ref<HTMLVideoElement | null>(null)
const cameraReady = ref(false)
let mediaStream: MediaStream | null = null

const halalStatuses = [
  { value: 'halal', label: 'Halal', icon: 'mdi-check-circle', color: 'success' },
  { value: 'haram', label: 'Haram', icon: 'mdi-check-circle', color: 'error' },
  { value: 'mashbuh', label: 'Mashbuh', icon: 'mdi-check-circle', color: 'warning' },
]

const certificationBodies = [
  'AVS',
  'Halal Monitoring Committee',
  'Taiwan Halal Integrity Development Association',
  'Autre'
]

const isStep1Valid = computed(() => {
  return form.value.name && form.value.category_id
})

const nextStep = () => {
  if (step.value < 4) {
    step.value++
  }
}

const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const goBack = () => {
  navigateTo('/products')
}

const selectImage = () => {
  fileInput.value?.click()
}

async function compressImage(file: File, maxSizeMB = 5, quality = 0.8): Promise<Blob> {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxDim = 1920;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.max(width / maxDim, height / maxDim);
        width = Math.round(width / ratio);
        height = Math.round(height / ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) return reject(new Error('Compression failed'));
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de charger l\'image pour compression'));
    };
    img.src = url;
  });
}

const handleImageUpload = async (event: Event) => {
  try {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      errorMessage.value = "Fichier trop volumineux (plus de 20MB)";
      errorSnackbar.value = true;
      return;
    }
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { imagePreview.value = e.target?.result as string };
    reader.readAsDataURL(file);
  }
  catch (error) {
    uploadErrorLog.value += 'Supabase error: ' + JSON.stringify(error) + '\n';
    errorMessage.value = `Échec de la compression: ${error}`;
    errorSnackbar.value = true;
  }
}
const uploadErrorLog = ref('')

async function uploadImage(file: File): Promise<string | null> {
  uploadingImage.value = true;
  uploadErrorLog.value = ''

  try {

    let fileExt = 'jpg';
    if (file.name && file.name.includes('.')) {
      fileExt = file.name.split('.').pop()!.toLowerCase();
    } else if (file.type) {
      const typeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/heic': 'jpg',
      }
      fileExt = typeMap[file.type] || 'jpg'
    }

    let fileToUpload: File | Blob = file;

    if (file.size > 5 * 1024 * 1024) {
      try {
        const compressed = await compressImage(file, 5, 0.78)

        if (compressed.size < file.size) {
          fileToUpload = new File([compressed], `photo.${fileExt}`, {
            type: file.type || 'image/jpeg'
          })
        } else {
          fileToUpload = file
        }
      } catch (err) {
        fileToUpload = file
        uploadErrorLog.value += 'Compression failed: ' + JSON.stringify(err) + '\n'
      }
    }

    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const mime = fileToUpload.type || file.type || `image/${fileExt === 'png' ? 'png' : 'jpeg'}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: mime
      });

    if (error) {
      uploadErrorLog.value += 'Supabase error: ' + JSON.stringify(error) + '\n';
      errorMessage.value = `Échec de l'upload: ${error}`;
      errorSnackbar.value = true;
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      uploadErrorLog.value += 'No public URL\n';
      errorMessage.value = 'URL publique introuvable';
      errorSnackbar.value = true;
      return null;
    }

    uploadErrorLog.value += 'Success: ' + publicUrl + '\n';
    return publicUrl;

  } catch (err: any) {
    uploadErrorLog.value += 'Exception: ' + (err?.message || JSON.stringify(err)) + '\n';
    errorMessage.value = err?.message || 'Erreur inattendue';
    errorSnackbar.value = true;
    return null;
  } finally {
    uploadingImage.value = false;
  }
}

const removeImage = () => {
  imagePreview.value = ''
  imageFile.value = null
  form.value.image_url = ''
}


watch(ingredientsInput, (val) => {
  const parts = (val || '').split(',').map(s => s.trim()).filter(Boolean)
  selectedIngredients.value = parts
})

watch(selectedIngredients, (arr) => {
  ingredientsInput.value = (arr || []).map((x: any) => typeof x === 'string' ? x : (x?.name || '')).filter(Boolean).join(', ')
})

const getAdditiveColor = (additive: any) => {
  if (typeof additive === 'object' && additive.halal_status) {
    const colors: Record<string, string> = {
      halal: 'success',
      haram: 'error',
      mashbuh: 'warning'
    }
    return colors[additive.halal_status] || 'secondary'
  }
  return 'secondary'
}

const getAdditiveIcon = (additive: any) => {
  if (typeof additive === 'object' && additive.halal_status) {
    const icons: Record<string, string> = {
      halal: 'mdi-check-circle',
      haram: 'mdi-close-circle',
      mashbuh: 'mdi-alert-circle'
    }
    return icons[additive.halal_status] || 'mdi-circle'
  }
  return 'mdi-circle'
}

const additiveFilterStatuses = [
  { value: 'halal', label: 'Halal', color: 'success', icon: 'mdi-check-circle' },
  { value: 'haram', label: 'Haram', color: 'error', icon: 'mdi-close-circle' },
  { value: 'mashbuh', label: 'Mashbuh', color: 'warning', icon: 'mdi-alert-circle' }
]

const filteredAdditives = computed(() => {
  let filtered = additives.value

  if (additiveSearchQuery.value) {
    const query = additiveSearchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query) ||
      (a.description && a.description.toLowerCase().includes(query))
    )
  }

  if (selectedAdditiveFilter.value) {
    filtered = filtered.filter(a => a.halal_status === selectedAdditiveFilter.value)
  }

  return filtered
})

const isAdditiveSelected = (additive: any) => {
  return selectedAdditives.value.some(sel =>
    typeof sel === 'object' && typeof additive === 'object'
      ? sel.id === additive.id
      : sel === additive
  )
}

const toggleAdditive = (additive: any) => {
  const index = selectedAdditives.value.findIndex(sel =>
    typeof sel === 'object' && typeof additive === 'object'
      ? sel.id === additive.id
      : sel === additive
  )

  if (index > -1) {
    selectedAdditives.value.splice(index, 1)
  } else {
    selectedAdditives.value.push(additive)
  }
}

const removeAdditive = (additive: any) => {
  const index = selectedAdditives.value.findIndex(sel =>
    typeof sel === 'object' && typeof additive === 'object'
      ? sel.id === additive.id
      : sel === additive
  )
  if (index > -1) {
    selectedAdditives.value.splice(index, 1)
  }
}

const submitProduct = async () => {
  loading.value = true
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      loading.value = false
      return
    }

    let imageUrl = form.value.image_url;
    if (imageFile.value) {
      const uploadedUrl = await uploadImage(imageFile.value);
      if (!uploadedUrl) {
        loading.value = false;
        return;
      }
      imageUrl = uploadedUrl;
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .upsert([{
        barcode: form.value.barcode || null,
        name: form.value.name,
        brand: form.value.brand || null,
        category_id: form.value.category_id,
        portion_description: form.value.portion_description || null,
        image_url: imageUrl,
      }], { onConflict: 'barcode', ignoreDuplicates: false })
      .select()
      .single()

    if (productError) throw productError
    if (!product) throw new Error('Le produit existe déjà ou création impossible')

    const productId = product.id
    createdProductId.value = productId

    const isUpdate = product.updated_at !== product.created_at

    const { error: halalError } = await supabase
      .from('halal_certifications')
      .upsert([{
        product_id: productId,
        halal_status: form.value.halal_status,
        certification_body: form.value.certification_body || null,
        certificate_number: form.value.certificate_number || null,
        certified_date: form.value.certified_date || null,
        expiry_date: form.value.expiry_date || null,
        notes: form.value.halal_notes || null,
      }], { onConflict: 'product_id', ignoreDuplicates: true })
    if (halalError) throw halalError

    const hasNutritionData = Object.values(form.value.nutrition).some(v => v !== null && v !== undefined && v !== '')
    if (hasNutritionData) {
      const nutritionToSave = Object.fromEntries(
        Object.entries(form.value.nutrition).map(([key, value]) => [key, value ?? 0])
      )

      const { error: nutritionError } = await supabase
        .from('nutrition_facts')
        .upsert([{ product_id: productId, ...nutritionToSave }], { onConflict: 'product_id', ignoreDuplicates: true })

      if (nutritionError) throw nutritionError
    }


    const ingredientMappings = []
    for (let i = 0; i < selectedIngredients.value.length; i++) {
      const ingredient = selectedIngredients.value[i]
      let ingredientId: string
      if (typeof ingredient === 'string') {
        const { data: existing } = await supabase.from('ingredients').select('id').eq('name', ingredient).single()
        if (existing) ingredientId = existing.id
        else {
          const { data: newIngredient, error } = await supabase.from('ingredients').insert([{ name: ingredient }]).select().single()
          if (error) continue
          ingredientId = newIngredient.id
        }
      } else ingredientId = ingredient.id
      ingredientMappings.push({ product_id: productId, ingredient_id: ingredientId, position: i + 1 })
    }
    if (ingredientMappings.length)
      await supabase.from('product_ingredients').upsert(ingredientMappings, { ignoreDuplicates: true })

    const additiveMappings = []
    for (const additive of selectedAdditives.value) {
      let additiveId: string
      if (typeof additive === 'string') {
        const code = additive.toUpperCase()
        const { data: existingAdditive } = await supabase.from('additives').select('id').eq('code', code).single()
        if (existingAdditive) additiveId = existingAdditive.id
        else {
          const { data: newAdditive, error } = await supabase.from('additives').insert([{ code, name: code }]).select().single()
          if (error) continue
          additiveId = newAdditive.id
        }
      } else additiveId = additive.id
      additiveMappings.push({ product_id: productId, additive_id: additiveId })
    }
    if (additiveMappings.length)
      await supabase.from('product_additives').upsert(additiveMappings, { ignoreDuplicates: true })

    if (selectedAllergens.value.length > 0) {
      const allergenMappings = selectedAllergens.value.map(id => ({
        product_id: productId,
        allergen_id: id,
        presence_type: 'contient'
      }))
      await supabase.from('product_allergens').upsert(allergenMappings, { ignoreDuplicates: true })
    }

    if (selectedLabels.value.length > 0) {
      const labelMappings = selectedLabels.value.map(id => ({ product_id: productId, label_id: id }))
      await supabase.from('product_labels').upsert(labelMappings, { ignoreDuplicates: true })
    }

    if (!currentUser.email) {
      throw new Error("L'utilisateur n'a pas d'email, impossible de loguer la contribution");
    }

    await logContribution(product.id, currentUser.email, isUpdate ? 'update' : 'create', { ...form.value });

    successDialog.value = true
  } catch (error: any) {
    console.error('Error submitting product:', error)
    errorMessage.value = error.message || 'Erreur lors de la création du produit'
    errorSnackbar.value = true
  } finally {
    loading.value = false
  }
}

const goToProduct = () => {
  navigateTo(`/products/${createdProductId.value}`)
}

const addAnother = () => {
  successDialog.value = false
  resetForm()
  step.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetForm = () => {
  form.value = {
    barcode: '',
    name: '',
    brand: '',
    category_id: null,
    portion_description: '',
    image_url: '',
    halal_status: 'non_verifie',
    certification_body: '',
    certificate_number: '',
    certified_date: '',
    expiry_date: '',
    halal_notes: '',
    nutrition: {
      calories_kcal: null,
      protein_g: null,
      carbs_g: null,
      sugars_g: null,
      fats_g: null,
      saturated_fats_g: null,
      trans_fats_g: null,
      fibres_g: null,
      sodium_mg: null,
      calcium_mg: null,
      water_ml: null,
    }
  }
  imagePreview.value = ''
  imageFile.value = null
  selectedIngredients.value = []
  selectedAdditives.value = []
  selectedAllergens.value = []
  selectedLabels.value = []
}

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) throw error
    categories.value = data || []
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

const loadIngredients = async () => {
  loadingIngredients.value = true
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, halal_status')
      .order('name')
      .limit(100)

    if (error) throw error
    ingredients.value = data || []
  } catch (error) {
    console.error('Error loading ingredients:', error)
  } finally {
    loadingIngredients.value = false
  }
}

const loadAdditives = async () => {
  loadingAdditives.value = true
  try {
    const { data, error } = await supabase
      .from('additives')
      .select('id, code, name, description, halal_status')
      .order('code')

    if (error) throw error
    additives.value = (data || []).map(a => ({
      ...a,
      display: `${a.code} - ${a.name}`
    }))
  } catch (error) {
    console.error('Error loading additives:', error)
  } finally {
    loadingAdditives.value = false
  }
}

const loadAllergens = async () => {
  try {
    const { data, error } = await supabase
      .from('allergens')
      .select('id, name')
      .order('name')

    if (error) throw error
    allergensList.value = data || []
  } catch (error) {
    console.error('Error loading allergens:', error)
  }
}

const loadLabels = async () => {
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('id, name')
      .order('name')

    if (error) throw error
    labelsList.value = data || []
  } catch (error) {
    console.error('Error loading labels:', error)
  }
}

onMounted(async () => {
  await fetchUser()
  await Promise.all([
    loadCategories(),
    loadIngredients(),
    loadAdditives(),
    loadAllergens(),
    loadLabels(),
  ])
})

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
})

const openCamera = async () => {

  if (capturedImage.value) {
    cameraDialog.value = true
    return
  }

  cameraDialog.value = true
  capturedImage.value = null
  cameraReady.value = false
  await nextTick()

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      videoRef.value.onloadedmetadata = () => {
        cameraReady.value = true
      }
    }

  } catch (err) {
    console.error('Erreur accès caméra:', err)
    alert("Impossible d'accéder à la caméra.")
    closeCamera()
  }
}

function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  cameraDialog.value = false
  capturedImage.value = null
  cameraReady.value = false
  imageToCrop.value = null
  showCropper.value = false
}

function retakePhoto() {
  capturedImage.value = null
  openCamera()
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return
  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(video, 0, 0)

  imageToCrop.value = canvas.toDataURL('image/png')

  if (mediaStream) mediaStream.getTracks().forEach(track => track.stop())

  cameraDialog.value = false
  showCropper.value = true
}

function onImageCropped(croppedDataUrl: string) {
  capturedImage.value = croppedDataUrl
  imageToCrop.value = null
  cameraDialog.value = true
}

function onCropCancel() {
  imageToCrop.value = null
  openCamera()
}

function cleanIngredients(text: string) {
  return text
    .replace(/\n/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim()
}

function preprocessImage(imgDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      const scale = 2
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      let totalBrightness = 0
      for (let i = 0; i < data.length; i += 4) {
        // @ts-ignore
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        totalBrightness += gray
      }
      const avgBrightness = totalBrightness / (data.length / 4)

      const threshold = avgBrightness < 128 ? avgBrightness * 0.8 : avgBrightness * 1.1

      for (let i = 0; i < data.length; i += 4) {
        // @ts-ignore
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

        gray = ((gray - avgBrightness) * 1.5) + avgBrightness
        gray = Math.max(0, Math.min(255, gray))

        const binary = gray > threshold ? 255 : 0

        data[i] = binary
        data[i + 1] = binary
        data[i + 2] = binary
      }

      ctx.putImageData(imgData, 0, 0)

      resolve(canvas.toDataURL('image/png'))
    }
    img.src = imgDataUrl
  })
}

async function processImage() {
  if (!capturedImage.value) return
  isScanning.value = true
  scanProgress.value = 0
  scanStatus.value = 'Initialisation...'

  try {
    let dataUrl = await preprocessImage(capturedImage.value)

    const result = await Tesseract.recognize(dataUrl, 'fra', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          scanProgress.value = Math.round(m.progress * 100)
          scanStatus.value = 'Reconnaissance du texte...'
        } else {
          scanStatus.value = m.status
        }
      }
    })

    ingredientsInput.value = cleanIngredients(result.data.text)
    closeCamera()
  } catch (err) {
    console.error('Erreur OCR:', err)
    alert('Erreur lors de l\'analyse de l\'image')
  } finally {
    isScanning.value = false
  }
}

onUnmounted(() => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.camera-preview {
  width: 100%;
  max-height: 60vh;
  object-fit: cover;
}
.image-upload {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
}

.image-upload:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background: rgba(var(--v-theme-primary), 0.02);
}

.image-upload.has-image {
  border-style: solid;
  cursor: default;
}

.barcode-scanner {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1280px) {
  .preview-card {
    position: fixed;
    top: 100px;
    right: 40px;
    width: 300px;
    z-index: 5;
  }
}

.v-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.v-chip-group .v-chip {
  margin: 4px;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

.v-text-field:focus-within,
.v-select:focus-within,
.v-combobox:focus-within,
.v-textarea:focus-within {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

@media (max-width: 600px) {

  .hero-section {
    border-radius: 0 0 24px 24px;
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 1.5rem !important;
    line-height: 1.3;
  }

  .card-enhanced {
    border-radius: 16px !important;
    margin-bottom: 1rem !important;
  }

  .card-enhanced .v-card-text {
    padding: 1rem !important;
  }

  .card-enhanced .v-card-actions {
    padding: 1rem !important;
    padding-top: 0 !important;
  }

  .card-enhanced .v-avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  .v-stepper {
    font-size: 0.75rem;
  }

  .v-chip-group .v-chip {
    font-size: 0.875rem;
    height: 32px;
  }

  .image-upload .v-img {
    height: 150px !important;
  }

  .v-card-actions .v-btn {
    width: 100%;
  }

  .v-row {
    margin: -8px;
  }

  .v-row>.v-col {
    padding: 8px;
  }

  .v-text-field,
  .v-select,
  .v-combobox,
  .v-textarea {
    font-size: 0.9rem;
  }

  .v-dialog {
    margin: 8px;
  }

  .v-dialog>.v-card {
    max-height: calc(100vh - 16px);
  }

  .v-alert {
    padding: 12px !important;
  }

  .v-alert .v-icon {
    margin-right: 8px;
  }

}

.v-stepper {
  box-shadow: none !important;
  background: transparent !important;
}

.v-chip {
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-dialog {
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.v-btn--loading {
  pointer-events: none;
}

.v-list-item {
  margin-bottom: 8px;
}

.v-expansion-panel {
  margin-bottom: 8px;
}

.v-expansion-panel-title {
  font-weight: 500;
}

.v-dialog .v-avatar {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 960px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

@media print {
  .v-app-bar,
  .v-btn,
  .preview-card {
    display: none !important;
  }
}

.v-btn:focus-visible,
.v-chip:focus-visible,
.v-text-field:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.5);
  outline-offset: 2px;
}

.v-theme--dark .image-upload {
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.v-theme--dark .image-upload:hover {
  border-color: rgba(var(--v-theme-primary), 0.7);
  background: rgba(var(--v-theme-primary), 0.05);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.card-enhanced {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
}

.card-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.hero-section {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(38, 198, 218, 0.08) 100%);
  border-radius: 0 0 40px 40px;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.card-enhanced .v-avatar {
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.v-stepper {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px;
  overflow: hidden;
}

.card-enhanced .v-btn--variant-flat {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-enhanced .v-btn--variant-flat:hover {
  box-shadow: 0 6px 24px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

.card-enhanced .v-chip {
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-enhanced .v-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-enhanced .v-text-field:focus-within,
.card-enhanced .v-select:focus-within,
.card-enhanced .v-combobox:focus-within,
.card-enhanced .v-textarea:focus-within {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.card-enhanced .image-upload {
  transition: all 0.3s ease;
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.02);
}

.card-enhanced .image-upload:hover {
  border-color: rgba(var(--v-theme-primary), 0.7);
  background: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.01);
}

.v-card {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enhanced .v-avatar+div h2 {
  position: relative;
}

.card-enhanced .v-avatar+div h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 2px;
}

.card-enhanced .v-card-text {
  padding: 2rem !important;
}

@media (min-width: 601px) and (max-width: 960px) {
  .hero-section {
    border-radius: 0 0 32px 32px;
  }

  .card-enhanced .v-card-text {
    padding: 1.5rem !important;
  }

  .card-enhanced .v-card-actions {
    padding: 1.5rem !important;
    padding-top: 0 !important;
  }
}

@media (max-width: 600px) {
  .v-stepper ::v-deep(.v-stepper-item) {
    padding: 8px 4px;
  }

  .v-stepper ::v-deep(.v-stepper-item__title) {
    font-size: 0.75rem;
  }

  .v-stepper ::v-deep(.v-stepper-item__avatar) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
}

@media (max-width: 600px) and (pointer: coarse) {
  .v-btn {
    min-height: 44px;
  }

  .v-chip {
    min-height: 36px;
  }

  .v-text-field,
  .v-select,
  .v-combobox {
    min-height: 48px;
  }
}

@media (max-width: 360px) {
  .hero-title {
    font-size: 1.25rem !important;
  }

  .v-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .card-enhanced {
    border-radius: 12px !important;
  }

  .v-chip {
    font-size: 0.75rem;
    padding: 0 8px;
  }
}

@media (max-width: 600px) {
  .v-theme--dark .card-enhanced {
    background: rgba(var(--v-theme-surface), 0.98);
  }

  .v-theme--dark .text-medium-emphasis {
    opacity: 0.8;
  }
}

@media (max-width: 600px) {
  .v-main {
    overflow-x: hidden;
  }

  * {
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 600px) and (prefers-reduced-motion: no-preference) {
  .card-enhanced {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card-enhanced:active {
    transform: scale(0.98);
  }
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.nutrition-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.nutrition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.additives-select-btn {
  transition: all 0.3s ease;
}

.additives-select-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.additive-item {
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
}

.additive-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

.additives-list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.additives-list::-webkit-scrollbar {
  width: 6px;
}

.additives-list::-webkit-scrollbar-track {
  background: transparent;
}

.additives-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.additives-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

@media (max-width: 600px) {
  .dialog-sticky {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgb(var(--v-theme-surface));
    padding-bottom: 8px;
  }

  .nutrition-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .nutrition-card {
    border-radius: 12px !important;
  }
}
</style>