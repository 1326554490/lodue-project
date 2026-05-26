import { ChevronLeft, Home } from 'lucide-react'
import Button from './Button.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const navItems = [
  { key: 'home', label: '入口' },
  { key: 'test', label: '校准' },
  { key: 'mode', label: '模式' },
  { key: 'reader', label: '阅读' },
  { key: 'feedback', label: '反馈' },
  { key: 'community', label: '共读' },
]

export default function AppShell({ children, page, goTo, goBack, isDarkTheme, updateSetting, isDark = isDarkTheme }) {
  const currentIndex = navItems.findIndex((item) => item.key === page)
  const iconSrc = isDark
    ? `${import.meta.env.BASE_URL}icons/lodue-dark.png`
    : `${import.meta.env.BASE_URL}icons/lodue-light.png`
  return (
    <div className={isDark ? 'app-root dark-ui lodue-dark' : 'app-root'}>
      <header className="header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={() => goTo('home')}>
            <img src={iconSrc} alt="Lodue" />
            <span>
              <strong className="brand-title">Lodue</strong>
              <span className="brand-sub">陪伴式阅读系统</span>
            </span>
          </button>

          <div className="journey-mini" aria-label="阅读流程">
            <div className="journey-top">
              <span>{currentIndex + 1}/6</span>
              <span>{navItems[currentIndex]?.label}</span>
            </div>
            <div className="journey-dots">
              {navItems.map((item, index) => (
                <span
                  key={item.key}
                  className={`journey-dot ${index < currentIndex ? 'done' : ''} ${index === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="journey-labels">
              {navItems.map((item, index) => (
                <span key={item.key} className={index === currentIndex ? 'active' : ''}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="header-actions">
            <ThemeToggle updateSetting={updateSetting} isDarkTheme={isDark} />
            {page !== 'home' ? (
              <>
                <Button variant="secondary" onClick={goBack}>
                  <ChevronLeft size={17} />
                  上一步
                </Button>
                <Button onClick={() => goTo('home')}>
                  <Home size={17} />
                  返回首页
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="shell main">{children}</main>
    </div>
  )
}
