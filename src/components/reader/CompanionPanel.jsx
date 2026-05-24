const companionLabels = {
  off: '无陪伴',
  weak: '轻陪伴',
  medium: '标准陪伴',
  strong: '强陪伴',
}

const modeTempo = {
  gentle: {
    status: '慢读陪伴中',
    anchorSize: 46,
    pulseBase: 6.8,
  },
  focus: {
    status: '专注跟随中',
    anchorSize: 40,
    pulseBase: 4.8,
  },
  clear: {
    status: '清晰定位中',
    anchorSize: 38,
    pulseBase: 5.6,
  },
}

const levelTempo = {
  weak: { beadScale: 0.9, anchorAlpha: 0.48, showMeter: false, showCoach: false, ring: false },
  medium: { beadScale: 1, anchorAlpha: 0.72, showMeter: true, showCoach: false, ring: false },
  strong: { beadScale: 1.1, anchorAlpha: 0.9, showMeter: true, showCoach: true, ring: true },
}

const VISUAL_HEIGHT = 236
const BEAD_COUNT = 20

export default function CompanionPanel({
  progress,
  activeParagraph,
  totalParagraphs,
  companionLevel,
  setCompanionLevel,
  isDark,
  paragraphText = '',
  mode = 'gentle',
  testState,
  liveReading,
}) {
  const safeTotal = Math.max(totalParagraphs || 0, 1)
  const safeActive = Math.min(Math.max(activeParagraph || 0, 0), safeTotal - 1)
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress || 0)))
  const safeLevel = companionLabels[companionLevel] ? companionLevel : 'medium'
  const rhythm = getRhythmMeta({ activeParagraph: safeActive, paragraphText, mode, testRhythmType: testState?.rhythmType, liveReading })
  const levelConfig = levelTempo[safeLevel] || levelTempo.medium
  const feedbackText = safeLevel === 'weak' ? '轻陪伴中' : levelConfig.showCoach ? rhythm.coachText : rhythm.rhythmLabel
  const suggestedTempo = getTempoSuggestion(rhythm.rhythmGroup)
  const attentionRippleSpeed = getAttentionRippleSpeed(liveReading?.currentDwellSec || 0)
  const rippleSpeed = getRippleSpeed(rhythm.rhythmGroup, liveReading?.currentDwellSec || 0)

  if (safeLevel === 'off') {
    return (
      <section className={`companion-card tempo-guide-card level-off quiet-flow${isDark ? ' is-dark' : ''}`} aria-label="无陪伴阅读状态">
        <div className="companion-inner">
          <div className="quiet-flow-head">
            <div>
              <div className="pill-soft">无陪伴</div>
              <h3>安静阅读</h3>
            </div>
            <strong>{safeProgress}%</strong>
          </div>
          <div className="quiet-progress" aria-label={`完成进度 ${safeProgress}%`}>
            <span style={{ width: `${safeProgress}%` }} />
          </div>
          <div className="quiet-flow-meta">
            <span>第 {safeActive + 1} / {safeTotal} 段</span>
          </div>
          <button className="quiet-enable" type="button" onClick={() => setCompanionLevel('weak')}>
            开启轻陪伴
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={`companion-card tempo-guide-card tempo-level-${safeLevel}${isDark ? ' is-dark' : ''}`} aria-label="Lodue Tempo Guide 阅读节奏引导器">
      <div className="companion-inner">
        <div className="tempo-head">
          <div>
            <div className={`tempo-status-dot rhythm-${rhythm.rhythmGroup}`}>Lodue陪伴中</div>
            <h3>Lodue Tempo Guide｜阅读节奏引导器</h3>
            <p>{rhythm.rhythmLabel} · 第 {safeActive + 1} / {safeTotal} 段</p>
          </div>
          <div className="flow-stage">
            <span>{safeProgress}%</span>
            <strong>{safeActive + 1}</strong>
          </div>
        </div>

        <TempoGuideVisual
          level={safeLevel}
          progress={safeProgress}
          activeParagraph={safeActive}
          totalParagraphs={safeTotal}
          mode={mode}
          rhythm={rhythm}
          anchorLabel={getAnchorLabel(safeLevel)}
          attentionRippleSpeed={attentionRippleSpeed}
          rippleSpeed={rippleSpeed}
        />

        {safeLevel !== 'weak' ? (
          <div className={`tempo-feedback rhythm-${rhythm.rhythmGroup}`}>
            <span>{feedbackText}</span>
            {safeLevel === 'strong' ? <small>本段停留 {Math.round(liveReading?.currentDwellSec || 0)}s · 建议节奏：{suggestedTempo}</small> : null}
          </div>
        ) : null}

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

function TempoGuideVisual({ level, progress, activeParagraph, totalParagraphs, mode, rhythm, anchorLabel, attentionRippleSpeed, rippleSpeed }) {
  const safeTotal = Math.max(totalParagraphs || 0, 1)
  const modeConfig = modeTempo[mode] || modeTempo.gentle
  const levelConfig = levelTempo[level] || levelTempo.medium
  const activeBead = paragraphToBead(activeParagraph, safeTotal, BEAD_COUNT)
  const progressBead = Math.min(BEAD_COUNT - 1, Math.max(0, Math.ceil((progress / 100) * BEAD_COUNT) - 1))
  const beads = Array.from({ length: BEAD_COUNT }, (_, index) => index)

  return (
    <div
      className={`tempo-guide-field tempo-guide-${level} tempo-mode-${mode} rhythm-${rhythm.rhythmGroup}`}
      style={{
        height: VISUAL_HEIGHT,
        '--pulse-duration': `${rhythm.pulseDuration}s`,
        '--anchor-size': `${modeConfig.anchorSize}px`,
        '--anchor-alpha': levelConfig.anchorAlpha,
        '--marker-left': `${rhythm.markerPosition}%`,
        '--attention-ripple-speed': attentionRippleSpeed,
        '--ripple-speed': rippleSpeed,
      }}
    >
      {level === 'strong' && ['fast', 'slow', 'attention'].includes(rhythm.rhythmGroup) ? (
        <div className={`tempo-ripple-layer rhythm-${rhythm.rhythmGroup}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}

      <div className="tempo-bead-chain" aria-label="阅读进度珠链">
        {beads.map((_, index) => {
          const isRead = index <= progressBead
          const isActive = index === activeBead
          return (
            <span
              className={`tempo-bead${isRead ? ' is-read' : ''}${isActive ? ' is-current' : ''}`}
              key={index}
              style={{
                width: `${isActive ? 9 * levelConfig.beadScale : isRead ? 6 * levelConfig.beadScale : 5}px`,
                height: `${isActive ? 9 * levelConfig.beadScale : isRead ? 6 * levelConfig.beadScale : 5}px`,
              }}
            />
          )
        })}
      </div>

      {levelConfig.showMeter ? (
        <div className="tempo-meter" aria-label={`当前节奏：${rhythm.rhythmLabel}`}>
          <div className="tempo-meter-labels">
            <span>慢</span>
            <span>稳</span>
            <span>快</span>
          </div>
          <div className="tempo-meter-track">
            <span className="tempo-meter-segment slow" />
            <span className="tempo-meter-segment steady" />
            <span className="tempo-meter-segment fast" />
            <i className="tempo-meter-marker" />
          </div>
          <span className="tempo-meter-anchor-label">{anchorLabel}</span>
        </div>
      ) : (
        <div className="tempo-meter tempo-meter-minimal" aria-label={`当前节奏：${rhythm.rhythmLabel}`}>
          <div className="tempo-meter-track">
            <span className="tempo-meter-segment slow" />
            <span className="tempo-meter-segment steady" />
            <span className="tempo-meter-segment fast" />
            <i className="tempo-meter-marker" />
          </div>
        </div>
      )}

      <div className="tempo-guide-meta">
        <strong>{progress}%</strong>
        <span>第 {activeParagraph + 1} / {safeTotal} 段</span>
      </div>
    </div>
  )
}

function getRhythmMeta({ activeParagraph, paragraphText, mode, testRhythmType, liveReading }) {
  const rhythmType = liveReading?.rhythmType || testRhythmType || getFallbackRhythmType({ activeParagraph, paragraphText })
  const rhythmGroup = getRhythmGroup(rhythmType)
  const modeConfig = modeTempo[mode] || modeTempo.gentle
  const labelMap = {
    tooFast: '读得非常快，可能还没充分理解',
    fast: '节奏偏快',
    steady: '节奏稳定',
    slow: '节奏偏慢',
    verySlow: '阅读较慢，可以使用舒缓或清晰辅助',
  }
  const coachMap = {
    fast: '可以稍微放慢，给句子留一点停顿',
    steady: '节奏稳定，继续向前',
    slow: '可以稍微提起节奏，继续读下一句',
  }
  const speedScale = rhythmGroup === 'fast' ? 1.22 : rhythmGroup === 'slow' ? 1.36 : rhythmGroup === 'attention' ? 0.92 : 1

  return {
    rhythmType,
    rhythmGroup,
    rhythmLabel: liveReading?.rhythmLabel || labelMap[rhythmType] || modeConfig.status || '节奏稳定',
    coachText: liveReading?.coachText || coachMap[rhythmGroup],
    markerPosition: rhythmGroup === 'attention' ? 18 : rhythmGroup === 'slow' ? 24 : rhythmGroup === 'fast' ? 82 : 50,
    pulseDuration: Number((modeConfig.pulseBase * speedScale).toFixed(2)),
  }
}

function getAnchorLabel(level) {
  if (level === 'weak') return '呼吸锚点'
  if (level === 'strong') return '跟随这个节奏读'
  return '节奏锚点'
}

function getSuggestedTempo(rhythmGroup) {
  if (rhythmGroup === 'attention') return '回到段落'
  if (rhythmGroup === 'fast') return '放慢'
  if (rhythmGroup === 'slow') return '慢读'
  return '保持'
}

function getRhythmGroup(rhythmType) {
  if (rhythmType === 'building') return 'building'
  if (rhythmType === 'attention') return 'attention'
  if (rhythmType === 'tooFast' || rhythmType === 'fast') return 'fast'
  if (rhythmType === 'verySlow' || rhythmType === 'slow') return 'slow'
  return 'steady'
}

function getTempoSuggestion(rhythmGroup) {
  const suggestionMap = {
    building: '建立中',
    fast: '放慢',
    steady: '保持',
    slow: '稍微提速',
    attention: '回到段落',
  }
  return suggestionMap[rhythmGroup] || suggestionMap.steady
}

function getAttentionRippleSpeed(currentDwellSec) {
  if (currentDwellSec > 90) return '1.7s'
  if (currentDwellSec > 60) return '2.4s'
  return '3.4s'
}

function getRippleSpeed(rhythmGroup, currentDwellSec) {
  if (rhythmGroup === 'fast') return '2.6s'
  if (rhythmGroup === 'slow') return '3s'
  if (rhythmGroup === 'attention') {
    if (currentDwellSec > 90) return '1.5s'
    if (currentDwellSec > 60) return '2s'
    return '2.8s'
  }
  return '4s'
}

function getFallbackRhythmType({ activeParagraph, paragraphText }) {
  const paragraphLength = (paragraphText || '').trim().length
  const expectedSeconds = Math.min(40, Math.max(10, paragraphLength / 8))
  const simulatedDwell = 14 + (activeParagraph % 5) * 5

  if (simulatedDwell < expectedSeconds * 0.6) return 'fast'
  if (simulatedDwell > expectedSeconds * 1.45) return 'slow'
  return 'steady'
}

function paragraphToBead(paragraphIndex, total, beadCount) {
  if (total <= 1 || beadCount <= 1) return 0
  return Math.min(beadCount - 1, Math.max(0, Math.round((paragraphIndex / (total - 1)) * (beadCount - 1))))
}
