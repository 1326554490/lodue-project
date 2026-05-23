import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'

const focusData = [
  { time: '开始', focus: 42, calm: 55 },
  { time: '5min', focus: 56, calm: 60 },
  { time: '10min', focus: 68, calm: 69 },
  { time: '15min', focus: 76, calm: 73 },
  { time: '完成', focus: 82, calm: 78 },
]

const weekData = [
  { day: '一', value: 42 },
  { day: '二', value: 63 },
  { day: '三', value: 48 },
  { day: '四', value: 84 },
  { day: '五', value: 56 },
  { day: '六', value: 98 },
  { day: '日', value: 70 },
]

export default function FeedbackPage({ goTo, selectedText, notes }) {
  return (
    <section>
      <PageHero eyebrow="阅读反馈报告" title="这次阅读完成得很稳定">
        Lodue 记录了你的阅读节奏、理解反馈与情绪变化。慢一点也没关系，稳定读下去就是进步。
      </PageHero>

      <div className="split">
        <div>
          <Card className="mb18">
            <div className="row-title compact">本次阅读摘要</div>
            <div className="grid-2">
              <ReportCell label="阅读内容" value={selectedText.title} />
              <ReportCell label="阅读时长" value="18 分钟" />
              <ReportCell label="回看标记" value={`${Math.max(notes.length, 2)} 处`} />
              <ReportCell label="建议休息" value="3 分钟" />
            </div>
          </Card>
          <Card>
            <h3 className="card-title">Lodue 的温柔提醒</h3>
            <div className="soft-remind">
              你在前 5 分钟略有分散，但中段之后专注状态逐渐稳定。建议继续使用舒缓阅读模式，并保持较宽行距。
            </div>
          </Card>
        </div>

        <div>
          <Card className="mb18">
            <div className="between mb18">
              <strong>专注与平静变化</strong>
              <span className="tag">本次</span>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={focusData}>
                  <CartesianGrid stroke="#e5eef0" vertical={false} />
                  <XAxis dataKey="time" />
                  <Tooltip />
                  <Area dataKey="calm" name="平静" stroke="#8db3c8" fill="#dcebef" strokeWidth={3} />
                  <Area dataKey="focus" name="专注" stroke="#57aea2" fill="#d9f2ef" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="between mb18">
              <strong>一周阅读节奏</strong>
              <span className="tag">周报</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" />
                <Tooltip />
                <Bar dataKey="value" fill="#58aea3" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <div className="actions">
        <Button onClick={() => goTo('reader')}>继续阅读</Button>
        <Button variant="secondary" onClick={() => goTo('community')}>
          分享给共读伙伴
        </Button>
        <Button variant="secondary" onClick={() => goTo('home')}>
          保存并返回首页
        </Button>
      </div>
    </section>
  )
}

function ReportCell({ label, value }) {
  return (
    <div className="report-cell">
      <div className="small muted">{label}</div>
      <div className="report-number">{value}</div>
    </div>
  )
}
