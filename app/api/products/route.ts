import { NextResponse } from "next/server"
import { sql, transaction } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    const params = []

    if (categoryId) {
      query += ` AND p.category_id = $${params.length + 1}`
      params.push(categoryId)
    }

    if (search) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR p.sku ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    query += " ORDER BY p.created_at DESC"

    const products = await sql(query, params)

    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, sku, basePrice, categoryId, description, hasVariants, marketplacePrices } = body

    // Validasi input
    if (!name || !sku || !basePrice || !categoryId) {
      return NextResponse.json({ success: false, message: "Data produk tidak lengkap" }, { status: 400 })
    }

    // Simpan produk menggunakan transaksi
    const result = await transaction(async (client) => {
      // Insert produk
      const productResult = await client`
        INSERT INTO products (name, sku, category_id, base_price, description, has_variants)
        VALUES (${name}, ${sku}, ${categoryId}, ${basePrice}, ${description || ""}, ${hasVariants || false})
        RETURNING id
      `

      const productId = productResult[0].id

      // Insert harga marketplace
      if (marketplacePrices && Object.keys(marketplacePrices).length > 0) {
        for (const [marketplaceId, price] of Object.entries(marketplacePrices)) {
          await client`
            INSERT INTO product_prices (product_id, marketplace_id, price)
            VALUES (${productId}, ${marketplaceId}, ${price})
          `
        }
      }

      return { productId }
    })

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: { productId: result.productId },
    })
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Gagal menambahkan produk: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
