<script setup>
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const user = useUser()
const favorite = useFavorite()
const router = useRouter()

const canInteract = computed(() => !user.isGuest)

const isOwnPost = computed(() =>
  canInteract.value && user.data.id === props.post.user.id
)

const isFollowing = computed(() =>
  canInteract.value && favorite.isUserFavorited(props.post.user.id)
)

const isPostFavorited = computed(() =>
  canInteract.value && favorite.isPostFavorited(props.post.id)
)

const isLoading = ref(false)
const isTogglingFavorite = ref(false)

async function toggleFollow () {
  if (!canInteract.value) {
    router.push('/login')
    return
  }

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

async function togglePostFavorite () {
  if (! canInteract.value) {
    router.push('/login')

    return
  }

  isTogglingFavorite.value = true
  try {
    await favorite.togglePostFavorite(props.post.id)
  } catch (e) {
    const { showErrorModal } = useHelpers()
    showErrorModal(e)
  } finally {
    isTogglingFavorite.value = false
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
        v-if="!isOwnPost"
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
    <button
      :disabled="isTogglingFavorite"
      :class="[
        'flex items-center justify-center gap-2 p-4 rounded-lg font-bold transition-colors disabled:opacity-50',
        isPostFavorited 
          ? 'bg-red-500 text-white' 
          : 'bg-red-200 text-red-500 hover:bg-red-300'
      ]"
      @click="togglePostFavorite">
      <component
        :is="isPostFavorited ? HeartIconSolid : HeartIcon"
        class="h-6"
        :class="isPostFavorited ? 'fill-current' : 'stroke-current'" />
      <span>
        {{ isPostFavorited ? 'Remove from favorites' : 'Add to my favorites' }}
      </span>
    </button>
  </div>
</template>