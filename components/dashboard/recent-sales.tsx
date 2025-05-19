import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Data contoh untuk penjualan terbaru
const recentSales = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "Rp 1.999.000",
    marketplace: "Shopee",
    date: "2 hari yang lalu",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "Rp 1.499.000",
    marketplace: "Tokopedia",
    date: "2 hari yang lalu",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "Rp 2.499.000",
    marketplace: "Lazada",
    date: "3 hari yang lalu",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "Rp 499.000",
    marketplace: "Shopee",
    date: "4 hari yang lalu",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "Rp 899.000",
    marketplace: "Tokopedia",
    date: "5 hari yang lalu",
  },
]

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Penjualan Terbaru</CardTitle>
        <CardDescription>Anda memiliki {recentSales.length} penjualan bulan ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentSales.map((sale, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {sale.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.name}</p>
                <p className="text-sm text-muted-foreground">{sale.email}</p>
                <p className="text-xs text-muted-foreground">
                  {sale.marketplace} • {sale.date}
                </p>
              </div>
              <div className="ml-auto font-medium">{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
