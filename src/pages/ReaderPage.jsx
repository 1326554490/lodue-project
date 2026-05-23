import { useMemo, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import CompanionPanel from '../components/reader/CompanionPanel.jsx'
import ReaderPaper, { getModeLabel } from '../components/reader/ReaderPaper.jsx'
import ReaderToolbar from '../components/reader/ReaderToolbar.jsx'
import { modePresets } from '../data/modes.js'

const keywords = ['图书馆', '阳光', '旧书', '批注', '交谈', '慢读', '陪伴', '心事']

export default function ReaderPage({ selectedText, mode, settings, updateSetting, toggleSetting, chooseMode, goTo, notes, setNotes }) {
  const [activePara, setActivePara] = useState(0)
  const [difficultyCount, setDifficultyCount] = useState(0)

  const paragraphs = useMemo(() => selectedText.content.split('\n').filter(Boolean), [selectedText.content])
  const progress = Math.max(8, Math.round(((activePara + 1) / paragraphs.length) * 100))

  const addNote = () => {
    const paragraph = activePara + 1
    setNotes((current) => [{ para: paragraph, text: `第 ${paragraph} 段需要回看。` }, ...current])
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
          <Button onClick={() => goTo('feedback')}>完成阅读</Button>
        </div>
      </div>

      <div className="reader-layout">
        <Card className="reader-card">
          <ReaderToolbar modeLabel={getModeLabel(mode)} settings={settings} updateSetting={updateSetting} toggleSetting={toggleSetting} onAddNote={addNote} />
          <ReaderPaper text={selectedText} settings={settings} activePara={activePara} setActivePara={setActivePara} chooseMode={chooseMode} updateSetting={updateSetting} />
        </Card>

        <CompanionPanel
          progress={progress}
          activePara={activePara}
          total={paragraphs.length}
          notes={notes}
          markDifficult={() => setDifficultyCount((count) => count + 1)}
          difficultyCount={difficultyCount}
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
