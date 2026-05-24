import { Moon, SunMedium } from 'lucide-react'

export default function ThemeToggle({ updateSetting, isDarkTheme }) {
  const Icon = isDarkTheme ? SunMedium : Moon

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => updateSetting('theme', isDarkTheme ? 'light' : 'dark')}
      aria-label={isDarkTheme ? '切换浅色模式' : '切换深色模式'}
    >
      <Icon size={15} />
      <span>{isDarkTheme ? '浅色' : '深色'}</span>
    </button>
  )
}
