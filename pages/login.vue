<script setup>

definePageMeta({
  middleware: ['validate-session', 'require-guest']
})

const user = useUser()
const router = useRouter()
const { showErrorModal } = useHelpers()

const form = reactive({
  email: '',
  password: ''
})

const errors = ref({})
const loading = ref(false)

async function submit () {
  errors.value = null
  loading.value = true

  try {
    await user.login(toRaw(form))
    router.push('/')
  } catch (e) {
    showErrorModal(e)
  }
}
</script>

<template>
  <form
    class="flex flex-col gap-8"
    @submit.prevent="submit">

    <h1 class="text-3xl">
      Login
    </h1>

    <FormInput
      v-model="form.email"
      required
      type="email"
      placeholder="Enter you email"
      label="Your Email" />
    <FormInput
      v-model="form.password"
      required
      type="password"
      placeholder="Enter your password"
      label="Password" />

    <button class="bg-blue-600 text-white px-8 py-4 rounded-lg">
      Login
    </button>
  </form>
</template>
