import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { useTimer } from '../hooks/useTimer.js'

const selfCheckOptions = [
  { id: 'eye-tired', label: '今天眼睛容易疲劳', score: { visual: 2, pace: 1 } },
  { id: 'line-skip', label: '容易跳行 / 串行', score: { visual: 3 } },
  { id: 'distracted', label: '容易分心', score: { focus: 3 } },
  { id: 'slow-pace', label: '希望阅读节奏更慢', score: { pace: 2 } },
  { id: 'dark', label: '偏好深色背景', score: { visual: 1 } },
  { id: 'light', label: '偏好浅色背景', score: {} },
  { id: 'companion', label: '需要陪伴提示', score: { focus: 1, companion: 2 } },
]

const feedbackOptions = [
  { id: 'understand', label: '我能顺畅理解主要内容', score: { visual: -1, focus: -1 } },
  { id: 'slight-skip', label: '我读到中途有轻微跳行', score: { visual: 2 } },
  { id: 'reread', label: '我需要回看前面的句子', score: { focus: 1, visual: 1 } },
  { id: 'dense', label: '我感觉文字有些密集', score: { visual: 2, pace: 1 } },
  { id: 'ui-attract', label: '我容易被界面元素吸引', score: { focus: 2 } },
  { id: 'more-companion', label: '我希望系统给我更明显的陪伴提示', score: { companion: 2 } },
  { id: 'quiet', label: '我希望系统尽量安静', score: { companion: -2, focus: -1 } },
]

const baselineText = `城市图书馆的自习区在傍晚安静下来，窗边的灯一盏盏亮起。林夏把今天要读的材料摊在桌面上，先看标题，再看小节名称。她发现自己并不是读不懂，而是常常在长段落里失去位置：读到第三四行时，眼睛已经走在前面，心里却还停在上一句。

她试着放慢速度，沿着句子的停顿往前走。文章讲的是一个社区如何改造旧书屋：志愿者整理积压图书，把靠窗的位置留给老人和孩子，再用小黑板记录每天最受欢迎的书。内容不复杂，但细节连续出现，如果只追着结论，很容易漏掉事情发生的顺序。`

const countChars = (value) => value.replace(/\s/g, '').length

function getReadingRhythm(seconds, text = baselineText) {
  const charCount = countChars(text)
  const minutes = seconds / 60
  const charsPerMinute = Math.round(charCount / Math.max(minutes, 0.01))

  if (charsPerMinute >= 720) {
    return {
      charCount,
      charsPerMinute,
      rhythmType: 'tooFast',
      rhythmLabel: '读得非常快，可能还没充分理解',
      rhythmExplain: '这个速度更像扫读，建议进入正文后让 Lodue 多给一点节奏提醒。',
    }
  }

  if (charsPerMinute >= 520) {
    return {
      charCount,
      charsPerMinute,
      rhythmType: 'fast',
      rhythmLabel: '节奏偏快',
      rhythmExplain: '你推进得比较快，如果后续理解不稳，可以用专注陪伴帮助停在当前段落。',
    }
  }

  if (charsPerMinute >= 260) {
    return {
      charCount,
      charsPerMinute,
      rhythmType: 'steady',
      rhythmLabel: '节奏稳定',
      rhythmExplain: '这个速度适合持续阅读，保持当前位置感和轻量陪伴即可。',
    }
  }

  if (charsPerMinute >= 140) {
    return {
      charCount,
      charsPerMinute,
      rhythmType: 'slow',
      rhythmLabel: '节奏偏慢但稳定',
      rhythmExplain: '你更适合慢读节奏，舒缓陪伴可以减少压力并保留阅读连贯性。',
    }
  }

  return {
    charCount,
    charsPerMinute,
    rhythmType: 'verySlow',
    rhythmLabel: '阅读较慢，可以使用舒缓或清晰辅助',
    rhythmExplain: '当前速度较慢，建议降低视觉负担，使用舒缓或清晰模式稳定定位。',
  }
}

