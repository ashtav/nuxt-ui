<template>
  <UiModal v-model:open="isOpen" title="Pin Study Location"
    description="Select or search your home / villa / hotel location in Bali." size="xl">
    <div class="space-y-4 py-1">
      <!-- Search Autocomplete Header -->
      <div class="relative flex items-center gap-2">
        <div class="relative flex-1">
          <input ref="searchInputRef" type="text" placeholder="Search hotel, villa, street name, or area in Bali..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-theme-border bg-slate-50 dark:bg-theme-input text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <button type="button" @click="locateCurrentPosition" :disabled="isLocating"
          class="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border hover:border-emerald-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0">
          <svg v-if="!isLocating" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="w-4 h-4 text-emerald-500">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <svg v-else class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ isLocating ? 'Locating...' : 'Locate Me' }}</span>
        </button>
      </div>

      <!-- Map Container -->
      <div
        class="relative w-full h-[360px] sm:h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-theme-border bg-slate-100 dark:bg-theme-app">
        <div ref="mapContainerRef" class="w-full h-full"></div>

        <!-- Map Loading Indicator -->
        <div v-if="isMapLoading"
          class="absolute inset-0 bg-white/80 dark:bg-theme-app/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
          <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Google Maps...</p>
        </div>

        <!-- Floating Quick Instruction Badge -->
        <div
          class="absolute bottom-3 left-3 bg-white dark:bg-theme-card px-3 py-1.5 rounded-lg border border-slate-200 dark:border-theme-border shadow-md text-[11px] font-medium text-slate-600 dark:text-slate-300 pointer-events-none flex items-center gap-1.5 z-10">
          <span>📍</span>
          <span>Click anywhere or drag the pin to set location</span>
        </div>
      </div>

      <!-- Distance & Address Preview Card -->
      <div
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-theme-card border border-slate-200 dark:border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1 max-w-md">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
              {{ currentDistance }} km from JB Location
            </span>
            <span v-if="routeDurationText" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              • 🚗 {{ routeDurationText }} drive
            </span>
            <span class="text-xs font-bold text-slate-500">
              ({{ formatRupiah(currentDistance * pricePerKm) }} / session)
            </span>
          </div>
          <p class="text-xs text-slate-700 dark:text-slate-200 font-medium line-clamp-2">
            {{ currentAddress || 'Click on the map or search above to select address...' }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 shrink-0">
          <UiButton type="button" variant="outline" size="md" rounded="rounded-xl" @click="isOpen = false">
            Cancel
          </UiButton>
          <UiButton type="button" variant="primary" size="md" rounded="rounded-xl" :disabled="!selectedCoords"
            @click="confirmLocation">
            Use This Location
          </UiButton>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import { JB_LOCATION, calculateDistanceToJB } from '~/utils/constants'
import { toast } from 'vue-sonner'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    initialLat?: number | null
    initialLng?: number | null
    initialAddress?: string
    pricePerKm?: number
  }>(),
  {
    modelValue: false,
    initialLat: null,
    initialLng: null,
    initialAddress: '',
    pricePerKm: 10000
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', data: { address: string; lat: number; lng: number; distance: number }): void
}>()

const runtimeConfig = useRuntimeConfig()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const mapContainerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const isMapLoading = ref(true)
const isLocating = ref(false)

const currentAddress = ref(props.initialAddress || '')
const selectedCoords = ref<{ lat: number; lng: number } | null>(
  props.initialLat && props.initialLng
    ? { lat: props.initialLat, lng: props.initialLng }
    : { lat: JB_LOCATION.latitude + 0.015, lng: JB_LOCATION.longitude + 0.015 }
)

let map: any = null
let jbMarker: any = null
let studentMarker: any = null
let connectingLine: any = null
let autocomplete: any = null
let geocoder: any = null
let directionsService: any = null
let directionsRenderer: any = null

const routeDistanceKm = ref<number | null>(null)
const routeDurationText = ref<string>('')

// ─── ANTI-ABUSE & COST PROTECTION LAYER ───────────────────────────────────
const MAX_LOOKUPS_PER_SESSION = 15
const lookupCount = ref(0)
const geocodeCache = new Map<string, string>()
const routeCache = new Map<string, { distanceKm: number; durationText: string; result: any }>()
let debounceTimer: any = null
let routeDebounceTimer: any = null
let lastGeocodedLat = 0
let lastGeocodedLng = 0

