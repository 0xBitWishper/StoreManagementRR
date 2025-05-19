"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Box, ClipboardList, Home, Menu, Package, Settings, ShoppingCart, Store, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const mobileLinks = [
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <div className="flex items-center border-b p-4">
          <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
            <Package className="h-5 w-5" />
            <span>Price Management</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-2 px-2 text-sm">
            {mobileLinks.map((section, i) => (
              <div key={i} className="mb-2">
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
                          onClick={() => setOpen(false)}
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
                    onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
