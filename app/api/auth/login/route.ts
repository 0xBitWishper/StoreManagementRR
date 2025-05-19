import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validasi input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email dan password diperlukan" }, { status: 400 })
    }

    // Cari user berdasarkan email
    const users = await query("SELECT * FROM users WHERE email = ?", [email])
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null

    if (!user) {
      return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 })
    }

    // Verifikasi password
    const passwordMatch = await bcryptjs.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 })
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" },
    )

    // Hapus password dari respons
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
