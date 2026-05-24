import { AlertCircle, Highlighter, PenLine, Ruler, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function ReaderPaper({
  text,
  settings,
  mode,
  activePara,
  onActiveParaChange,
  chooseMode,
  updateSetting,
  toggleSetting,
  difficultMarks,
  notes,
  addNote,
  updateNote,
  deleteNote,
  markDifficult,
}) {
  const paragraphs = useMemo(() => text.content.split("\n").map((paragraph) => paragraph.trim()).filter(Boolean), [text.content])
  const paragraphRefs = useRef([])
  const paperRef = useRef(null)
  const hoverRef = useRef(null)
  const [rulerY, setRulerY] = useState(132)
  const [openNoteId, setOpenNoteId] = useState(null)
  const [openNoteParagraph, setOpenNoteParagraph] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')
  const notesByParagraph = notes.reduce((map, note) => {
    map[note.paragraphIndex] = [...(map[note.paragraphIndex] || []), note]
    return map
  }, {})
  const openNote = notes.find((note) => note.id === openNoteId)
  const isAddingNote = openNoteId === 'new'

  useEffect(() => {
    const updateFromAnchor = () => {
      if (hoverRef.current != null) return
      const anchorY = window.innerHeight * 0.4
      let closestIndex = activePara
      let closestDistance = Number.POSITIVE_INFINITY

      paragraphRefs.current.forEach((node, index) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const middle = rect.top + rect.height / 2
        const distance = Math.abs(middle - anchorY)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== activePara) onActiveParaChange(closestIndex)
    }

    updateFromAnchor()
    window.addEventListener('scroll', updateFromAnchor, { passive: true })
    window.addEventListener('resize', updateFromAnchor)
    return () => {
      window.removeEventListener('scroll', updateFromAnchor)
      window.removeEventListener('resize', updateFromAnchor)
    }
  }, [activePara, onActiveParaChange, paragraphs.length])

  useEffect(() => {
    const node = paragraphRefs.current[activePara]
    const paper = paperRef.current
    if (!node || !paper || hoverRef.current != null) return
    const nodeRect = node.getBoundingClientRect()
    const paperRect = paper.getBoundingClientRect()
    setRulerY(nodeRect.top - paperRect.top + nodeRect.height / 2)
  }, [activePara])

  const handleMouseMove = (event) => {
    if (!paperRef.current || !settings.ruler) return
    const rect = paperRef.current.getBoundingClientRect()
    setRulerY(event.clientY - rect.top)
  }

  const handleLeavePaper = () => {
    hoverRef.current = null
    const node = paragraphRefs.current[activePara]
    const paper = paperRef.current
    if (!node || !paper) return
    const nodeRect = node.getBoundingClientRect()
    const paperRect = paper.getBoundingClientRect()
    setRulerY(nodeRect.top - paperRect.top + nodeRect.height / 2)
  }

  const openNewNote = (paragraphIndex) => {
    setOpenNoteId('new')
    setOpenNoteParagraph(paragraphIndex)
    setNoteDraft('')
  }

  const openExistingNote = (note) => {
    if (openNoteId === note.id) {
      closeNote()
      return
    }

    setOpenNoteId(note.id)
    setOpenNoteParagraph(note.paragraphIndex)
    setNoteDraft(note.text)
  }

  const closeNote = () => {
    setOpenNoteId(null)
    setOpenNoteParagraph(null)
    setNoteDraft('')
  }

  const handleSaveNote = () => {
    if (!noteDraft.trim()) return
    if (isAddingNote) {
      addNote(openNoteParagraph, noteDraft)
    } else if (openNote) {
      updateNote(openNote.id, noteDraft)
    }
    closeNote()
  }

  const handleDeleteNote = () => {
    if (!openNote) return
    deleteNote(openNote.id)
    closeNote()
  }

  return (
    <div
      className={`reader-paper paper-${settings.bg} reader-mode-${mode}`}
      ref={paperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeavePaper}
    >
      <div className="reader-rail" aria-label="阅读工具">
        <div className="rail-label">字号</div>
        <button className="rail-btn" onClick={() => updateSetting('font', Math.min(24, settings.font + 1))} title="放大字号">A+</button>
        <button className="rail-btn" onClick={() => updateSetting('font', Math.max(15, settings.font - 1))} title="缩小字号">A-</button>
        <div className="rail-divider" />
        <div className="rail-label">模式</div>
        <button className={`rail-btn ${mode === 'gentle' ? 'active' : ''}`} onClick={() => chooseMode('gentle')} title="轻柔模式">柔</button>
        <button className={`rail-btn ${mode === 'focus' ? 'active' : ''}`} onClick={() => chooseMode('focus')} title="专注模式">专</button>
        <button className={`rail-btn ${mode === 'clear' ? 'active' : ''}`} onClick={() => chooseMode('clear')} title="清晰模式">清</button>
        <div className="rail-divider" />
        <div className="rail-label">背景</div>
        <button className={`rail-btn ${settings.bg === 'mist' ? 'active' : ''}`} onClick={() => updateSetting('bg', 'mist')} title="浅色背景">浅</button>
        <button className={`rail-btn ${settings.bg === 'dark' ? 'active' : ''}`} onClick={() => updateSetting('bg', 'dark')} title="深色背景">深</button>
        <div className="rail-divider" />
        <button className={`rail-btn icon ${settings.focus ? 'active' : ''}`} onClick={() => toggleSetting('focus')} title="高亮当前段落" aria-label="高亮当前段落">
          <Highlighter size={15} />
        </button>
        <button className={`rail-btn icon ${settings.ruler ? 'active' : ''}`} onClick={() => toggleSetting('ruler')} title="阅读尺" aria-label="阅读尺">
          <Ruler size={15} />
        </button>
      </div>

      {settings.ruler ? <div className={`reading-ruler ruler-${mode}`} style={{ top: rulerY }} /> : null}

      <div className="reader-content">
        {paragraphs.map((paragraph, index) => {
          const isActive = activePara === index
          const isDifficult = difficultMarks.includes(index)
          const paragraphNotes = notesByParagraph[index] || []
          const isNoteOpenForParagraph = openNoteParagraph === index && (isAddingNote || openNote?.paragraphIndex === index)

          return (
            <p
              key={`${paragraph.slice(0, 12)}-${index}`}
              ref={(node) => {
                paragraphRefs.current[index] = node
              }}
              data-index={index}
              className={`para ${settings.focus ? (isActive ? 'active' : 'dimmed') : 'no-focus'} ${isDifficult ? 'difficult' : ''} ${paragraphNotes.length ? 'has-note' : ''}`}
              onMouseEnter={() => {
                hoverRef.current = index
                onActiveParaChange(index)
              }}
              onClick={() => onActiveParaChange(index)}
              style={{
                fontSize: `${settings.font}px`,
                lineHeight: settings.line,
                letterSpacing: `${settings.letter}px`,
              }}
            >
              {mode === 'clear' ? <span className="para-index">{String(index + 1).padStart(2, '0')}</span> : null}
              {mode === 'focus' && isActive ? <span className="focus-bar" /> : null}
              <span className="para-text">{paragraph}</span>
              <span className="para-tools" aria-label={`第 ${index + 1} 段工具`}>
                <button
                  type="button"
                  className="para-tool note-tool"
                  onClick={(event) => {
                    event.stopPropagation()
                    paragraphNotes.length ? openExistingNote(paragraphNotes[0]) : openNewNote(index)
                  }}
                  title={paragraphNotes.length ? '查看便签' : '添加便签'}
                  aria-label={paragraphNotes.length ? `查看第 ${index + 1} 段便签` : `给第 ${index + 1} 段添加便签`}
                >
                  <PenLine size={15} />
                </button>
                <button
                  type="button"
                  className={`para-tool ${isDifficult ? 'active-warn' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    markDifficult(index)
                  }}
                  title={isDifficult ? '取消回看标记' : '需要回看'}
                  aria-label={isDifficult ? `取消第 ${index + 1} 段回看标记` : `标记第 ${index + 1} 段需要回看`}
                >
                  <AlertCircle size={15} />
                </button>
              </span>
              {isDifficult ? <span className="difficult-tip">需要回看</span> : null}
              {paragraphNotes.length ? (
                <button
                  className="note-pin"
                  onClick={(event) => {
                    event.stopPropagation()
                    openExistingNote(paragraphNotes[0])
                  }}
                  aria-label={`查看第 ${index + 1} 段便签`}
                  title="查看便签"
                >
                  <span className="note-fold" />
                </button>
              ) : null}
              {isNoteOpenForParagraph ? (
                <span className="inline-note-panel" onClick={(event) => event.stopPropagation()}>
                  <strong>{isAddingNote ? '新便签' : `第 ${index + 1} 段便签`}</strong>
                  <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="疑问、共鸣或回看理由..." autoFocus />
                  <span className="inline-note-actions">
                    <button onClick={closeNote} title="收起" aria-label="收起便签"><X size={13} /></button>
                    {!isAddingNote ? <button onClick={handleDeleteNote} title="删除" aria-label="删除便签"><Trash2 size={13} /></button> : null}
                    <button className="primary" onClick={handleSaveNote} disabled={!noteDraft.trim()}>保存</button>
                  </span>
                </span>
              ) : null}
            </p>
          )
        })}
      </div>
    </div>
  )
}