function toggleList(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function addScores(options, selectedIds) {
  return options.reduce(
    (sum, option) => {
      if (!selectedIds.includes(option.id)) return sum
      return {
        visual: sum.visual + (option.score.visual || 0),
        focus: sum.focus + (option.score.focus || 0),
        pace: sum.pace + (option.score.pace || 0),
        companion: sum.companion + (option.score.companion || 0),
      }
    },
    { visual: 0, focus: 0, pace: 0, companion: 0 },
  )
}

function buildProfile(testState) {
  const self = testState.selfCheck || []
  const feedback = testState.feedback || []
  const seconds = testState.seconds || 0
  const rhythmResult = seconds > 0
    ? getReadingRhythm(seconds)
    : {
        charCount: countChars(baselineText),
        charsPerMinute: 0,
        rhythmType: 'steady',
        rhythmLabel: '节奏稳定',
        rhythmExplain: '完成基线测试后会根据真实用时判断节奏。',
      }
  const chars = rhythmResult.charCount
  const charsPerMinute = testState.charsPerMinute || rhythmResult.charsPerMinute
  const rhythmType = testState.rhythmType || rhythmResult.rhythmType
  const rhythmLabel = testState.rhythmLabel || rhythmResult.rhythmLabel
  const rhythmExplain = testState.rhythmExplain || rhythmResult.rhythmExplain
  const selfScore = addScores(selfCheckOptions, self)
  const feedbackScore = addScores(feedbackOptions, feedback)
  const visualScore = selfScore.visual + feedbackScore.visual
  const focusScore = selfScore.focus + feedbackScore.focus
  const companionScore = selfScore.companion + feedbackScore.companion

  const visualLoad = visualScore >= 4 ? '高' : visualScore >= 2 ? '中' : '低'
  const focusNeed = focusScore >= 4 ? '高' : focusScore >= 2 ? '中' : '低'
  const hasVisualIssue = self.includes('line-skip') || feedback.includes('slight-skip') || feedback.includes('reread') || feedback.includes('dense')
  const feelsUnclear = !feedback.includes('understand') || feedback.includes('reread') || feedback.includes('dense')
  let recommendedMode = 'gentle'

  if (rhythmType === 'verySlow' || rhythmType === 'slow') recommendedMode = 'gentle'
  else if ((rhythmType === 'fast' || rhythmType === 'tooFast') && feelsUnclear) recommendedMode = 'focus'
  else if (hasVisualIssue) recommendedMode = 'clear'
  else if (self.includes('distracted') || feedback.includes('ui-attract') || focusNeed === '高') recommendedMode = 'focus'

  let companionLevel = 'weak'
  if (feedback.includes('quiet')) companionLevel = 'off'
  else if (companionScore >= 4 || focusNeed === '高' || rhythmType === 'tooFast') companionLevel = 'strong'
  else if (companionScore >= 2 || focusNeed === '中' || rhythmType === 'fast') companionLevel = 'medium'

  const reason = {
    gentle: '你的反馈更适合低压力慢读：保持柔和背景、较宽行距和轻量陪伴，让阅读过程不被过度提示打断。',
    focus: '你今天更需要稳定注意力：推荐突出当前段落、弱化周边内容，并使用标准陪伴帮助回到阅读位置。',
    clear: '你对文字密度或跳行更敏感：推荐更大的字间距、清楚的段落边界和定位线，优先降低视觉负担。',
  }[recommendedMode]

  return {
    chars,
    charsPerMinute,
    rhythmType,
    rhythmLabel,
    rhythmExplain,
    visualLoad,
    focusNeed,
    recommendedMode,
    companionLevel,
    reason,
  }
}

export default function TestPage({ selectedText, testState, setTestState, goTo, chooseMode }) {
  const timer = useTimer(0)
  const startTimeRef = useRef(null)
  const [warning, setWarning] = useState('')
  const profile = useMemo(() => buildProfile(testState), [testState])
  const selfCheck = testState.selfCheck || []
  const feedback = testState.feedback || []
  const hasStarted = Boolean(testState.baselineStarted)

  useEffect(() => {
    if (hasStarted) setTestState((current) => ({ ...current, seconds: timer.seconds }))
  }, [hasStarted, setTestState, timer.seconds])

  const startBaseline = () => {
    setWarning('')
    startTimeRef.current = Date.now()
    timer.reset()
    timer.start()
    setTestState((current) => ({
      ...current,
      seconds: 0,
      charCount: countChars(baselineText),
      charsPerMinute: 0,
      rhythmType: null,
      rhythmLabel: '',
      rhythmExplain: '',
      baselineStarted: true,
    }))
  }

  const finishBaseline = () => {
    timer.stop()
    const elapsedSeconds = startTimeRef.current
      ? Number(((Date.now() - startTimeRef.current) / 1000).toFixed(1))
      : timer.seconds

    if (elapsedSeconds < 6) {
      setWarning('阅读时间过短，建议重新测试')
      setTestState((current) => ({ ...current, seconds: elapsedSeconds, baselineStarted: false }))
      startTimeRef.current = null
      timer.reset()
      return
    }

    const rhythmResult = getReadingRhythm(elapsedSeconds)
    setTestState((current) => ({
      ...current,
      step: 3,
      seconds: elapsedSeconds,
      charCount: rhythmResult.charCount,
      charsPerMinute: rhythmResult.charsPerMinute,
      rhythmType: rhythmResult.rhythmType,
      rhythmLabel: rhythmResult.rhythmLabel,
      rhythmExplain: rhythmResult.rhythmExplain,
      baselineStarted: false,
    }))
    startTimeRef.current = null
  }

  const finish = () => {
    const result = buildProfile(testState)
    setTestState((current) => ({ ...current, profile: result }))
    chooseMode(result.recommendedMode)
    goTo('mode')
  }

  return (
    <section>
      <PageHero eyebrow="阅读状态校准" title="开始前，先了解你今天的阅读状态">
        这不是医学诊断，只用于优化当前阅读体验。Lodue 会把主观状态、基线用时和读后反馈合在一起，生成今日阅读画像。
      </PageHero>

      <div className="progress-shell">
        <div className="progress-mini" style={{ width: `${(testState.step / 4) * 100}%` }} />
      </div>

      <Card className="test-box">
        <div className="test-top">
          <div>
            <span className="tag active">Step {testState.step}/4</span>
            <h2>
              {testState.step === 1 && '今日阅读状态自评'}
              {testState.step === 2 && '阅读基线测试'}
              {testState.step === 3 && '阅读后反馈'}
              {testState.step === 4 && '生成今日阅读画像'}
            </h2>
          </div>
          <div className="test-current">当前内容：{selectedText.title}</div>
        </div>

        {testState.step === 1 ? (
          <>
            <div className="choice-grid">
              {selfCheckOptions.map((option) => (
                <button
                  key={option.id}
                  className={`choice ${selfCheck.includes(option.id) ? 'selected' : ''}`}
                  onClick={() => setTestState((current) => ({ ...current, selfCheck: toggleList(selfCheck, option.id) }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="actions right">
              <Button disabled={!selfCheck.length} onClick={() => setTestState((current) => ({ ...current, step: 2 }))}>
                进入阅读基线测试
              </Button>
            </div>
          </>
        ) : null}

        {testState.step === 2 ? (
          <>
            <div className="timer-box">
              <div>
                <span className="small muted">阅读用时</span>
                <span className="timer-value">{timer.seconds}s</span>
                <span className="small muted"> · {profile.chars} 字</span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={startBaseline}>
                  开始计时
                </Button>
                <Button variant="secondary" disabled={!hasStarted} onClick={timer.running ? timer.pause : timer.start}>
                  {timer.running ? '暂停' : '继续'}
                </Button>
              </div>
            </div>
            {warning ? <div className="calibration-warning">{warning}</div> : null}
            <div className="reading-test">
              {baselineText.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 16)}>{paragraph}</p>
              ))}
            </div>
            <div className="between mt24">
              <Button variant="secondary" onClick={() => setTestState((current) => ({ ...current, step: 1, baselineStarted: false }))}>
                返回上一步
              </Button>
              <Button disabled={!hasStarted} onClick={finishBaseline}>
                我读完了
              </Button>
            </div>
          </>
        ) : null}

        {testState.step === 3 ? (
          <>
            <div className="note-soft mb18">
              本段阅读用时：<strong>{testState.seconds} 秒</strong>；共 <strong>{profile.chars} 字</strong>；每分钟约 <strong>{profile.charsPerMinute || 0} 字</strong>。
              <br />
              节奏判断：<strong>{profile.rhythmLabel}</strong>。{profile.rhythmExplain}
            </div>
            <div className="choice-grid">
              {feedbackOptions.map((option) => (
                <button
                  key={option.id}
                  className={`choice ${feedback.includes(option.id) ? 'selected' : ''}`}
                  onClick={() => setTestState((current) => ({ ...current, feedback: toggleList(feedback, option.id) }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="between mt24">
              <Button variant="secondary" onClick={() => setTestState((current) => ({ ...current, step: 2, baselineStarted: false }))}>
                重新阅读
              </Button>
              <Button disabled={!feedback.length} onClick={() => setTestState((current) => ({ ...current, step: 4 }))}>
                生成阅读画像
              </Button>
            </div>
          </>
        ) : null}

        {testState.step === 4 ? (
          <>
            <div className="profile-grid">
              <div><span>阅读节奏</span><strong>{profile.rhythmLabel}</strong></div>
              <div><span>视觉负担</span><strong>{profile.visualLoad}</strong></div>
              <div><span>专注需求</span><strong>{profile.focusNeed}</strong></div>
              <div><span>推荐模式</span><strong>{profile.recommendedMode}</strong></div>
              <div><span>陪伴强度</span><strong>{profile.companionLevel}</strong></div>
              <div><span>基线速度</span><strong>{profile.charsPerMinute} 字/分钟</strong></div>
            </div>
            <div className="note-soft mt24">{profile.reason}</div>
            <div className="between mt24">
              <Button variant="secondary" onClick={() => setTestState((current) => ({ ...current, step: 3 }))}>
                调整反馈
              </Button>
              <Button onClick={finish}>使用推荐模式</Button>
            </div>
          </>
        ) : null}
      </Card>
    </section>
  )
}
