export const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    const firstPart = parts[0]
    if (!firstPart) return '??'
    if (parts.length === 1) return firstPart.slice(0, 2).toUpperCase()
    const secondPart = parts[1] || ''
    const firstLetter = firstPart.slice(0, 1)
    const secondLetter = secondPart.slice(0, 1)
    return (firstLetter + secondLetter).toUpperCase()
}

export const getAvatarColor = (name?: string | null): string => {
    if (!name) return '#6b7280'
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const h = Math.abs(hash % 360)
    return `hsl(${h}, 55%, 43%)`
}

export const copyToClipboard = async (text: string, successMsg: string = 'Copied to clipboard!') => {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        } else {
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            return true
        }
    } catch (err) {
        console.error('Failed to copy to clipboard', err)
        return false
    }
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}
