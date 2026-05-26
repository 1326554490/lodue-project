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

const initialSharedRecaps = [
  {
    id: 'recap-1',
    owner: '小林',
    isMine: false,
    avatar: '林',
    bookTitle: '《红楼梦》节选 · 雨后共读',
    sharedAt: '8 分钟前',
    mode: '舒缓阅读模式',
    progress: 76,
    durationText: '18 分钟',
    rhythmSummary: '中段节奏稳定，末尾有一次注意力停留',
    notesCount: 2,
    difficultCount: 1,
    highlightParagraph: 3,
    quote: '书之所以好，正因它替人藏得住话。',
    insight: '这一段让我想到，阅读像是在替没说出口的话找位置。',
    tags: ['共鸣', '慢读', '雨声'],
    reactions: { resonance: 3, readTogether: 2, revisit: 1 },
  },
  {
    id: 'recap-2',
    owner: '南枝',
    isMine: false,
    avatar: '南',
    bookTitle: '《红楼梦》节选 · 雨后共读',
    sharedAt: '22 分钟前',
    mode: '清晰阅读模式',
    progress: 58,
    durationText: '14 分钟',
    rhythmSummary: '前半段推进较快，第 7 段有明显回看',
    notesCount: 1,
    difficultCount: 2,
    highlightParagraph: 7,
    quote: '雨声把窗外的路洗得很亮，屋里的人却越坐越沉默。',
    insight: '我在这里停了一会儿，感觉人物的沉默比对白更重。',
    tags: ['难读', '回看', '心事'],
    reactions: { resonance: 5, readTogether: 4, revisit: 2 },
  },
  {
    id: 'recap-3',
    owner: '阿澈',
    isMine: false,
    avatar: '澈',
    bookTitle: '《红楼梦》节选 · 雨后共读',
    sharedAt: '35 分钟前',
    mode: '专注阅读模式',
    progress: 91,
    durationText: '26 分钟',
    rhythmSummary: '整体慢读，便签集中在情绪转折处',
    notesCount: 4,
    difficultCount: 0,
    highlightParagraph: 9,
    quote: '有些告别不是转身，而是把一句话一直留在原处。',
    insight: '读完以后更想回看前面的铺垫，像是很多细节突然亮起来。',
    tags: ['便签', '共鸣', '慢读'],
    reactions: { resonance: 4, readTogether: 1, revisit: 3 },
  },
]

function App() {
  const [page, setPage] = useState('home')
  const [selectedText, setSelectedText] = useState(sampleTexts[0])
  const [mode, setMode] = useState('gentle')
  const [testState, setTestState] = useState({ step: 1, selfCheck: [], feedback: [], seconds: 0, baselineStarted: false })
  const [community, setCommunity] = useState(initialCommunity)
  const [sharedRecaps, setSharedRecaps] = useState(initialSharedRecaps)
  const { settings, updateSetting, applyModePreset, toggleSetting, manualOverrides, setManualOverrides } = useReadingSettings(modePresets.gentle)

  const isDarkTheme = settings.theme === 'dark' || settings.bg === 'dark'

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
      manualOverrides,
      setManualOverrides,
      testState,
      setTestState,
      community,
      setCommunity,
      sharedRecaps,
      setSharedRecaps,
    }),
    [applyModePreset, community, manualOverrides, mode, selectedText, settings, sharedRecaps, testState, toggleSetting, updateSetting],
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
      <AppShell page={page} goTo={setPage} goBack={goBack} isDarkTheme={isDarkTheme} updateSetting={updateSetting}>
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
