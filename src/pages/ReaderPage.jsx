import { Highlighter, PenLine, Ruler } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import ReaderPaper from '../components/reader/ReaderPaper.jsx'
import ReaderToolbar from '../components/reader/ReaderToolbar.jsx'
import CompanionPanel from '../components/reader/CompanionPanel.jsx'
import { modePresets } from '../data/modes.js'
import { sampleTexts } from '../data/sampleTexts.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

const fallbackKeywords = ['图书馆', '阳光', '旧书', '批注', '交谈', '慢读', '陪伴', '心事']

function buildLiveReadingState(testRhythmType, detail = {}) {
  const {
    rhythmReady = false,
    currentDwellSec = 0,
    lastParagraphDwellSec = 0,
    avgDwellSec = 0,
    paragraphText = '',
    mode = 'gentle',
    lastMoveSec = 0,
    fastScroll = false,
    recentScrollMove = false,
    lastExpectedSeconds = 0,
    lastParagraphChars = 0,
  } = detail
  const paragraphLength = paragraphText.replace(/\s/g, '').length
  const charsPerSecond = mode === 'focus' ? 6.2 : mode === 'clear' ? 5.4 : 5
  const expectedSeconds = Math.min(28, Math.max(4, paragraphLength / charsPerSecond))
  const referenceExpectedSeconds = lastExpectedSeconds || expectedSeconds
  const attentionThreshold = Math.max(55, expectedSeconds * 2.6)
  let rhythmType = normalizeBaselineRhythm(testRhythmType) || 'steady'

  if (!rhythmReady) {
    rhythmType = 'building'
  } else if (currentDwellSec > attentionThreshold) {
    rhythmType = 'attention'
  } else if (fastScroll || (recentScrollMove && lastParagraphChars >= 60 && lastParagraphDwellSec > 0 && lastParagraphDwellSec < referenceExpectedSeconds * 0.42)) {
    rhythmType = 'fast'
  } else if (currentDwellSec > 0) {
    if (currentDwellSec > expectedSeconds * 1.25 && currentDwellSec <= attentionThreshold) rhythmType = 'slow'
    else rhythmType = 'steady'
  }

  const rhythmCopy = {
    building: ['正在建立节奏', '先读一小段，Lodue 会再判断你的节奏'],
    fast: ['节奏偏快', '可以稍微放慢，给句子留一点停顿'],
    steady: ['节奏稳定', '保持当前节奏，继续向前'],
    attention: ['注意力停留', '回到当前段落，接着读下一句'],
    slow: ['节奏偏慢', '可以稍微提起节奏，继续读下一句'],
  }
  const [rhythmLabel, coachText] = rhythmCopy[rhythmType] || rhythmCopy.steady

  return {
    rhythmReady,
    currentDwellSec,
    lastParagraphDwellSec,
    avgDwellSec,
    lastMoveSec,
    expectedSeconds,
    attentionThreshold,
    rhythmType,
    rhythmLabel,
    coachText,
  }
}

function normalizeBaselineRhythm(type) {
  if (type === 'tooFast' || type === 'fast') return 'fast'
  if (type === 'verySlow' || type === 'slow') return 'slow'
  if (type === 'steady') return 'steady'
  return null
}

