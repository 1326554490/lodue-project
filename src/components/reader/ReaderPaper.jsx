import { useEffect, useRef } from 'react'
export default function ReaderPaper({ text, settings, mode, activePara, onActiveParaChange, chooseMode, updateSetting, difficultMarks, notes }) {
  const paragraphs = text.content.split('\n').filter(Boolean)
  const paragraphRefs = useRef([])
  const notesByParagraph = notes.reduce((map, note) => {
    map[note.paragraphIndex] = (map[note.paragraphIndex] || 0) + 1
    return map
  }, {})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible) {
          onActiveParaChange(Number(visible.target.dataset.index))
        }
      },
      { rootMargin: '-20% 0px -45% 0px', threshold: [0.35, 0.55, 0.75] },
    )

    paragraphRefs.current.filter(Boolean).forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [onActiveParaChange, paragraphs.length])

  return (
    <div className={`reader-paper paper-${settings.bg} reader-mode-${mode}`}>
      <div className="reader-rail">
        <div className="rail-label">字号</div>
        <button className="rail-btn" onClick={() => updateSetting('font', Math.min(23, settings.font + 1))}>
          A+
        </button>
        <button className="rail-btn" onClick={() => updateSetting('font', Math.max(15, settings.font - 1))}>
          A-
        </button>
        <div className="rail-divider" />
        <div className="rail-label">模式</div>
        <button className="rail-btn" onClick={() => chooseMode('gentle')}>
          舒
        </button>
        <button className="rail-btn" onClick={() => chooseMode('focus')}>
          专
        </button>
        <button className="rail-btn" onClick={() => chooseMode('clear')}>
          清
        </button>
        <div className="rail-divider" />
        <div className="rail-label">背景</div>
        <button className="rail-btn" onClick={() => updateSetting('bg', 'mist')}>
          浅
        </button>
        <button className="rail-btn" onClick={() => updateSetting('bg', 'dark')}>
          深
        </button>
      </div>

      {settings.ruler ? <div className="reading-ruler show" style={{ top: 132 + activePara * 132 }} /> : null}

      <div className="reader-content">
        {paragraphs.map((paragraph, index) => {
          const isActive = activePara === index
          const isDifficult = difficultMarks.includes(index)
          const noteCount = notesByParagraph[index] || 0

          return (
            <p
              key={`${paragraph.slice(0, 12)}-${index}`}
              ref={(node) => {
                paragraphRefs.current[index] = node
              }}
              data-index={index}
              className={`para ${settings.focus ? (isActive ? 'active' : 'dimmed') : 'no-focus'} ${isDifficult ? 'difficult' : ''} ${noteCount ? 'has-note' : ''}`}
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
              <span className="para-badges">
                {isDifficult ? <span className="para-badge difficult-badge">难读</span> : null}
                {noteCount ? <span className="para-badge note-badge">便签 {noteCount}</span> : null}
              </span>
            </p>
          )
        })}
      </div>
    </div>
  )
}
