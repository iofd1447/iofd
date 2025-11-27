const imagePreview = ref('')
const imageFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const selectImage = () => {
  fileInput.value?.click()
}

const removeImage = () => {
  imagePreview.value = ''
  imageFile.value = null
  form.value.image_url = ''
}

export { selectImage, removeImage }