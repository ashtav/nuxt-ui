<template>
    <i v-if="name" :class="['hgi hgi-stroke', iconClass, size]"></i>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        name: string;
        size?: string;
        clean?: boolean;
    }>(),
    {
        size: 'sm',
        clean: false
    }
);

const ALIASES: Record<string, string> = {
    'lock-01': 'lock',
    'locked-01': 'lock',
    'unlock': 'square-unlock-02',
    'lock-unlocked': 'square-unlock-02',
    'lock-unlocked-01': 'square-unlock-02',
    'lock-unlocked-02': 'square-unlock-02',
    'unlocked': 'square-unlock-02',
    'eye': 'view',
    'eye-off': 'view-off',
    'calendar-check-01': 'calendar-check-in-01',
    'calendar-check': 'calendar-check-in-01',
    'user-id': 'user-id-verification',
    'bank-note-01': 'wallet-02',
    'banknote': 'wallet-02',
    'contract': 'contracts',
    'plus-circle': 'add-circle',
    'minus-circle': 'remove-circle',
    'building-07': 'building-03',
    'file-invoice': 'invoice-01',
    'file-text': 'invoice-03',
    'sliders-01': 'sliders-horizontal',
    'alert-triangle': 'alert-02',
    'warning': 'alert-02',
    'user-love': 'user-love-01',
    'emergency-contact': 'shield-user',
    'shield-tick': 'security-check',
    'shield-check': 'security-check',
    'two-factor': 'security-check',
    'braces': 'second-bracket',
    'json': 'second-bracket',
    'brackets-curly': 'second-bracket',
    'mega-phone': 'megaphone-01',
    'megaphone': 'megaphone-01',
    'shredder': 'file-shredder',
    'star-01': 'star',
    'star-filled': 'star',
    'video-recorder': 'video-01'
};

const iconClass = computed(() => {
    if (!props.name) return '';
    if (props.name.includes('hgi-')) return props.name;
    const resolved = ALIASES[props.name] || props.name;
    return `hgi-${resolved}`;
});
</script>

<style scoped lang="scss">
.hgi {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    vertical-align: middle;
    font-weight: normal !important;
    --tblr-icon-size: 1.05rem;
    font-size: var(--tblr-icon-size);

    &.xxs {
        --tblr-icon-size: .8rem;
    }

    &.xs {
        --tblr-icon-size: .9rem;
    }

    &.sm {
        --tblr-icon-size: 1.02rem;
    }

    &.md {
        --tblr-icon-size: 1.25rem;
    }

    &.lg {
        --tblr-icon-size: 1.5rem;
    }

    &.xl {
        --tblr-icon-size: 2.5rem;
    }

    &.xxl {
        --tblr-icon-size: 3.5rem;
    }
}
</style>