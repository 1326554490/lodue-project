export default function PageHero({ eyebrow, title, children }) {
  return (
    <div className="hero">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
    </div>
  )
}
