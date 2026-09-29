import { ArrowLeft } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { LinkButton } from '@/components/common/Button'
import { PageHero } from '@/components/public/PageHero'

export default function NotFoundPage({ title = 'Page not found' }: { title?: string }) {
  return (
    <>
      <Seo title={title} noindex />
      <PageHero eyebrow="404" title={title} description="The page you are looking for may have moved, or is no longer published." size="lg">
        <div className="flex flex-wrap gap-3">
          <LinkButton to="/" icon={<ArrowLeft className="size-4" aria-hidden />}>
            Back to home
          </LinkButton>
          <LinkButton to="/competitions" variant="outline-light">
            Explore competitions
          </LinkButton>
        </div>
      </PageHero>
    </>
  )
}
