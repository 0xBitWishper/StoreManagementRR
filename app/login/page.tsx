"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Package, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

const formSchema = z.object({
  email: z.string().min(1, { message: "Email atau username harus diisi" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDatabaseSetupAlert, setShowDatabaseSetupAlert] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "admin",
      password: "admin123",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setError(null)
      setShowDatabaseSetupAlert(false)

      console.log("Attempting login with:", values.email)
      const result = await login(values.email, values.password)

      if (result.success) {
        console.log("Login successful, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        console.log("Login failed:", result.message)
        setError(result.message || "Login gagal. Silakan coba lagi.")

        // Jika error berkaitan dengan database, tampilkan alert untuk setup database
        if (result.message.includes("database") || result.message.includes("500")) {
          setShowDatabaseSetupAlert(true)
        }
      }
    } catch (error) {
      console.error("Login submission error:", error)
      setError("Terjadi kesalahan saat login. Silakan coba lagi.")
      setShowDatabaseSetupAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Masukkan email dan password untuk mengakses dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showDatabaseSetupAlert && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Mungkin Belum Di-setup</AlertTitle>
              <AlertDescription>
                Sepertinya database belum di-setup atau terjadi masalah koneksi.
                <Link href="/database-setup" className="block mt-2 font-medium text-primary hover:underline">
                  Klik di sini untuk setup database
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username atau Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username atau email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            <Link href="/database-setup" className="text-primary hover:underline">
              Setup Database
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
