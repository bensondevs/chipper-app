export const useFavorite = defineStore('favorite', () => {
  const { $api } = useNuxtApp()

  const favoritedUserIds = ref(new Set())
  const togglingUserIds = ref(new Set())
  const favoritedPostIds = ref(new Set())

  async function fetch () {
    try {
      const response = await $api.get('favorites')
      
      const favoritesData = response?.data || response
      const users = favoritesData?.users || []
      const posts = favoritesData?.posts || []
      
      favoritedUserIds.value = new Set(users.map(user => user.id))
      favoritedPostIds.value = new Set(posts.map(post => post.id))
      
      return favoritesData
    } catch (e) {
      favoritedUserIds.value = new Set()
      favoritedPostIds.value = new Set()
      
      return {
        posts: [],
        users: [],
      }
    }
  }
  
  function addFavorite (userId) {
    favoritedUserIds.value = new Set([...favoritedUserIds.value, userId])
  }
  
  function removeFavorite (userId) {
    favoritedUserIds.value = new Set([...favoritedUserIds.value].filter(id => id !== userId))
  }

  function isUserFavorited (userId) {
    return favoritedUserIds.value.has(userId)
  }
  
  function isPostFavorited (postId) {
    return favoritedPostIds.value.has(postId)
  }
  
  function isTogglingUser (userId) {
    return togglingUserIds.value.has(userId)
  }
  
  function addTogglingUser (userId) {
    togglingUserIds.value = new Set([...togglingUserIds.value, userId])
  }
  
  function removeTogglingUser (userId) {
    togglingUserIds.value = new Set([...togglingUserIds.value].filter(id => id !== userId))
  }
  
  function addPostFavorite (postId) {
    favoritedPostIds.value = new Set([...favoritedPostIds.value, postId])
  }
  
  function removePostFavorite (postId) {
    favoritedPostIds.value = new Set([...favoritedPostIds.value].filter(id => id !== postId))
  }
  
  async function toggleUserFavorite (userId) {
    const user = useUser()
    
    if (user.data.id === userId || isTogglingUser(userId)) {
      return
    }
    
    const wasFavorited = isUserFavorited(userId)
    
    // Lock this user
    addTogglingUser(userId)
    
    // Optimistic update
    wasFavorited
      ? removeFavorite(userId)
      : addFavorite(userId)
    
    try {
      await (wasFavorited
          ? $api.delete(`users/${userId}/favorite`)
          : $api.post(`users/${userId}/favorite`)
      )
    } catch (e) {
      // Rollback
      wasFavorited
        ? addFavorite(userId)
        : removeFavorite(userId)
      
      throw e
    } finally {
      // Unlock this user
      removeTogglingUser(userId)
    }
  }
  
  async function togglePostFavorite (postId) {
    const wasFavorited = isPostFavorited(postId)
    
    // Optimistic update
    wasFavorited
      ? removePostFavorite(postId)
      : addPostFavorite(postId)
    
    try {
      await (wasFavorited
          ? $api.delete(`posts/${postId}/favorite`)
          : $api.post(`posts/${postId}/favorite`)
      )
    } catch (e) {
      // Rollback
      wasFavorited
        ? addPostFavorite(postId)
        : removePostFavorite(postId)
      
      throw e
    }
  }
  
  function clear () {
    favoritedUserIds.value = new Set()
    favoritedPostIds.value = new Set()
  }

  return {
    favoritedUserIds: computed(() => Array.from(favoritedUserIds.value)),
    favoritedPostIds: computed(() => Array.from(favoritedPostIds.value)),
    fetch,
    isUserFavorited,
    isPostFavorited,
    toggleUserFavorite,
    togglePostFavorite,
    clear
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavorite, import.meta.hot))
}
