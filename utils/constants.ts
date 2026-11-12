export const DEFAULT_LOCATION = {
  latitude: -8.629938149882552,
  longitude: 115.15469939331466,
  address: 'Center Location',
  gmapsLink: 'https://maps.google.com/?q=-8.629938149882552,115.15469939331466'
}

// Backward compatibility alias for JB_LOCATION
export const JB_LOCATION = DEFAULT_LOCATION

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number = DEFAULT_LOCATION.latitude,
  lon2: number = DEFAULT_LOCATION.longitude
): number {
  const R = 6371 // Earth radius in KM
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 10) / 10
}

export function calculateDistanceToJB(lat: number, lon: number): number {
  return calculateDistance(lat, lon)
}

export function extractCoordsFromGmaps(url: string): { lat: number; lng: number } | null {
  if (!url) return null
  const trimmed = url.trim()

  const atMatch = trimmed.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/)
  if (atMatch && atMatch[1] && atMatch[2]) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
  }

  const qMatch = trimmed.match(/[?&]q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/)
  if (qMatch && qMatch[1] && qMatch[2]) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }
  }

  return null
}

