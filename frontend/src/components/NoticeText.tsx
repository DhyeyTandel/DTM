import type { CardNotice } from '../lib/cardNotice'

export function NoticeText({ notice }: { notice: CardNotice }) {
  const isError = notice.kind === 'error'
  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={`mt-3 text-[0.9375rem] font-semibold ${isError ? 'text-error' : 'text-ok'}`}
    >
      {notice.message}
    </p>
  )
}
