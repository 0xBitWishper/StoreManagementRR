import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-db"

export async function POST() {
  try {
    const result = await seedDatabase()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
