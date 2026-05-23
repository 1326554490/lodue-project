import { useCallback, useEffect, useMemo, useRef } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import CompanionPanel from '../components/reader/CompanionPanel.jsx'
import ReaderPaper, { getModeLabel } from '../components/reader/ReaderPaper.jsx'
import ReaderToolbar from '../components/reader/ReaderToolbar.jsx'
import { modePresets } from '../data/modes.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

const keywords = ['图书馆', '阳光', '旧书', '批注', '交谈', '慢读', '陪伴', '心事']

export default function ReaderPage({ selectedText, mode, settings, updateSetting, toggleSetting, chooseMode, goTo }) {
  const {
    readingSession,
    startSession,
    updateCurrentParagraph,
    addDwellTime,
    markDifficult,
    addNote,
    setCompanionLevel,
    finishSession,
  } = useReadingSession()
  const paragraphs = useMemo(() => selectedText.content.split('\n').filter(Boolean), [selectedText.content])
  const dwellRef = useRef({ paragraphIndex: 0, enteredAt: Date.now() })

  useEffect(() => {
    startSession({
      textId: selectedText.id,
      paragraphCount: paragraphs.length,
      mode,
      theme: settings.bg === 'dark' ? 'dark' : 'light',
    })
    dwellRef.current = { paragraphIndex: 0, enteredAt: Date.now() }
  }, [paragraphs.length, selectedText.id, startSession])

  useEffect(() => {
    const now = Date.now()
    const seconds = Number(((now - dwellRef.current.enteredAt) / 1000).toFixed(1))

    addDwellTime(dwellRef.current.paragraphIndex, seconds)
    dwellRef.current = { paragraphIndex: readingSession.currentParagraph, enteredAt: now }
  }, [addDwellTime, readingSession.currentParagraph])

  const handleAddNote = useCallback(() => {
    const paragraph = readingSession.currentParagraph + 1
    addNote(readingSession.currentParagraph, `第 ${paragraph} 段需要回看。`)
  }, [addNote, readingSession.currentParagraph])

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
          <p className="muted">当前模式：{modePresets[mode].label}。你可以随时调整阅读辅助，也可以把难读段落标记下来。</p>
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
          <ReaderToolbar modeLabel={getModeLabel(mode)} settings={settings} updateSetting={updateSetting} toggleSetting={toggleSetting} onAddNote={handleAddNote} />
          <ReaderPaper
            text={selectedText}
            settings={settings}
            activePara={readingSession.currentParagraph}
            onActiveParaChange={updateCurrentParagraph}
            chooseMode={chooseMode}
            updateSetting={updateSetting}
          />
        </Card>

        <CompanionPanel
          progress={readingSession.progress}
          activePara={readingSession.currentParagraph}
          total={paragraphs.length}
          notes={readingSession.notes}
          markDifficult={() => markDifficult(readingSession.currentParagraph)}
          difficultyCount={readingSession.difficultMarks.length}
          companionLevel={readingSession.companionLevel}
          setCompanionLevel={setCompanionLevel}
        />
      </div>

      {settings.keywords ? (
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
      ) : null}
    </section>
  )
}
