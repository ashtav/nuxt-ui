import { onMounted, onUnmounted } from 'vue'

export interface KeyCombinationOptions {
  preventDefault?: boolean
  stopPropagation?: boolean
  exact?: boolean // If true (default), modifiers must match exactly.
  enableOnInputs?: boolean // If true, shortcuts trigger even in inputs/textareas.
}

export function useKeys() {
  const listeners: Array<{
    keys: string[]
    handler: (e: KeyboardEvent) => void
    options?: KeyCombinationOptions
  }> = []

  const handleKeyDown = (event: KeyboardEvent) => {
    // Check if target is an input field
    const target = event.target as HTMLElement
    const isInput = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    )

    // Determine which modifiers are active
    const activeModifiers = {
      ctrl: event.ctrlKey || event.metaKey, // Ctrl or Cmd/Meta
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    }

    const isModifierKeyOnly = ['control', 'shift', 'alt', 'meta'].includes(event.key.toLowerCase())

    for (const listener of listeners) {
      // Skip if input target unless explicitly enabled
      if (isInput && !listener.options?.enableOnInputs) {
        continue
      }

      const combination = listener.keys.map(k => k.toLowerCase())
      
      const requiredModifiers = {
        ctrl: combination.includes('ctrl') || combination.includes('control') || combination.includes('meta') || combination.includes('cmd') || combination.includes('command'),
        alt: combination.includes('alt') || combination.includes('option'),
        shift: combination.includes('shift'),
        meta: combination.includes('meta') || combination.includes('cmd') || combination.includes('command'),
      }

      // Check modifier keys match
      const exact = listener.options?.exact ?? true
      let modifiersMatch = true

      if (exact) {
        // If exact matching, active modifiers must match requested modifiers exactly
        const ctrlMatch = activeModifiers.ctrl === requiredModifiers.ctrl
        const altMatch = activeModifiers.alt === requiredModifiers.alt
        const shiftMatch = activeModifiers.shift === requiredModifiers.shift
        
        if (!ctrlMatch || !altMatch || !shiftMatch) {
          modifiersMatch = false
        }
      } else {
        // If not exact, required modifiers must be present, but extra modifiers are allowed
        if (requiredModifiers.ctrl && !activeModifiers.ctrl) modifiersMatch = false
        if (requiredModifiers.alt && !activeModifiers.alt) modifiersMatch = false
        if (requiredModifiers.shift && !activeModifiers.shift) modifiersMatch = false
      }

      if (!modifiersMatch) continue

      // Now check the main non-modifier key
      const nonModifiers = combination.filter(k => 
        !['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command'].includes(k)
      )

      if (nonModifiers.length > 0) {
        const targetKey = nonModifiers[0]
        const eventKey = event.key.toLowerCase()
        const eventCode = event.code.toLowerCase()

        // Match exact character or key code aliases (e.g. esc, enter, space, backslash)
        const matchesKey = eventKey === targetKey || eventCode === `key${targetKey}` || 
                           (targetKey === 'space' && (eventKey === ' ' || eventCode === 'space')) ||
                           (targetKey === 'enter' && eventKey === 'enter') ||
                           (targetKey === 'esc' && eventKey === 'escape') ||
                           (targetKey === 'escape' && eventKey === 'escape') ||
                           (targetKey === 'tab' && eventKey === 'tab') ||
                           (targetKey === 'backspace' && eventKey === 'backspace') ||
                           (targetKey === 'delete' && eventKey === 'delete') ||
                           ((targetKey === '\\' || targetKey === 'backslash') && (eventKey === '\\' || eventCode === 'backslash'))

        if (matchesKey) {
          if (listener.options?.preventDefault ?? true) {
            event.preventDefault()
          }
          if (listener.options?.stopPropagation) {
            event.stopPropagation()
          }
          listener.handler(event)
        }
      } else {
        // No non-modifier keys, only matching modifiers
        // E.g. user just pressed Alt or Ctrl
        if (isModifierKeyOnly) {
          const pressedModifier = event.key.toLowerCase()
          const matchesModifier = 
            (pressedModifier === 'alt' && combination.includes('alt')) ||
            (pressedModifier === 'control' && (combination.includes('ctrl') || combination.includes('control'))) ||
            (pressedModifier === 'shift' && combination.includes('shift')) ||
            (pressedModifier === 'meta' && (combination.includes('meta') || combination.includes('cmd') || combination.includes('command')))

          if (matchesModifier) {
            if (listener.options?.preventDefault) {
              event.preventDefault()
            }
            if (listener.options?.stopPropagation) {
              event.stopPropagation()
            }
            listener.handler(event)
          }
        }
      }
    }
  }

  // Manage event listeners lifecycle
  if (process.client) {
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })
  }

  const apply = (keysCombo: string[], handler: (e: KeyboardEvent) => void, options?: KeyCombinationOptions) => {
    listeners.push({ keys: keysCombo, handler, options })
  }

  return {
    apply
  }
}
