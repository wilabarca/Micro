# Proyecto de Microservicios - Biblioteca Digital

**Desarrollado por:** Wilver De Jesús Abarca Sánchez  
**Repositorio GitHub:** [TU_URL_AQUÍ]

---

## Descripción del Proyecto

Sistema de gestión de biblioteca digital implementado con arquitectura de microservicios utilizando Docker Compose. El proyecto integra tres servicios principales:

- **Frontend**: Aplicación web en React + TypeScript
- **Backend API**: API REST en Go (Golang)
- **Base de Datos**: MySQL 8.0 con persistencia de datos

---

## Arquitectura del Sistema
```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript)                          │
│  Container: react-abarca-frontend                        │
│  Puerto: 80                                              │
│  Servidor: Nginx                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP Requests
                       ↓
┌─────────────────────────────────────────────────────────┐
│  BACKEND API (Go/Gin Framework)                         │
│  Container: golang-wilver-api                            │
│  Puerto: 5000                                            │
│  Endpoints:                                              │
│  - GET    /books        (Obtener todos los libros)      │
│  - GET    /books/:id    (Obtener libro por ID)          │
│  - POST   /books        (Crear nuevo libro)             │
│  - PUT    /books/:id    (Actualizar libro)              │
│  - DELETE /books/:id    (Eliminar libro)                │
│  - GET    /abarca       (Obtener nombre completo)       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ SQL Queries
                       ↓
┌─────────────────────────────────────────────────────────┐
│  BASE DE DATOS (MySQL 8.0)                              │
│  Container: mysql-abarca-container                       │
│  Puerto: 3306                                            │
│  Base de datos: authorstore                              │
│  Tabla: books                                            │
│  Volumen persistente: mysql-abarca-data                  │
└─────────────────────────────────────────────────────────┘
```

---

## Cómo Levantar el Entorno

### Prerequisitos

- Docker Desktop instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Git instalado

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/wilabarca/Micro.git
cd MICROSERVICIO
```

### Paso 2: Construir y Levantar los Servicios
```bash
# Construir las imágenes y levantar los contenedores
docker-compose up --build -d

# Ver el estado de los servicios
docker-compose ps

# Ver los logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-wilver
```

### Paso 3: Verificar que Todo Funcione

1. **Base de Datos**: Verificar que MySQL esté corriendo
```bash
docker-compose exec db-abarca mysql -uroot -pAbarca@234 -e "SHOW DATABASES;"
```

2. **API Backend**: Abrir en el navegador
```
http://localhost:5000
```

3. **Frontend**: Abrir en el navegador
```
http://localhost:80
```

---

## 
### Gestión de Contenedores
```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes 
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart api-wilver

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir solo el backend
docker-compose up -d --build api-wilver

# Reconstruir solo el frontend
docker-compose up -d --build frontend-abarca
```

---

## Servicios y Puertos

| Servicio | Contenedor | Puerto | URL |
|----------|-----------|--------|-----|
| Frontend | react-abarca-frontend | 80 | http://localhost:80 |
| Backend API | golang-wilver-api | 5000 | http://localhost:5000 |
| MySQL | mysql-abarca-container | 3306 | localhost:3306 |

---

## ndpoints de la API

### Libros

| Método | Endpoint | Descripción | Body Example |
|--------|----------|-------------|--------------|
| GET | `/books` | Obtener todos los libros | - |
| GET | `/books/:id` | Obtener libro por ID | - |
| POST | `/books` | Crear nuevo libro | `{"title":"1984","year":1949}` |
| PUT | `/books/:id` | Actualizar libro | `{"title":"1984 Updated","year":1949}` |
| DELETE | `/books/:id` | Eliminar libro | - |

### Personalizado

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| GET | `/abarca` | Obtener nombre completo del desarrollador | `{"nombre_completo":"Wilver De Jesús Abarca Sánchez"}` |

---

## Variables de Entorno

### Backend (CRUDAPI/.env)
```env
DB_USER=root
DB_PASSWORD=Abarca@234
DB_HOST=db-abarca
DB_PORT=3306
DB_NAME=authorstore
```

---

## 🗄️ Base de Datos

### Esquema de la Tabla `books`
```sql
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL
);
```

---

## Pruebas de Persistencia

### Verificar Persistencia de Datos
```bash
# 1. Agregar algunos libros desde el frontend

# 2. Detener los contenedores
docker-compose down

# 3. Volver a levantar los contenedores
docker-compose up -d

# 4. Verificar que los libros siguen ahí
# Abrir http://localhost:80 y comprobar que los datos persisten
```

---

##  Autor

**Wilver De Jesús Abarca Sánchez**

- GitHub: https://github.com/wilabarca/Micro.git

---
