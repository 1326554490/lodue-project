import { FileText, Globe, Languages, Link, Upload } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import Tag from '../components/common/Tag.jsx'
import { sampleTexts } from '../data/sampleTexts.js'

export default function HomePage({ goTo, setSelectedText }) {
  const [customText, setCustomText] = useState('')

  const startReading = (text) => {
    setSelectedText(text)
    goTo('test')
  }

  const startCustom = () => {
    const value = customText.trim()
    if (!value) return
    startReading({
      id: 'custom',
      tag: '自定义内容',
      title: '我的阅读材料',
      desc: '由你粘贴导入的阅读内容。',
      content: value,
    })
  }

  return (
    <section>
      <PageHero eyebrow="高保真内容入口页" title="选择今天的阅读内容">
        你可以从示例文本开始，也可以粘贴自己的内容。Lodue 会先做轻量阅读状态校准，再进入个性化阅读空间。
      </PageHero>

      <div className="row-title">
        <FileText size={22} /> 精选示例
      </div>
      <div className="grid-3">
        {sampleTexts.map((item) => (
          <Card key={item.id} className="sample-card">
            <div>
              <Tag active>{item.tag}</Tag>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="sample-actions">
              <Button variant="secondary" onClick={() => setSelectedText(item)}>
                预览内容
              </Button>
              <Button onClick={() => startReading(item)}>开始阅读</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="row-title mt-section">
        <Upload size={22} /> 粘贴你的文本
      </div>
      <Card>
        <textarea
          value={customText}
          onChange={(event) => setCustomText(event.target.value)}
          placeholder="将文章、资料、论文段落粘贴到这里..."
        />
        <div className="grid-2 mt24">
          <Button onClick={startCustom}>导入并开始</Button>
          <Button variant="secondary" onClick={() => setCustomText('')}>
            清空内容
          </Button>
        </div>
      </Card>

      <div className="row-title mt-section">
        <Globe size={22} /> 更多方式
      </div>
      <div className="grid-3">
        <Card className="helper-card">
          <Link className="helper-icon" />
          <strong>导入网页链接</strong>
          <div className="disabled-bar">即将开放</div>
        </Card>
        <Card className="helper-card">
          <Upload className="helper-icon" />
          <strong>上传文档</strong>
          <div className="disabled-bar">即将开放</div>
        </Card>
        <Card className="helper-card">
          <Languages className="helper-icon" />
          <strong>双语辅助</strong>
          <div className="disabled-bar">即将开放</div>
        </Card>
      </div>
    </section>
  )
}
