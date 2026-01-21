# Configuración de Supabase

## Pasos para configurar Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu **Project URL** y **anon public key** (los encontrarás en Settings → API)

### 2. Crear las tablas

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Ejecuta el script

### 3. Configurar variables de entorno en Vercel

Agrega las siguientes variables en Vercel (Settings → Environment Variables):

- `SUPABASE_URL` = Tu Project URL (ej: `https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY` = Tu anon public key
- `CONFIG_API_KEY` = Una clave secreta para proteger los endpoints de edición (opcional pero recomendado)

### 4. Instalar dependencias

```bash
npm install
```

## Endpoints disponibles

### Configuración de IA (`/api/ai-config`)

#### Obtener toda la configuración
```bash
GET /api/ai-config
```

#### Obtener configuración por clave
```bash
GET /api/ai-config?key=system_prompt
```

#### Actualizar configuración
```bash
PUT /api/ai-config?key=system_prompt
Headers:
  x-api-key: TU_CONFIG_API_KEY
Body:
{
  "value": {
    "text": "Nuevo prompt del sistema"
  },
  "description": "Descripción opcional"
}
```

#### Crear nueva configuración
```bash
POST /api/ai-config
Headers:
  x-api-key: TU_CONFIG_API_KEY
Body:
{
  "key": "nueva_config",
  "value": {
    "data": "valor"
  },
  "description": "Descripción opcional"
}
```

### Conversaciones (`/api/conversations`)

#### Obtener conversación de un número
```bash
GET /api/conversations?phoneNumber=573502053858&limit=50&offset=0
```

#### Listar todas las conversaciones
```bash
GET /api/conversations?limit=20&offset=0
```

## Estructura de configuración

La configuración de IA se almacena con las siguientes claves:

- `system_prompt`: Prompt principal del sistema
- `business_info`: Información de contacto (name, phone, address, email)
- `business_hours`: Horarios de atención por día
- `services`: Lista de servicios ofrecidos
- `rules`: Reglas y políticas adicionales

### Ejemplo de actualización de configuración

```bash
curl -X PUT "https://tu-app.vercel.app/ai-config?key=business_info" \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "value": {
      "name": "Albeiro García Odontología",
      "phone": "+57 311 6635391",
      "address": "Calle 123, Bogotá",
      "email": "contacto@odontologia.com"
    }
  }'
```

## Notas importantes

- Los mensajes se guardan automáticamente cuando se reciben y se envían
- El historial de conversación se usa para dar contexto a la IA (últimos 20 mensajes)
- La configuración de IA se carga cada vez que se procesa un mensaje
- Los endpoints de lectura son públicos, los de escritura requieren API key
