import { Link } from 'react-router'

export function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="Dhyey Tandel Motors"
      className="font-display text-4xl leading-none font-bold tracking-wide uppercase"
    >
      <span aria-hidden="true">DTM</span>
    </Link>
  )
}
