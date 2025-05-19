import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect ke halaman dashboard
  redirect("/dashboard")

  // Ini tidak akan dijalankan karena redirect di atas
  return null
}
