export const usePosts = defineStore('posts', () => {
  const { $api } = useNuxtApp()

  const posts = ref([])
  const isSubmitting = ref(false)
  const newPostsAvailable = ref(false)
  const latestPostId = ref(null)
  const latestPostTimestamp = ref(null)
  
  function trackLatestPost (post) {
    latestPostId.value = post.id
    
    if (post.created_at) {
      latestPostTimestamp.value = new Date(post.created_at).getTime()
    }
  }
  
  async function fetch () {
    const { data = [] } = await $api.get('posts')
    
    posts.value = data
    newPostsAvailable.value = false
    
    if (data[0]) {
      trackLatestPost(data[0])
    }
    
    return data
  }
  
  async function fetchNewPosts () {
    const { data = [] } = await $api.get('posts')
    if (!data.length) return []
    
    if (latestPostId.value === null) {
      return data
    }
    
    const newPosts = []
    
    for (const post of data) {
      const postTs = post.created_at ? new Date(post.created_at).getTime() : null
      const isValidTs = postTs !== null && !isNaN(postTs)
      
      const isNew = latestPostTimestamp.value !== null && isValidTs
        ? postTs > latestPostTimestamp.value
        : post.id > latestPostId.value
      
      if (!isNew) break
      
      newPosts.push(post)
    }
    
    return newPosts
  }
  
  async function checkForNewPosts () {
    try {
      const newPosts = await fetchNewPosts()
      newPostsAvailable.value = newPosts.length > 0
      return newPosts
    } catch (error) {
      console.error('Error checking for new posts:', error)
      newPostsAvailable.value = false
      return []
    }
  }
  
  async function loadNewPosts () {
    if (!newPostsAvailable.value) return
    
    const newPosts = await fetchNewPosts()
    if (!newPosts.length) return
    
    posts.value = [...newPosts, ...posts.value]
    
    trackLatestPost(newPosts[0])
    
    newPostsAvailable.value = false
  }
  
  async function create ({ title, body }) {
    const response = await $api.post('posts', { title, body })
    const post = response?.data || response
    
    posts.value.unshift(post)
    
    if (post.id && (!latestPostId.value || post.id > latestPostId.value)) {
      trackLatestPost(post)
    }
    
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
    newPostsAvailable,
    fetch,
    checkForNewPosts,
    loadNewPosts,
    create,
    submitForm
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePosts, import.meta.hot))
}

