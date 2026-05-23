import { useEffect } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { useTimer } from '../hooks/useTimer.js'

const problems = ['容易跳行或串行', '读着读着注意力分散', '长段落容易疲劳', '需要更清晰的视觉定位']
const feelings = ['偏慢但稳定', '有点分心', '眼睛容易累', '节奏刚刚好']

export default function TestPage({ selectedText, testState, setTestState, goTo, chooseMode }) {
  const timer = useTimer(testState.seconds || 0)

  useEffect(() => {
    setTestState((current) => ({ ...current, seconds: timer.seconds }))
  }, [setTestState, timer.seconds])

  const selectProblem = (problem) => setTestState((current) => ({ ...current, problem }))
  const selectFeeling = (feeling) => setTestState((current) => ({ ...current, feeling }))

  const finish = () => {
    const text = `${testState.problem} ${testState.feeling}`
    if (text.includes('跳行') || text.includes('视觉定位')) chooseMode('clear')
    else if (text.includes('分心')) chooseMode('focus')
    else chooseMode('gentle')
    goTo('mode')
  }

  return (
    <section>
      <PageHero eyebrow="阅读状态校准" title="开始前，先了解你今天的阅读状态">
        这不是医学诊断，只用于优化当前阅读体验。Lodue 会根据反馈推荐更舒适的显示方式和陪伴节奏。
      </PageHero>

      <div className="progress-shell">
        <div className="progress-mini" style={{ width: `${(testState.step / 3) * 100}%` }} />
      </div>

      <Card className="test-box">
        <div className="test-top">
          <div>
            <span className="tag active">Step {testState.step}/3</span>
            <h2>
              {testState.step === 1 && '你现在阅读时最常遇到的问题是？'}
              {testState.step === 2 && '请阅读一小段文字，感受当前节奏'}
              {testState.step === 3 && '读完后，你的感受更接近哪一种？'}
            </h2>
          </div>
          <div className="test-current">当前内容：{selectedText.title}</div>
        </div>

        {testState.step === 1 ? (
          <>
            <div className="choice-grid">
              {problems.map((problem) => (
                <button
                  key={problem}
                  className={`choice ${testState.problem === problem ? 'selected' : ''}`}
                  onClick={() => selectProblem(problem)}
                >
                  {problem}
                </button>
              ))}
            </div>
            <div className="actions right">
              <Button disabled={!testState.problem} onClick={() => setTestState((current) => ({ ...current, step: 2 }))}>
                进入短文本测试
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
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={timer.reset}>
                  重置
                </Button>
                <Button variant="secondary" onClick={timer.toggle}>
                  {timer.running ? '暂停' : '开始计时'}
                </Button>
              </div>
            </div>
            <div className="reading-test">
              午后的图书馆很安静，阳光落在桌面上。林夏翻开那本旧书，发现书页边缘写着几行浅浅的批注。她忽然觉得，阅读并不是一个人的事情，而像是在和某个遥远的人轻声交谈。
            </div>
            <div className="between mt24">
              <Button variant="secondary" onClick={() => setTestState((current) => ({ ...current, step: 1 }))}>
                返回上一步
              </Button>
              <Button
                onClick={() => {
                  timer.stop()
                  setTestState((current) => ({ ...current, step: 3, seconds: timer.seconds || 42 }))
                }}
              >
                我读完了
              </Button>
            </div>
          </>
        ) : null}

        {testState.step === 3 ? (
          <>
            <div className="note-soft mb18">
              本段阅读用时：<strong>{testState.seconds || 42} 秒</strong>；当前节奏：<strong>偏慢但稳定</strong>。请选择你的主观感受，系统将生成今日阅读模式。
            </div>
            <div className="choice-grid">
              {feelings.map((feeling) => (
                <button
                  key={feeling}
                  className={`choice ${testState.feeling === feeling ? 'selected' : ''}`}
                  onClick={() => selectFeeling(feeling)}
                >
                  {feeling}
                </button>
              ))}
            </div>
            <div className="between mt24">
              <Button variant="secondary" onClick={() => setTestState((current) => ({ ...current, step: 2 }))}>
                重新阅读
              </Button>
              <Button disabled={!testState.feeling} onClick={finish}>
                生成我的阅读模式
              </Button>
            </div>
          </>
        ) : null}
      </Card>
    </section>
  )
}
