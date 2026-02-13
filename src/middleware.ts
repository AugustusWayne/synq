import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protected and dashboard routes (auth not enforced in middleware)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/protected')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/protected/:path*', '/dashboard/:path*'],
}

