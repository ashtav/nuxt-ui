<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative w-full flex items-center">
      <!-- Hidden file input for local audio selection -->
      <input v-if="allowLocalFile" ref="fileInputRef" type="file" class="hidden" :accept="accept"
        @change="handleFileChange" />

      <!-- Input -->
      <input :id="inputId" ref="inputRef" v-bind="$attrs" type="text" :value="displayValue" :placeholder="placeholder"
        :required="required" :readonly="isLocalFileOrRecording" @input="handleInput" @blur="handleBlur"
        :disabled="loading || isRecording || ($attrs.disabled !== undefined && $attrs.disabled !== false)"
        class="truncate flex h-9 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          displayError
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500',
          isLocalFileOrRecording ? 'bg-slate-50/50 dark:bg-theme-hover cursor-default font-medium text-emerald-700 dark:text-emerald-400' : ''
        ]"
        :style="inputPaddingRightStyle" />

      <!-- Playback Visualizer Overlay (Only shown when playing) -->
      <Transition name="fade">
        <div v-if="isPlaying"
          class="absolute inset-y-px inset-x-px bg-white dark:bg-theme-card flex items-center justify-between px-3 pr-10 rounded-lg pointer-events-none z-10 overflow-hidden">
          <!-- Left: animated indicator & playback time -->
          <div class="flex items-center gap-2 min-w-0 pr-2">
            <span class="relative flex h-2 w-2 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">
              Playing: <span class="text-slate-700 dark:text-slate-300 font-normal">{{ formattedPlaybackTime }}</span>
            </span>
          </div>

          <!-- Right: live canvas bars visualizer -->
          <div class="flex items-center shrink-0 pr-1">
            <canvas ref="playbackCanvas" width="48" height="16" class="w-12 h-4 shrink-0 block"></canvas>
          </div>

          <!-- Sleek progress bar at bottom spanning full width -->
          <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-theme-border overflow-hidden">
            <div
              class="h-full bg-emerald-500 transition-all duration-100 ease-linear"
              :style="{ width: `${playbackProgress}%` }"
            ></div>
          </div>
        </div>
      </Transition>

      <!-- Recording Overlay (wraps the input field) -->
      <Transition name="fade">
        <div v-if="isRecording"
          class="absolute inset-0 bg-red-50 dark:bg-red-950/80 rounded-lg border border-red-200 dark:border-red-900/60 flex items-center justify-between px-1 ps-3 z-10">
          <div class="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold animate-pulse">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>Recording: {{ formattedTime }}<span v-if="maxDuration" class="opacity-80 font-normal text-[11px]"> / {{ formatDuration(maxDuration) }}</span></span>
          </div>

          <!-- Right items: Visualizer and Stop button -->
          <div class="flex items-center gap-3">
            <!-- Canvas Visualizer (Green, 6 bars) -->
            <canvas ref="recordingCanvas" width="40" height="16" class="w-10 h-4 shrink-0 block"></canvas>

            <!-- Stop Button inside the overlay -->
            <button type="button" @click="stopRecording"
              class="h-7 px-2.5 flex items-center gap-1.5 rounded-md bg-white dark:bg-theme-card text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-theme-hover text-xs border border-red-200 dark:border-red-900/60 transition-all cursor-pointer focus:outline-none shadow-xs">
              <Icon name="stop" class="shrink-0" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Suffix Actions (Only shown when not recording) -->
      <div v-if="!isRecording" class="absolute right-1 flex items-center z-20">
        <TransitionGroup name="btn-action" tag="div" class="relative flex items-center gap-1">
          <!-- Play / Stop Button -->
          <button
            v-if="modelValue"
            key="btn-play"
            type="button"
            @click="togglePlayback"
            class="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 border focus:outline-none cursor-pointer shrink-0"
            :class="[
              isPlaying
                ? 'text-red-600 dark:text-red-400 bg-white dark:bg-theme-card hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800/60 shadow-xs'
                : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 bg-white dark:bg-theme-card hover:bg-slate-50 dark:hover:bg-theme-hover border-slate-200 dark:border-theme-border'
            ]"
            :title="isPlaying ? 'Stop playback' : 'Play recorded audio'"
          >
            <Icon :name="isPlaying ? 'stop' : 'play'" size="sm" />
          </button>

          <!-- Minimalist Delete button (hidden when playing) -->
          <button
            v-if="modelValue && !isPlaying"
            key="btn-delete"
            type="button"
            @click="clearAudio"
            class="flex items-center justify-center w-7 h-7 rounded-md text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-transparent focus:outline-none cursor-pointer shrink-0"
            title="Delete recorded audio"
          >
            <Icon name="delete-02" size="sm" />
          </button>

          <!-- Minimalist Select Local File Button (hidden when audio is present or playing) -->
          <button
            v-if="allowLocalFile && !modelValue && !isPlaying"
            key="btn-file"
            type="button"
            :disabled="loading"
            @click="triggerFileSelect"
            class="flex items-center justify-center gap-1 px-2.5 h-7 rounded-md text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 bg-white dark:bg-theme-card hover:bg-slate-50 dark:hover:bg-theme-hover text-xs focus:outline-none transition-colors border border-slate-200 dark:border-theme-border cursor-pointer shrink-0 whitespace-nowrap"
            title="Select audio file from local device"
          >
            <Icon name="file-attachment" size="xs" class="shrink-0 text-slate-400 dark:text-slate-500" />
            <span>File</span>
          </button>

          <!-- Minimalist Record Button (hidden when audio is present or playing) -->
          <button
            v-if="!modelValue && !isPlaying"
            key="btn-record"
            type="button"
            :disabled="loading"
            @click="startRecording"
            class="flex items-center justify-center gap-1 px-2.5 h-7 rounded-md text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 bg-white dark:bg-theme-card hover:bg-slate-50 dark:hover:bg-theme-hover text-xs focus:outline-none transition-colors border border-slate-200 dark:border-theme-border cursor-pointer shrink-0 whitespace-nowrap"
            title="Record audio via microphone"
          >
            <Icon name="mic-01" class="shrink-0 text-slate-400 dark:text-slate-500" />
            <span>Record</span>
          </button>
        </TransitionGroup>
      </div>
    </div>

    <!-- Error message display -->
    <span v-if="typeof displayError === 'string' && displayError"
      class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ displayError }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId, onBeforeUnmount, watch, nextTick } from 'vue'

