import { getConnection } from "./db"
import bcryptjs from "bcryptjs"

export async function seedDatabase() {
  const connection = await getConnection()

  try {
    // Buat tabel users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel stores
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel categories
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel costs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS costs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        type ENUM('fixed', 'percentage') DEFAULT 'fixed',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel marketplaces
    await connection.query(`
      CREATE TABLE IF NOT EXISTS marketplaces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        fee DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel products
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        category_id INT,
        base_price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `)

    // Buat tabel product_prices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        marketplace_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (marketplace_id) REFERENCES marketplaces(id) ON DELETE CASCADE
      )
    `)

    // Buat tabel orders
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        customer_address TEXT,
        marketplace_id INT,
        store_id INT,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (marketplace_id) REFERENCES marketplaces(id) ON DELETE SET NULL,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
      )
    `)

    // Buat tabel order_items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // Buat tabel followups
    await connection.query(`
      CREATE TABLE IF NOT EXISTS followups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        notes TEXT,
        followup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'contacted', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `)

    // Seed data awal untuk users (admin default)
    const [existingUsers] = await connection.query("SELECT * FROM users WHERE username = ?", ["admin"])
    if (Array.isArray(existingUsers) && (existingUsers as any[]).length === 0) {
      // Hash password dengan bcryptjs
      const hashedPassword = await bcryptjs.hash("admin123", 10)

      await connection.query(
        `
        INSERT INTO users (username, password, name, role)
        VALUES (?, ?, ?, ?)
      `,
        ["admin", hashedPassword, "Administrator", "admin"],
      )
    }

    // Seed data awal untuk stores
    const [existingStores] = await connection.query("SELECT * FROM stores LIMIT 1")
    if (Array.isArray(existingStores) && (existingStores as any[]).length === 0) {
      await connection.query(`
        INSERT INTO stores (name, address, phone)
        VALUES 
        ('Toko Utama', 'Jl. Raya Utama No. 123', '08123456789'),
        ('Toko Cabang 1', 'Jl. Raya Cabang No. 456', '08234567890')
      `)
    }

    // Seed data awal untuk categories
    const [existingCategories] = await connection.query("SELECT * FROM categories LIMIT 1")
    if (Array.isArray(existingCategories) && (existingCategories as any[]).length === 0) {
      await connection.query(`
        INSERT INTO categories (name, description)
        VALUES 
        ('Elektronik', 'Produk elektronik dan gadget'),
        ('Fashion', 'Produk pakaian dan aksesoris'),
        ('Makanan', 'Produk makanan dan minuman')
      `)
    }

    // Seed data awal untuk costs
    const [existingCosts] = await connection.query("SELECT * FROM costs LIMIT 1")
    if (Array.isArray(existingCosts) && (existingCosts as any[]).length === 0) {
      await connection.query(`
        INSERT INTO costs (name, value, type, description)
        VALUES 
        ('Packaging', 5000, 'fixed', 'Biaya packaging per produk'),
        ('Margin', 20, 'percentage', 'Margin keuntungan dalam persentase')
      `)
    }

    // Seed data awal untuk marketplaces
    const [existingMarketplaces] = await connection.query("SELECT * FROM marketplaces LIMIT 1")
    if (Array.isArray(existingMarketplaces) && (existingMarketplaces as any[]).length === 0) {
      await connection.query(`
        INSERT INTO marketplaces (name, fee, description)
        VALUES 
        ('Tokopedia', 5, 'Fee marketplace Tokopedia'),
        ('Shopee', 5, 'Fee marketplace Shopee'),
        ('Lazada', 4.5, 'Fee marketplace Lazada'),
        ('TikTok Shop', 3, 'Fee marketplace TikTok Shop'),
        ('Offline', 0, 'Penjualan offline tanpa fee')
      `)
    }

    return { success: true, message: "Database berhasil di-seed!" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return {
      success: false,
      message: `Gagal melakukan seed database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
