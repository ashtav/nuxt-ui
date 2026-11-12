<template>
  <UiLabel v-bind="$props">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>
  </UiLabel>
</template>

<script setup lang="ts">
import UiLabel from '~/components/ui/Label.vue'

defineProps<{
  text?: string
  icon?: string
  iconColor?: string
  iconSize?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  uppercase?: boolean
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  required?: boolean
  as?: string
}>()
</script>