defineOptions({
  inheritAttrs: false
})

interface Props {
  label?: string
  hint?: string
  required?: boolean
  error?: string | boolean
  loading?: boolean
  placeholder?: string
  allowLocalFile?: boolean
  accept?: string
  maxSize?: number // in MB
  maxDuration?: number // in seconds, default 60 (1 minute)
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  error: false,
  loading: false,
  placeholder: 'Enter audio path, asset URL, or select/record audio...',
  allowLocalFile: true,
  accept: 'audio/*',
  maxSize: 20,
  maxDuration: 60,
})

const modelValue = defineModel<string | null>({ default: '' })
const inputId = useId()
const inputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const localError = ref<string | null>(null)
const selectedFileName = ref<string>('')

const displayError = computed(() => {
  return localError.value || props.error
})

const displayValue = computed(() => {
  if (selectedFileName.value) {
    return selectedFileName.value
  }
  if (!modelValue.value) return ''
  const valStr = String(modelValue.value)
  if (valStr.startsWith('data:audio')) {
    return isRecordedAudio.value ? 'Recorded Audio File' : 'Uploaded Audio File'
  }
  return modelValue.value
})

const isLocalFileOrRecording = computed(() => {
  if (selectedFileName.value) return true
  if (!modelValue.value) return false
  return String(modelValue.value).startsWith('data:audio') || isRecordedAudio.value
})

