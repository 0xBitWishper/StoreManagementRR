import mysql from "mysql2/promise"

// Konfigurasi koneksi database
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "price_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool koneksi untuk mengelola koneksi database
let pool: mysql.Pool

// Fungsi untuk mendapatkan koneksi dari pool
export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Fungsi untuk menjalankan query
export async function query(sql: string, params: any[] = []) {
  const connection = await getConnection()
  try {
    const [results] = await connection.query(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Fungsi untuk menjalankan query dalam transaksi
export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const pool = await getConnection()
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Fungsi untuk memeriksa koneksi database
export async function testConnection() {
  try {
    const connection = await getConnection()
    const [rows] = await connection.query("SELECT 1 as test")
    return { success: true, message: "Koneksi database berhasil!" }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      success: false,
      message: `Koneksi database gagal: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
