export const useFavorite = defineStore('favorite', () => {
  const { $api } = useNuxtApp()

  const favoritedUserIds = ref(new Set())
  const togglingUserIds = ref(new Set())

  async function fetch () {
    try {
      const response = await $api.get('favorites')
      
      const favoritesData = response?.data || response
      const users = favoritesData?.users || []
      
      favoritedUserIds.value = new Set(users.map(user => user.id))
      
      return favoritesData
    } catch (e) {
      favoritedUserIds.value = new Set()
      
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
  
  function isTogglingUser (userId) {
    return togglingUserIds.value.has(userId)
  }
  
  function addTogglingUser (userId) {
    togglingUserIds.value = new Set([...togglingUserIds.value, userId])
  }
  
  function removeTogglingUser (userId) {
    togglingUserIds.value = new Set([...togglingUserIds.value].filter(id => id !== userId))
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
  
  function clear () {
    favoritedUserIds.value = new Set()
  }

  return {
    favoritedUserIds: computed(() => Array.from(favoritedUserIds.value)),
    fetch,
    isUserFavorited,
    toggleUserFavorite,
    clear
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavorite, import.meta.hot))
}
