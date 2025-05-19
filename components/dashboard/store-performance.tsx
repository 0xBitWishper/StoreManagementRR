"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"

// Data contoh untuk performa toko
const storeData = [
  { name: "Toko Jakarta", value: 35, color: "#0ea5e9" },
  { name: "Toko Bandung", value: 25, color: "#22c55e" },
  { name: "Toko Surabaya", value: 20, color: "#f59e0b" },
  { name: "Toko Medan", value: 15, color: "#8b5cf6" },
  { name: "Toko Makassar", value: 5, color: "#ec4899" },
]

// Data contoh untuk performa marketplace
const marketplaceData = [
  { name: "Shopee", value: 40, color: "#f97316" },
  { name: "Tokopedia", value: 30, color: "#10b981" },
  { name: "Lazada", value: 15, color: "#3b82f6" },
  { name: "TikTok Shop", value: 10, color: "#000000" },
  { name: "Lainnya", value: 5, color: "#6b7280" },
]

export function StorePerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Penjualan</CardTitle>
        <CardDescription>Distribusi penjualan berdasarkan toko dan marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="store">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store">Toko</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>
          <TabsContent value="store" className="space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {storeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="marketplace" className="space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketplaceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {marketplaceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