// ─── Playback State ───
const isPlaying = ref(false)
const playbackCurrentTime = ref(0)
const playbackDuration = ref(0)
let audioPlayer: HTMLAudioElement | null = null

const playbackProgress = computed(() => {
  if (!playbackDuration.value || !isFinite(playbackDuration.value) || playbackDuration.value <= 0) return 0
  return Math.min(100, Math.max(0, (playbackCurrentTime.value / playbackDuration.value) * 100))
})

const formattedPlaybackTime = computed(() => {
  const curM = Math.floor(playbackCurrentTime.value / 60)
  const curS = Math.floor(playbackCurrentTime.value % 60)
  const cur = `${curM}:${curS < 10 ? '0' : ''}${curS}`

  if (!playbackDuration.value || !isFinite(playbackDuration.value) || playbackDuration.value <= 0) {
    return cur
  }
  const durM = Math.floor(playbackDuration.value / 60)
  const durS = Math.floor(playbackDuration.value % 60)
  const dur = `${durM}:${durS < 10 ? '0' : ''}${durS}`
  return `${cur} / ${dur}`
})

const inputPaddingRightStyle = computed(() => {
  if (isRecording.value) return 'padding-right: 84px;'
  if (isPlaying.value) return 'padding-right: 40px;'
  if (modelValue.value) return 'padding-right: 72px;'
  let rightOffset = 8
  if (props.allowLocalFile) rightOffset += 56
  rightOffset += 68
  return `padding-right: ${rightOffset}px;`
})

const recordingCanvas = ref<HTMLCanvasElement | null>(null)
const playbackCanvas = ref<HTMLCanvasElement | null>(null)

// ─── Recording State ───
const isRecording = ref(false)
const isRecordedAudio = ref(false)
const recordingTime = ref(0)
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []
let timerInterval: any = null

watch(() => modelValue.value, (val) => {
  if (isPlaying.value) {
    stopPlayback()
  }
  if (val && String(val).startsWith('data:audio')) {
    if (!selectedFileName.value) {
      isRecordedAudio.value = true
    }
  } else if (!val) {
    isRecordedAudio.value = false
    selectedFileName.value = ''
  }
}, { immediate: true })

// ─── Web Audio API (Visualizer) State ───
let recordingAudioContext: AudioContext | null = null
let recordingAnalyser: AnalyserNode | null = null
let recordingAnimationId: number | null = null

let playbackAudioContext: AudioContext | null = null
let playbackAnalyser: AnalyserNode | null = null
let playbackAnimationId: number | null = null
let playbackSourceNode: MediaElementAudioSourceNode | null = null

const formattedTime = computed(() => {
  const m = Math.floor(recordingTime.value / 60)
  const s = recordingTime.value % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
})

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// ─── Recording Visualizer ───
const startRecordingVisualizer = (stream: MediaStream) => {
  if (!recordingCanvas.value) return
  const canvas = recordingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return

  try {
    recordingAudioContext = new AudioContextClass()
    recordingAnalyser = recordingAudioContext.createAnalyser()
    const source = recordingAudioContext.createMediaStreamSource(stream)
    source.connect(recordingAnalyser)

    recordingAnalyser.fftSize = 32
    const bufferLength = recordingAnalyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isRecording.value) return
      recordingAnimationId = requestAnimationFrame(draw)

      if (recordingAnalyser) {
        recordingAnalyser.getByteFrequencyData(dataArray)
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barCount = 6
      const gap = 3
      const totalGap = (barCount - 1) * gap
      const barWidth = (canvas.width - totalGap) / barCount

      ctx.fillStyle = '#10b981' // Emerald Green

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i] || 0
        const percent = val / 255
        // scale height to canvas dimensions
        const barHeight = Math.max(2, percent * canvas.height)
        const x = i * (barWidth + gap)
        const y = canvas.height - barHeight

        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 1.5)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }
    }

    draw()
  } catch (err) {
    console.warn('Microphone visualizer failed to start:', err)
  }
}

