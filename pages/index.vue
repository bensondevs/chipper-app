<script setup>
definePageMeta({
  middleware: ['validate-session']
})

const user = useUser()
const postsStore = usePosts()

// Load posts if not already loaded
if (!postsStore.posts.length) {
  await postsStore.fetch()
}

const posts = computed(() => postsStore.posts)
</script>

<template>
  <PostForm
    v-if="!user.isGuest" />
  <div class="grid gap-16">
    <PostItem
      v-for="post in posts"
      :key="post.id"
      v-bind="{ post }" />
  </div>
</template>
