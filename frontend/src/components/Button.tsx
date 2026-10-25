import type { ComponentProps } from 'react'

type Variant = 'primary' | 'dark' | 'outline'

const variantClasses: Record<Variant, string> = {
  primary:
    'border-brand bg-brand text-on-brand hover:border-brand-hover hover:bg-brand-hover disabled:border-line disabled:bg-ground disabled:text-ink',
  dark: 'border-band bg-band text-on-band hover:border-ink-muted hover:bg-ink-muted disabled:border-line disabled:bg-ground disabled:text-ink-muted',
  outline:
    'border-ink text-ink hover:bg-ink hover:text-canvas disabled:border-line disabled:text-ink-muted',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-11 cursor-pointer border px-3 text-[0.9375rem] whitespace-nowrap font-semibold tracking-[0.04em] transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