const stopRecordingVisualizer = () => {
  if (recordingAnimationId) {
    cancelAnimationFrame(recordingAnimationId)
    recordingAnimationId = null
  }
  if (recordingAudioContext) {
    if (recordingAudioContext.state !== 'closed') {
      recordingAudioContext.close()
    }
    recordingAudioContext = null
  }
  recordingAnalyser = null
}

// ─── Playback Visualizer ───
const startPlaybackVisualizer = (audioElement: HTMLAudioElement) => {
  if (!playbackCanvas.value) return
  const canvas = playbackCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return

  try {
    playbackAudioContext = new AudioContextClass()
    playbackAnalyser = playbackAudioContext.createAnalyser()
    playbackSourceNode = playbackAudioContext.createMediaElementSource(audioElement)

    playbackSourceNode.connect(playbackAnalyser)
    playbackAnalyser.connect(playbackAudioContext.destination)

    playbackAnalyser.fftSize = 32
    const bufferLength = playbackAnalyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying.value) return
      playbackAnimationId = requestAnimationFrame(draw)

      if (playbackAnalyser) {
        playbackAnalyser.getByteFrequencyData(dataArray)
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barCount = 7
      const gap = 3
      const totalGap = (barCount - 1) * gap
      const barWidth = (canvas.width - totalGap) / barCount

      ctx.fillStyle = '#10b981' // Emerald Green

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i] || 0
        const percent = val / 255
        const barHeight = Math.max(2, percent * canvas.height)
        const x = i * (barWidth + gap)
        const y = canvas.height - barHeight

        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 1.5)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }
    }

    draw()
  } catch (err) {
    console.warn('Playback visualizer failed to start:', err)
  }
}

const stopPlaybackVisualizer = () => {
  if (playbackAnimationId) {
    cancelAnimationFrame(playbackAnimationId)
    playbackAnimationId = null
  }
  if (playbackAudioContext) {
    if (playbackAudioContext.state !== 'closed') {
      playbackAudioContext.close()
    }
    playbackAudioContext = null
  }
  playbackAnalyser = null
  playbackSourceNode = null
}

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

// Detect the best supported MIME type for the current browser.
// Safari supports audio/mp4; Chrome/Firefox support audio/webm.
const getSupportedMimeType = (): string => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = getSupportedMimeType()
    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    chunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      // Use the actual MIME type the MediaRecorder used so the browser can play it back
      const actualMimeType = mediaRecorder?.mimeType || mimeType || 'audio/webm'
      const blob = new Blob(chunks, { type: actualMimeType })
      selectedFileName.value = `Recorded_Audio_${formattedTime.value.replace(':', 'm')}s`
      const reader = new FileReader()
      reader.onloadend = () => {
        modelValue.value = reader.result as string
        isRecordedAudio.value = true
      }
      reader.readAsDataURL(blob)

      // Clean up stream tracks
      stream.getTracks().forEach(track => track.stop())
    }

    // Stop playback if playing
    if (isPlaying.value) {
      stopPlayback()
    }

    recordingTime.value = 0
    isRecording.value = true
    mediaRecorder.start()

    nextTick(() => {
      startRecordingVisualizer(stream)
    })

    timerInterval = setInterval(() => {
      recordingTime.value++
      if (props.maxDuration && recordingTime.value >= props.maxDuration) {
        stopRecording()
      }
    }, 1000)
  } catch (err) {
    console.error('Microphone access denied or error starting recording:', err)
  }
}