export default function ReaderPage({ selectedText, mode, settings, updateSetting, toggleSetting, chooseMode, goTo, testState }) {
  const {
    readingSession,
    startSession,
    updateCurrentParagraph,
    addDwellTime,
    recordRhythmSample,
    markDifficult,
    addNote,
    updateNote,
    deleteNote,
    setCompanionLevel,
    finishSession,
  } = useReadingSession()
  const activeText = selectedText || sampleTexts[0]
  const paragraphs = useMemo(() => {
    const content = activeText?.content || sampleTexts[0].content
    return content
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
  }, [activeText?.content])
  const dwellRef = useRef({ paragraphIndex: 0, enteredAt: 0 })
  const activeStartedAtRef = useRef(performance.now())
  const pageStartedAtRef = useRef(performance.now())
  const lastParagraphChangeAtRef = useRef(performance.now())
  const previousParagraphRef = useRef(0)
  const dwellTimesRef = useRef({})
  const lastParagraphDwellSecRef = useRef(0)
  const lastParagraphCharsRef = useRef(0)
  const recentMoveRef = useRef([])
  const lastExpectedSecondsRef = useRef(0)
  const confirmedMoveCountRef = useRef(0)
  const pendingMoveSourceRef = useRef('scroll')
  const rhythmCandidateRef = useRef({ type: 'building', since: performance.now() })
  const rhythmCandidateCountRef = useRef(0)
  const rhythmHoldUntilRef = useRef(0)
  const [toast, setToast] = useState('')
  const [liveReading, setLiveReading] = useState(() => buildLiveReadingState(testState?.rhythmType))
  const [sidebarWidth, setSidebarWidth] = useState(340)
  const dragStartRef = useRef(null)
  const currentParagraph = Math.min(Math.max(readingSession.currentParagraph, 0), Math.max(paragraphs.length - 1, 0))
  const [visualCurrentParagraph, setVisualCurrentParagraph] = useState(currentParagraph)
  const companionLevel = readingSession.companionLevel || 'medium'
  const isDark = settings.theme === 'dark' || settings.bg === 'dark'
  const isCompanionOff = companionLevel === 'off'
  const isFocusMode = mode === 'focus'
  const modeCopy = {
    gentle: '低压力阅读中，非当前段落会保持柔和可读。',
    focus: '专注跟随已开启，阅读尺会贴近当前段落。',
    clear: '清晰分段中，段落编号和边界会帮助定位。',
  }

  const sidebarStyle = { '--reader-sidebar-width': `${sidebarWidth}px` }

  useEffect(() => {
    startSession({
      textId: activeText.id,
      paragraphCount: paragraphs.length,
      mode,
      theme: isDark ? 'dark' : 'light',
      companionLevel: readingSession.textId === activeText.id ? undefined : testState?.profile?.companionLevel,
    })
    dwellRef.current = { paragraphIndex: 0, enteredAt: Date.now() }
  }, [mode, paragraphs.length, activeText.id, isDark, startSession, testState?.profile?.companionLevel, readingSession.textId])

  useEffect(() => {
    pageStartedAtRef.current = performance.now()
    activeStartedAtRef.current = performance.now()
    lastParagraphChangeAtRef.current = performance.now()
    previousParagraphRef.current = 0
    dwellTimesRef.current = {}
    lastParagraphDwellSecRef.current = 0
    lastParagraphCharsRef.current = 0
    lastExpectedSecondsRef.current = 0
    confirmedMoveCountRef.current = 0
    recentMoveRef.current = []
    rhythmCandidateRef.current = { type: 'building', since: performance.now() }
    rhythmCandidateCountRef.current = 0
    rhythmHoldUntilRef.current = 0
    setVisualCurrentParagraph(0)
    setLiveReading(buildLiveReadingState(testState?.rhythmType))
  }, [activeText.id, paragraphs.length, testState?.rhythmType])

  useEffect(() => {
    const now = Date.now()
    const seconds = Number(((now - dwellRef.current.enteredAt) / 1000).toFixed(1))

    addDwellTime(dwellRef.current.paragraphIndex, seconds)
    dwellRef.current = { paragraphIndex: readingSession.currentParagraph, enteredAt: now }
  }, [addDwellTime, readingSession.currentParagraph])

  useEffect(() => {
    const now = performance.now()
    const previousParagraph = previousParagraphRef.current
    if (previousParagraph === currentParagraph) {
      setVisualCurrentParagraph(currentParagraph)
      return
    }
    const previousDwellSec = Number(((now - activeStartedAtRef.current) / 1000).toFixed(1))
    const lastMoveSec = Number(((now - lastParagraphChangeAtRef.current) / 1000).toFixed(1))
    const source = pendingMoveSourceRef.current
    const previousText = paragraphs[previousParagraph] || ''
    const previousChars = previousText.replace(/\s/g, '').length
    const previousCharsPerSecond = mode === 'focus' ? 6.2 : mode === 'clear' ? 5.4 : 5
    const previousExpectedSeconds = Math.min(28, Math.max(4, previousChars / previousCharsPerSecond))

    dwellTimesRef.current[previousParagraph] = (dwellTimesRef.current[previousParagraph] || 0) + previousDwellSec
    lastParagraphDwellSecRef.current = previousDwellSec
    lastParagraphCharsRef.current = previousChars
    lastExpectedSecondsRef.current = previousExpectedSeconds
    if (source === 'scroll' || source === 'hover') {
      confirmedMoveCountRef.current += 1
      recentMoveRef.current = [
        ...recentMoveRef.current.filter((move) => now - move.at <= 3000),
        { from: previousParagraph, to: currentParagraph, at: now, source },
      ]
    }
    previousParagraphRef.current = currentParagraph
    activeStartedAtRef.current = now
    lastParagraphChangeAtRef.current = now
    pendingMoveSourceRef.current = 'scroll'
    setVisualCurrentParagraph(currentParagraph)
    setLiveReading((current) => ({
      ...current,
      lastParagraphDwellSec: previousDwellSec,
      lastMoveSec,
    }))
  }, [currentParagraph, mode, paragraphs])

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now()
      const currentParagraphText = paragraphs[currentParagraph] || ''
      const currentDwellSec = Number(((now - activeStartedAtRef.current) / 1000).toFixed(1))
      const recentMoves = recentMoveRef.current.filter((move) => now - move.at <= 3000)
      recentMoveRef.current = recentMoves
      const crossedParagraphs = recentMoves.reduce((sum, move) => sum + Math.abs(move.to - move.from), 0)
      const rhythmReady = (now - pageStartedAtRef.current >= 8000 && currentDwellSec > 0) || confirmedMoveCountRef.current >= 1
      const recentScrollMove = recentMoves.some((move) => move.to === currentParagraph)
      const dwellValues = Object.values(dwellTimesRef.current)
      const avgDwellSec = dwellValues.length
        ? Number((dwellValues.reduce((sum, value) => sum + value, 0) / dwellValues.length).toFixed(1))
        : currentDwellSec
      const nextReading = buildLiveReadingState(testState?.rhythmType, {
        rhythmReady,
        currentDwellSec,
        lastParagraphDwellSec: lastParagraphDwellSecRef.current,
        avgDwellSec,
        mode,
        lastMoveSec: Number(((now - lastParagraphChangeAtRef.current) / 1000).toFixed(1)),
        fastScroll: crossedParagraphs >= 2,
        recentScrollMove,
        lastExpectedSeconds: lastExpectedSecondsRef.current,
        lastParagraphChars: lastParagraphCharsRef.current,
        paragraphText: currentParagraphText,
      })

      const candidate = rhythmCandidateRef.current
      if (nextReading.rhythmType !== candidate.type) {
        rhythmCandidateRef.current = { type: nextReading.rhythmType, since: now }
        rhythmCandidateCountRef.current = 1
      } else {
        rhythmCandidateCountRef.current += 1
      }

      const held = liveReading.rhythmType !== nextReading.rhythmType && now < rhythmHoldUntilRef.current
      const canSwitch = !held && (nextReading.rhythmType === 'building' || nextReading.rhythmType === liveReading.rhythmType || rhythmCandidateCountRef.current >= 2)
      if (canSwitch) {
        if (nextReading.rhythmType === 'attention') rhythmHoldUntilRef.current = now + 4000
        else if (nextReading.rhythmType === 'fast') rhythmHoldUntilRef.current = now + 2000
        setLiveReading(nextReading)
        recordRhythmSample({ paragraph: currentParagraph, type: nextReading.rhythmType, dwellSec: nextReading.currentDwellSec })
      }
    }, 800)

    return () => window.clearInterval(id)
  }, [currentParagraph, paragraphs, testState?.rhythmType, liveReading.rhythmType, mode, recordRhythmSample])

  const handleAddNote = useCallback(
    (paragraphIndex, text) => {
      addNote(paragraphIndex, text)
      setToast(`已贴到第 ${paragraphIndex + 1} 段`)
    },
    [addNote],
  )

  const handleUpdateNote = useCallback(
    (noteId, text) => {
      updateNote(noteId, text)
      setToast('便签已更新')
    },
    [updateNote],
  )

  const handleDeleteNote = useCallback(
    (noteId) => {
      deleteNote(noteId)
      setToast('便签已删除')
    },
    [deleteNote],
  )

  const handleConfirmedParagraphChange = useCallback(
    (paragraphIndex, source = 'scroll') => {
      if (paragraphIndex === currentParagraph) return
      pendingMoveSourceRef.current = source
      updateCurrentParagraph(paragraphIndex)
    },
    [currentParagraph, updateCurrentParagraph],
  )

  const startSidebarDrag = useCallback((event) => {
    event.preventDefault()
    dragStartRef.current = {
      x: event.clientX,
      width: sidebarWidth,
    }
  }, [sidebarWidth])

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragStartRef.current) return
      const delta = dragStartRef.current.x - event.clientX
      setSidebarWidth(Math.min(420, Math.max(320, dragStartRef.current.width + delta)))
    }
    const handleUp = () => {
      dragStartRef.current = null
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [])

  const handleMarkDifficult = useCallback(
    (paragraphIndex = currentParagraph) => {
      const willCancel = readingSession.difficultMarks.includes(paragraphIndex)
      markDifficult(paragraphIndex)
      setToast(willCancel ? `已取消第 ${paragraphIndex + 1} 段回看标记` : `第 ${paragraphIndex + 1} 段已标记为需要回看`)
    },
    [currentParagraph, markDifficult, readingSession.difficultMarks],
  )

  useEffect(() => {
    if (!toast) return undefined
    const id = window.setTimeout(() => setToast(''), 1800)
    return () => window.clearTimeout(id)
  }, [toast])

  const handleFinish = () => {
    const now = Date.now()
    const seconds = Number(((now - dwellRef.current.enteredAt) / 1000).toFixed(1))

    addDwellTime(dwellRef.current.paragraphIndex, seconds)
    recordRhythmSample({ paragraph: currentParagraph, type: liveReading.rhythmType, dwellSec: liveReading.currentDwellSec })
    finishSession()
    goTo('feedback')
  }

  return (
    <section className={`reader-page ${isDark ? 'reader-dark' : ''} ${companionLevel === 'strong' && liveReading.rhythmType === 'attention' ? 'tempo-attention-strong' : ''}`}>
      <div className="reader-top">
        <div>
          <div className="eyebrow">沉浸阅读空间</div>
          <h1>{activeText.title}</h1>
          <p>当前模式：{modePresets[mode].label}。{modeCopy[mode]}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => goTo('mode')}>
            调整模式
          </Button>
          <Button onClick={handleFinish}>完成阅读</Button>
        </div>
      </div>

      <div className={`reader-layout ${isCompanionOff ? 'reader-layout-quiet' : ''}`} style={sidebarStyle}>
        <ReaderSideTools
          mode={mode}
          settings={settings}
          chooseMode={chooseMode}
          updateSetting={updateSetting}
          toggleSetting={toggleSetting}
        />
        <div className="card reader-card">
          <ReaderToolbar
            modeLabel={modePresets[mode]?.label || modePresets.gentle.label}
            activePara={currentParagraph}
            total={paragraphs.length}
          />
          <ReaderPaper
            text={activeText}
            settings={settings}
            mode={mode}
            activePara={visualCurrentParagraph}
            onActiveParaChange={setVisualCurrentParagraph}
            onConfirmedParaChange={handleConfirmedParagraphChange}
            chooseMode={chooseMode}
            updateSetting={updateSetting}
            toggleSetting={toggleSetting}
            difficultMarks={readingSession.difficultMarks}
            notes={readingSession.notes}
            addNote={handleAddNote}
            updateNote={handleUpdateNote}
            deleteNote={handleDeleteNote}
            markDifficult={handleMarkDifficult}
          />
        </div>

        <button
          className="reader-sidebar-resizer"
          type="button"
          aria-label="调整右侧栏宽度"
          onPointerDown={startSidebarDrag}
        />

        <aside className={`side-stack ${isCompanionOff ? 'quiet-side' : ''} lg:sticky lg:top-24 lg:self-start h-[calc(100vh-120px)] overflow-y-auto pr-1`} aria-label="Lodue Flow 与阅读辅助">
          <div className="sticky top-0 z-20 pb-4">
            <CompanionPanel
              progress={readingSession.progress}
              activeParagraph={currentParagraph}
              totalParagraphs={Math.max(paragraphs.length, 1)}
              companionLevel={companionLevel}
              setCompanionLevel={setCompanionLevel}
              isDark={isDark}
              notes={readingSession.notes}
              difficultMarks={readingSession.difficultMarks}
              revisitCount={readingSession.revisitCount}
              paragraphText={paragraphs[currentParagraph] || ''}
              mode={mode}
              testState={testState}
              liveReading={liveReading}
            />
          </div>

          <div className="space-y-5">
            <ReadingAssistCard
              progress={readingSession.progress}
              activeParagraph={currentParagraph}
              totalParagraphs={paragraphs.length}
              difficultMarks={readingSession.difficultMarks}
              revisitCount={readingSession.revisitCount}
              isCurrentDifficult={readingSession.difficultMarks.includes(currentParagraph)}
              compact={isCompanionOff || isFocusMode}
              isDark={isDark}
            />
            <NotesCard
              notes={readingSession.notes}
              activeParagraph={currentParagraph}
              compact={isCompanionOff}
              isDark={isDark}
              onAddHint={() => setToast('点击正文段落旁的笔形按钮添加便签')}
            />
            {!isCompanionOff && !isFocusMode && settings.keywords ? <KeywordsCard keywords={activeText.keywords || fallbackKeywords} /> : null}
          </div>
        </aside>
      </div>

      {toast ? <div className="reader-toast">{toast}</div> : null}
    </section>
  )
}

