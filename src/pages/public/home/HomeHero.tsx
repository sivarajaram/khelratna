import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, MapPin, Trophy } from 'lucide-react'
import type { Competition } from '@/types/database'
import { LinkButton } from '@/components/common/Button'
import { Media } from '@/components/common/Media'
import { CompetitionStatusBadge } from '@/components/common/Badge'
import { formatDateRange } from '@/utils/format'

const ease = [0.16, 1, 0.3, 1] as const

interface HomeHeroProps {
  image: string | null | undefined
  featured: Competition | null | undefined
}

export function HomeHero({ image, featured }: HomeHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white" aria-labelledby="hero-title">
      {/* Atmosphere: grain, light bloom, vertical rhythm lines */}
      <div className="absolute inset-0 -z-10 bg-grain" aria-hidden />
      <div className="absolute top-[-20%] left-[-10%] -z-10 size-[50rem] rounded-full bg-navy-700/50 blur-3xl" aria-hidden />
      <div className="absolute right-[-10%] bottom-[-30%] -z-10 size-[40rem] rounded-full bg-red-600/10 blur-3xl" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:calc(100%/6)_100%] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden
      />

      <div className="container-page grid items-center gap-14 pt-32 pb-28 lg:min-h-[min(100svh,58rem)] lg:grid-cols-12 lg:gap-10 lg:pt-36 lg:pb-44">
        <div className="lg:col-span-7">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="eyebrow text-white/70">
            Karate <span className="text-red-600">•</span> Championships <span className="text-red-600">•</span> Excellence
          </motion.p>

          <h1 id="hero-title" className="display-xl mt-7">
            <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease }}>
              Where discipline
            </motion.span>
            <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.22, ease }}>
              becomes{' '}
              <span className="relative inline-block text-gold-300">
                achievement
                <motion.span
                  className="absolute -bottom-1 left-0 h-[0.08em] w-full origin-left bg-red-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.8, ease }}
                  aria-hidden
                />
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="mt-8 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8"
          >
            Khelratna celebrates Karate excellence through competitions, championships, recognition, achievements and extraordinary sporting accomplishments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <LinkButton to="/competitions" size="lg" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Explore competitions
            </LinkButton>
            <LinkButton to="/awards" size="lg" variant="outline-light">
              Our achievements
            </LinkButton>
            <Link
              to="/world-records"
              className="group ml-1 inline-flex items-center gap-2 px-2 py-3 text-xs font-semibold tracking-[0.14em] text-gold-300 uppercase hover:text-gold-100"
            >
              <Trophy className="size-4" aria-hidden />
              World records
              <ArrowRight className="size-3.5 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative lg:col-span-5"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
        >
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2rem] border border-gold-500/25" aria-hidden />
            <Media
              src={image}
              alt="Karate athlete competing at a Khelratna championship"
              aspect="aspect-[4/5]"
              className="rounded-[1.6rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]"
              priority
              placeholderLabel="Hero competition photo"
              sizes="(min-width: 1024px) 40vw, 90vw"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-gradient-to-t from-navy-950/70 via-transparent to-transparent"
              aria-hidden
            />

            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease }}
                className="absolute right-4 -bottom-8 left-4 sm:-left-10 sm:right-10"
              >
                <Link
                  to={`/competitions/${featured.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-navy-900/85 p-5 shadow-2xl backdrop-blur-xl transition hover:border-gold-500/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.625rem] font-semibold tracking-[0.2em] text-gold-300 uppercase">
                      {featured.status === 'completed' ? 'Featured championship' : 'Next championship'}
                    </span>
                    <CompetitionStatusBadge status={featured.status} onDark />
                  </div>
                  <p className="mt-2.5 font-display text-lg leading-snug font-semibold">{featured.name}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {formatDateRange(featured.start_date, featured.end_date)}
                    </span>
                    {featured.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden />
                        {featured.location}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
