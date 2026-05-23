import Card from '../common/Card.jsx'

const companionLabels = {
  off: '关闭陪伴',
  weak: '轻陪伴',
  medium: '标准陪伴',
  strong: '强陪伴',
}

const companionDescriptions = {
  off: '仅保留进度，降低存在感。',
  weak: '细波线和当前位置。',
  medium: '加入便签点和难读峰。',
  strong: '显示回看弧线与完整信号。',
}

export default function CompanionPanel({
  progress,
  activePara,
  total,
  notes,
  difficultyCount,
  difficultMarks,
  revisitCount,
  companionLevel,
  setCompanionLevel,
  isCurrentDifficult,
  mode,
}) {
  const stage = progress < 35 ? '渐入' : progress < 70 ? '沉浸' : '收束'
  const revisitTotal = Object.values(revisitCount).reduce((sum, count) => sum + count, 0)
  const modeSignal = mode === 'focus' ? '专注跟随' : mode === 'clear' ? '清晰定位' : '低压力阅读'

  return (
    <aside className="side-stack">
      <div className={`companion-card level-${companionLevel} companion-sticky`}>
        <div className="companion-inner">
          <div className="comp-head">
            <div>
              <div className="pill-soft">Lodue Flow</div>
              <h3>阅读流</h3>
              <p>{companionLevel === 'off' ? '陪伴已弱化，仅显示当前进度。' : `${modeSignal}，信号随段落推进更新。`}</p>
            </div>
          </div>
          <ReadingField
            level={companionLevel}
            progress={progress}
            activePara={activePara}
            total={total}
            difficultMarks={difficultMarks}
            revisitCount={revisitCount}
            notes={notes}
            stage={stage}
          />
          <div className="flow-legend">
            <span><i className="legend-wave" />节奏</span>
            {companionLevel !== 'weak' && companionLevel !== 'off' ? <span><i className="legend-peak" />难读</span> : null}
            {companionLevel !== 'weak' && companionLevel !== 'off' ? <span><i className="legend-note" />便签</span> : null}
            {companionLevel === 'strong' ? <span><i className="legend-loop" />回看</span> : null}
          </div>
          <div className="assist-actions">
            {Object.keys(companionLabels).map((level) => (
              <button className={companionLevel === level ? 'active' : ''} key={level} onClick={() => setCompanionLevel(level)} title={companionDescriptions[level]}>
                {companionLabels[level]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="assist-card">
        <div className="between">
          <div>
            <strong>阅读进度</strong>
            <div className="small muted">
              第 {activePara + 1} / {total} 段
            </div>
          </div>
          <span className="tag">{progress}%</span>
        </div>
        <div className="assist-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="assist-grid">
          <div className="assist-cell">
            <span>难读标记</span>
            <strong>{difficultyCount} 处</strong>
          </div>
          <div className="assist-cell">
            <span>预计剩余</span>
            <strong>约 {Math.max(total - activePara - 1, 0)} 段</strong>
          </div>
        </div>
        <div className="hint-box">{isCurrentDifficult ? '本段已标记为需要回看。' : '段落旁工具可添加便签或回看标记。'}</div>
      </Card>

      <Card>
        <div className="between mb18">
          <strong>阅读信号</strong>
          <span className="tag">实时</span>
        </div>
        <div className="signal-list">
          <div>
            <span>当前段落</span>
            <strong>第 {activePara + 1} 段</strong>
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

      <Card>
        <div className="between mb18">
          <strong>我的便签</strong>
          <span className="small muted">{notes.length} 条</span>
        </div>
        {notes.length ? (
          notes.map((note) => (
            <div className="note-item" key={note.id}>
              <div className="note-label">第 {note.paragraphIndex + 1} 段</div>
              {note.text}
            </div>
          ))
        ) : (
          <div className="note-empty">点击正文段落后添加便签，记录难读点或共鸣句。</div>
        )}
      </Card>
    </aside>
  )
}

function ReadingField({ level, progress, activePara, total, difficultMarks, revisitCount, notes, stage }) {
  const safeTotal = Math.max(total, 1)
  const currentRatio = Math.min(0.96, Math.max(0.04, (activePara + 1) / safeTotal))
  const currentX = `${currentRatio * 100}%`
  const progressWidth = `${Math.min(100, Math.max(0, progress))}%`
  const noteParagraphs = [...new Set(notes.map((note) => note.paragraphIndex))]
  const xForIndex = (index) => 8 + ((index + 1) / safeTotal) * 84
  const lineOffset = Math.round(currentRatio * 10)

  if (level === 'off') {
    return (
      <div className="reading-field field-off">
        <strong>{progress}%</strong>
        <span>{stage}阅读中 · 第 {activePara + 1} 段</span>
      </div>
    )
  }

  return (
    <div className={`reading-field field-${level}`}>
      <svg className="flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="flow-wave primary" d={`M 4 ${50 - lineOffset / 2} C 18 ${36 + lineOffset}, 30 ${64 - lineOffset}, 44 50 S 70 ${38 + lineOffset}, 96 ${50 - lineOffset / 3}`} />
        {level !== 'weak' ? <path className="flow-wave secondary" d={`M 4 ${38 + lineOffset / 4} C 20 ${28}, 32 ${50 + lineOffset}, 48 38 S 76 ${30}, 96 ${42 + lineOffset / 5}`} /> : null}
        {level === 'strong' ? <path className="flow-wave tertiary" d={`M 4 ${66 - lineOffset / 5} C 22 ${76}, 36 ${52}, 54 66 S 78 ${78 - lineOffset}, 96 60`} /> : null}
        {level === 'strong'
          ? Object.entries(revisitCount).map(([index]) => {
              const x = xForIndex(Number(index))
              return <path className="flow-loop" key={`loop-${index}`} d={`M ${x - 4} 30 C ${x - 10} 18, ${x + 10} 18, ${x + 4} 30`} />
            })
          : null}
      </svg>
      <div className="field-progress" style={{ width: progressWidth }} />
      <div className="field-progress-line" style={{ left: currentX }} />
      <div className="field-cursor" style={{ left: currentX }} />
      {level === 'medium' || level === 'strong'
        ? difficultMarks.map((index) => <span className="field-peak" key={`peak-${index}`} style={{ left: `${xForIndex(index)}%` }} />)
        : null}
      {level === 'medium' || level === 'strong'
        ? noteParagraphs.map((index) => <span className="field-note" key={`note-${index}`} style={{ left: `${xForIndex(index)}%` }} />)
        : null}
      {level === 'strong'
        ? Object.entries(revisitCount).map(([index]) => <span className="field-loop-dot" key={`loop-dot-${index}`} style={{ left: `${xForIndex(Number(index))}%` }} />)
        : null}
      <div className="field-caption">{level === 'weak' ? '轻陪伴' : level === 'medium' ? '标准陪伴' : '强陪伴'}</div>
    </div>
  )
}
