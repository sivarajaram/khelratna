import type { ReactNode } from 'react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'

/** Shared shell for legal pages. The text itself must be supplied/approved by Khelratna. */
export function LegalPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <>
      <Seo title={title} description={description} />
      <PageHero eyebrow="Legal" title={title} crumbs={[{ label: title }]} />
      <section className="py-16 lg:py-24">
        <div className="container-page max-w-3xl">
          <p className="mb-10 rounded-xl bg-gold-50 p-4 text-sm text-gold-700 ring-1 ring-gold-500/30">
            Placeholder text — this page must be replaced with a policy reviewed and approved by Khelratna.
          </p>
          <div className="prose-kr">{children}</div>
        </div>
      </section>
    </>
  )
}
