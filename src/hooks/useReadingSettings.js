import { useCallback, useState } from 'react'

export function useReadingSettings(initialPreset) {
  const [settings, setSettings] = useState({
    font: initialPreset.font,
    line: initialPreset.line,
    letter: initialPreset.letter,
    bg: initialPreset.bg,
    focus: initialPreset.focus,
    ruler: initialPreset.ruler,
    keywords: initialPreset.keywords,
  })

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }, [])

  const toggleSetting = useCallback((key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
  }, [])

  const applyModePreset = useCallback((preset) => {
    setSettings({
      font: preset.font,
      line: preset.line,
      letter: preset.letter,
      bg: preset.bg,
      focus: preset.focus,
      ruler: preset.ruler,
      keywords: preset.keywords,
    })
  }, [])

  return { settings, updateSetting, toggleSetting, applyModePreset }
}
