import dayjs from 'dayjs'
import 'dayjs/locale/en'

dayjs.locale('en')

export const allowOnlyNumber = (e: KeyboardEvent) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']

    if (e.ctrlKey || e.metaKey) return
    if (e.key === 'Unidentified' || e.key === 'Process') return
    if (allowedKeys.includes(e.key) || /^[0-9]$/.test(e.key)) return

    e.preventDefault()
}

export const ucwords = (value: string | null | undefined): string => {
    if (!value) return ''
    return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const ucfirst = (value: string | null | undefined): string => {
    if (!value) return ''
    const trimmed = value.trimStart()
    const leading = value.slice(0, value.length - trimmed.length)
    if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
        return leading + trimmed.replace(/^(https?:\/\/|www\.)/i, (m) => m.toLowerCase())
    }
    return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Render text with clickable links for URLs and emails, preserving safe HTML and lowercase URL schemes.
 */
export const renderTextWithLinks = (
    text: string | null | undefined,
    linkClass: string = 'underline text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 break-all transition-colors cursor-pointer'
): string => {
    if (!text) return ''

    // 1. Sanitize HTML entities
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    // 2. Identify URLs and emails with placeholders to prevent conflicts
    const placeHolders: { type: 'url' | 'email'; raw: string; cleanedUrl: string; href: string }[] = []
    const urlRegex = /(https?:\/\/[^\s<>"]+)|(\b(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:com|net|org|edu|gov|id|co|info|me|io|app|dev|online|xyz|biz|cc|tv|us|uk|ca|au|jp|fr|de|ru|es|it|web)(?::\d+)?(?:\/[^\s<>"]*)?)/gi
    const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi

    let tempText = escaped

    // Extract Emails first
    tempText = tempText.replace(emailRegex, (email) => {
        const idx = placeHolders.length
        placeHolders.push({
            type: 'email',
            raw: email,
            cleanedUrl: email,
            href: `mailto:${email}`,
        })
        return `__PLACEHOLDER_${idx}__`
    })

    // Extract URLs next
    tempText = tempText.replace(urlRegex, (url) => {
        let cleanedUrl = url
        let trailing = ''
        const match = url.match(/([.,!?;:)]+)$/)
        if (match) {
            trailing = match[1] || ''
            cleanedUrl = url.substring(0, url.length - trailing.length)
        }
        // Force protocol to lowercase (e.g. Https:// -> https://)
        cleanedUrl = cleanedUrl.replace(/^(https?:\/\/)/i, (m) => m.toLowerCase())
        const href = cleanedUrl.toLowerCase().startsWith('http') ? cleanedUrl : `https://${cleanedUrl}`

        const idx = placeHolders.length
        placeHolders.push({
            type: 'url',
            raw: cleanedUrl,
            cleanedUrl,
            href,
        })
        return `__PLACEHOLDER_${idx}__${trailing}`
    })

    // 3. Reconstruct HTML with anchor tags
    placeHolders.forEach((ph, idx) => {
        const targetAttr = ph.type === 'url' ? ' target="_blank" rel="noopener noreferrer"' : ''
        const linkHtml = `<a href="${ph.href}"${targetAttr} class="${linkClass}" onclick="event.stopPropagation()">${ph.cleanedUrl}</a>`
        tempText = tempText.replace(`__PLACEHOLDER_${idx}__`, linkHtml)
    })

    return tempText
}

export const formatIDR = (value: number | string | null | undefined, withPrefix: boolean = true): string => {
    if (value === 0 || value === '0' || value === null || value === undefined || value === '') {
        return withPrefix ? 'Rp 0' : '0'
    }

    const num = typeof value === 'number' ? value : parseCurrency(value)

    if (isNaN(num) || num === 0) {
        return withPrefix ? 'Rp 0' : '0'
    }

    let data = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(num))

    if (!withPrefix) {
        return data.replaceAll('Rp', '').trim()
    }

    return data
}

