"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string | number
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false, message: "Not implemented" }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        // For demo purposes, we'll just decode the token
        // In a real app, you would verify the token with your backend
        try {
          const userData = JSON.parse(atob(token.split(".")[1]))

          if (userData && userData.exp * 1000 > Date.now()) {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
            })
          } else {
            // Token expired
            localStorage.removeItem("token")
          }
        } catch (tokenError) {
          console.error("Token parsing error:", tokenError)
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("Auth provider: login attempt for", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Login response error:", response.status, errorText)

        if (response.status === 500) {
          return {
            success: false,
            message: "Server error. Database mungkin belum di-setup atau terjadi masalah koneksi.",
          }
        }

        return {
          success: false,
          message: `Login gagal dengan status ${response.status}. Silakan coba lagi.`,
        }
      }

      // Now parse JSON safely
      let data
      try {
        data = await response.json()
        console.log("Login response:", data.success ? "success" : "failed")
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)
        return {
          success: false,
          message: "Gagal memproses respons server. Silakan coba lagi.",
        }
      }

      if (data.success) {
        localStorage.setItem("token", data.token)

        try {
          // Decode token to get user data
          const userData = JSON.parse(atob(data.token.split(".")[1]))

          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          })

          return { success: true, message: "Login berhasil" }
        } catch (tokenError) {
          console.error("Token parsing error:", tokenError)
          return { success: false, message: "Token autentikasi tidak valid" }
        }
      } else {
        return { success: false, message: data.message || "Login gagal" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Terjadi kesalahan saat login. Server mungkin tidak merespons atau database belum di-setup.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
