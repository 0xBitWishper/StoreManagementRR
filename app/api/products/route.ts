import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")

    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    const params = []

    if (categoryId) {
      sql += " AND p.category_id = ?"
      params.push(categoryId)
    }

    if (search) {
      sql += " AND (p.name LIKE ? OR p.sku LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += " ORDER BY p.created_at DESC"

    const products = await query(sql, params)

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
    const result = await transaction(async (connection) => {
      // Insert produk
      const [productResult] = await connection.query(
        `INSERT INTO products (name, sku, category_id, base_price, description, has_variants)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, sku, categoryId, basePrice, description || "", hasVariants || false],
      )

      const productId = productResult.insertId

      // Insert harga marketplace
      if (marketplacePrices && Object.keys(marketplacePrices).length > 0) {
        for (const [marketplaceId, price] of Object.entries(marketplacePrices)) {
          await connection.query(
            `INSERT INTO product_prices (product_id, marketplace_id, price)
             VALUES (?, ?, ?)`,
            [productId, marketplaceId, price],
          )
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
