"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Server } from "lucide-react"

export default function DatabaseSetupPage() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSeedingDatabase, setIsSeedingDatabase] = useState(false)

  // Fungsi untuk menguji koneksi database
  const testConnection = async () => {
    try {
      setIsTestingConnection(true)
      setTestResult(null)

      const response = await fetch("/api/db-test")
      const data = await response.json()

      setTestResult({
        success: data.success,
        message: data.message,
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Fungsi untuk melakukan seed database
  const seedDatabase = async () => {
    try {
      setIsSeedingDatabase(true)
      setSeedResult(null)

      const response = await fetch("/api/seed", {
        method: "POST",
      })
      const data = await response.json()

      setSeedResult({
        success: data.success,
        message: data.message,
      })
    } catch (error) {
      setSeedResult({
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsSeedingDatabase(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Setup Database</h1>
      <p className="text-muted-foreground mb-8">
        Halaman ini membantu Anda untuk mengatur database PostgreSQL untuk aplikasi Price Management System.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Koneksi Database
            </CardTitle>
            <CardDescription>Periksa apakah aplikasi dapat terhubung ke database PostgreSQL Neon Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Pastikan Anda telah mengatur environment variable <code>DATABASE_URL</code> dengan benar.
            </p>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"} className="mb-4">
                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{testResult.success ? "Koneksi Berhasil" : "Koneksi Gagal"}</AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testConnection} disabled={isTestingConnection}>
              {isTestingConnection ? "Menguji Koneksi..." : "Test Koneksi"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Seed Database
            </CardTitle>
            <CardDescription>Buat tabel dan isi data awal ke database PostgreSQL Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Proses ini akan membuat tabel-tabel yang diperlukan dan mengisi data awal seperti kategori, marketplace,
              dan data master lainnya.
            </p>

            {seedResult && (
              <Alert variant={seedResult.success ? "default" : "destructive"} className="mb-4">
                {seedResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{seedResult.success ? "Seed Berhasil" : "Seed Gagal"}</AlertTitle>
                <AlertDescription>{seedResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={seedDatabase} disabled={isSeedingDatabase || (testResult && !testResult.success)}>
              {isSeedingDatabase ? "Seeding Database..." : "Seed Database"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Langkah Selanjutnya</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Pastikan koneksi database berhasil dengan mengklik "Test Koneksi"</li>
          <li>Buat tabel dan isi data awal dengan mengklik "Seed Database"</li>
          <li>
            Setelah selesai, Anda dapat login dengan username <code>admin</code> dan password <code>admin123</code>
          </li>
          <li>Mulai gunakan aplikasi Price Management System</li>
        </ol>
      </div>
    </div>
  )
}