const stopRecording = () => {
  stopRecordingVisualizer()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  isRecording.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// ─── Playback Handling ───
const togglePlayback = () => {
  if (isPlaying.value) {
    stopPlayback()
  } else {
    startPlayback()
  }
}

const startPlayback = () => {
  if (!modelValue.value) return

  playbackCurrentTime.value = 0
  playbackDuration.value = 0

  audioPlayer = new Audio()
  audioPlayer.crossOrigin = 'anonymous'
  audioPlayer.src = modelValue.value

  audioPlayer.onloadedmetadata = () => {
    if (audioPlayer && isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
      playbackDuration.value = audioPlayer.duration
    }
  }

  audioPlayer.ondurationchange = () => {
    if (audioPlayer && isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
      playbackDuration.value = audioPlayer.duration
    }
  }

  audioPlayer.ontimeupdate = () => {
    if (audioPlayer) {
      playbackCurrentTime.value = audioPlayer.currentTime
      if ((!playbackDuration.value || !isFinite(playbackDuration.value)) && isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
        playbackDuration.value = audioPlayer.duration
      }
    }
  }

  isPlaying.value = true

  nextTick(() => {
    if (audioPlayer) {
      startPlaybackVisualizer(audioPlayer)
    }
  })

  audioPlayer.play().catch((err) => {
    console.warn('Playback failed:', err)
    stopPlayback()
  })

  audioPlayer.onended = () => {
    stopPlayback()
  }

  audioPlayer.onerror = (err) => {
    console.warn('Audio playback error:', err)
    stopPlayback()
  }
}

const stopPlayback = () => {
  stopPlaybackVisualizer()
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer.ontimeupdate = null
    audioPlayer.onloadedmetadata = null
    audioPlayer.ondurationchange = null
    audioPlayer.onended = null
    audioPlayer.onerror = null
    audioPlayer = null
  }
  isPlaying.value = false
  playbackCurrentTime.value = 0
  playbackDuration.value = 0
}

const clearAudio = () => {
  stopPlayback()
  modelValue.value = ''
  selectedFileName.value = ''
  isRecordedAudio.value = false
  localError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// ─── File Select Handling ───
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  localError.value = null
  const file = input.files[0]
  if (!file) return

  if (props.maxSize !== undefined) {
    const maxSizeBytes = props.maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      localError.value = `File size of ${file.name} must be less than ${props.maxSize} MB.`
      input.value = ''
      return
    }
  }

  const applyFile = () => {
    selectedFileName.value = file.name
    const reader = new FileReader()
    reader.onloadend = () => {
      modelValue.value = reader.result as string
      isRecordedAudio.value = false
    }
    reader.readAsDataURL(file)
    input.value = ''
  }

  if (props.maxDuration && props.maxDuration > 0) {
    const objectUrl = URL.createObjectURL(file)
    const tempAudio = new Audio()
    tempAudio.preload = 'metadata'
    tempAudio.src = objectUrl

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
      tempAudio.onloadedmetadata = null
      tempAudio.onerror = null
    }

    tempAudio.onloadedmetadata = () => {
      const duration = tempAudio.duration
      cleanup()
      if (isFinite(duration) && duration > props.maxDuration) {
        const maxText = props.maxDuration >= 60
          ? `${Math.floor(props.maxDuration / 60)} minute${props.maxDuration >= 120 ? 's' : ''}`
          : `${props.maxDuration}s`
        localError.value = `Audio duration (${formatDuration(Math.round(duration))}) exceeds the maximum allowed duration of ${maxText}.`
        input.value = ''
        return
      }
      applyFile()
    }

    tempAudio.onerror = () => {
      cleanup()
      applyFile()
    }
  } else {
    applyFile()
  }
}

// ─── Input Events ───
const handleInput = (event: Event) => {
  if (isLocalFileOrRecording.value) return
  const input = event.target as HTMLInputElement
  modelValue.value = input.value
}

const handleBlur = (event: FocusEvent) => {
  if (isLocalFileOrRecording.value) return
  const input = event.target as HTMLInputElement
  modelValue.value = input.value
}

onBeforeUnmount(() => {
  stopRecording()
  stopPlayback()
})
</script>

<style scoped>
/* Action buttons slide & fade transition (FLIP) */
.btn-action-move,
.btn-action-enter-active,
.btn-action-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-action-enter-from,
.btn-action-leave-to {
  opacity: 0;
  transform: scale(0.85) translateX(6px);
}

.btn-action-leave-active {
  position: absolute;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
