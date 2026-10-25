import type { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-hover disabled:border-line disabled:bg-raised disabled:text-ink',
  secondary: 'border-line text-ink hover:bg-raised disabled:text-ink-muted',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-11 cursor-pointer rounded-control border border-transparent px-5 font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
