import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/common/AppShell.jsx'
import HomePage from './pages/HomePage.jsx'
import TestPage from './pages/TestPage.jsx'
import ModePage from './pages/ModePage.jsx'
import ReaderPage from './pages/ReaderPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import { sampleTexts } from './data/sampleTexts.js'
import { modePresets } from './data/modes.js'
import { initialCommunity } from './data/community.js'
import { ReadingSessionProvider } from './hooks/useReadingSession.js'
import { useReadingSettings } from './hooks/useReadingSettings.js'

const pages = ['home', 'test', 'mode', 'reader', 'feedback', 'community']

function App() {
  const [page, setPage] = useState('home')
  const [selectedText, setSelectedText] = useState(sampleTexts[0])
  const [mode, setMode] = useState('gentle')
  const [testState, setTestState] = useState({ step: 1, selfCheck: [], feedback: [], seconds: 0, baselineStarted: false })
  const [community, setCommunity] = useState(initialCommunity)
  const { settings, updateSetting, applyModePreset, toggleSetting } = useReadingSettings(modePresets.gentle)

  const isDark = settings.bg === 'dark'

  const pageProps = useMemo(
    () => ({
      goTo: setPage,
      selectedText,
      setSelectedText,
      mode,
      setMode,
      settings,
      updateSetting,
      toggleSetting,
      applyModePreset,
      testState,
      setTestState,
      community,
      setCommunity,
    }),
    [applyModePreset, community, mode, selectedText, settings, testState, toggleSetting, updateSetting],
  )

  const chooseMode = (key) => {
    setMode(key)
    applyModePreset(modePresets[key])
  }

  const goBack = () => {
    const current = pages.indexOf(page)
    setPage(pages[Math.max(0, current - 1)])
  }

  const renderPage = () => {
    switch (page) {
      case 'test':
        return <TestPage {...pageProps} chooseMode={chooseMode} />
      case 'mode':
        return <ModePage {...pageProps} chooseMode={chooseMode} />
      case 'reader':
        return <ReaderPage {...pageProps} chooseMode={chooseMode} />
      case 'feedback':
        return <FeedbackPage {...pageProps} />
      case 'community':
        return <CommunityPage {...pageProps} />
      case 'home':
      default:
        return <HomePage {...pageProps} />
    }
  }

  return (
    <ReadingSessionProvider>
      <AppShell page={page} goTo={setPage} goBack={goBack} isDark={isDark}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -18, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </ReadingSessionProvider>
  )
}

export default App
