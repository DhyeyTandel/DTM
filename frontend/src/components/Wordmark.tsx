import { Link } from 'react-router'
import { ROUTES } from '../lib/routes'

export function Wordmark() {
  return (
    <Link
      to={ROUTES.home}
      aria-label="Dhyey Tandel Motors"
      className="text-3xl leading-none font-bold tracking-wide uppercase"
    >
      <span aria-hidden="true">DTM</span>
    </Link>
  )
}
