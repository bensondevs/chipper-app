<script setup>
const postsStore = usePosts()
const { showErrorModal } = useHelpers()

const form = reactive({
  title: '',
  body: ''
})

async function submit () {
  try {
    await postsStore.submitForm(form)
  } catch (e) {
    showErrorModal(e)
  }
}
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
    <button
      type="submit"
      :disabled="postsStore.isSubmitting"
      class="bg-blue-600 text-white px-8 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
      {{ postsStore.isSubmitting ? 'Posting...' : 'Post' }}
    </button>
  </form>
</template>