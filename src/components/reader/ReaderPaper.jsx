import { useEffect, useRef } from 'react'
import { modePresets } from '../../data/modes.js'

export default function ReaderPaper({ text, settings, activePara, onActiveParaChange, chooseMode, updateSetting }) {
  const paragraphs = text.content.split('\n').filter(Boolean)
  const paragraphRefs = useRef([])

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
    <div className={`reader-paper paper-${settings.bg}`}>
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

      {settings.ruler ? <div className="reading-ruler show" style={{ top: 144 + activePara * 124 }} /> : null}

      <div className="reader-content">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${paragraph.slice(0, 12)}-${index}`}
            ref={(node) => {
              paragraphRefs.current[index] = node
            }}
            data-index={index}
            className={`para ${settings.focus ? (activePara === index ? 'active' : '') : 'no-focus'}`}
            onClick={() => onActiveParaChange(index)}
            style={{
              fontSize: `${settings.font}px`,
              lineHeight: settings.line,
              letterSpacing: `${settings.letter}px`,
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

export function getModeLabel(mode) {
  return modePresets[mode]?.label || modePresets.gentle.label
}
