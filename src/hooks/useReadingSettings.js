import { useCallback, useState } from 'react'

function bgToThemeSurface(bg = 'mist') {
  if (bg === 'dark') return { theme: 'dark', surface: 'mist', bg: 'dark' }
  if (bg === 'cream' || bg === 'paper') return { theme: 'light', surface: 'paper', bg: 'cream' }
  if (bg === 'white' || bg === 'plain') return { theme: 'light', surface: 'plain', bg: 'white' }
  return { theme: 'light', surface: 'mist', bg: 'mist' }
}

function surfaceToBg(surface = 'mist') {
  if (surface === 'paper') return 'cream'
  if (surface === 'plain') return 'white'
  return 'mist'
}

export function useReadingSettings(initialPreset) {
  const initialSurface = bgToThemeSurface(initialPreset.bg)
  const [settings, setSettings] = useState({
    font: initialPreset.font,
    line: initialPreset.line,
    letter: initialPreset.letter,
    theme: initialSurface.theme,
    surface: initialSurface.surface,
    bg: initialSurface.bg,
    focus: initialPreset.focus,
    ruler: initialPreset.ruler,
    keywords: initialPreset.keywords,
  })
  const [manualOverrides, setManualOverrides] = useState({
    theme: false,
    surface: false,
    bg: false,
    focus: false,
    ruler: false,
    keywords: false,
    font: false,
    line: false,
    letter: false,
  })

  const markOverride = useCallback((key) => {
    setManualOverrides((current) => {
      if (key === 'theme') return { ...current, theme: true, bg: true }
      if (key === 'surface') return { ...current, surface: true, bg: true }
      if (key === 'bg') return { ...current, theme: true, surface: true, bg: true }
      return key in current ? { ...current, [key]: true } : current
    })
  }, [])

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => {
      if (key === 'theme') {
        const nextTheme = value === 'dark' ? 'dark' : 'light'
        return {
          ...current,
          theme: nextTheme,
          bg: nextTheme === 'dark' ? 'dark' : surfaceToBg(current.surface),
        }
      }

      if (key === 'surface') {
        return {
          ...current,
          theme: 'light',
          surface: value,
          bg: surfaceToBg(value),
        }
      }

      if (key === 'bg') {
        return {
          ...current,
          ...bgToThemeSurface(value),
        }
      }

      return { ...current, [key]: value }
    })
    markOverride(key)
  }, [markOverride])

  const toggleSetting = useCallback((key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
    markOverride(key)
  }, [markOverride])

  const applyModePreset = useCallback((preset) => {
    setSettings((current) => ({
      ...current,
      font: manualOverrides.font ? current.font : preset.font,
      line: manualOverrides.line ? current.line : preset.line,
      letter: manualOverrides.letter ? current.letter : preset.letter,
      focus: manualOverrides.focus ? current.focus : preset.focus,
      ruler: manualOverrides.ruler ? current.ruler : preset.ruler,
    }))
  }, [manualOverrides.focus, manualOverrides.font, manualOverrides.letter, manualOverrides.line, manualOverrides.ruler])

  return { settings, updateSetting, toggleSetting, applyModePreset, manualOverrides, setManualOverrides }
}
