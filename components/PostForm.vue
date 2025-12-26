<script setup>
const postsStore = usePosts()
const { showErrorModal } = useHelpers()

const form = reactive({
  title: '',
  body: '',
  image: null
})

const imagePreview = ref(null)
const fileInputRef = ref(null)

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function validateImage (file) {
  if (!file.type.startsWith('image/')) {
    showErrorModal('Only image files are allowed')
    return false
  }

  if (file.size > MAX_IMAGE_SIZE) {
    showErrorModal('Image must be under 5MB')
    return false
  }

  return true
}

function handleImageChange (event) {
  const file = event.target.files?.[0]
  if (!file || !validateImage(file)) return

  clearImage()
  form.image = file
  imagePreview.value = URL.createObjectURL(file)
}

function clearImage () {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  form.image = null
  imagePreview.value = null

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function resetForm () {
  form.title = ''
  form.body = ''
  clearImage()
}

async function submit () {
  if (postsStore.isSubmitting) return

  try {
    await postsStore.submitForm(form)
    resetForm()
  } catch (e) {
    showErrorModal(e)
  }
}

onBeforeUnmount(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})
</script>

<template>
  <form
    class="grid gap-4 mb-16"
    @submit.prevent="submit">
    <FormInput
      v-model="form.title"
      placeholder="Post title"
      maxlength="256" />
    <FormTextarea
      v-model="form.body"
      placeholder="What is happening?!" />
    <div class="grid gap-2">
      <label class="text-sm font-medium text-gray-700">
        Attach Image (optional)
      </label>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        :disabled="postsStore.isSubmitting"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        @change="handleImageChange" />
      <div v-if="imagePreview" class="relative">
        <img
          :src="imagePreview"
          alt="Preview"
          class="max-w-full h-auto rounded-lg border border-gray-300" />
        <button
          type="button"
          @click="clearImage"
          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <button
      type="submit"
      :disabled="postsStore.isSubmitting"
      class="bg-blue-600 text-white px-8 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
      {{ postsStore.isSubmitting ? 'Posting...' : 'Post' }}
    </button>
  </form>
</template>