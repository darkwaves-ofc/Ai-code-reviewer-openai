import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Check if the user is authenticated
  if (!token) {
    // If the user is not authenticated and trying to access a protected route
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

