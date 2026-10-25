import { Link } from 'react-router'

export function Wordmark() {
  return (
    <Link to="/" aria-label="Dhyey Tandel Motors" className="text-title font-bold tracking-tight">
      <span className="sm:hidden" aria-hidden="true">
        DTM
      </span>
      <span className="hidden sm:inline" aria-hidden="true">
        Dhyey Tandel Motors
      </span>
    </Link>
  )
}
