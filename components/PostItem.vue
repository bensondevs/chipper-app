<script setup>
import { HeartIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const user = useUser()
const favorite = useFavorite()

const isOwnPost = computed(() => {
  if (user.isGuest) return false
  return user.data.id === props.post.user.id
})

const isFollowing = computed(() => {
  if (user.isGuest) return false
  return favorite.isUserFavorited(props.post.user.id)
})

const isLoading = ref(false)

async function toggleFollow () {
  if (user.isGuest) return

  isLoading.value = true
  try {
    await favorite.toggleUserFavorite(props.post.user.id)
  } catch (e) {
    const { showErrorModal } = useHelpers()
    showErrorModal(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="grid gap-3">
    <h4 class="font-bold text-lg">
      {{ post.title }}
    </h4>
    <div class="flex justify-between bg-gray-100 p-4 rounded-lg">
      <div>
        by <strong>{{ post.user.name }}</strong>
      </div>
      <button
        v-if="!user.isGuest && !isOwnPost"
        :disabled="isLoading"
        :class="[
          'font-medium text-sm px-2 rounded-full disabled:opacity-50',
          isFollowing ? 'bg-gray-300' : 'bg-blue-200'
        ]"
        @click="toggleFollow">
        {{ isFollowing ? 'Unfollow' : 'Follow' }}
      </button>
    </div>
    <p>
      {{ post.body }}
    </p>
    <button class="bg-red-200 text-red-500 flex items-center justify-center gap-2 p-4 rounded-lg">
      <HeartIcon
        class="h-6 stroke-current" />
      <span class="font-bold">
        Add to my favorites
      </span>
    </button>
  </div>
</template>