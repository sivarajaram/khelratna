import { LinkButton } from '@/components/common/Button'
import { EmptyState } from '@/components/common/States'

export default function NotFoundAdmin({ message = 'This admin page does not exist.' }: { message?: string }) {
  return (
    <EmptyState
      title="Not found"
      description={message}
      action={
        <LinkButton to="/admin/dashboard" variant="navy" caps={false} size="sm">
          Back to dashboard
        </LinkButton>
      }
    />
  )
}
