import { useId, useState, type ReactNode } from 'react'

interface FilterSectionProps {
  title: string
  children: ReactNode
}

export function FilterSection({ title, children }: FilterSectionProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen(!open)
        }}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between text-left text-[1.0625rem] font-semibold"
      >
        {title}
        <span aria-hidden="true" className="text-2xl leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      <div id={panelId} hidden={!open} className="pb-4">
        {children}
      </div>
    </div>
  )
}
