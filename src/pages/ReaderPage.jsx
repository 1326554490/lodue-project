import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import ReaderPaper from '../components/reader/ReaderPaper.jsx'
import ReaderToolbar from '../components/reader/ReaderToolbar.jsx'
import CompanionPanel from '../components/reader/CompanionPanel.jsx'
import { modePresets } from '../data/modes.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

const fallbackKeywords = ['图书馆', '阳光', '旧书', '批注', '交谈', '慢读', '陪伴', '心事']

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
    const content = selectedText?.content || ''
    return content
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
  }, [selectedText?.content])
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
      setToast('便签已删除')
    },
    [deleteNote],
  )

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
    finishSession()
    goTo('feedback')
  }

  return (
    <section>
      <div className="reader-top">
        <div>
          <div className="eyebrow">沉浸阅读空间</div>
          <h1>{selectedText.title}</h1>
          <p>当前模式：{modePresets[mode].label}。{modeCopy[mode]}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => goTo('mode')}>
            调整模式
          </Button>
          <Button onClick={handleFinish}>完成阅读</Button>
        </div>
      </div>

      <div className="reader-layout">
        <div className="card reader-card">
          <ReaderToolbar
            modeLabel={modePresets[mode]?.label || modePresets.gentle.label}
            activePara={currentParagraph}
            total={paragraphs.length}
          />
          <ReaderPaper
            text={selectedText}
            settings={settings}
            mode={mode}
            activePara={currentParagraph}
            onActiveParaChange={updateCurrentParagraph}
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

        <aside className="side-stack lg:sticky lg:top-24 lg:self-start h-[calc(100vh-120px)] overflow-y-auto pr-1" aria-label="Lodue Flow 与阅读辅助">
          <div className="sticky top-0 z-20 pb-4">
            <CompanionPanel
              progress={readingSession.progress}
              activeParagraph={currentParagraph}
              totalParagraphs={Math.max(paragraphs.length, 1)}
              companionLevel={readingSession.companionLevel}
              setCompanionLevel={setCompanionLevel}
              isDark={settings.bg === 'dark'}
              notes={readingSession.notes}
              difficultMarks={readingSession.difficultMarks}
              revisitCount={readingSession.revisitCount}
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
            />
            <NotesCard notes={readingSession.notes} />
            {settings.keywords ? <KeywordsCard keywords={selectedText.keywords || fallbackKeywords} /> : null}
          </div>
        </aside>
      </div>

      {toast ? <div className="reader-toast">{toast}</div> : null}
    </section>
  )
}

function ReadingAssistCard({ progress, activeParagraph, totalParagraphs, difficultMarks, revisitCount, isCurrentDifficult }) {
  const safeTotal = Math.max(totalParagraphs || 0, 1)
  const safeActive = Math.min(Math.max(activeParagraph || 0, 0), safeTotal - 1)
  const safeProgress = Math.min(100, Math.max(0, progress || 0))
  const difficultyCount = difficultMarks.length
  const revisitTotal = Object.values(revisitCount || {}).reduce((sum, count) => sum + count, 0)

  return (
    <>
      <Card className="assist-card">
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
        <div className="assist-grid">
          <div className="assist-cell">
            <span>回看标记</span>
            <strong>{difficultyCount} 处</strong>
          </div>
          <div className="assist-cell">
            <span>预计剩余</span>
            <strong>约 {Math.max(safeTotal - safeActive - 1, 0)} 段</strong>
          </div>
        </div>
        <div className="hint-box">{isCurrentDifficult ? '本段已标记为需要回看。' : '段落旁的轻量按钮可添加便签或回看标记。'}</div>
      </Card>

      <Card>
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
            <span>需回看段落</span>
            <strong>{difficultyCount ? difficultMarks.map((item) => item + 1).join('、') : '暂无'}</strong>
          </div>
        </div>
      </Card>
    </>
  )
}

function NotesCard({ notes }) {
  return (
    <Card>
      <div className="between mb18">
        <strong>我的便签</strong>
        <span className="small muted">{(notes || []).length} 条</span>
      </div>
      {(notes || []).length ? (
        (notes || []).map((note) => (
          <div className="note-item" key={note.id}>
            <div className="note-label">第 {note.paragraphIndex + 1} 段</div>
            {note.text}
          </div>
        ))
      ) : (
        <div className="note-empty">点击正文段落旁的小便签图标，记录疑问、共鸣或回看理由。</div>
      )}
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
