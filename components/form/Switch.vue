<template>
  <label 
    class="relative inline-flex items-center gap-2.5 cursor-pointer select-none"
    :class="[disabled && 'opacity-50 pointer-events-none']"
  >
    <div class="relative shrink-0 flex items-center">
      <input 
        type="checkbox" 
        v-model="modelValue" 
        :disabled="disabled"
        class="sr-only peer" 
      />
      <div
        class="w-9 h-5 bg-slate-200 dark:bg-theme-hover rounded-full peer peer-focus:ring-2 peer-focus:ring-theme-primary/30 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-theme-border peer-checked:bg-theme-primary"
      ></div>
    </div>
    <span v-if="label || $slots.default" class="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
  label?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  label: ''
})

const modelValue = defineModel<boolean>({ default: false })
</script>