export const thousandFormat = (value: number | string | null | undefined): string => {
    return formatIDR(value, false)
}

export const parseCurrency = (value: number | string | null | undefined): number => {
    if (value === 0 || value === '0' || value === null || value === undefined || value === '') {
        return 0
    }
    if (typeof value === 'number') {
        return isNaN(value) ? 0 : value
    }
    let str = String(value).trim().replace(/^Rp\s*/i, '')
    if (!str) return 0

    // 1. If it contains both dot and comma (e.g. "205.000,00" or "205,000.00")
    if (str.includes('.') && str.includes(',')) {
        if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
            // Indonesian: dot is thousand, comma is decimal (e.g. 205.000,00)
            str = str.replace(/\./g, '').replace(',', '.')
        } else {
            // English: comma is thousand, dot is decimal (e.g. 205,000.00)
            str = str.replace(/,/g, '')
        }
        return Math.round(parseFloat(str)) || 0
    }

    // 2. If it matches Indonesian thousands separator with dots: e.g. "205.000" or "1.500.000"
    if (/^-?\d{1,3}(\.\d{3})+$/.test(str)) {
        return parseInt(str.replace(/\./g, ''), 10) || 0
    }

    // 3. If it matches English thousands separator with commas: e.g. "205,000" or "1,500,000"
    if (/^-?\d{1,3}(,\d{3})+$/.test(str)) {
        return parseInt(str.replace(/,/g, ''), 10) || 0
    }

    // 4. If it matches MySQL decimal without thousand separator: e.g. "205000.00" or "150.50"
    if (/^-?\d+\.\d+$/.test(str)) {
        return Math.round(parseFloat(str)) || 0
    }

    // 5. Fallback: strip any non-digits (preserving minus if any)
    const clean = str.replace(/[^0-9-]/g, '')
    const num = parseInt(clean, 10)
    return isNaN(num) ? 0 : num
}

export const disabledDate = (offset: number = 0, type: 'past' | 'future' = 'past') => {
    return (current: any) => {
        const limit = dayjs().add(offset, 'day').endOf('day')
        return type === 'past' ? current && current <= limit : current && current >= limit
    }
}

export const disabledDateRange = (pastOffset: number = 0, futureOffset: number = 7) => {
    return (current: any) => {
        const tooEarly = current && current < dayjs().add(pastOffset, 'day').startOf('day')
        const tooLate = current && current > dayjs().add(futureOffset, 'day').endOf('day')
        return tooEarly || tooLate
    }
}

export const now = (offset: number = 0): string => {
    return dayjs().add(offset, 'day').format('YYYY-MM-DD')
}

export const dateFormat = (value: string, format: string = 'DD/MM/YYYY'): string => {
    return dayjs(value).format(format)
}

export const formatDate = (value: string | Date | null | undefined, format: string = 'D MMM YYYY'): string => {
    if (!value) return '-'
    return dayjs(value).locale('en').format(format)
}

export const formatDateTime = (value: string | Date | null | undefined): string => {
    if (!value) return '-'
    let parsedVal = value
    if (typeof value === 'string' && value.includes(' ') && !value.includes('Z') && !value.includes('+') && !value.includes('-')) {
        parsedVal = value.replace(' ', 'T') + 'Z'
    }
    return dayjs(parsedVal).format('DD/MM/YYYY HH:mm')
}

/**
 * Format remaining days until expiration or date.
 * e.g. "45 days left", "1 day left", "Expires today", "Expired 3 days ago"
 */
export const formatDaysLeft = (targetDate: string | Date | null | undefined): string => {
    if (!targetDate) return ''
    const today = dayjs().startOf('day')
    const target = dayjs(targetDate).startOf('day')
    if (!target.isValid()) return ''

    const diff = target.diff(today, 'day')
    if (diff > 1) {
        return `${diff} days left`
    }
    if (diff === 1) {
        return '1 day left'
    }
    if (diff === 0) {
        return 'Expires today'
    }
    const absDiff = Math.abs(diff)
    if (absDiff === 1) {
        return 'Expired yesterday'
    }
    return `Expired ${absDiff} days ago`
}