function ReaderSideTools({ mode, settings, chooseMode, updateSetting, toggleSetting }) {
  const isDark = settings.theme === 'dark' || settings.bg === 'dark'
  return (
    <div className="reader-side-tools" aria-label="阅读工具">
      <div className="rail-label">字号</div>
      <button className="rail-btn" onClick={() => updateSetting('font', Math.max(15, settings.font - 1))} title="缩小字号">A-</button>
      <button className="rail-btn" onClick={() => updateSetting('font', Math.min(24, settings.font + 1))} title="放大字号">A+</button>
      <div className="rail-divider" />
      <div className="rail-label">模式</div>
      <button className={`rail-btn ${mode === 'gentle' ? 'active' : ''}`} onClick={() => chooseMode('gentle')} title="舒缓模式">舒</button>
      <button className={`rail-btn ${mode === 'focus' ? 'active' : ''}`} onClick={() => chooseMode('focus')} title="专注模式">专</button>
      <button className={`rail-btn ${mode === 'clear' ? 'active' : ''}`} onClick={() => chooseMode('clear')} title="清晰模式">清</button>
      <div className="rail-divider" />
      <div className="rail-label">背景</div>
      <button className={`rail-btn ${!isDark ? 'active' : ''}`} onClick={() => updateSetting('theme', 'light')} title="浅色主题">浅</button>
      <button className={`rail-btn ${isDark ? 'active' : ''}`} onClick={() => updateSetting('theme', 'dark')} title="深色主题">深</button>
      <div className="rail-divider" />
      <button className={`rail-btn icon ${settings.focus ? 'active' : ''}`} onClick={() => toggleSetting('focus')} title="高亮当前段落" aria-label="高亮当前段落">
        <Highlighter size={15} />
      </button>
      <button className={`rail-btn icon ${settings.ruler ? 'active' : ''}`} onClick={() => toggleSetting('ruler')} title="阅读尺" aria-label="阅读尺">
        <Ruler size={15} />
      </button>
    </div>
  )
}

