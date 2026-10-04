import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'navy' | 'outline' | 'outline-light' | 'light' | 'ghost' | 'gold' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800',
  navy: 'bg-navy-900 text-white hover:bg-navy-700',
  outline: 'border border-navy-900/20 text-navy-900 hover:border-navy-900 hover:bg-navy-900 hover:text-white',
  'outline-light': 'border border-white/30 text-white hover:border-white hover:bg-white hover:text-navy-900',
  light: 'bg-white text-navy-900 hover:bg-gold-50',
  ghost: 'text-navy-900 hover:bg-navy-50',
  gold: 'bg-gold-300 text-navy-950 hover:bg-gold-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-11 px-5 text-[0.8125rem] gap-2',
  lg: 'h-13 px-7 text-sm gap-2.5',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Public-site buttons use uppercase tracking; admin buttons pass false. */
  caps?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  className?: string
  children?: ReactNode
}

function classes({ variant = 'primary', size = 'md', caps = true, className }: CommonProps) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap transition-all duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
    caps && 'tracking-[0.12em] uppercase',
    !caps && 'rounded-lg',
    variants[variant],
    sizes[size],
    className,
  )
}

type ButtonProps = CommonProps & ComponentProps<'button'> & { loading?: boolean }

export function Button({ variant, size, caps, icon, iconRight, className, children, loading, disabled, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, size, caps, className })} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  )
}

type LinkButtonProps = CommonProps & { to: string; external?: boolean } & Omit<ComponentProps<'a'>, 'href'>

export function LinkButton({ variant, size, caps, icon, iconRight, className, children, to, external, ...rest }: LinkButtonProps) {
  const cls = classes({ variant, size, caps, className })
  if (external || /^(https?:|mailto:|tel:)/.test(to)) {
    return (
      <a href={to} className={cls} target={to.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...rest}>
        {icon}
        {children}
        {iconRight}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}
