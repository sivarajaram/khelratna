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
  /** Background photograph; falls back to the branded gradient. */
  image?: string | null
  /** Visual register of the page (see PRD §55). */
  variant?: 'navy' | 'ink' | 'prestige' | 'editorial'
  crumbs?: Crumb[]
  children?: ReactNode
  className?: string
  size?: 'md' | 'lg'
}

const backgrounds = {
  navy: 'bg-navy-900',
  ink: 'bg-ink',
  prestige: 'bg-navy-950',
  editorial: 'bg-navy-900',
}

export function PageHero({ eyebrow, title, description, image, variant = 'navy', crumbs, children, className, size = 'md' }: PageHeroProps) {
  const gold = variant === 'prestige'
  return (
    <section className={cn('relative isolate overflow-hidden text-white', backgrounds[variant], className)}>
      {image && <img src={image} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-35" fetchPriority="high" />}
      <div className="absolute inset-0 -z-10 bg-grain" aria-hidden />
      {/* Brand geometry: soft light, diagonal rule and a quiet accent */}
      <div
        className={cn(
          'absolute -top-40 -right-40 -z-10 size-[36rem] rounded-full blur-3xl',
          gold ? 'bg-gold-500/15' : variant === 'ink' ? 'bg-red-600/10' : 'bg-navy-600/40',
        )}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/40 via-transparent to-navy-950/60" aria-hidden />
      <div
        className={cn('absolute bottom-0 left-0 h-px w-full -z-10', gold ? 'bg-gradient-to-r from-transparent via-gold-500/60 to-transparent' : 'bg-white/10')}
        aria-hidden
      />

      <div className={cn('container-page', size === 'lg' ? 'pt-40 pb-24 lg:pt-48 lg:pb-32' : 'pt-36 pb-16 lg:pt-44 lg:pb-24')}>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3" aria-hidden />
                  {c.to ? (
                    <Link to={c.to} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="max-w-[16rem] truncate text-white/80">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          {eyebrow && <p className={cn('eyebrow mb-6', gold ? 'eyebrow-gold text-gold-300' : 'text-white/70')}>{eyebrow}</p>}
          <h1 className="display-xl">{title}</h1>
          {description && <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">{description}</p>}
        </motion.div>
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
