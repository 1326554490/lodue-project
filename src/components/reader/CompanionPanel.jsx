import Card from '../common/Card.jsx'

const companionLabels = {
  off: '关闭',
  weak: '弱',
  medium: '中',
  strong: '强',
}

export default function CompanionPanel({
  progress,
  activePara,
  total,
  notes,
  markDifficult,
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
  const visualLabel = {
    off: '极简',
    weak: '细流线',
    medium: '多线跟随',
    strong: '峰值与回环',
  }[companionLevel]

  return (
    <aside className="side-stack">
      <div className={`companion-card level-${companionLevel}`}>
        <div className="companion-inner">
          <div className="comp-head">
            <div>
              <div className="pill-soft">Lodue 陪伴中</div>
              <h3>陪伴流场</h3>
              <p>{companionLevel === 'off' ? '当前仅保留文字状态，减少视觉输入。' : `${modeSignal} · ${visualLabel}会随进度、难读和回看变化。`}</p>
            </div>
          </div>
          <ReadingField
            level={companionLevel}
            progress={progress}
            activePara={activePara}
            total={total}
            difficultMarks={difficultMarks}
            revisitCount={revisitCount}
            stage={stage}
          />
          <div className="metric-grid">
            <div className="metric">
              <span>陪伴感</span>
              <strong>{companionLabels[companionLevel]}</strong>
            </div>
            <div className="metric">
              <span>阅读阶段</span>
              <strong>{stage}</strong>
            </div>
            <div className="metric">
              <span>可视强度</span>
              <strong>{visualLabel}</strong>
            </div>
          </div>
          <div className="assist-actions">
            {Object.keys(companionLabels).map((level) => (
              <button className={companionLevel === level ? 'active' : ''} key={level} onClick={() => setCompanionLevel(level)}>
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
        <div className="assist-actions">
          <button className={isCurrentDifficult ? 'active warn' : ''} onClick={markDifficult}>
            {isCurrentDifficult ? '取消难读' : '标记难读'}
          </button>
          <button>本段提示</button>
        </div>
        <div className="hint-box">本段建议慢读：先关注人物关系与情绪变化，遇到长句时可以按逗号自然停顿。</div>
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

function ReadingField({ level, progress, activePara, total, difficultMarks, revisitCount, stage }) {
  const safeTotal = Math.max(total, 1)
  const currentX = `${Math.min(96, Math.max(4, ((activePara + 1) / safeTotal) * 100))}%`
  const progressWidth = `${Math.min(100, Math.max(0, progress))}%`

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
      <div className="field-line primary" />
      {level !== 'weak' ? <div className="field-line secondary" /> : null}
      {level === 'medium' || level === 'strong' ? <div className="field-line tertiary" /> : null}
      <div className="field-progress" style={{ width: progressWidth }} />
      <div className="field-cursor" style={{ left: currentX }}>
        <span>{activePara + 1}</span>
      </div>
      {level !== 'weak'
        ? Array.from({ length: safeTotal }).map((_, index) => (
            <span
              className={`field-node ${index === activePara ? 'active' : ''} ${difficultMarks.includes(index) ? 'difficult' : ''}`}
              key={index}
              style={{ left: `${((index + 1) / safeTotal) * 100}%` }}
            />
          ))
        : null}
      {level === 'strong'
        ? difficultMarks.map((index) => <span className="field-peak" key={`peak-${index}`} style={{ left: `${((index + 1) / safeTotal) * 100}%` }} />)
        : null}
      {level === 'strong'
        ? Object.entries(revisitCount).map(([index, count]) => (
            <span className="field-loop" key={`loop-${index}`} style={{ left: `${((Number(index) + 1) / safeTotal) * 100}%` }}>
              {count}
            </span>
          ))
        : null}
      <div className="field-caption">{level === 'weak' ? '细流线 · 当前进度点' : level === 'medium' ? '多线跟随 · 当前段落节点' : '强反馈 · 难读峰值与回看回环'}</div>
    </div>
  )
}
