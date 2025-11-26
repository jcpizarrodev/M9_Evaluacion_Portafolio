
# M9_Evaluación de portafolio - Tienda Digital de Libros

## Resumen

**Tienda Digital de Libros** es una aplicación web educativa que simula una plataforma de venta de libros.  
Está pensada para cumplir con los requerimientos académicos: módulo de usuarios (registro + login), generación y verificación de JWT, modelo de libros con control de stock, vistas en Handlebars con Bootstrap, compra protegida por autenticación y un panel administrativo con CRUD de libros y estadísticas.

La implementación actual usa archivos JSON como persistencia (carpeta `/db`) para facilitar la entrega y pruebas sin depender de una base de datos externa.

---

## Características principales

- Registro de usuarios con `bcrypt` para hashing de contraseñas.
- Inicio de sesión que crea una sesión y un **JWT** (válido 2 horas).
- Modelo `Libro` con campos: `id`, `nombre`, `precio`, `cantidad_disponible`.
- Listado público de libros (`/libros`).
- Compra de libros vía ruta protegida: `POST /libros/:id/comprar` (valida stock).
- Carrito de compras ligado a la **sesión** del usuario (`/carrito`), con proceso de checkout.
- Panel de administración (`/admin`) accesible solo para el usuario con `role: "admin"`.
- CRUD completo de libros desde el panel admin.
- Registro de ventas en `db/ventas.json`.
- Vistas server-side con **Handlebars** y estilos con **Bootstrap 5**.
- Variables de entorno con `.env` para secrets y puerto.
- API endpoints para consumo desde Postman u otros clientes.

---

## Estructura del proyecto

```
.
├── db/
│   ├── libros.json          # Datos persistentes: libros
│   ├── usuarios.json        # Usuarios registrados (hashed passwords)
│   └── ventas.json          # Registro de ventas
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── libros.controller.js
│   │   └── admin.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── libros.model.js
│   │   ├── usuarios.model.js
│   │   └── ventas.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── libros.routes.js
│   │   └── admin.routes.js
│   └── views/                # Handlebars templates
├── public/                   # CSS, JS estáticos
├── .env
├── server.js
├── package.json
└── README.md
```

> Nota: Los JSON de datos se encuentran en `/db` para mantener orden en el proyecto.

---

## Instalación y puesta en marcha

1. Clonar el repositorio y entrar en la carpeta:

```bash
git clone <REPO_URL>
cd <PROJECT_FOLDER>
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo `.env` en la raíz con al menos:

```
SESSION_SECRET=tu_secret_de_sesion
JWT_SECRET=tu_secret_jwt
PORT=3000
```

4. Ejecutar la aplicación:

```bash
npm start
```

Abrir en el navegador:

```
http://localhost:3000
```

---

## Variables de entorno (`.env`)

| Variable          | Uso                                                 |
|-------------------|-----------------------------------------------------|
| `SESSION_SECRET`  | Clave para firmar la sesión de express-session      |
| `JWT_SECRET`      | Clave para firmar/verificar tokens JWT              |
| `PORT`            | Puerto de ejecución del servidor (por defecto 3000) |

Asegúrate de agregar `.env` a `.gitignore` para no subir secretos al repositorio.

---

## Panel de administración y CRUD de productos

### Acceso
- Solo el usuario con `role: "admin"` puede acceder a `/admin`.
- En `src/controllers/auth.controller.js` al registrar, si `username === "admin"` se asigna `role: "admin"` (esto es útil para pruebas). En entornos reales deberías crear y asignar roles de forma segura.

### Funcionalidades del panel
- **Listado** de libros con métricas (total libros, total ventas, libros sin stock).
- **Crear libro**: formulario con `nombre`, `precio`, `cantidad`.
- **Editar libro**: actualizar precio y cantidad disponible.
- **Eliminar libro**: remueve del `db/libros.json`.
- Todas las acciones usan `saveLibros(libros)` para persistir cambios en `/db/libros.json`.

---

## Carrito de compras y flujo de checkout

### Flujo general (vistas)
1. Usuario navega `/libros` y agrega items al carrito (`/carrito/add`) — el carrito se guarda en `req.session.cart`.
2. El carrito muestra `nombre`, `cantidad`, `precio`, `subtotal` y `total`.
3. Al presionar **Pagar**, el formulario hace `POST /carrito/checkout`.
   - Antes de procesar, se inyecta automáticamente el token de sesión en el body si existe (`routes/libros.routes.js`).
   - `verifyToken` valida que el usuario esté autenticado (por token o sesión).
4. `procesarCarrito` recorre cada item y llama `comprarLibroLogic` por cada posición:
   - Si hay stock suficiente, descuenta y registra venta (`db/ventas.json`).
   - Si al menos una compra fue exitosa, limpia el carrito.
   - Por diseño actual, el token de sesión se elimina después del checkout (esto se hace deliberadamente; puedes cambiarlo según necesidad).

### Validaciones principales
- No se puede agregar al carrito más unidades que las disponibles.
- Antes de añadir al carrito y antes del checkout se verifican cantidades disponibles para evitar overselling.

---

## APIs disponibles — ejemplos y uso

A continuación ejemplos prácticos (curl y body JSON) que puedes usar para probar la API desde Postman o terminal.

> **Nota**: Las rutas que empiezan con `/api/` devuelven JSON. Las rutas `/libros`, `/carrito` y `/admin` devuelven vistas HTML.

### 1. Login (API) — obtener token JWT

**POST** `/api/login`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "username": "juan",
  "password": "tu_contraseña"
}
```

