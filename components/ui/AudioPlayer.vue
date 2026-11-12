<template>
  <!-- 1. Minimal / Compact Inline Player (Card & Modal Grid Friendly) -->
  <div
    v-if="minimal"
    class="w-full rounded-xl p-2.5 bg-slate-50 dark:bg-theme-app border border-slate-200 dark:border-theme-border flex items-center gap-2.5 select-none transition-all shadow-2xs"
  >
    <!-- Hidden native audio element -->
    <audio
      ref="audioRef"
      :src="src"
      preload="metadata"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onDurationChange"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @waiting="isLoading = true"
      @playing="isLoading = false; isPlaying = true"
      @ended="onEnded"
      @error="onError"
    />

    <!-- Play/Pause Button -->
    <button
      type="button"
      class="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      :disabled="isLoading || !src"
      :title="isPlaying ? 'Pause Audio' : 'Play Audio'"
      @click="togglePlay"
    >
      <Icon v-if="isLoading" name="loading-03" class="text-xs animate-spin" />
      <Icon v-else-if="isPlaying" name="pause" class="text-xs" />
      <Icon v-else name="play" class="text-xs translate-x-0.5" />
    </button>

    <!-- Progress Scrubber Track & Timestamps -->
    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <div
        ref="scrubberRef"
        class="relative py-0.5 cursor-pointer flex items-center group touch-none"
        @mousedown="startSeek"
        @touchstart="startTouchSeek"
      >
        <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-theme-input relative overflow-hidden">
          <div
            class="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-[width] duration-75 ease-linear"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <div
          class="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-100 border border-indigo-600 dark:border-indigo-400 shadow-xs pointer-events-none transition-transform duration-100"
          :class="isSeeking ? 'scale-125' : 'group-hover:scale-125'"
          :style="{ left: `calc(${progressPercent}% * (100% - 10px) / 100)` }"
        />
      </div>

      <div class="flex items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 leading-none select-none">
        <span>{{ formatTime(currentTime) }} / {{ formattedDuration }}</span>
      </div>
    </div>

    <!-- Quick Controls: Grouped Speed & Audio with Separation Border -->
    <div class="inline-flex items-center rounded-lg border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card shadow-2xs divide-x divide-slate-200 dark:divide-theme-border shrink-0 overflow-hidden">
      <button
        type="button"
        class="px-2 py-1 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors cursor-pointer select-none"
        title="Playback Speed"
        @click="cyclePlaybackRate"
      >
        {{ playbackRate }}x
      </button>

      <button
        type="button"
        class="w-7 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors cursor-pointer"
        :title="isMuted ? 'Unmute' : 'Mute'"
        @click="toggleMute"
      >
        <Icon :name="isMuted ? 'volume-off' : 'volume-high'" class="text-xs" />
      </button>
    </div>
  </div>

  <!-- 2. Standard / Full Audio Player View -->
  <div
    v-else
    class="bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border rounded-xl select-none transition-all shadow-2xs"
    :class="compact ? 'p-3 flex flex-col gap-2' : 'p-4 flex flex-col gap-3'"
  >
    <!-- Hidden native audio element -->
    <audio
      ref="audioRef"
      :src="src"
      preload="metadata"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onDurationChange"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @waiting="isLoading = true"
      @playing="isLoading = false; isPlaying = true"
      @ended="onEnded"
      @error="onError"
    />

    <!-- Header Section (Only if title, icon or close button is needed) -->
    <div v-if="title || showClose" class="flex items-center justify-between gap-2 min-w-0">
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <span
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-theme-border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
        >
          <Icon :name="isPlaying ? 'play' : 'volume-high'" class="text-sm" :class="{ 'animate-pulse': isPlaying }" />
        </span>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" :title="title">
            {{ title }}
          </span>
          <span v-if="subtitle" class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            {{ subtitle }}
          </span>
        </div>
      </div>

      <!-- Close Action -->
      <UiButton
        v-if="showClose"
        variant="ghost"
        size="icon"
        icon="cancel-01"
        class="!h-7 !w-7 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 text-xs shrink-0"
        title="Close Player"
        @click="$emit('close')"
      />
    </div>

    <!-- Scrubber Progress Bar & Time -->
    <div class="flex flex-col gap-0.5 w-full">
      <!-- Interactive Scrubber Track -->
      <div
        ref="scrubberRef"
        class="relative py-1 cursor-pointer flex items-center group touch-none"
        @mousedown="startSeek"
        @touchstart="startTouchSeek"
      >
        <!-- Background Track -->
        <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-theme-input relative overflow-hidden">
          <!-- Filled Progress -->
          <div
            class="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-[width] duration-75 ease-linear"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>

        <!-- Thumb Handle (Enlarges on hover/drag) -->
        <div
          class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-slate-100 border-2 border-emerald-500 shadow-xs pointer-events-none transition-transform duration-100"
          :class="isSeeking ? 'scale-125 ring-2 ring-emerald-500/20' : 'group-hover:scale-125'"
          :style="{ left: `calc(${progressPercent}% * (100% - 12px) / 100)` }"
        />
      </div>

      <!-- Timestamps -->
      <div class="flex items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 leading-none select-none">
        <span>{{ formatTime(currentTime) }} / {{ formattedDuration }}</span>
      </div>
    </div>

    <!-- Player Controls Row -->
    <div class="flex items-center justify-between gap-2 pt-0.5">
      <!-- Left Controls: Skip Backward, Play/Pause, Skip Forward -->
      <div class="flex items-center gap-1.5">
        <!-- Skip Back 5s -->
        <UiButton
          variant="ghost"
          size="icon"
          icon="backward-01"
          class="!h-7 !w-7 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 text-xs"
          title="Rewind 5 seconds"
          @click="skip(-5)"
        />

        <!-- Play / Pause Main Button -->
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
          :disabled="isLoading || !src"
          :title="isPlaying ? 'Pause' : 'Play'"
          @click="togglePlay"
        >
          <Icon v-if="isLoading" name="loading-03" class="text-sm animate-spin" />
          <Icon v-else-if="isPlaying" name="pause" class="text-sm" />
          <Icon v-else name="play" class="text-sm translate-x-0.5" />
        </button>

        <!-- Skip Forward 5s -->
        <UiButton
          variant="ghost"
          size="icon"
          icon="forward-01"
          class="!h-7 !w-7 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 text-xs"
          title="Forward 5 seconds"
          @click="skip(5)"
        />
      </div>

      <!-- Right Controls: Speed Selector & Mute Toggle Grouped Pill -->
      <div class="inline-flex items-center rounded-lg border border-slate-200 dark:border-theme-border bg-slate-50 dark:bg-theme-app divide-x divide-slate-200 dark:divide-theme-border overflow-hidden">
        <button
          type="button"
          class="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors cursor-pointer select-none whitespace-nowrap"
          title="Playback speed"
          @click="cyclePlaybackRate"
        >
          Speed {{ playbackRate }}x
        </button>

        <button
          type="button"
          class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors cursor-pointer"
          :title="isMuted ? 'Unmute' : 'Mute'"
          @click="toggleMute"
        >
          <Icon :name="isMuted ? 'volume-off' : 'volume-high'" class="text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    title?: string
    subtitle?: string
    autoplay?: boolean
    compact?: boolean
    minimal?: boolean
    showClose?: boolean
    stopOtherOnPlay?: boolean
  }>(),
  {
    title: '',
    subtitle: '',
    autoplay: false,
    compact: false,
    minimal: false,
    showClose: false,
    stopOtherOnPlay: true
  }
)

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'ended'): void
  (e: 'close'): void
}>()

