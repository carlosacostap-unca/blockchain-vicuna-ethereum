import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la tabla de cooperativas
export interface Cooperativa {
  id?: number
  nombre: string
  comunidad: string
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla de artesanos
export interface Artesano {
  id?: number
  nombres: string
  apellidos: string
  domicilio: string
  dni: string
  fecha_nacimiento: string
  contacto: string
  fotografia_url?: string
  cooperativa_id?: number
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla de chakus
export interface Chaku {
  id?: number
  nombre: string
  created_at?: string
  updated_at?: string
}

// Enums para COLT
export type UnidadTipo = 'Kg'
export type MateriaPrimaTipo = 'Vicugna vicugna'
export type ProcedenciaTipo = 'En silvestría' | 'Otro'
export type DestinoTipo = 'Transformación' | 'Comercialización'

// Tipos para la tabla de COLT
export interface COLT {
  id?: number
  numero: string
  artesano_id: number
  unidad: UnidadTipo
  cantidad: number
  materia_prima: MateriaPrimaTipo
  descripcion: string
  lugar_procedencia: ProcedenciaTipo
  chaku_id?: number
  ano: number
  documentacion_origen: string
  destino: DestinoTipo
  fecha_expedicion: string
  created_at?: string
  updated_at?: string
}

// Tipo extendido para COLT con datos relacionados
export interface COLTWithRelations extends COLT {
  artesano?: Artesano
  chaku?: Chaku
}

// Tipo extendido para Artesano con datos relacionados
export interface ArtesanoWithRelations extends Artesano {
  cooperativa?: Cooperativa
}

// Tipos para la tabla de CTPSFS
export interface CTPSFS {
  id?: number
  numero: string
  descripcion_producto: string
  chaku_id?: number
  ano: number
  documentacion_origen: string
  created_at?: string
  updated_at?: string
}

// Tipos para los procesos de transformación de CTPSFS
export interface CTPSFSProcesoTransformacion {
  id?: number
  ctpsfs_id: number
  descripcion_producto: string
  cantidad: number
  unidad: string
  documentacion_tenencia: string
  fecha_certificacion: string
  artesano_id: number // Permisionario
  created_at?: string
  updated_at?: string
}

// Tipo extendido para CTPSFS con datos relacionados
export interface CTPSFSWithRelations extends CTPSFS {
  chaku?: Chaku
  procesos_transformacion?: CTPSFSProcesoTransformacionWithRelations[]
}

// Tipo extendido para procesos de transformación con datos relacionados
export interface CTPSFSProcesoTransformacionWithRelations extends CTPSFSProcesoTransformacion {
  artesano?: Artesano
}

// Constantes para los selectores
export const UNIDAD_OPTIONS: UnidadTipo[] = ['Kg']
export const MATERIA_PRIMA_OPTIONS: MateriaPrimaTipo[] = ['Vicugna vicugna']
export const PROCEDENCIA_OPTIONS: ProcedenciaTipo[] = ['En silvestría', 'Otro']
export const DESTINO_OPTIONS: DestinoTipo[] = ['Transformación', 'Comercialización']

// Tipos para la tabla de tipos de prendas
export interface TipoPrenda {
  id?: number
  nombre: string
  descripcion?: string
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla de productos
export interface Producto {
  id?: number
  nombre_prenda: string
  tipo_prenda_id?: number
  artesano_id: number
  ctpsfs_id?: number
  localidad_origen: string
  tecnicas_utilizadas: string
  ancho_metros: number
  alto_metros: number
  tiempo_elaboracion_meses: number
  peso_fibra_gramos?: number
  fotografias?: string[] // Array de URLs de las fotografías
  nft_creado?: boolean // Indica si ya se ha creado un NFT para este producto
  nft_transaction_hash?: string // Hash de la transacción blockchain cuando se creó el NFT
  nft_token_id?: number // ID del token NFT en el contrato inteligente
  created_at?: string
  updated_at?: string
}

// Tipo extendido para Producto con datos relacionados
export interface ProductoWithRelations extends Producto {
  artesano?: Artesano
  ctpsfs?: CTPSFS
  tipo_prenda?: TipoPrenda
}

// ========================================
// TIPOS DE AUTENTICACIÓN Y ROLES
// ========================================

// Tipos para roles de usuario
export type UserRoleName = 'administrador' | 'artesano' | 'cooperativa'

export interface UserRole {
  id: number
  name: UserRoleName
  description?: string
  created_at?: string
}

// Tipos para perfiles de usuario
export interface UserProfile {
  id: string // UUID del usuario de auth.users
  email: string
  full_name?: string
  role_id: number
  artesano_id?: number
  cooperativa_id?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Tipo extendido para perfil con datos relacionados
export interface UserProfileWithRelations extends UserProfile {
  role?: UserRole
}

// Tipo para el contexto de autenticación
export interface AuthContextType {
  user: unknown | null
  profile: UserProfileWithRelations | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: unknown }>
  signOut: () => Promise<void>
  hasRole: (roleName: UserRoleName) => boolean
}
