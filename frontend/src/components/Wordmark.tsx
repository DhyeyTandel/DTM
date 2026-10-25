import { Link } from 'react-router'

export function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="Dhyey Tandel Motors"
      className="text-3xl leading-none font-bold tracking-wide uppercase"
    >
      <span aria-hidden="true">DTM</span>
    </Link>
  )
}
