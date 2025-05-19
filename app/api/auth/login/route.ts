import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    // Log untuk debugging
    console.log("Login request received")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    // Validasi input
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ success: false, message: "Email dan password diperlukan" }, { status: 400 })
    }

    try {
      // Cari user berdasarkan email atau username dengan query yang lebih sederhana
      console.log("Querying database for user")

      // Gunakan query yang lebih sederhana dan pastikan kolom ada di tabel
      const users = await sql`
        SELECT id, username, name, email, password, role 
        FROM users 
        WHERE username = ${email} OR email = ${email}
      `

      console.log("Query result:", JSON.stringify(users).substring(0, 100))

      if (!users || users.length === 0) {
        console.log("User not found")
        return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 })
      }

      const user = users[0]
      console.log("User found:", user.username)

      // Verifikasi password dengan try-catch
      try {
        console.log("Verifying password")
        const passwordMatch = await bcryptjs.compare(password, user.password)

        if (!passwordMatch) {
          console.log("Password doesn't match")
          return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 })
        }

        console.log("Password verified successfully")
      } catch (passwordError) {
        console.error("Password verification error:", passwordError)
        return NextResponse.json(
          {
            success: false,
            message: "Error verifying password",
            error: passwordError instanceof Error ? passwordError.message : String(passwordError),
          },
          { status: 500 },
        )
      }

      // Buat token JWT
      console.log("Creating JWT token")
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key"
      console.log("JWT secret length:", jwtSecret.length)

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name || user.username,
          email: user.email || user.username,
          role: user.role || "user",
        },
        jwtSecret,
        { expiresIn: "1d" },
      )

      console.log("JWT token created successfully")

      // Hapus password dari respons
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        success: true,
        message: "Login berhasil",
        token,
        user: userWithoutPassword,
      })
    } catch (dbError) {
      console.error("Database error during login:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Terjadi kesalahan saat mengakses database",
          error: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses permintaan login",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
