import { sql } from "./db"
import bcryptjs from "bcryptjs"

export async function seedDatabase() {
  try {
    console.log("Starting database seeding")

    // Buat tabel users
    console.log("Creating users table")
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(10) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("Users table created successfully")

    // Buat tabel stores
    console.log("Creating stores table")
    await sql`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel categories
    console.log("Creating categories table")
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel costs
    console.log("Creating costs table")
    await sql`
      CREATE TABLE IF NOT EXISTS costs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        type VARCHAR(10) DEFAULT 'fixed',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel marketplaces
    console.log("Creating marketplaces table")
    await sql`
      CREATE TABLE IF NOT EXISTS marketplaces (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        fee DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel products
    console.log("Creating products table")
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        base_price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        has_variants BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel product_prices
    console.log("Creating product_prices table")
    await sql`
      CREATE TABLE IF NOT EXISTS product_prices (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        marketplace_id INTEGER NOT NULL REFERENCES marketplaces(id) ON DELETE CASCADE,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel orders
    console.log("Creating orders table")
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        customer_address TEXT,
        marketplace_id INTEGER REFERENCES marketplaces(id) ON DELETE SET NULL,
        store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel order_items
    console.log("Creating order_items table")
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Buat tabel followups
    console.log("Creating followups table")
    await sql`
      CREATE TABLE IF NOT EXISTS followups (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        notes TEXT,
        followup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed data awal untuk users (admin default)
    console.log("Checking for existing admin user")
    const existingUsers = await sql`SELECT * FROM users WHERE username = 'admin'`

    if (existingUsers.length === 0) {
      console.log("Creating admin user")
      try {
        // Hash password dengan bcryptjs
        const hashedPassword = await bcryptjs.hash("admin123", 10)
        console.log("Password hashed successfully")

        await sql`
          INSERT INTO users (username, password, name, email, role)
          VALUES ('admin', ${hashedPassword}, 'Administrator', 'admin@example.com', 'admin')
        `
        console.log("Admin user created successfully")
      } catch (userError) {
        console.error("Error creating admin user:", userError)
        throw userError
      }
    } else {
      console.log("Admin user already exists")
    }

    // Seed data awal untuk stores
    console.log("Checking for existing stores")
    const existingStores = await sql`SELECT * FROM stores LIMIT 1`
    if (existingStores.length === 0) {
      console.log("Creating stores")
      await sql`
        INSERT INTO stores (name, address, phone)
        VALUES 
        ('Toko Utama', 'Jl. Raya Utama No. 123', '08123456789'),
        ('Toko Cabang 1', 'Jl. Raya Cabang No. 456', '08234567890')
      `
      console.log("Stores created successfully")
    }

    // Seed data awal untuk categories
    console.log("Checking for existing categories")
    const existingCategories = await sql`SELECT * FROM categories LIMIT 1`
    if (existingCategories.length === 0) {
      console.log("Creating categories")
      await sql`
        INSERT INTO categories (name, description)
        VALUES 
        ('Elektronik', 'Produk elektronik dan gadget'),
        ('Fashion', 'Produk pakaian dan aksesoris'),
        ('Makanan', 'Produk makanan dan minuman')
      `
      console.log("Categories created successfully")
    }

    // Seed data awal untuk costs
    console.log("Checking for existing costs")
    const existingCosts = await sql`SELECT * FROM costs LIMIT 1`
    if (existingCosts.length === 0) {
      console.log("Creating costs")
      await sql`
        INSERT INTO costs (name, value, type, description)
        VALUES 
        ('Packaging', 5000, 'fixed', 'Biaya packaging per produk'),
        ('Margin', 20, 'percentage', 'Margin keuntungan dalam persentase')
      `
      console.log("Costs created successfully")
    }

    // Seed data awal untuk marketplaces
    console.log("Checking for existing marketplaces")
    const existingMarketplaces = await sql`SELECT * FROM marketplaces LIMIT 1`
    if (existingMarketplaces.length === 0) {
      console.log("Creating marketplaces")
      await sql`
        INSERT INTO marketplaces (name, fee, description)
        VALUES 
        ('Tokopedia', 5, 'Fee marketplace Tokopedia'),
        ('Shopee', 5, 'Fee marketplace Shopee'),
        ('Lazada', 4.5, 'Fee marketplace Lazada'),
        ('TikTok Shop', 3, 'Fee marketplace TikTok Shop'),
        ('Offline', 0, 'Penjualan offline tanpa fee')
      `
      console.log("Marketplaces created successfully")
    }

    console.log("Database seeding completed successfully")
    return { success: true, message: "Database berhasil di-seed!" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return {
      success: false,
      message: `Gagal melakukan seed database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