function ReadingAssistCard({ progress, activeParagraph, totalParagraphs, difficultMarks, revisitCount, isCurrentDifficult, compact = false, isDark = false }) {
  const safeTotal = Math.max(totalParagraphs || 0, 1)
  const safeActive = Math.min(Math.max(activeParagraph || 0, 0), safeTotal - 1)
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress || 0)))
  const difficultyCount = difficultMarks.length
  const revisitTotal = Object.values(revisitCount || {}).reduce((sum, count) => sum + count, 0)

  return (
    <>
      <Card className={`assist-card ${compact ? 'quiet-card' : ''} ${isDark ? 'is-dark-card' : ''}`}>
        <div className="between">
          <div>
            <strong>阅读进度</strong>
            <div className="small muted">
              第 {safeActive + 1} / {safeTotal} 段
            </div>
          </div>
          <span className="tag">{safeProgress}%</span>
        </div>
        <div className="assist-progress">
          <span style={{ width: `${safeProgress}%` }} />
        </div>
        {!compact ? (
          <>
            <div className="assist-grid">
              <div className="assist-cell">
                <span>难读标记</span>
                <strong>{difficultyCount} 处</strong>
              </div>
              <div className="assist-cell">
                <span>预计剩余</span>
                <strong>约 {Math.max(safeTotal - safeActive - 1, 0)} 段</strong>
              </div>
            </div>
            <div className="hint-box">{isCurrentDifficult ? '本段已标记为需要回看。' : '段落旁的笔形按钮可添加便签或回看标记。'}</div>
          </>
        ) : null}
      </Card>

      {!compact ? (
        <Card className={isDark ? 'is-dark-card' : ''}>
          <div className="between mb18">
            <strong>阅读信号</strong>
            <span className="tag">实时</span>
          </div>
          <div className="signal-list">
            <div>
              <span>当前段落</span>
              <strong>第 {safeActive + 1} 段</strong>
            </div>
            <div>
              <span>回看总次数</span>
              <strong>{revisitTotal} 次</strong>
            </div>
            <div>
              <span>难读段落</span>
              <strong>{difficultyCount ? difficultMarks.map((item) => item + 1).join('、') : '暂无'}</strong>
            </div>
          </div>
        </Card>
      ) : null}
    </>
  )
}

