'use client'

import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'

export default function AdminWelcomePage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario o perfil, no mostrar nada (el hook se encarga de redirigir)
  if (!user || !profile) {
    return null
  }

  const handleContinueToAdmin = () => {
    router.push('/admin')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {profile.nombre || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Welcome Icon */}
          <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Welcome Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido al Panel de Administración!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Has iniciado sesión exitosamente como administrador. 
            Desde aquí puedes gestionar todos los aspectos del sistema de trazabilidad de prendas.
          </p>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de la Sesión</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Usuario:</span> {profile.nombre || 'Administrador'}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Rol:</span> Administrador</p>
              <p><span className="font-medium">Acceso:</span> Completo</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContinueToAdmin}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-md"
            >
              Continuar al Panel de Administración
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Volver al Inicio
            </button>
          </div>

          {/* Quick Access Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z" fill="#3b82f6"/>
                  <path d="M16 14C19.3137 14 22 16.6863 22 20V22H10V20C10 16.6863 12.6863 14 16 14Z" fill="#3b82f6"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestión de Usuarios</h4>
              <p className="text-sm text-gray-600">Administrar artesanos, cooperativas y otros usuarios del sistema</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7L9 18L4 13" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Control de Calidad</h4>
              <p className="text-sm text-gray-600">Supervisar y validar productos y procesos de certificación</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19V6L21 12L9 19Z" fill="#8b5cf6"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">NFT y Blockchain</h4>
              <p className="text-sm text-gray-600">Generar NFTs y gestionar la trazabilidad en blockchain</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}