const instanceId = `audio_player_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`

const audioRef = ref<HTMLAudioElement | null>(null)
const scrubberRef = ref<HTMLDivElement | null>(null)

const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isMuted = ref(false)
const playbackRate = ref(1)
const isSeeking = ref(false)

const progressPercent = computed(() => {
  if (!duration.value || duration.value <= 0 || !isFinite(duration.value)) return 0
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
})

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const m = String(mins).padStart(2, '0')
  const s = String(secs).padStart(2, '0')
  return `${m}:${s}`
}

const formattedDuration = computed(() => {
  if (!isFinite(duration.value) || duration.value <= 0) {
    return currentTime.value > 0 ? formatTime(currentTime.value) : '00:00'
  }
  return formatTime(duration.value)
})

const notifyOtherAudios = () => {
  if (props.stopOtherOnPlay && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('jb:audio-play', {
        detail: { id: instanceId }
      })
    )

    // Also pause any native <audio> elements on the page
    document.querySelectorAll('audio').forEach((el) => {
      if (el !== audioRef.value && !el.paused) {
        try {
          el.pause()
        } catch (_) {}
      }
    })
  }
}

const onOtherAudioPlay = (e: Event) => {
  if (!props.stopOtherOnPlay) return
  const customEvent = e as CustomEvent<{ id: string }>
  if (customEvent.detail?.id !== instanceId && isPlaying.value) {
    if (audioRef.value && !audioRef.value.paused) {
      audioRef.value.pause()
    }
    isPlaying.value = false
  }
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    notifyOtherAudios()
    audioRef.value.play().catch(() => {})
  }
}

