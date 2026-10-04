import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { AlertTriangle } from 'lucide-react'

/** Last-resort error screen (failed chunk load, render crash). Never shows technical details. */
export default function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (!notFound) console.error(error)

  return (
    <main className="grid min-h-dvh place-items-center bg-navy-950 px-6 text-center text-white">
      <div className="max-w-md">
        <AlertTriangle className="mx-auto size-8 text-gold-500" aria-hidden />
        <h1 className="mt-6 font-display text-3xl font-bold uppercase">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
        <p className="mt-4 text-white/65">
          {notFound ? 'The page you are looking for does not exist.' : 'Please refresh the page. If the problem continues, try again in a few minutes.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-accent-600 px-5 py-3 text-xs font-semibold tracking-[0.12em] uppercase hover:bg-accent-700"
          >
            Refresh
          </button>
          <Link
            to="/"
            className="rounded-full border border-white/30 px-5 py-3 text-xs font-semibold tracking-[0.12em] uppercase hover:bg-white hover:text-navy-900"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
