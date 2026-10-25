import type { ComponentProps } from 'react'

type Variant = 'primary' | 'outline'

const variantClasses: Record<Variant, string> = {
  primary:
    'border-brand bg-brand text-on-brand hover:border-brand-hover hover:bg-brand-hover disabled:border-line disabled:bg-ground disabled:text-ink',
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
      className={`min-h-11 cursor-pointer border px-4 text-[0.9375rem] font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
