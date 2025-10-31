'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'

export default function AdminMisDatosPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: ''
  })
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

  // Inicializar datos del formulario con la información del perfil
  useState(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || profile.full_name || '',
        email: user.email || '',
        telefono: profile.telefono || '',
        direccion: profile.direccion || '',
        ciudad: profile.ciudad || '',
        pais: profile.pais || 'Bolivia'
      })
    }
  }, [profile, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      // Aquí se implementará la lógica para guardar los datos
      console.log('Guardando datos:', formData)
      setEditMode(false)
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al guardar datos:', error)
    }
  }

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData({
      nombre: profile.nombre || profile.full_name || '',
      email: user.email || '',
      telefono: profile.telefono || '',
      direccion: profile.direccion || '',
      ciudad: profile.ciudad || '',
      pais: profile.pais || 'Bolivia'
    })
    setEditMode(false)
  }

  const handleAccessOption = (option: string) => {
    setIsMenuOpen(false)
    switch (option) {
      case 'Administrador':
        router.push('/admin')
        break
      case 'Artesano':
        router.push('/artesano')
        break
      case 'Cooperativa':
        router.push('/cooperativa')
        break
    }
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Igual al de la página admin */}
      <header className="shadow-lg relative" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <div className="flex-shrink-0">
              <h1 className="text-xl tracking-wide font-maria-david" style={{ color: '#ecd2b4' }}>RUTA DEL TELAR</h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => router.push('/')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  INICIO
                </button>
                <button
                  onClick={() => router.push('/catalogo')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  CATÁLOGO
                </button>
                <button
                  onClick={() => router.push('/productos')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  PRODUCTOS
                </button>
                <button
                  onClick={() => router.push('/enlaces')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  ENLACES
                </button>
              </div>
            </nav>

            {/* Menú de usuario */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  className="flex flex-row justify-center items-center w-8 h-8 space-x-1 hover:opacity-80 transition-opacity duration-200"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                </button>

                {/* Dropdown del menú */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50"
                    style={{ backgroundColor: '#0f324b' }}
                  >
                    <div className="py-2">
                      {/* Información del usuario */}
                      <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                          {profile.nombre || profile.full_name || user.email}
                        </p>
                        <p className="text-xs opacity-60 capitalize" style={{ color: '#ecd2b4' }}>
                          {profile.role?.name}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleAccessOption('Administrador')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Administrador
                      </button>
                      <button
                        onClick={() => handleAccessOption('Artesano')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Artesano
                      </button>
                      <button
                        onClick={() => handleAccessOption('Cooperativa')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Cooperativa
                      </button>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-600 my-1"></div>
                      
                      {/* Botón de cerrar sesión */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200 text-red-400"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título y navegación */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mr-4"
              style={{ color: '#0f324b' }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Panel de Administración
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Administrar Mis Datos
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Tarjeta de información personal */}
        <div className="rounded-lg shadow-lg p-8 mb-6" style={{ backgroundColor: '#0f324b' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-maria-david" style={{ color: '#ecd2b4' }}>
              Información Personal
            </h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                Editar
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
                  style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Nombre Completo
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4',
                    focusRingColor: '#ecd2b4'
                  }}
                />
              ) : (
                <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                  {formData.nombre || 'No especificado'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Correo Electrónico
              </label>
              <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                {formData.email}
                <span className="text-xs opacity-60 ml-2">(No editable)</span>
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Teléfono
              </label>
              {editMode ? (
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                />
              ) : (
                <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                  {formData.telefono || 'No especificado'}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Dirección
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                />
              ) : (
                <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                  {formData.direccion || 'No especificado'}
                </p>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Ciudad
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                />
              ) : (
                <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                  {formData.ciudad || 'No especificado'}
                </p>
              )}
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                País
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                />
              ) : (
                <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                  {formData.pais || 'No especificado'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#0f324b' }}>
          <h2 className="text-2xl font-bold font-maria-david mb-6" style={{ color: '#ecd2b4' }}>
            Información de la Cuenta
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Rol de Usuario
              </label>
              <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                Administrador
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Estado de la Cuenta
              </label>
              <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                Activa
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Fecha de Registro
              </label>
              <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Último Acceso
              </label>
              <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}