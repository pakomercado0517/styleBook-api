# 📋 Stylebook - Backend API

[![Node.js](https://img.shields.io/badge/node.js-v18+-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)]()
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-black)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791)]()
[![License](https://img.shields.io/badge/license-ISC-blue)]()

> **Plataforma de agendamiento de citas tipo Booksy** - Backend RESTful API construida con Node.js, Express, TypeScript y PostgreSQL.

## 📖 Descripción

Stylebook es una plataforma de agendamiento de citas para diferentes tipos de negocios (salones de belleza, peluquerías, dentistas, consultorías, etc.). Permite que clientes busquen, reserven y paguen por servicios, mientras que los proveedores gestionan sus servicios, empleados, disponibilidad y reseñas.

### Características Principales

✅ **Autenticación JWT** - Seguridad robusta con tokens  
✅ **Gestión de Roles** - Cliente, Proveedor, Administrador  
✅ **Citas Inteligentes** - Sistema completo de reservas  
✅ **Reseñas y Ratings** - Sistema de calificación para proveedores  
✅ **Manejo de Horarios** - Timezone automático y bloques de disponibilidad  
✅ **API RESTful** - 36 endpoints completamente documentados  
✅ **Validaciones Robustas** - Express-validator en todos los endpoints  
✅ **Manejo de Errores** - Sistema centralizado de errores  

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.1.0
- **Lenguaje:** TypeScript 5.9.3
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize 6.x + Sequelize-TypeScript 2.1.6
- **Autenticación:** JWT (jsonwebtoken 9.0.2)
- **Encriptación:** bcryptjs 6.0.0
- **Validación:** express-validator 7.2.1
- **Logging:** morgan 1.10.1
- **Manejo de Fechas:** date-fns + date-fns-tz

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18+
- **npm** v9+
- **PostgreSQL** v12+
- **Git**
- **Postman** (para testing) - [Descargar](https://www.postman.com/downloads/)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/stylebook-backend.git
cd stylebook-backend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/stylebook_db

# Servidor
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_REFRESH_SECRET=tu_secreto_refresh_seguro_aqui
JWT_EXPIRATION=7d

# Email (Futuro)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña
```

### 4. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE stylebook_db;

# Salir
\q
```

### 5. Ejecutar Migraciones

```bash
# Las migraciones se ejecutan automáticamente al iniciar el servidor
npm run dev
```

---

## 📦 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                 # Configuración Sequelize
│   ├── controllers/              # Lógica de peticiones
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── ProviderController.ts
│   │   ├── ServiceController.ts
│   │   ├── AppointmentController.ts
│   │   ├── ReviewController.ts
│   │   └── BlockedHoursController.ts
│   ├── models/                   # Modelos Sequelize (12 modelos)
│   │   ├── Users.ts
│   │   ├── Clients.ts
│   │   ├── Providers.ts
│   │   ├── Services.ts
│   │   ├── Employees.ts
│   │   ├── Appointments.ts
│   │   ├── Payments.ts
│   │   ├── Reviews.ts
│   │   ├── HorariosBlocked.ts
│   │   ├── Favorites.ts
│   │   ├── Notifications.ts
│   │   └── CancellationPolicy.ts
│   ├── services/                 # Lógica de negocio
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   ├── ProviderService.ts
│   │   ├── ServiceService.ts
│   │   ├── AppointmentService.ts
│   │   ├── ReviewService.ts
│   │   └── BlockedHoursService.ts
│   ├── router/                   # Rutas API (7 routers)
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── providers.ts
│   │   ├── services.ts
│   │   ├── appointments.ts
│   │   ├── reviews.ts
│   │   └── blockedHours.ts
│   ├── middlewares/              # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── response.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── dateUtils.ts         # Conversión de timezones
│   │   └── errors.ts            # Clases de error
│   ├── validators/               # Validaciones express-validator
│   │   └── index.ts
│   ├── server.ts                # Configuración Express
│   └── index.ts                 # Punto de entrada
├── dist/                        # Código compilado
├── docs/                        # Documentación
│   ├── BUSINESS_FLOW.md        # Flujo de negocio
│   ├── TESTING_POSTMAN.md      # Guía de pruebas
│   ├── RULES.md                # Reglas de desarrollo
│   └── PROJECT_CONTEXT.md      # Contexto del proyecto
├── postman_collection/
│   └── api.json                 # Colección con 36 endpoints
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El servidor iniciará en `http://localhost:3000`

### Build/Compilación

```bash
npm run build
```

### Producción

```bash
npm start
```

---

## 📡 API Endpoints

### Total: 36 Endpoints

| Sección | Endpoints | Estado |
|---------|-----------|--------|
| 🔐 **Auth** | 3 | ✅ Completado |
| 👥 **Users** | 4 | ✅ Completado |
| 🏢 **Providers** | 5 | ✅ Completado |
| 🔧 **Services** | 6 | ✅ Completado |
| 📅 **Appointments** | 5 | ✅ Completado |
| ⭐ **Reviews** | 6 | ✅ Completado |
| 🚫 **Blocked Hours** | 7 | ✅ Completado |

### Ejemplos Rápidos

#### Registrarse
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Juan",
  "apellido": "Pérez",
  "email": "juan@test.com",
  "password": "Password123",
  "role": "client"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "juan@test.com",
  "password": "Password123"
}
```

#### Crear Cita
```bash
POST /appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_id": 1,
  "employee_id": 1,
  "start_date": "2025-10-25T14:00:00",
  "end_date": "2025-10-25T14:30:00"
}
```

Para documentación completa, ver `docs/api_routes/` o importar la colección en Postman.

---

## 🧪 Testing

### Con Postman

1. **Importar Colección**
   - Abre Postman
   - Click en "Import"
   - Selecciona `postman_collection/api.json`

2. **Token Automático**
   - Ejecuta `/auth/register` o `/auth/login`
   - El token se guarda automáticamente
   - Úsalo en otros endpoints con `{{token}}`

3. **Ejecutar Flujos**
   - FLUJO 1: Autenticación (5 min)
   - FLUJO 2: Usuarios (3 min)
   - FLUJO 3: Proveedores (5 min)
   - FLUJO 4: Servicios (5 min)
   - FLUJO 5: Citas (5 min)
   - FLUJO 6: Reseñas (5 min)
   - FLUJO 7: Horarios Bloqueados (5 min)

Ver `docs/TESTING_POSTMAN.md` para guía completa.

---

## 📚 Documentación

La documentación detallada está en la carpeta `docs/`:

| Documento | Descripción |
|-----------|-------------|
| `PROJECT_CONTEXT.md` | Contexto y visión del proyecto |
| `RULES.md` | Reglas y estándares de desarrollo |
| `BUSINESS_FLOW.md` | Flujo de negocio completo |
| `TESTING_POSTMAN.md` | Guía de pruebas |
| `ALIGNMENT_RULES.md` | Alineación a reglas y contexto |
| `API_ROUTES_SUMMARY.md` | Resumen de rutas API |

---

## 🔐 Autenticación

### JWT Flow

```
1. Registrarse/Login
   → POST /auth/register o /auth/login
   → Retorna JWT token

2. Usar Token
   → Authorization: Bearer {token}
   → En headers de cada request protegido

3. Token Automático en Postman
   → Se guarda automáticamente en variable {{token}}
   → Se usa en todos los endpoints protegidos
```

### Roles y Permisos

```
- client: Buscar servicios, reservar citas, dejar reseñas
- provider: Crear servicios, gestionar citas, ver reseñas
- admin: Acceso total, moderación, reportes
```

---

## ⏰ Manejo de Timezones

La aplicación maneja automáticamente diferentes zonas horarias:

```
Entrada: Hora local del usuario
   ↓
Backend: Convierte a UTC
   ↓
Base de Datos: Almacena en UTC
   ↓
Salida: Convierte a timezone del usuario
```

**Timezone por defecto:** America/Mexico_City

---

## 🔄 Flujo de Negocio

### Cliente Reserva Cita

```
1. Registrarse
2. Buscar servicios
3. Ver disponibilidad
4. Reservar cita (status: pending)
5. Proveedor confirma (status: confirmed)
6. Cita se realiza (status: completed)
7. Cliente deja reseña
```

### Proveedor Configura Negocio

```
1. Registrarse como proveedor
2. Crear perfil de negocio
3. Crear empleados
4. Crear servicios
5. Bloquear horarios (almuerzo, cierre)
6. Confirmar/rechazar citas
7. Ver reseñas
```

Para detalles completos, ver `docs/BUSINESS_FLOW.md`.

---

## 🐛 Solución de Problemas

### Error: Database Connection
```
Verificar que PostgreSQL está corriendo
Revisar DATABASE_URL en .env
Confirmar que la BD existe
```

### Error: JWT Token Invalid
```
Hacer login primero con /auth/login
El token se guarda automáticamente en Postman
Si no funciona, verificar que el token no expiró
```

### Error: Email Already Exists
```
Cambiar el email en el registro
Los emails deben ser únicos en el sistema
```

Ver `docs/TESTING_POSTMAN.md` para más soluciones.

---

## 📝 Commits y Versionado

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: agregar endpoint de búsqueda"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar README"
git commit -m "refactor: simplificar controller"
git commit -m "test: agregar pruebas unitarias"
```

---

## 🚀 Próximas Funcionalidades

### Fase 2 - En Desarrollo
- [ ] Sistema de Disponibilidad Avanzado
- [ ] Confirmación de Citas (Proveedor)
- [ ] Búsqueda con Filtros Avanzados
- [ ] Cálculo de Rating Automático

### Fase 3 - Próximamente
- [ ] Sistema de Pagos (Stripe/MercadoPago)
- [ ] Notificaciones Email/SMS
- [ ] Sistema de Favoritos
- [ ] Comentarios en Reseñas

### Fase 4 - Largo Plazo
- [ ] Promociones y Descuentos
- [ ] Reportes y Analytics
- [ ] Integración de Calendario
- [ ] App Móvil Nativa

---

## 📊 Estadísticas del Proyecto

```
✅ Modelos:           12
✅ Controladores:     7
✅ Servicios:         7
✅ Routers:           7
✅ Endpoints:         36
✅ Validadores:       Múltiples
✅ Middlewares:       5
✅ Lines of Code:     ~3000+
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Líneas de Desarrollo

- Mantener style guide en `docs/RULES.md`
- Seguir convenciones de commits
- Actualizar documentación
- Agregar tests para nuevas funcionalidades

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Pako Mercado**
- Email: pako@example.com
- GitHub: [@pakomercat](https://github.com/pakomercat)

---

## 📞 Soporte

Para soporte o preguntas:

1. 📖 Revisar la documentación en `docs/`
2. 🧪 Consultar guía de pruebas en `docs/TESTING_POSTMAN.md`
3. 🔄 Ver flujo de negocio en `docs/BUSINESS_FLOW.md`
4. 💬 Abrir un Issue en GitHub

---

## 🙏 Agradecimientos

- [Sequelize](https://sequelize.org/) - ORM
- [Express.js](https://expressjs.com/) - Framework
- [PostgreSQL](https://www.postgresql.org/) - Base de datos
- [TypeScript](https://www.typescriptlang.org/) - Tipado
- [date-fns](https://date-fns.org/) - Manejo de fechas

---

## 📅 Changelog

### v1.0.0 (21 de Octubre, 2025)

- ✅ Autenticación JWT completa
- ✅ 12 modelos de datos
- ✅ 36 endpoints API
- ✅ Validaciones robustas
- ✅ Manejo de timezones
- ✅ Sistema de citas
- ✅ Sistema de reseñas
- ✅ 100% documentado
- ✅ Postman collection con token automático

---

**Last Updated:** 21 de Octubre, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
# styleBook-api
