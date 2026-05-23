import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import CompanionPanel from '../components/reader/CompanionPanel.jsx'
import ReaderPaper from '../components/reader/ReaderPaper.jsx'
import ReaderToolbar from '../components/reader/ReaderToolbar.jsx'
import { modePresets } from '../data/modes.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

const keywords = ['图书馆', '阳光', '旧书', '批注', '交谈', '慢读', '陪伴', '心事']

export default function ReaderPage({ selectedText, mode, settings, updateSetting, toggleSetting, chooseMode, goTo, testState }) {
  const {
    readingSession,
    startSession,
    updateCurrentParagraph,
    addDwellTime,
    markDifficult,
    addNote,
    updateNote,
    deleteNote,
    setCompanionLevel,
    finishSession,
  } = useReadingSession()
  const paragraphs = useMemo(() => {
  const content = selectedText?.content || "";
  return content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}, [selectedText?.content]);
  const dwellRef = useRef({ paragraphIndex: 0, enteredAt: 0 })
  const [toast, setToast] = useState('')
  const currentParagraph = Math.max(readingSession.currentParagraph, 0)
  const modeCopy = {
    gentle: '低压力阅读中，非当前段落会保持柔和可读。',
    focus: '专注跟随已开启，阅读尺会贴近当前段落。',
    clear: '清晰分段中，段落编号和边界会帮助定位。',
  }

  useEffect(() => {
    startSession({
      textId: selectedText.id,
      paragraphCount: paragraphs.length,
      mode,
      theme: settings.bg === 'dark' ? 'dark' : 'light',
      companionLevel: testState?.profile?.companionLevel,
    })
    dwellRef.current = { paragraphIndex: 0, enteredAt: Date.now() }
  }, [mode, paragraphs.length, selectedText.id, settings.bg, startSession, testState?.profile?.companionLevel])

  useEffect(() => {
    const now = Date.now()
    const seconds = Number(((now - dwellRef.current.enteredAt) / 1000).toFixed(1))

    addDwellTime(dwellRef.current.paragraphIndex, seconds)
    dwellRef.current = { paragraphIndex: readingSession.currentParagraph, enteredAt: now }
  }, [addDwellTime, readingSession.currentParagraph])

  useEffect(() => {
    if (testState?.profile?.companionLevel) return
    setCompanionLevel(mode === 'focus' ? 'medium' : 'weak')
  }, [mode, setCompanionLevel, testState?.profile?.companionLevel])

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
      setToast('便签已移除')
    },
    [deleteNote],
  )

  const handleMarkDifficult = useCallback(
    (paragraphIndex = currentParagraph) => {
      const willCancel = readingSession.difficultMarks.includes(paragraphIndex)
      markDifficult(paragraphIndex)
      setToast(willCancel ? `已取消第 ${paragraphIndex + 1} 段回看标记` : `第 ${paragraphIndex + 1} 段已标为需要回看`)
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
    finishSession()
    goTo('feedback')
  }

  return (
    <section>
      <div className="reader-top">
        <div>
          <div className="eyebrow">沉浸阅读空间</div>
          <h1>{selectedText.title}</h1>
          <p className="muted">当前模式：{modePresets[mode].label}。{modeCopy[mode]}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => goTo('mode')}>
            调整模式
          </Button>
          <Button onClick={handleFinish}>完成阅读</Button>
        </div>
      </div>

      <div className="reader-layout">
        <Card className="reader-card">
          <ReaderToolbar modeLabel={modePresets[mode]?.label || modePresets.gentle.label} settings={settings} updateSetting={updateSetting} toggleSetting={toggleSetting} />
          <ReaderPaper
            text={selectedText}
            settings={settings}
            mode={mode}
            activePara={currentParagraph}
            onActiveParaChange={updateCurrentParagraph}
            chooseMode={chooseMode}
            updateSetting={updateSetting}
            difficultMarks={readingSession.difficultMarks}
            notes={readingSession.notes}
            addNote={handleAddNote}
            updateNote={handleUpdateNote}
            deleteNote={handleDeleteNote}
            markDifficult={handleMarkDifficult}
          />
        </Card>

        <CompanionPanel
          progress={readingSession.progress}
          activePara={currentParagraph}
          total={paragraphs.length}
          notes={readingSession.notes}
          markDifficult={handleMarkDifficult}
          difficultyCount={readingSession.difficultMarks.length}
          difficultMarks={readingSession.difficultMarks}
          revisitCount={readingSession.revisitCount}
          companionLevel={readingSession.companionLevel}
          setCompanionLevel={setCompanionLevel}
          isCurrentDifficult={readingSession.difficultMarks.includes(currentParagraph)}
          mode={mode}
        />
      </div>

      {toast ? <div className="reader-toast">{toast}</div> : null}

      {settings.keywords ? (
        <Card className="keyword-card">
          <div className="row-title compact">关键词浮岛</div>
          <div className="keyword-cloud">
            {(selectedText.keywords || keywords).map((word, index) => (
              <span className={`tag ${index % 3 === 0 ? 'orange' : index % 3 === 1 ? 'purple' : 'teal'}`} key={word}>
                {word}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </section>
  )
}
