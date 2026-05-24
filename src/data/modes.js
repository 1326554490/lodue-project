export const modePresets = {
  gentle: {
    label: '舒缓阅读模式',
    desc: '适合容易疲劳、希望降低压力的慢读状态，段落高亮更柔和，阅读尺存在感更低。',
    icon: 'Leaf',
    font: 18,
    line: 1.95,
    letter: 0.5,
    focus: true,
    ruler: false,
    keywords: true,
    tags: ['大字舒展', '宽行距', '低刺激', '柔和高亮'],
  },
  focus: {
    label: '专注阅读模式',
    desc: '适合容易走神、需要把注意力稳定在当前段落的阅读状态。',
    icon: 'Brain',
    font: 17,
    line: 1.85,
    letter: 0.2,
    focus: true,
    ruler: true,
    keywords: true,
    tags: ['当前段聚焦', '弱化干扰', '阅读尺', '节奏提醒'],
  },
  clear: {
    label: '清晰阅读模式',
    desc: '适合容易跳行、串行，或需要更清楚文字间隔和段落边界的阅读状态。',
    icon: 'ScanText',
    font: 18,
    line: 2.05,
    letter: 1.2,
    focus: true,
    ruler: true,
    keywords: false,
    tags: ['字距增加', '段落分块', '清晰对比', '阅读定位'],
  },
}

export const themeOptions = [
  { key: 'light', label: '浅色', color: '#f3f8f8' },
  { key: 'dark', label: '深色', color: '#29424A' },
]

export const surfaceOptions = [
  { key: 'mist', label: '清爽', color: '#f3f8f8', bg: 'mist' },
  { key: 'paper', label: '纸张', color: '#fbf6ed', bg: 'cream' },
  { key: 'plain', label: '简洁', color: '#ffffff', bg: 'white' },
]

export const bgOptions = [
  { key: 'mist', label: '清爽浅色', color: '#f3f8f8' },
  { key: 'cream', label: '纸张质感', color: '#fbf6ed' },
  { key: 'white', label: '简洁白色', color: '#ffffff' },
  { key: 'dark', label: '深色模式', color: '#29424A' },
]
