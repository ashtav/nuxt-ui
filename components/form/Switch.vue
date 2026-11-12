<template>
  <label 
    class="relative inline-flex items-center cursor-pointer select-none shrink-0"
    :class="[disabled && 'opacity-50 pointer-events-none']"
  >
    <input 
      type="checkbox" 
      v-model="modelValue" 
      :disabled="disabled"
      class="sr-only peer" 
    />
    <div
      class="w-9 h-5 bg-slate-200 dark:bg-theme-hover rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 dark:peer-focus:ring-emerald-500/30 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-theme-border peer-checked:bg-emerald-600"
    ></div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const modelValue = defineModel<boolean>({ default: false })
</script>
