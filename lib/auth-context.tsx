'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, AuthContextType, UserProfileWithRelations, UserRoleName } from './supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfileWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error getting initial session:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile without joins to avoid RLS recursion
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        console.error('Error details:', JSON.stringify(profileError, null, 2))
        return
      }

      // Fetch user role separately using the role_id from the profile
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', profileData.role_id)
        .single()

      if (roleError) {
        console.warn('No role found for user:', roleError)
        console.warn('Profile data:', profileData)
      }

      // Combine the data
      const combinedData = {
        ...profileData,
        role: roleData || null
      }

      console.log('User profile loaded:', {
        userId,
        profileData,
        roleData,
        combinedData
      })

      setProfile(combinedData)
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      // Redirigir a la pantalla de inicio después de cerrar sesión
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (roleName: UserRoleName): boolean => {
    return profile?.role?.name === roleName
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook para proteger rutas que requieren autenticación
export function useRequireAuth(requiredRole?: UserRoleName) {
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    console.log('useRequireAuth effect triggered:', {
      loading,
      user: !!user,
      profile,
      requiredRole,
      userRole: profile?.role?.name
    })

    if (!loading && !user) {
      // Redirigir al login si no está autenticado
      console.log('Redirecting to login - no user')
      window.location.href = '/login'
    }

    // Solo redirigir si:
    // 1. No está cargando
    // 2. El usuario está autenticado
    // 3. Se requiere un rol específico
    // 4. El perfil ya se cargó (no es null)
    // 5. El rol del perfil no coincide con el requerido
    if (!loading && user && requiredRole && profile !== null && profile?.role?.name !== requiredRole) {
      // Redirigir si no tiene el rol requerido
      console.log('Redirecting due to insufficient role:', {
        userRole: profile?.role?.name,
        requiredRole,
        profile
      })
      window.location.href = '/'
    }
  }, [user, profile, loading, requiredRole])

  return { user, profile, loading }
}