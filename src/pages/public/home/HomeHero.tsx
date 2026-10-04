import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy } from 'lucide-react'
import { LinkButton } from '@/components/common/Button'
import { Media } from '@/components/common/Media'

const ease = [0.16, 1, 0.3, 1] as const

interface HomeHeroProps {
  image: string | null | undefined
}

export function HomeHero({ image }: HomeHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-paper text-ink" aria-labelledby="hero-title">
      {/* Quiet structure: faint column rules fading out toward the bottom */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(20,42,49,0.05)_1px,transparent_1px)] bg-[size:calc(100%/6)_100%] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
        aria-hidden
      />

      <div className="container-page grid items-center gap-14 pt-32 pb-24 lg:min-h-[min(100svh,54rem)] lg:grid-cols-12 lg:gap-12 lg:pt-36 lg:pb-36">
        <div className="lg:col-span-7">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="eyebrow text-navy-700">
            Karate <span className="text-gold-500">•</span> Championships <span className="text-gold-500">•</span> Excellence
          </motion.p>

          <h1 id="hero-title" className="display-xl mt-7 text-navy-900">
            <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease }}>
              Where discipline
            </motion.span>
            <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.22, ease }}>
              becomes{' '}
              <span className="relative inline-block text-navy-600">
                achievement
                <motion.span
                  className="absolute -bottom-1 left-0 h-[0.06em] w-full origin-left bg-gold-500"
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
            className="mt-8 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8"
          >
            Arjuna Book of World Record celebrates Karate excellence through competitions, championships, recognition, achievements and extraordinary sporting
            accomplishments.
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
            <LinkButton to="/awards" size="lg" variant="outline">
              Our achievements
            </LinkButton>
            <Link
              to="/world-records"
              className="group ml-1 inline-flex items-center gap-2 px-2 py-3 text-xs font-semibold tracking-[0.14em] text-gold-700 uppercase hover:text-navy-900"
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
            <div className="absolute -inset-3 rounded-[2rem] border border-line" aria-hidden />
            <Media
              src={image}
              alt="Karate athlete competing at an Arjuna Book of World Record championship"
              aspect="aspect-[4/5]"
              className="rounded-[1.6rem] shadow-[0_30px_60px_-30px_rgba(20,42,49,0.45)]"
              priority
              placeholderLabel="Hero competition photo"
              sizes="(min-width: 1024px) 40vw, 90vw"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-gradient-to-t from-navy-950/25 via-transparent to-transparent"
              aria-hidden
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
