import { Button } from './Button'

export function LoadingState({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <p className="text-xl font-semibold">{label}…</p>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <p role="alert" className="text-xl font-semibold text-error">
        {message}
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <p className="text-2xl font-semibold">{title}</p>
      <p className="mt-2 text-ink-muted">{text}</p>
    </div>
  )
}