/**
 * Formats a date with remaining days in parentheses.
 * e.g. "28 Mar 2027 (170 days left)" or "-"
 */
export const formatDateWithDaysLeft = (targetDate: string | Date | null | undefined, format: string = 'D MMM YYYY'): string => {
    if (!targetDate) return '-'
    const formattedDate = formatDate(targetDate, format)
    const daysLeft = formatDaysLeft(targetDate)
    return daysLeft ? `${formattedDate} (${daysLeft})` : formattedDate
}

/**
 * Formats a date with relative days ago in parentheses.
 * e.g. "1 Nov 2026 (today)", "31 Oct 2026 (1 day ago)", "28 Oct 2026 (4 days ago)"
 */
export const formatDateWithDaysAgo = (targetDate: string | Date | null | undefined, format: string = 'D MMM YYYY'): string => {
    if (!targetDate) return '-'
    const d = dayjs(targetDate)
    if (!d.isValid()) return '-'
    const formattedDate = d.locale('en').format(format)
    const today = dayjs().startOf('day')
    const target = d.startOf('day')
    const diff = today.diff(target, 'day')

    let relative = ''
    if (diff <= 0) {
        relative = 'today'
    } else if (diff === 1) {
        relative = '1 day ago'
    } else {
        relative = `${diff} days ago`
    }

    return `${formattedDate} (${relative})`
}

export const getTruncatedFacilities = (facilities: any[] | undefined): { main: string, extra: number } => {
    if (!facilities || facilities.length === 0) return { main: '-', extra: 0 }
    if (facilities.length <= 2) return { main: facilities.map(f => ucfirst(f.name)).join(', '), extra: 0 }
    return { main: `${ucfirst(facilities[0].name)}, ${ucfirst(facilities[1].name)}`, extra: facilities.length - 2 }
}

