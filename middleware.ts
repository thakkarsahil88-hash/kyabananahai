import { withAuth } from 'next-auth/middleware'

export default withAuth({ pages: { signIn: '/' } })

export const config = {
  matcher: [
    '/cook/:path*',
    '/recipes/:path*',
    '/recipe/:path*',
    '/history/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
  ],
}
