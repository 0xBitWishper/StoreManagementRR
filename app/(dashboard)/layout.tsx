"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarProvider } from "@/components/sidebar-provider"
import { useAuth } from "@/lib/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Jika belum dimount, tampilkan loading
  if (!mounted) {
    return null
  }

  // Jika sedang loading auth, tampilkan loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Jika tidak authenticated dan bukan di halaman setup, redirect ke login
  if (!isAuthenticated && !pathname.includes("/database-setup") && !pathname.includes("/database-config")) {
    // Redirect ke login di client side
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex w-full flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
              <MobileNav />
              <div className="ml-auto flex items-center gap-4">
                <ModeToggle />
                <UserNav />
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
