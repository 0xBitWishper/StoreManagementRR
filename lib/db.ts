import { neon } from "@neondatabase/serverless"

// Konfigurasi koneksi database
const DATABASE_URL = process.env.DATABASE_URL || ""

// Log untuk debugging
console.log("Database URL length:", DATABASE_URL.length)
console.log("Database URL prefix:", DATABASE_URL.substring(0, 15) + "...")

// Buat instance SQL client dengan opsi yang lebih toleran terhadap error
export const sql = neon(DATABASE_URL, {
  fullResults: true,
  connectionTimeoutMillis: 10000, // 10 detik timeout
  max: 5, // maksimum 5 koneksi
})

// Fungsi untuk menjalankan query
export async function query(queryText: string, params: any[] = []) {
  try {
    console.log("Executing query:", queryText.substring(0, 100) + "...")
    const result = await sql(queryText, params)
    console.log("Query executed successfully")
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Fungsi untuk menjalankan query dalam transaksi
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  try {
    console.log("Starting transaction")
    await sql`BEGIN`
    const result = await callback(sql)
    await sql`COMMIT`
    console.log("Transaction committed successfully")
    return result
  } catch (error) {
    console.log("Transaction error, rolling back")
    try {
      await sql`ROLLBACK`
      console.log("Rollback successful")
    } catch (rollbackError) {
      console.error("Error during transaction rollback:", rollbackError)
    }
    console.error("Transaction error:", error)
    throw error
  }
}

// Fungsi untuk memeriksa koneksi database
export async function testConnection() {
  try {
    console.log("Testing database connection")
    const result = await sql`SELECT 1 as test`
    console.log("Database connection successful")
    return {
      success: true,
      message: "Koneksi ke PostgreSQL Neon berhasil!",
      details: {
        database: "Neon PostgreSQL",
      },
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      success: false,
      message: `Koneksi database gagal: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    }
  }
}
