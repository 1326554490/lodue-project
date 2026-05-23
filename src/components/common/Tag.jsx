export default function Tag({ children, tone = 'teal', active = false }) {
  return <span className={`tag ${tone} ${active ? 'active' : ''}`}>{children}</span>
}
