"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Box, ClipboardList, Home, Package, Settings, ShoppingCart, Store, Tag } from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Produk",
    icon: Package,
    children: [
      {
        title: "Daftar Produk",
        href: "/produk/list",
      },
      {
        title: "Pembuatan Pricelist",
        href: "/produk/pricelist",
      },
      {
        title: "Laporan Produk",
        href: "/produk/laporan",
      },
    ],
  },
  {
    title: "Pesanan",
    icon: ShoppingCart,
    children: [
      {
        title: "Daftar Pesanan",
        href: "/order/list",
      },
      {
        title: "Followup CRM",
        href: "/order/followup",
      },
      {
        title: "Laporan Penjualan",
        href: "/order/laporan",
      },
    ],
  },
  {
    title: "Master Data",
    icon: Settings,
    children: [
      {
        title: "Toko",
        href: "/master/toko",
        icon: Store,
      },
      {
        title: "Kategori",
        href: "/master/kategori",
        icon: Tag,
      },
      {
        title: "Marketplace",
        href: "/master/marketplace",
        icon: ShoppingCart,
      },
      {
        title: "Biaya",
        href: "/master/biaya",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Database Setup",
    href: "/database-setup",
    icon: Box,
  },
  {
    title: "Panduan Instalasi",
    href: "/installation-guide",
    icon: ClipboardList,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Price Management</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm">
          {sidebarLinks.map((section, i) => (
            <div key={i} className="mb-4">
              {section.children ? (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
                    {section.icon && <section.icon className="h-4 w-4" />}
                    <span>{section.title}</span>
                  </div>
                  <div className="mt-1 grid gap-1 pl-6">
                    {section.children.map((child, j) => (
                      <Link
                        key={j}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
                          pathname === child.href && "bg-accent text-accent-foreground",
                        )}
                      >
                        {child.icon && <child.icon className="h-4 w-4" />}
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
                    pathname === section.href && "bg-accent text-accent-foreground",
                  )}
                >
                  {section.icon && <section.icon className="h-4 w-4" />}
                  <span>{section.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
