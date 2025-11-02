-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.artesanos (
  id bigint NOT NULL DEFAULT nextval('artesanos_id_seq'::regclass),
  nombres character varying NOT NULL,
  apellidos character varying NOT NULL,
  domicilio text NOT NULL,
  dni character varying NOT NULL UNIQUE,
  fecha_nacimiento date NOT NULL,
  contacto character varying NOT NULL,
  fotografia_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  cooperativa_id bigint,
  CONSTRAINT artesanos_pkey PRIMARY KEY (id),
  CONSTRAINT artesanos_cooperativa_id_fkey FOREIGN KEY (cooperativa_id) REFERENCES public.cooperativas(id)
);
CREATE TABLE public.chakus (
  id bigint NOT NULL DEFAULT nextval('chakus_id_seq'::regclass),
  nombre character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chakus_pkey PRIMARY KEY (id)
);
CREATE TABLE public.colt (
  id bigint NOT NULL DEFAULT nextval('colt_id_seq'::regclass),
  numero character varying NOT NULL UNIQUE,
  artesano_id bigint,
  unidad USER-DEFINED NOT NULL DEFAULT 'Kg'::unidad_tipo,
  cantidad numeric NOT NULL,
  materia_prima USER-DEFINED NOT NULL DEFAULT 'Vicugna vicugna'::materia_prima_tipo,
  descripcion text NOT NULL,
  lugar_procedencia USER-DEFINED NOT NULL,
  chaku_id bigint,
  ano integer NOT NULL,
  documentacion_origen text NOT NULL,
  destino USER-DEFINED NOT NULL,
  fecha_expedicion date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT colt_pkey PRIMARY KEY (id),
  CONSTRAINT colt_artesano_id_fkey FOREIGN KEY (artesano_id) REFERENCES public.artesanos(id),
  CONSTRAINT colt_chaku_id_fkey FOREIGN KEY (chaku_id) REFERENCES public.chakus(id)
);
CREATE TABLE public.cooperativas (
  id bigint NOT NULL DEFAULT nextval('cooperativas_id_seq'::regclass),
  nombre character varying NOT NULL,
  comunidad character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cooperativas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ctpsfs (
  id bigint NOT NULL DEFAULT nextval('ctpsfs_id_seq'::regclass),
  numero character varying NOT NULL UNIQUE,
  descripcion_producto text NOT NULL,
  chaku_id bigint,
  ano integer NOT NULL,
  documentacion_origen text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ctpsfs_pkey PRIMARY KEY (id),
  CONSTRAINT ctpsfs_chaku_id_fkey FOREIGN KEY (chaku_id) REFERENCES public.chakus(id)
);
CREATE TABLE public.ctpsfs_procesos_transformacion (
  id bigint NOT NULL DEFAULT nextval('ctpsfs_procesos_transformacion_id_seq'::regclass),
  ctpsfs_id bigint,
  descripcion_producto text NOT NULL,
  cantidad numeric NOT NULL,
  unidad character varying NOT NULL DEFAULT 'Kg'::character varying,
  documentacion_tenencia text NOT NULL,
  fecha_certificacion date NOT NULL,
  artesano_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ctpsfs_procesos_transformacion_pkey PRIMARY KEY (id),
  CONSTRAINT ctpsfs_procesos_transformacion_ctpsfs_id_fkey FOREIGN KEY (ctpsfs_id) REFERENCES public.ctpsfs(id),
  CONSTRAINT ctpsfs_procesos_transformacion_artesano_id_fkey FOREIGN KEY (artesano_id) REFERENCES public.artesanos(id)
);
CREATE TABLE public.productos (
  id bigint NOT NULL DEFAULT nextval('productos_id_seq'::regclass),
  nombre_prenda character varying NOT NULL,
  artesano_id bigint,
  ctpsfs_id bigint,
  localidad_origen character varying NOT NULL,
  tecnicas_utilizadas text NOT NULL,
  ancho_metros numeric NOT NULL CHECK (ancho_metros > 0::numeric),
  alto_metros numeric NOT NULL CHECK (alto_metros > 0::numeric),
  tiempo_elaboracion_meses integer NOT NULL CHECK (tiempo_elaboracion_meses > 0),
  fotografias ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  peso_fibra_gramos numeric CHECK (peso_fibra_gramos IS NULL OR peso_fibra_gramos > 0::numeric),
  nft_creado boolean NOT NULL DEFAULT false,
  nft_transaction_hash character varying,
  nft_token_id bigint UNIQUE,
  tipo_prenda_id bigint,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_artesano_id_fkey FOREIGN KEY (artesano_id) REFERENCES public.artesanos(id),
  CONSTRAINT productos_ctpsfs_id_fkey FOREIGN KEY (ctpsfs_id) REFERENCES public.ctpsfs(id),
  CONSTRAINT productos_tipo_prenda_id_fkey FOREIGN KEY (tipo_prenda_id) REFERENCES public.tipos_prendas(id)
);
CREATE TABLE public.tipos_prendas (
  id bigint NOT NULL DEFAULT nextval('tipos_prendas_id_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tipos_prendas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email character varying NOT NULL,
  full_name character varying,
  role_id bigint NOT NULL,
  artesano_id bigint,
  cooperativa_id bigint,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT user_profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(id),
  CONSTRAINT user_profiles_artesano_id_fkey FOREIGN KEY (artesano_id) REFERENCES public.artesanos(id),
  CONSTRAINT user_profiles_cooperativa_id_fkey FOREIGN KEY (cooperativa_id) REFERENCES public.cooperativas(id)
);
CREATE TABLE public.user_roles (
  id bigint NOT NULL DEFAULT nextval('user_roles_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);