function NotesCard({ notes, activeParagraph, compact = false, isDark = false, onAddHint }) {
  return (
    <Card className={`${compact ? 'quiet-card' : ''} ${isDark ? 'is-dark-card' : ''}`}>
      <div className="between mb18">
        <strong>我的便签</strong>
        <button className="note-entry-btn" type="button" title="在正文当前段添加便签" aria-label={`在第 ${activeParagraph + 1} 段添加便签`} onClick={onAddHint}>
          <PenLine size={15} />
        </button>
      </div>
      {(notes || []).length ? (
        (notes || []).slice(0, compact ? 2 : undefined).map((note) => (
          <div className="note-item" key={note.id}>
            <div className="note-label">第 {note.paragraphIndex + 1} 段</div>
            {note.text}
          </div>
        ))
      ) : (
        <div className="note-empty">点击正文段落旁的笔形按钮，记录疑问或回看理由。</div>
      )}
      {compact && (notes || []).length > 2 ? <div className="small muted mt-2">还有 {(notes || []).length - 2} 条便签</div> : null}
    </Card>
  )
}

function KeywordsCard({ keywords }) {
  if (!keywords?.length) return null

  return (
    <Card className="keyword-card">
      <div className="row-title compact">关键词浮岛</div>
      <div className="keyword-cloud">
        {keywords.map((word, index) => (
          <span className={`tag ${index % 3 === 0 ? 'orange' : index % 3 === 1 ? 'purple' : 'teal'}`} key={word}>
            {word}
          </span>
        ))}
      </div>
    </Card>
  )
}
