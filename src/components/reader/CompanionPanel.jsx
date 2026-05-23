const companionLabels = {
  off: '关闭陪伴',
  weak: '轻陪伴',
  medium: '标准陪伴',
  strong: '强陪伴',
}

const levelCopy = {
  off: '陪伴已关闭',
  weak: '细波线轻提示',
  medium: '标准陪伴流场',
  strong: '强陪伴信号层',
}

export default function CompanionPanel({
  progress,
  activeParagraph,
  totalParagraphs,
  companionLevel,
  setCompanionLevel,
  isDark,
  notes = [],
  difficultMarks = [],
  revisitCount = {},
}) {
  const safeTotal = Math.max(totalParagraphs || 0, 1)
  const safeActive = Math.min(Math.max(activeParagraph || 0, 0), safeTotal - 1)
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress || 0)))
  const safeLevel = companionLabels[companionLevel] ? companionLevel : 'medium'
  const visualHeight =
    safeLevel === 'off' ? 108 :
    safeLevel === 'weak' ? 176 :
    safeLevel === 'medium' ? 228 : 260

  return (
    <section className={`companion-card level-${safeLevel}${isDark ? ' is-dark' : ''}`} aria-label="Lodue Flow 陪伴面板">
      <div className="companion-inner">
        <div className="comp-head">
          <div>
            <div className="pill-soft">Lodue陪伴中</div>
            <h3>Lodue Flow</h3>
            <p>
              {levelCopy[safeLevel]} · {safeProgress}% · 第 {safeActive + 1} / {safeTotal} 段
            </p>
          </div>
        </div>

        <LodueFlow
          level={safeLevel}
          progress={safeProgress}
          activeParagraph={safeActive}
          totalParagraphs={safeTotal}
          visualHeight={visualHeight}
          notes={notes}
          difficultMarks={difficultMarks}
          revisitCount={revisitCount}
        />

        <div className="flow-legend" aria-hidden="true">
          {safeLevel === 'off' ? (
            <span><i className="legend-progress" />极简进度</span>
          ) : (
            <span><i className="legend-wave" />阅读节奏</span>
          )}
          {safeLevel !== 'off' ? <span><i className="legend-current" />当前段落</span> : null}
          {safeLevel === 'strong' ? <span><i className="legend-peak" />难读峰值</span> : null}
          {safeLevel === 'strong' ? <span><i className="legend-note" />便签点</span> : null}
        </div>

        <div className="assist-actions" aria-label="陪伴强度切换">
          {Object.entries(companionLabels).map(([level, label]) => (
            <button
              className={safeLevel === level ? 'active' : ''}
              key={level}
              onClick={() => setCompanionLevel(level)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function LodueFlow({ level, progress, activeParagraph, totalParagraphs, visualHeight, notes, difficultMarks, revisitCount }) {
  const safeTotal = Math.max(totalParagraphs || 0, 1)
  const currentRatio = Math.min(0.96, Math.max(0.04, (activeParagraph + 1) / safeTotal))
  const currentX = `${currentRatio * 100}%`
  const progressWidth = `${Math.min(100, Math.max(0, progress))}%`
  const activeLabel = `第 ${activeParagraph + 1} / ${safeTotal} 段`
  const noteParagraphs = [...new Set((notes || []).map((note) => note.paragraphIndex))]
  const xForIndex = (index) => 8 + ((Math.min(Math.max(index, 0), safeTotal - 1) + 1) / safeTotal) * 84
  const drift = Math.round(currentRatio * 10)

  if (level === 'off') {
    return (
      <div className="reading-field field-off" style={{ height: visualHeight }}>
        <strong>{progress}%</strong>
        <span>{activeLabel} · 陪伴已关闭</span>
        <div className="field-off-track">
          <span style={{ width: progressWidth }} />
        </div>
      </div>
    )
  }

  return (
    <div className={`reading-field field-${level}`} style={{ height: visualHeight }}>
      <svg className="flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="flow-wave primary"
          d={`M 4 ${52 - drift / 3} C 18 ${35 + drift}, 31 ${67 - drift}, 45 51 S 72 ${36 + drift / 2}, 96 ${51 - drift / 4}`}
        />
        {level !== 'weak' ? (
          <path
            className="flow-wave secondary"
            d={`M 4 ${38 + drift / 4} C 20 25, 35 ${55 + drift / 2}, 51 39 S 78 28, 96 ${43 + drift / 5}`}
          />
        ) : null}
        {level === 'strong' ? (
          <path
            className="flow-wave tertiary"
            d={`M 4 ${69 - drift / 5} C 22 80, 39 52, 58 68 S 82 ${80 - drift}, 96 60`}
          />
        ) : null}
        {level === 'strong'
          ? Object.entries(revisitCount || {}).map(([index]) => {
              const x = xForIndex(Number(index))
              return <path className="flow-loop" key={`loop-${index}`} d={`M ${x - 5} 30 C ${x - 12} 17, ${x + 12} 17, ${x + 5} 30`} />
            })
          : null}
      </svg>

      <div className="field-progress" style={{ width: progressWidth }} />
      <div className="field-progress-line" style={{ left: currentX }} />
      <div className={`field-cursor ${level === 'strong' ? 'strong' : ''}`} style={{ left: currentX }} />

      {level === 'strong'
        ? (difficultMarks || []).map((index) => <span className="field-peak" key={`peak-${index}`} style={{ left: `${xForIndex(index)}%` }} />)
        : null}
      {level !== 'weak' ? <span className="field-warm-dot" style={{ left: `${Math.min(92, Math.max(12, xForIndex(activeParagraph) + 14))}%` }} /> : null}
      {level === 'strong'
        ? noteParagraphs.map((index) => <span className="field-note" key={`note-${index}`} style={{ left: `${xForIndex(index)}%` }} />)
        : null}
      {level === 'strong'
        ? Object.entries(revisitCount || {}).map(([index]) => <span className="field-loop-dot" key={`loop-dot-${index}`} style={{ left: `${xForIndex(Number(index))}%` }} />)
        : null}

      <div className="field-meta">
        <strong>{progress}%</strong>
        <span>{activeLabel}</span>
      </div>
      <div className="field-caption">{levelCopy[level]}</div>
    </div>
  )
}
