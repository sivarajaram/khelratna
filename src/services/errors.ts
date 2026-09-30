/**
 * Normalised error: `message` is always safe to show to a visitor or admin.
 * The raw database/network error is kept in `cause` for the console only.
 */
export class AppError extends Error {
  readonly code?: string

  constructor(message: string, code?: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'AppError'
    this.code = code
  }

  static from(err: unknown): AppError {
    if (err instanceof AppError) return err
    const e = err as { code?: string; message?: string; status?: number } | undefined
    const code = e?.code
    console.error('[arjunabookofworldrecord]', err)

    if (code === '23505') return new AppError('An entry with the same unique value (such as the slug or number) already exists.', code, err)
    if (code === '23503') return new AppError('This item is linked to other content and cannot be changed that way.', code, err)
    if (code === '23514') return new AppError('Some values are not allowed. Please check the form and try again.', code, err)
    if (code === '42501' || e?.status === 401 || e?.status === 403)
      return new AppError('You do not have permission to do that. Please sign in again.', code, err)
    if (code === 'PGRST116') return new AppError('The requested item could not be found.', code, err)
    if (err instanceof TypeError || /fetch|network/i.test(e?.message ?? ''))
      return new AppError('Network problem. Please check your connection and try again.', 'network', err)
    return new AppError('Something went wrong. Please try again in a moment.', code, err)
  }
}

export function errorMessage(err: unknown): string {
  return err instanceof AppError ? err.message : AppError.from(err).message
}