export const generateInvoiceId = () => {
    // Base36 timestamp (detik sejak epoch) — lebih pendek, monotonically increasing
    const timePart = Math.floor(Date.now() / 1000).toString(36).toUpperCase(); // ~6 chars, unik per detik

    // 3 char random suffix — cukup untuk collision window per detik
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars, tanpa ambigu
    const rand = Array.from({ length: 3 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');

    return `INV-${timePart}${rand}`;
}

/**
 * Handle "K" shortcut for thousands (1k = 1000)
 */
export const handleKShortcut = (e: KeyboardEvent, state: any, field: string | number, isTier: boolean = false) => {
    if (e.key.toLowerCase() === 'k') {
        e.preventDefault()

        // Handle nested price_tiers (khusus untuk FormUnit)
        if (isTier && typeof field === 'number' && state.price_tiers) {
            const currentVal = state.price_tiers[field] || 0
            state.price_tiers[field] = currentVal > 0 ? currentVal * 1000 : 1000
            return
        }

        // Handle normal fields
        const currentVal = state[field as string] || 0
        const numericVal = typeof currentVal === 'string' ? parseInt(currentVal) || 0 : currentVal
        state[field as string] = numericVal > 0 ? numericVal * 1000 : 1000
    }
}

/**
 * Format kebab-case role names to Title Case (e.g. "super-admin" -> "Super Admin", "hr" -> "HR")
 */
export const formatRoleName = (name: string): string => {
    return name
        .split('-')
        .map(word => {
            if (word.toLowerCase() === 'hr') return 'HR'
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
}

/**
 * Format duration between start_time and end_time into human-readable label.
 * e.g. "09:00", "09:55" -> "55m"
 * e.g. "09:00", "10:00" -> "1h"
 * e.g. "09:00", "10:30" -> "1h 30m"
 */
export const formatDurationFromTimes = (startTime?: string | null, endTime?: string | null): string => {
    if (!startTime || !endTime) return ''
    const [startH = 0, startM = 0] = String(startTime).split(':').map(Number)
    const [endH = 0, endM = 0] = String(endTime).split(':').map(Number)
    const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM)
    if (diffMinutes <= 0) return ''
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
}

/**
 * Resolves a valid meeting URL (Google Meet, Zoom, Teams, or general URL) from a schedule, lesson record, or class object.
 */
export const resolveMeetingUrl = (item: any): string | null => {
    if (!item || typeof item !== 'object') return null

    const candidates = [
        item.meeting_link,
        item.meeting_url,
        item.zoom_link,
        item.link,
        item.teacher?.gmeet_links,
        item.teacher?.teacher?.gmeet_links,
        Array.isArray(item.teachers) ? item.teachers[0]?.gmeet_links : null,
        item.schedule?.meeting_link,
        item.schedule?.zoom_link,
        item.schedule?.teacher?.gmeet_links,
        item.classInfo?.meeting_link,
        item.class?.meeting_link,
        item.study_location,
        item.schedule?.study_location,
    ]

    for (const c of candidates) {
        if (!c || typeof c !== 'string') continue
        const trimmed = c.trim()
        if (!trimmed) continue

        // Ignore map URLs
        if (trimmed.includes('maps.google') || trimmed.includes('maps.app.goo.gl') || trimmed.includes('g.co/kgs')) {
            continue
        }

        // Direct URL
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed
        }
        // Known conference domains without scheme
        if (/^(zoom\.us|meet\.google\.com|teams\.live\.com|teams\.microsoft\.com|us[0-9]+web\.zoom\.us)/i.test(trimmed)) {
            return `https://${trimmed}`
        }
        // Embedded URL in text
        const match = trimmed.match(/https?:\/\/[^\s]+/i)
        if (match) {
            return match[0]
        }
    }

    return null
}

/**
 * Resolves a Google Maps URL from a schedule, lesson record, or class object.
 * Checks direct gmaps_link, coordinates (lat/long), and text location query.
 */
export const resolveMapUrl = (item: any): string | null => {
    if (!item || typeof item !== 'object') return null

    // 1. Direct gmaps_link
    const directLink = item.gmaps_link || item.schedule?.gmaps_link || item.class?.gmaps_link || item.classInfo?.gmaps_link
    if (directLink && typeof directLink === 'string' && directLink.trim()) {
        const trimmed = directLink.trim()
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed
        }
        return `https://${trimmed}`
    }

    // 2. GPS Coordinates
    const lat = item.latitude ?? item.class_lat ?? item.schedule?.latitude ?? item.schedule?.lat
    const lng = item.longitude ?? item.class_long ?? item.schedule?.longitude ?? item.schedule?.long ?? item.schedule?.lng
    if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && !isNaN(Number(lat)) && !isNaN(Number(lng)) && String(lat).trim() !== '' && String(lng).trim() !== '') {
        return `https://www.google.com/maps?q=${lat},${lng}`
    }

    // 3. study_location
    const loc = item.study_location ?? item.schedule?.study_location ?? item.class?.study_location ?? item.classInfo?.study_location
    if (loc && typeof loc === 'string' && loc.trim()) {
        const trimmed = loc.trim()
        if (trimmed.toLowerCase() === 'online') {
            return null
        }
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
    }

    return null
}

/**
 * Format study mode into display label, Tailwind badge classes, and icon.
 */
export const formatStudyModeBadge = (mode?: string | null): { label: string, classes: string, icon: string } => {
    if (!mode) {
        return {
            label: 'Onsite',
            classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50',
            icon: 'building-03',
        }
    }
    const m = mode.toLowerCase().replace(/[_-]/g, ' ').trim()
    if (m === 'online') {
        return {
            label: 'Online',
            classes: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50',
            icon: 'video-01',
        }
    }
    if (m === 'offsite' || m.includes('your place') || m.includes('student place')) {
        return {
            label: 'Offsite',
            classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
            icon: 'location-01',
        }
    }
    return {
        label: 'Onsite',
        classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50',
        icon: 'building-03',
    }
}

