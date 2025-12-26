<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: String,
  placeholder: String,
  class: String,
  inputClass: String,
  label: String,
  errors: Array,
  hint: String
})

const textarea = ref(null)
const { errors } = toRefs(props)

const handle = event => {
  emit('update:modelValue', event.target.value)
}

const focus = () => {
  textarea.value.focus()
}

defineExpose({
  focus
})
</script>

<template>
  <div class="flex flex-col gap-2" :class="props.class">
    <label
      v-if="label"
      class="text-base font-normal">
      {{ label }}
    </label>
    <div class="relative rounded-lg">
      <textarea
        ref="textarea"
        v-bind="$attrs"
        :value="props.modelValue"
        :placeholder="placeholder"
        class="block w-full rounded-lg border border-gray-400 px-5 py-4 text-sm focus:border-blue-500 focus:outline-none md:text-base"
        :class="inputClass"
        @input="handle">
      </textarea>
    </div>
    <div
      v-if="errors"
      class="text-sm text-red-500">
      {{ errors[0] }}
    </div>
    <div
      v-if="hint"
      class="mt-px w-full rounded-lg px-4 py-3 text-xs font-light text-gray-400">
      {{ hint }}
    </div>
  </div>
</template>

