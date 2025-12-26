export const usePosts = defineStore('posts', () => {
  const { $api } = useNuxtApp()

  const posts = ref([])
  const isSubmitting = ref(false)

  async function fetch () {
    const { data } = await $api.get('posts')
    posts.value = data
    return data
  }

  async function create ({ title, body }) {
    const response = await $api.post('posts', { title, body })
    // Handle API response - could be wrapped in { data: post } or direct post object
    const post = response?.data || response
    // Add the new post to the beginning of the list
    posts.value.unshift(post)
    return post
  }

  function clearForm (form) {
    form.title = ''
    form.body = ''
  }

  async function submitForm (form) {
    isSubmitting.value = true

    try {
      await create(toRaw(form))
      clearForm(form)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    posts,
    isSubmitting,
    fetch,
    create,
    clearForm,
    submitForm
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePosts, import.meta.hot))
}

