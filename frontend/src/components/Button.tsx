import type { ComponentProps } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variant = 'primary' | 'dark' | 'outline'

const variantClasses: Record<Variant, string> = {
  primary:
    'border-brand bg-brand text-on-brand hover:border-brand-hover hover:bg-brand-hover disabled:border-line disabled:bg-ground disabled:text-ink',
  dark: 'border-band bg-band text-on-band hover:border-ink-muted hover:bg-ink-muted disabled:border-line disabled:bg-ground disabled:text-ink-muted',
  outline:
    'border-ink text-ink hover:bg-ink hover:text-canvas disabled:border-line disabled:text-ink-muted',
}

function buttonClasses(variant: Variant, className: string): string {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center border px-3 text-[0.9375rem] font-semibold tracking-[0.04em] whitespace-nowrap transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button type="button" className={buttonClasses(variant, className)} {...props} />
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
}

export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />
}
