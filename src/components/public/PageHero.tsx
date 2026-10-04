import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Crumb {
  to?: string
  label: string
}

interface PageHeroProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  /** Background photograph. A photo switches the hero to the dark style so text stays legible. */
  image?: string | null
  /** 'prestige' is the dark, gold-accented style used by World Records; everything else is light. */
  variant?: 'navy' | 'ink' | 'prestige' | 'editorial'
  crumbs?: Crumb[]
  children?: ReactNode
  className?: string
  size?: 'md' | 'lg'
}

const ease = [0.16, 1, 0.3, 1] as const

export function PageHero({ eyebrow, title, description, image, variant = 'navy', crumbs, children, className, size = 'md' }: PageHeroProps) {
  const prestige = variant === 'prestige'
  const dark = prestige || !!image

  return (
    <section className={cn('relative isolate overflow-hidden', dark ? 'bg-navy-950 text-white' : 'border-b border-line bg-paper text-ink', className)}>
      {image && <img src={image} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-30" fetchPriority="high" />}
      {dark ? (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/50 via-navy-950/30 to-navy-950/80" aria-hidden />
          {prestige && <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" aria-hidden />}
        </>
      ) : (
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(20,42,49,0.045)_1px,transparent_1px)] bg-[size:calc(100%/6)_100%] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          aria-hidden
        />
      )}

      <div className={cn('container-page', size === 'lg' ? 'pt-36 pb-20 lg:pt-44 lg:pb-28' : 'pt-32 pb-14 lg:pt-40 lg:pb-20')}>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className={cn('flex flex-wrap items-center gap-1.5 text-xs', dark ? 'text-white/50' : 'text-muted')}>
              <li>
                <Link to="/" className={dark ? 'hover:text-white' : 'hover:text-navy-900'}>
                  Home
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3" aria-hidden />
                  {c.to ? (
                    <Link to={c.to} className={dark ? 'hover:text-white' : 'hover:text-navy-900'}>
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className={cn('max-w-[16rem] truncate', dark ? 'text-white/80' : 'text-ink/80')}>
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="max-w-4xl">
          {eyebrow && <p className={cn('eyebrow mb-6', prestige ? 'eyebrow-gold text-gold-300' : dark ? 'text-white/70' : 'text-navy-700')}>{eyebrow}</p>}
          <h1 className={cn('display-xl', !dark && 'text-navy-900')}>{title}</h1>
          {description && <p className={cn('mt-6 max-w-2xl text-base leading-7 sm:text-lg', dark ? 'text-white/70' : 'text-muted')}>{description}</p>}
        </motion.div>
        {children && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease }} className="mt-10">
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
