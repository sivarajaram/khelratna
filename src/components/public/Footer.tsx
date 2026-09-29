import { Link } from 'react-router'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { SocialIcon, socialLabels } from '@/components/common/SocialIcon'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const whatsappHref = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`

const columns = [
  {
    title: 'About',
    links: [
      { to: '/about', label: 'About Khelratna' },
      { to: '/about#mission', label: 'Mission' },
      { to: '/about#vision', label: 'Vision' },
      { to: '/certificates', label: 'Verify a Certificate' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { to: '/competitions', label: 'Competitions' },
      { to: '/champions', label: 'Champions' },
      { to: '/world-records', label: 'World Records' },
      { to: '/awards', label: 'Awards' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/news', label: 'News' },
    ],
  },
]

export function Footer() {
  const { settings, social } = useSiteSettings()
  const year = new Date().getFullYear()
  const org = settings?.org_name ?? 'Khelratna'

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div className="gold-rule" />
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo logoUrl={settings?.logo_url} name={org} tone="light" />
          {settings?.footer_text && <p className="mt-6 max-w-sm text-sm leading-6 text-white/60">{settings.footer_text}</p>}
          {social.length > 0 && (
            <ul className="mt-8 flex gap-2.5" aria-label="Social media">
              {social.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-gold-500 hover:bg-gold-500 hover:text-navy-950"
                    aria-label={`${org} on ${socialLabels[s.platform]}`}
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">{col.title}</h2>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/65 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">Contact</h2>
          <ul className="mt-5 space-y-4 text-sm text-white/70">
            {settings?.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            )}
            {settings?.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings?.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.whatsapp && (
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                <a href={whatsappHref(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp {settings.whatsapp}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {org}. All Rights Reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export { whatsappHref }
