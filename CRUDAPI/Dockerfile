# 🔹 Etapa 1: Construcción
FROM golang:1.23-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY go.mod go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 🔹 Etapa 2: Imagen final
FROM alpine:latest

# Instalar certificados SSL
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar el binario compilado desde la etapa de construcción
COPY --from=builder /app/main .

# Copiar archivo .env si existe (opcional, las variables se pasan desde docker-compose)
COPY .env* ./

# Exponer el puerto
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["./main"]