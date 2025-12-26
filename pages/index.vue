<script setup>
definePageMeta({
  middleware: ['validate-session']
})

const user = useUser()
const postsStore = usePosts()
const favorite = useFavorite()

// Load posts if not already loaded
if (!postsStore.posts.length) {
  await postsStore.fetch()
}

// Load favorites if user is logged in and favorites not loaded
if (!user.isGuest && favorite.favoritedUserIds.length === 0) {
  await favorite.fetch()
}

const posts = computed(() => postsStore.posts)
const hasNewPosts = computed(() => postsStore.newPostsAvailable)

// Set up polling for new posts every 30 seconds
let pollInterval = null

onMounted(() => {
  pollInterval = setInterval(
      async () => { await postsStore.checkForNewPosts() },
      30000,
  )
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

function loadNewPosts () {
  postsStore.loadNewPosts()
}
</script>

<template>
  <PostForm
    v-if="!user.isGuest" />
  <div class="grid gap-16">
    <button
      v-if="hasNewPosts"
      class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-4"
      @click="loadNewPosts">
      Load New Posts
    </button>
    <PostItem
      v-for="post in posts"
      :key="post.id"
      v-bind="{ post }" />
  </div>
</template>
