import { Brain, Leaf, ScanText, SlidersHorizontal } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { bgOptions, modePresets } from '../data/modes.js'

const icons = { gentle: Leaf, focus: Brain, clear: ScanText }

export default function ModePage({ mode, settings, updateSetting, toggleSetting, chooseMode, goTo }) {
  const current = modePresets[mode]

  return (
    <section>
      <PageHero eyebrow="个性化阅读设置" title="已为你生成今日阅读模式">
        你可以直接使用系统推荐，也可以根据当前状态手动调整字号、行距、背景和辅助功能。
      </PageHero>

      <div className="split">
        <Card className="mode-card">
          <span className="tag active">推荐模式</span>
          <h2>{current.label}</h2>
          <p className="muted">{current.desc}</p>
          <div className="keyword-cloud mt24">
            {current.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="mode-choices">
            {Object.entries(modePresets).map(([key, item]) => {
              const Icon = icons[key]
              return (
                <button key={key} className={`mode-choice ${mode === key ? 'active' : ''}`} onClick={() => chooseMode(key)}>
                  <div className="mode-icon">
                    <Icon size={22} />
                  </div>
                  <div className="mode-title">{item.label}</div>
                  <div className="mode-desc">{item.desc}</div>
                </button>
              )
            })}
          </div>
          <div className="grid-2 mt24">
            <Button onClick={() => goTo('reader')}>使用推荐模式进入阅读</Button>
            <Button variant="secondary" onClick={() => goTo('reader')}>
              跳过，直接阅读
            </Button>
          </div>
        </Card>

        <Card>
          <div className="row-title compact">
            <SlidersHorizontal size={20} /> 手动微调
          </div>
          <Slider label="字号" value={`${settings.font}px`} min="15" max="23" step="1" current={settings.font} onChange={(v) => updateSetting('font', Number(v))} />
          <Slider label="行距" value={Number(settings.line).toFixed(2)} min="1.4" max="2.4" step="0.05" current={settings.line} onChange={(v) => updateSetting('line', Number(v))} />
          <Slider label="字间距" value={`${settings.letter}px`} min="0" max="2" step="0.1" current={settings.letter} onChange={(v) => updateSetting('letter', Number(v))} />

          <div className="small strong mb10">背景</div>
          <div className="bg-grid">
            {bgOptions.map((option) => (
              <button key={option.key} className={`bg-chip ${settings.bg === option.key ? 'active' : ''}`} onClick={() => updateSetting('bg', option.key)}>
                <span className="swatch" style={{ background: option.color }} />
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt24">
            {[
              ['focus', '当前段落高亮'],
              ['ruler', '阅读尺辅助'],
              ['keywords', '关键词提示'],
            ].map(([key, label]) => (
              <button className="toggle-row" key={key} onClick={() => toggleSetting(key)}>
                {label}
                <span className={`toggle ${settings[key] ? 'on' : ''}`} />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

function Slider({ label, value, min, max, step, current, onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-head">
        <span>{label}</span>
        <span className="slider-value">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={current} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