const currentDistance = computed(() => {
  if (routeDistanceKm.value !== null && routeDistanceKm.value > 0) {
    return routeDistanceKm.value
  }
  if (!selectedCoords.value) return 0
  return Math.round(calculateDistanceToJB(selectedCoords.value.lat, selectedCoords.value.lng) * 1.3 * 10) / 10
})

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

// Load Google Maps API Script
const loadGoogleMapsApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      return resolve()
    }

    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      if ((window as any).google?.maps) {
        return resolve()
      }
      existingScript.addEventListener('load', () => resolve())
      return
    }

    const apiKey = (runtimeConfig.public.googleApiKey as string) || 'AIzaSyCbCeP2nV--l1D202WY6GPlENQkKM9S810'
    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,geocoding`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })
}

// ─── DRIVING ROUTE VIA DIRECTIONS API (100% Precision) ────────────────────
const calculateDrivingRoute = (lat: number, lng: number, immediate = false) => {
  if (routeDebounceTimer) {
    clearTimeout(routeDebounceTimer)
    routeDebounceTimer = null
  }

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (routeCache.has(cacheKey)) {
    const cached = routeCache.get(cacheKey)!
    routeDistanceKm.value = cached.distanceKm
    routeDurationText.value = cached.durationText
    if (directionsRenderer && cached.result) {
      directionsRenderer.setDirections(cached.result)
      if (connectingLine) connectingLine.setMap(null)
    }
    return
  }

  const execute = () => {
    if (!directionsService || !(window as any).google?.maps) {
      fallbackStraightLine(lat, lng)
      return
    }

    const googleMaps = (window as any).google.maps
    const request = {
      origin: new googleMaps.LatLng(JB_LOCATION.latitude, JB_LOCATION.longitude),
      destination: new googleMaps.LatLng(lat, lng),
      travelMode: googleMaps.TravelMode.DRIVING
    }

    directionsService.route(request, (result: any, status: string) => {
      if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
        const leg = result.routes[0].legs[0]
        const km = Math.round((leg.distance.value / 1000) * 10) / 10
        routeDistanceKm.value = km
        routeDurationText.value = leg.duration.text

        if (directionsRenderer) {
          directionsRenderer.setDirections(result)
          if (connectingLine) connectingLine.setMap(null)
        }

        routeCache.set(cacheKey, {
          distanceKm: km,
          durationText: leg.duration.text,
          result: result
        })
      } else {
        fallbackStraightLine(lat, lng)
      }
    })
  }

  if (immediate) {
    execute()
  } else {
    routeDebounceTimer = setTimeout(execute, 600)
  }
}

const fallbackStraightLine = (lat: number, lng: number) => {
  routeDistanceKm.value = null
  routeDurationText.value = ''
  if (directionsRenderer) {
    directionsRenderer.set('directions', null)
  }
  if (connectingLine && (window as any).google?.maps) {
    const googleMaps = (window as any).google.maps
    const LatLngClass = googleMaps.LatLng || googleMaps.maps?.LatLng
    if (LatLngClass && map) {
      connectingLine.setMap(map)
      connectingLine.setPath([
        new LatLngClass(JB_LOCATION.latitude, JB_LOCATION.longitude),
        new LatLngClass(lat, lng)
      ])
    }
  }
}

// Reverse Geocode coordinates to address string (Debounced, Cached & Rate-Limited)
const reverseGeocode = (lat: number, lng: number, immediate = false) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  // 1. Check in-memory cache
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (geocodeCache.has(cacheKey)) {
    currentAddress.value = geocodeCache.get(cacheKey)!
    return
  }

  // 2. Minimum distance threshold check (~20m)
  if (lastGeocodedLat && lastGeocodedLng) {
    const dLat = Math.abs(lat - lastGeocodedLat)
    const dLng = Math.abs(lng - lastGeocodedLng)
    if (dLat < 0.0002 && dLng < 0.0002) {
      return
    }
  }

  // 3. Max lookups protection per session
  if (lookupCount.value >= MAX_LOOKUPS_PER_SESSION) {
    currentAddress.value = `Pinned Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    return
  }

  const execute = async () => {
    if (!geocoder) {
      const googleMaps = (window as any).google?.maps
      if (googleMaps?.Geocoder) {
        geocoder = new googleMaps.Geocoder()
      } else if (googleMaps?.importLibrary) {
        try {
          const { Geocoder } = await googleMaps.importLibrary('geocoding')
          if (Geocoder) geocoder = new Geocoder()
        } catch {}
      }
    }

    if (!geocoder) return

    lookupCount.value++
    lastGeocodedLat = lat
    lastGeocodedLng = lng

    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results && results[0]) {
        const formatted = results[0].formatted_address
        currentAddress.value = formatted
        geocodeCache.set(cacheKey, formatted)
      } else {
        // Graceful fallback for REQUEST_DENIED, OVER_QUERY_LIMIT, or other API errors
        if (!currentAddress.value || currentAddress.value.startsWith('Pinned Location') || currentAddress.value.startsWith('Pinned Coordinates')) {
          currentAddress.value = `Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
        }
      }
    })
  }

  if (immediate) {
    execute()
  } else {
    debounceTimer = setTimeout(execute, 700)
  }
}

// ─── BALI LAND BOUNDARY POLYGON (Prevents pinning on ocean or other islands) ──
const BALI_MAINLAND_POLYGON: Array<[number, number]> = [
  [-8.10, 114.43], // Gilimanuk
  [-8.11, 114.60], // Gerokgak
  [-8.14, 114.95], // Seririt
  [-8.08, 115.15], // Singaraja
  [-8.11, 115.35], // Tejakula
  [-8.22, 115.58], // Tianyar
  [-8.33, 115.70], // Amed / Culik
  [-8.45, 115.72], // Karangasem / Ujung
  [-8.55, 115.55], // Padangbai / Candidasa
  [-8.58, 115.42], // Kusamba / Klungkung
  [-8.60, 115.33], // Ketewel / Gianyar
  [-8.68, 115.26], // Sanur
  [-8.75, 115.22], // Benoa
  [-8.78, 115.23], // Tanjung Benoa
  [-8.81, 115.23], // Nusa Dua
  [-8.85, 115.18], // Pandawa / Kutuh
  [-8.84, 115.11], // Ungasan
  [-8.83, 115.09], // Uluwatu
  [-8.78, 115.12], // Jimbaran
  [-8.72, 115.16], // Tuban / Kuta
  [-8.68, 115.15], // Seminyak
  [-8.65, 115.12], // Canggu
  [-8.62, 115.08], // Tanah Lot
  [-8.56, 115.01], // Kediri / Tabanan Coast
  [-8.51, 114.88], // Antosari / Soka
  [-8.45, 114.73], // Pekutatan
  [-8.39, 114.60], // Mendoyo / Negara
  [-8.34, 114.45], // Melaya
  [-8.18, 114.43], // Cekik / Menjangan
]

const NUSA_ISLANDS_POLYGON: Array<[number, number]> = [
  [-8.66, 115.43], // Lembongan
  [-8.68, 115.55], // Buyuk
  [-8.76, 115.62], // Suana
  [-8.80, 115.58], // Tanglad
  [-8.78, 115.50], // Guyangan
  [-8.72, 115.45], // Toyapakeh
]

const isPointInPolygon = (point: [number, number], vs: Array<[number, number]>): boolean => {
  const x = point[1] // lng
  const y = point[0] // lat
  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const ptI = vs[i]
    const ptJ = vs[j]
    if (!ptI || !ptJ) continue
    const xi = ptI[1], yi = ptI[0]
    const xj = ptJ[1], yj = ptJ[0]
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

const isLocationOnBaliLand = (lat: number, lng: number): boolean => {
  return isPointInPolygon([lat, lng], BALI_MAINLAND_POLYGON) || isPointInPolygon([lat, lng], NUSA_ISLANDS_POLYGON)
}

// Update student marker position and polyline
const updateStudentPosition = (rawLat: number, rawLng: number, updateAddress = true) => {
  // Validate that the clicked/dragged position is on Bali Land
  if (!isLocationOnBaliLand(rawLat, rawLng)) {
    toast.warning('Please select a valid land address on Bali island. (Ocean/water locations are not accessible).')
    // Reset marker to last valid coordinates if available
    if (studentMarker && selectedCoords.value) {
      studentMarker.setPosition(selectedCoords.value)
    }
    return
  }

  const lat = rawLat
  const lng = rawLng
  selectedCoords.value = { lat, lng }

  if (studentMarker) {
    studentMarker.setPosition({ lat, lng })
  }

  calculateDrivingRoute(lat, lng, false)

  if (updateAddress) {
    reverseGeocode(lat, lng)
  }
}

// Initialize Google Maps
const initMap = async () => {
  try {
    isMapLoading.value = true
    await loadGoogleMapsApi()

    if (!mapContainerRef.value || !(window as any).google?.maps) return
    const googleMaps = (window as any).google.maps
    let mapsLib: any = null
    let geocodingLib: any = null
    let placesLib: any = null
    let markerLib: any = null

    if (googleMaps.importLibrary) {
      try {
        const [mLib, gLib, pLib, mkLib] = await Promise.all([
          googleMaps.importLibrary('maps'),
          googleMaps.importLibrary('geocoding'),
          googleMaps.importLibrary('places'),
          googleMaps.importLibrary('marker'),
        ])
        mapsLib = mLib
        geocodingLib = gLib
        placesLib = pLib
        markerLib = mkLib
      } catch (e) {
        console.warn('Google Maps importLibrary warning:', e)
      }
    }

    const MapClass = googleMaps.Map || mapsLib?.Map
    const GeocoderClass = googleMaps.Geocoder || geocodingLib?.Geocoder
    const MarkerClass = googleMaps.Marker || markerLib?.Marker || mapsLib?.Marker
    const PolylineClass = googleMaps.Polyline || mapsLib?.Polyline
    const LatLngClass = googleMaps.LatLng || mapsLib?.LatLng
    const SymbolPathObj = googleMaps.SymbolPath || mapsLib?.SymbolPath

    if (GeocoderClass) {
      geocoder = new GeocoderClass()
    }

    const initialPos = selectedCoords.value || {
      lat: JB_LOCATION.latitude + 0.01,
      lng: JB_LOCATION.longitude + 0.01
    }

    if (!MapClass) {
      console.error('Google Maps Map class could not be loaded.')
      return
    }

    map = new MapClass(mapContainerRef.value, {
      center: initialPos,
      zoom: 14,
      minZoom: 9.5, // Prevents zooming out beyond Bali island
      maxZoom: 19,
      // Restrict all panning strictly to Bali Island boundaries
      restriction: {
        latLngBounds: {
          north: -8.00, // Northern coast of Bali (Singaraja / Lovina)
          south: -8.95, // Southern coast of Bali (Uluwatu / Nusa Penida)
          west: 114.40, // West Bali (Gilimanuk / Menjangan)
          east: 115.75  // East Bali (Amed / Karangasem / Nusa Lembongan)
        },
        strictBounds: true // Lock camera strictly inside Bali
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: isDarkMode() ? darkMapStyles : lightMapStyles
    })

    // 1. JB Campus Marker (Green)
    if (MarkerClass) {
      jbMarker = new MarkerClass({
        position: { lat: JB_LOCATION.latitude, lng: JB_LOCATION.longitude },
        map: map,
        title: 'Jembatan Bahasa HQ',
        icon: SymbolPathObj ? {
          path: SymbolPathObj.BACKWARD_CLOSED_ARROW,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 6
        } : undefined
      })

      // 2. Student Location Marker (Draggable)
      studentMarker = new MarkerClass({
        position: initialPos,
        map: map,
        draggable: true,
        title: 'Your Learning Location',
        animation: googleMaps.Animation?.DROP
      })
    }

    // 3. Directions Service & Renderer for 100% Real Road Polyline
    if (googleMaps.DirectionsService && googleMaps.DirectionsRenderer) {
      directionsService = new googleMaps.DirectionsService()
      directionsRenderer = new googleMaps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#059669',
          strokeWeight: 5,
          strokeOpacity: 0.85
        }
      })
    }

    // 4. Connecting Distance Polyline (Fallback straight dashed line)
    if (PolylineClass && LatLngClass) {
      connectingLine = new PolylineClass({
        path: [
          new LatLngClass(JB_LOCATION.latitude, JB_LOCATION.longitude),
          new LatLngClass(initialPos.lat, initialPos.lng)
        ],
        strokeColor: '#059669',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map
      })
    }

    // Calculate Driving Route on initial open
    calculateDrivingRoute(initialPos.lat, initialPos.lng, true)

    // Event: Drag Student Marker
    if (studentMarker) {
      studentMarker.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        updateStudentPosition(lat, lng, true)
      })
    }

    // Event: Click on Map
    map.addListener('click', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      updateStudentPosition(lat, lng, true)
    })

    // 5. Autocomplete Search Setup (Restricted to Bali & Minimal Data Fields)
    const AutocompleteClass = googleMaps.places?.Autocomplete || placesLib?.Autocomplete
    if (searchInputRef.value && AutocompleteClass) {
      autocomplete = new AutocompleteClass(searchInputRef.value, {
        componentRestrictions: { country: 'id' },
        fields: ['geometry.location', 'name', 'formatted_address'],
        bounds: new googleMaps.LatLngBounds(
          new googleMaps.LatLng(-8.90, 114.40),
          new googleMaps.LatLng(-8.05, 115.75)
        ),
        strictBounds: false
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry || !place.geometry.location) {
          toast.warning('Location details not found for this query.')
          return
        }

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        currentAddress.value = place.formatted_address || place.name || ''

        map.setCenter({ lat, lng })
        map.setZoom(16)
        updateStudentPosition(lat, lng, false)
      })
    }

    if (!props.initialAddress && initialPos) {
      reverseGeocode(initialPos.lat, initialPos.lng, true)
    }

    // Smart User Location Auto-Detect (only if user is currently inside Bali)
    if (!props.initialLat && !props.initialLng && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude
          const uLng = pos.coords.longitude
          if (isLocationOnBaliLand(uLat, uLng)) {
            if (map) {
              map.setCenter({ lat: uLat, lng: uLng })
              map.setZoom(15)
            }
            updateStudentPosition(uLat, uLng, true)
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000 }
      )
    }
  } catch (err) {
    console.error('Failed initializing Google Map:', err)
  } finally {
    isMapLoading.value = false
  }
}

// Locate via Browser Geolocation
const locateCurrentPosition = () => {
  if (!navigator.geolocation) {
    toast.error('Geolocation is not supported by your browser.')
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      if (map) {
        map.setCenter({ lat, lng })
        map.setZoom(16)
      }
      updateStudentPosition(lat, lng, true)
      toast.success('Located your current position!')
    },
    (error) => {
      isLocating.value = false
      toast.warning('Could not retrieve your location. Please check browser permissions.')
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

const confirmLocation = () => {
  if (!selectedCoords.value) return
  emit('confirm', {
    address: currentAddress.value || `${selectedCoords.value.lat.toFixed(6)}, ${selectedCoords.value.lng.toFixed(6)}`,
    lat: selectedCoords.value.lat,
    lng: selectedCoords.value.lng,
    distance: currentDistance.value
  })
  isOpen.value = false
}

watch(isOpen, (opened) => {
  if (opened) {
    lookupCount.value = 0
    nextTick(() => {
      setTimeout(() => {
        initMap()
      }, 150)
    })
  } else {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (routeDebounceTimer) {
      clearTimeout(routeDebounceTimer)
      routeDebounceTimer = null
    }
  }
})

let themeObserver: MutationObserver | null = null

onMounted(() => {
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    themeObserver = new MutationObserver(() => {
      if (map) {
        map.setOptions({ styles: isDarkMode() ? darkMapStyles : lightMapStyles })
      }
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  }
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  if (routeDebounceTimer) {
    clearTimeout(routeDebounceTimer)
    routeDebounceTimer = null
  }
})

const isDarkMode = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

const lightMapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
]

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1e2128' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e2128' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#272b34' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e2128' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#313742' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#15171c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] }
]
</script>

<style>
.dark .pac-container {
  background-color: #22252e !important;
  border: 1px solid #272b34 !important;
  color: #ffffff !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
  border-radius: 0.75rem !important;
  margin-top: 4px !important;
  font-family: inherit !important;
}

.dark .pac-item {
  border-top: 1px solid #272b34 !important;
  color: #cbd5e1 !important;
  padding: 6px 10px !important;
  cursor: pointer !important;
}

.dark .pac-item:hover,
.dark .pac-item-selected {
  background-color: #262b37 !important;
}

.dark .pac-item-query {
  color: #ffffff !important;
  font-size: 12px !important;
}

.dark .pac-matched {
  color: #34d399 !important;
}

.dark .pac-icon {
  filter: invert(0.8) hue-rotate(180deg) !important;
}

.dark .pac-logo:after {
  filter: invert(0.8) !important;
}
</style>
