"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("token", data.token)

        // Decode token to get user data
        const userData = JSON.parse(atob(data.token.split(".")[1]))

        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        })

        return { success: true, message: "Login successful" }
      } else {
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
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
