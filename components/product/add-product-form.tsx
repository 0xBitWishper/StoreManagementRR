"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

// Schema untuk validasi form
const productSchema = z.object({
  name: z.string().min(3, { message: "Nama produk minimal 3 karakter" }),
  sku: z.string().min(2, { message: "SKU minimal 2 karakter" }),
  basePrice: z.coerce.number().min(1, { message: "Harga dasar harus diisi" }),
  categoryId: z.string().min(1, { message: "Kategori harus dipilih" }),
  description: z.string().optional(),
  hasVariants: z.boolean().default(false),
})

type ProductFormValues = z.infer<typeof productSchema>

// Data dummy untuk kategori
const categories = [
  { id: "1", name: "Elektronik" },
  { id: "2", name: "Fashion" },
  { id: "3", name: "Makanan" },
]

// Data dummy untuk marketplace
const marketplaces = [
  { id: "1", name: "Shopee", fee: 5 },
  { id: "2", name: "Tokopedia", fee: 4.5 },
  { id: "3", name: "Lazada", fee: 4 },
  { id: "4", name: "TikTok Shop", fee: 3 },
]

export function AddProductForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [marketplacePrices, setMarketplacePrices] = useState<Record<string, number>>({})

  // Inisialisasi form dengan default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      basePrice: 0,
      categoryId: "",
      description: "",
      hasVariants: false,
    },
  })

  // Fungsi untuk menghitung harga marketplace
  const calculateMarketplacePrice = (basePrice: number, marketplaceFee: number) => {
    const margin = 20 // Margin 20%
    const packaging = 5000 // Biaya packaging

    // Rumus: (Harga Dasar + Packaging) * (1 + Margin/100) / (1 - Fee/100)
    const price = ((basePrice + packaging) * (1 + margin / 100)) / (1 - marketplaceFee / 100)
    return Math.ceil(price / 1000) * 1000 // Bulatkan ke atas ke ribuan terdekat
  }

  // Update harga marketplace saat harga dasar berubah
  const updateMarketplacePrices = (basePrice: number) => {
    const prices: Record<string, number> = {}

    marketplaces.forEach((marketplace) => {
      prices[marketplace.id] = calculateMarketplacePrice(basePrice, marketplace.fee)
    })

    setMarketplacePrices(prices)
  }

  // Handler saat form disubmit
  async function onSubmit(data: ProductFormValues) {
    try {
      setIsSubmitting(true)

      // Simpan produk ke database
      const result = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          marketplacePrices,
        }),
      })

      const response = await result.json()

      if (response.success) {
        toast({
          title: "Produk berhasil ditambahkan",
          description: `Produk ${data.name} telah berhasil disimpan.`,
        })

        // Reset form
        form.reset()
        setMarketplacePrices({})
      } else {
        throw new Error(response.message || "Gagal menyimpan produk")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        variant: "destructive",
        title: "Gagal menambahkan produk",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan produk",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tambah Produk Baru</h3>
        <p className="text-sm text-muted-foreground">
          Isi informasi produk dan hitung harga jual di berbagai marketplace.
        </p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Informasi Produk</TabsTrigger>
          <TabsTrigger value="pricing">Harga Marketplace</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama produk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan SKU produk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Dasar (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Masukkan harga dasar"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            updateMarketplacePrices(Number(e.target.value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan deskripsi produk" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasVariants"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Produk memiliki varian</FormLabel>
                      <FormDescription>Centang jika produk memiliki varian seperti ukuran atau warna.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {marketplaces.map((marketplace) => (
                  <Card key={marketplace.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{marketplace.name}</h4>
                        <span className="text-xs text-muted-foreground">Fee: {marketplace.fee}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm font-medium">Harga Jual</label>
                            <Input
                              type="number"
                              value={marketplacePrices[marketplace.id] || 0}
                              onChange={(e) => {
                                const newPrices = { ...marketplacePrices }
                                newPrices[marketplace.id] = Number(e.target.value)
                                setMarketplacePrices(newPrices)
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Harga Coret</label>
                            <Input
                              type="number"
                              value={Math.round((marketplacePrices[marketplace.id] || 0) * 1.2)}
                              readOnly
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Admin Marketplace</label>
                          <div className="text-sm">
                            Rp{" "}
                            {Math.round(
                              ((marketplacePrices[marketplace.id] || 0) * marketplace.fee) / 100,
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
