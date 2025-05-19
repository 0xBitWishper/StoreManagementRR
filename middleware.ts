import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Definisikan path yang tidak memerlukan autentikasi
  const isPublicPath =
    path === "/login" || path === "/register" || path === "/database-setup" || path.startsWith("/api/")

  // Dapatkan token dari cookies
  const token = request.cookies.get("auth-token")?.value || ""

  // Jika user mengakses halaman publik dan sudah login, redirect ke dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Jika user mengakses halaman yang memerlukan autentikasi dan belum login, redirect ke login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Konfigurasi path mana yang akan diproses oleh middleware
export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * 1. /api/auth (untuk endpoint autentikasi)
     * 2. /api/db-test dan /api/seed (untuk setup database)
     * 3. /_next (file internal Next.js)
     * 4. /_vercel (file internal Vercel)
     * 5. /favicon.ico, /logo.png, dll (file statis)
     */
    "/((?!api/auth|api/db-test|api/seed|_next|_vercel|.*\\..*|api/.*|favicon.ico).*)",
  ],
}