const skip = (seconds: number) => {
  if (!audioRef.value) return
  const maxDur = isFinite(duration.value) && duration.value > 0 ? duration.value : 3600
  const target = Math.max(0, Math.min(maxDur, audioRef.value.currentTime + seconds))
  audioRef.value.currentTime = target
  currentTime.value = target
}

const toggleMute = () => {
  if (!audioRef.value) return
  audioRef.value.muted = !audioRef.value.muted
  isMuted.value = audioRef.value.muted
}

const speedOptions = [1, 1.25, 1.5, 2]
const cyclePlaybackRate = () => {
  if (!audioRef.value) return
  const currentIndex = speedOptions.indexOf(playbackRate.value)
  const nextRate = speedOptions[(currentIndex + 1) % speedOptions.length] ?? 1
  playbackRate.value = nextRate
  audioRef.value.playbackRate = nextRate
}

// Scrubber dragging and seeking
const updateSeekPosition = (clientX: number) => {
  if (!scrubberRef.value || !audioRef.value || !isFinite(duration.value) || duration.value <= 0) return
  const rect = scrubberRef.value.getBoundingClientRect()
  const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left))
  const percent = offsetX / rect.width
  const targetTime = percent * duration.value
  currentTime.value = targetTime
  audioRef.value.currentTime = targetTime
}

const startSeek = (e: MouseEvent) => {
  isSeeking.value = true
  updateSeekPosition(e.clientX)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e: MouseEvent) => {
  if (isSeeking.value) {
    updateSeekPosition(e.clientX)
  }
}

const onMouseUp = () => {
  isSeeking.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const startTouchSeek = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (!touch) return
  isSeeking.value = true
  updateSeekPosition(touch.clientX)
  window.addEventListener('touchmove', onTouchMove)
  window.addEventListener('touchend', onTouchEnd)
}

const onTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (isSeeking.value && touch) {
    updateSeekPosition(touch.clientX)
  }
}

const onTouchEnd = () => {
  isSeeking.value = false
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
}

// Audio Event Listeners
const onLoadedMetadata = () => {
  if (audioRef.value) {
    const rawDuration = audioRef.value.duration
    if (isFinite(rawDuration) && rawDuration > 0) {
      duration.value = rawDuration
    } else if (rawDuration === Infinity) {
      // Fix for WebM blobs generated by MediaRecorder having Infinity duration in Chrome
      duration.value = 0
      const el = audioRef.value
      const onSeekEnd = () => {
        el.removeEventListener('timeupdate', onSeekEnd)
        if (isFinite(el.duration) && el.duration > 0) {
          duration.value = el.duration
        }
        el.currentTime = 0
      }
      el.addEventListener('timeupdate', onSeekEnd, { once: true })
      el.currentTime = 1e101
    } else {
      duration.value = 0
    }

    currentTime.value = audioRef.value.currentTime || 0
    isLoading.value = false
    if (props.autoplay) {
      notifyOtherAudios()
      audioRef.value.play().catch(() => {})
    }
  }
}

const onDurationChange = () => {
  if (audioRef.value) {
    const raw = audioRef.value.duration
    if (isFinite(raw) && raw > 0) {
      duration.value = raw
    }
  }
}

const onTimeUpdate = () => {
  if (audioRef.value && !isSeeking.value) {
    currentTime.value = audioRef.value.currentTime || 0
    const raw = audioRef.value.duration
    if (isFinite(raw) && raw > 0) {
      duration.value = raw
    } else if (currentTime.value > duration.value) {
      duration.value = currentTime.value
    }
  }
}

const onPlay = () => {
  isPlaying.value = true
  isLoading.value = false
  notifyOtherAudios()
  emit('play')
}

const onPause = () => {
  isPlaying.value = false
  emit('pause')
}

const onEnded = () => {
  if (currentTime.value > duration.value || !isFinite(duration.value)) {
    duration.value = currentTime.value
  }
  isPlaying.value = false
  currentTime.value = 0
  emit('ended')
}

const onError = () => {
  isLoading.value = false
  isPlaying.value = false
}

// Watch for src changes
watch(
  () => props.src,
  (newSrc) => {
    currentTime.value = 0
    duration.value = 0
    isPlaying.value = false
    if (audioRef.value && newSrc) {
      audioRef.value.load()
      if (props.autoplay) {
        notifyOtherAudios()
        audioRef.value.play().catch(() => {})
      }
    }
  }
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('jb:audio-play', onOtherAudioPlay)
  }
  if (audioRef.value && props.src) {
    audioRef.value.load()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('jb:audio-play', onOtherAudioPlay)
  }
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<style scoped></style>