Respuesta (ejemplo):
```json
{
  "token": "eyJhbGciOiJ..."
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"1234"}'
```

---

### 2. Listar libros (API)

**GET** `/api/libros`

Respuesta:
```json
[
  {
    "id": 1,
    "nombre": "El principito",
    "precio": 10000,
    "cantidad_disponible": 4
  },
  ...
]
```

**curl:**
```bash
curl http://localhost:3000/api/libros
```

---

### 3. Obtener libro por ID (API)

**GET** `/api/libros/:id`

**curl:**
```bash
curl http://localhost:3000/api/libros/1
```

---

### 4. Comprar libro (API o desde la vista) — protegido

**POST** `/libros/:id/comprar`

- Requiere token JWT en `Authorization: Bearer <token>` **o** sesión válida en la app.
- Body (application/json o form data):

```json
{
  "cantidad": 2
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/libros/1/comprar \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"cantidad":1}'
```

Respuesta (ejemplo):
```json
{ "mensaje": "Compra exitosa: 1 x \"El principito\"" }
```

Si no hay stock suficiente:
```json
{ "mensaje": "Stock insuficiente" }
```

---

### 5. Carrito — obtener (API)

**GET** `/api/carrito`

Respuesta:
```json
{
  "cart": [
    { "id": 1, "cantidad": 2, "nombre": "El principito", "precio": 10000, "subtotal": 20000, "disponible": 4 }
  ],
  "total": 20000
}
```

---

## Seguridad

- **Hash de contraseñas**: `bcrypt` con salt rounds configurados (en código actual `10`).
- **JWT**: firmado con `JWT_SECRET` y expiración (2 horas).
- **Middleware `verifyToken`**:
  - Permite la autenticación por `Authorization: Bearer <token>`, por `req.body.token`, por `req.query.token` o por `req.session.token`.
  - Si existe sesión de usuario sin token, también permite el acceso (útil para la navegación web tradicional).
- **Rutas admin**: acceso restringido verificando `req.session.user.role === "admin"`.
- **No exponer secretos**: usar `.env` y agregarlo a `.gitignore`.

---

## Buenas prácticas y recomendaciones

1. **Migrar a una base de datos real** (PostgreSQL, MySQL, MongoDB) cuando sea necesario para concurrencia y persistencia robusta. Con archivos JSON existe riesgo de condiciones de carrera con múltiples procesos.
2. **Añadir validación** de inputs con `express-validator` o `Joi` para garantizar robustez.
3. **Usar transacciones** (si se migra a SQL) para garantizar atomicidad de compras.
4. **Mejorar gestión de roles** (crear tabla/archivo para roles y permisos).
5. **Tareas de integración y pruebas E2E** con Jest + Supertest o Cypress.
6. **No eliminar token automáticamente** tras checkout (a menos que sea un requerimiento).

---

## Pruebas recomendadas (Postman)

Configura variables de entorno en Postman:

- `baseURL` = `http://localhost:3000`
- `jwtToken` = ` ` (vacío)
- `libroId` = `1`

Flujo recomendado:
1. `POST {{baseURL}}/api/login` → guardar token en `jwtToken`.
2. `GET {{baseURL}}/api/libros` → obtener `libroId` con stock.
3. `POST {{baseURL}}/libros/{{libroId}}/comprar` con header `Authorization: Bearer {{jwtToken}}` y body `{ "cantidad": 1 }`.
4. `GET {{baseURL}}/api/libros/{{libroId}}` → verificar que `cantidad_disponible` fue descontada.

---

## Despliegue

- Para entornos productivos:
  - Usar `NODE_ENV=production`.
  - Configurar HTTPS (certificado TLS).
  - Usar un gestor de procesos (PM2, systemd).
  - Migrar la persistencia a una base de datos gestionada.
  - Configurar backups periódicos de `/db` mientras migra a DB real.

---

## Autor

Proyecto desarrollado como entrega académica por **[Tu Nombre]**.  
Contacto: `tu.email@ejemplo.com` (opcional)

---

## Licencia

MIT License — ver archivo `LICENSE`.

---

