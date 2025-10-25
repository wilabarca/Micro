package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

// ==================== ENTIDAD ====================
type Book struct {
	ID    int64  `json:"id"`
	Title string `json:"title" binding:"required"`
	Year  int    `json:"year" binding:"required"`
}

// ==================== REPOSITORIO ====================
type BookRepository interface {
	CreateBook(book *Book) error
	GetAll() ([]Book, error)
	GetByID(id int64) (*Book, error)
	UpdateBook(book *Book) error
	DeleteBook(id int64) error
}

// ==================== IMPLEMENTACIÓN MYSQL ====================
type MySQLBookRepository struct {
	db *sql.DB
}

func NewMySQLBookRepository(db *sql.DB) BookRepository {
	return &MySQLBookRepository{db: db}
}

func (m *MySQLBookRepository) CreateBook(book *Book) error {
	result, err := m.db.Exec("INSERT INTO books (title, year) VALUES (?, ?)", book.Title, book.Year)
	if err != nil {
		log.Println("Error al insertar el libro:", err)
		return err
	}

	id, err := result.LastInsertId()
	if err == nil {
		book.ID = id
	}

	return nil
}

func (m *MySQLBookRepository) DeleteBook(id int64) error {
	result, err := m.db.Exec("DELETE FROM books WHERE id = ?", id)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("book with id %d not found", id)
	}
	return nil
}

func (m *MySQLBookRepository) GetAll() ([]Book, error) {
	rows, err := m.db.Query("SELECT id, title, year FROM books")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		if err := rows.Scan(&book.ID, &book.Title, &book.Year); err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func (m *MySQLBookRepository) GetByID(id int64) (*Book, error) {
	var book Book
	err := m.db.QueryRow("SELECT id, title, year FROM books WHERE id = ?", id).Scan(&book.ID, &book.Title, &book.Year)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("book with id %d not found", id)
		}
		return nil, err
	}
	return &book, nil
}

func (m *MySQLBookRepository) UpdateBook(book *Book) error {
	result, err := m.db.Exec("UPDATE books SET title = ?, year = ? WHERE id = ?", book.Title, book.Year, book.ID)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("book with id %d not found", book.ID)
	}
	return nil
}

// ==================== SERVICIO ====================
type BookService struct {
	repository BookRepository
}

func NewBookService(repo BookRepository) *BookService {
	return &BookService{repository: repo}
}

func (b *BookService) CreateBook(book *Book) error {
	return b.repository.CreateBook(book)
}

func (b *BookService) GetByID(id int64) (*Book, error) {
	return b.repository.GetByID(id)
}

func (b *BookService) UpdateBook(book *Book) error {
	if book.ID == 0 {
		return fmt.Errorf("book ID is required for update")
	}
	return b.repository.UpdateBook(book)
}

func (b *BookService) DeleteBook(id int64) error {
	return b.repository.DeleteBook(id)
}

func (b *BookService) GetAll() ([]Book, error) {
	return b.repository.GetAll()
}

// ==================== CONTROLADOR ====================
type BookController struct {
	service *BookService
}

func NewBookController(service *BookService) *BookController {
	return &BookController{service: service}
}

func (pc *BookController) CreateBook(c *gin.Context) {
	var book Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	err := pc.service.CreateBook(&book)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Libro creado correctamente", "book": book})
}

func (pc *BookController) GetAllBooks(c *gin.Context) {
	books, err := pc.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, books)
}

func (pc *BookController) GetBookByID(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	book, err := pc.service.GetByID(int64(num))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, book)
}

func (pc *BookController) UpdateBook(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var book Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Entrada inválida"})
		return
	}
	book.ID = int64(num)

	err = pc.service.UpdateBook(&book)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Libro actualizado correctamente", "book": book})
}

func (pc *BookController) DeleteBook(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	err = pc.service.DeleteBook(int64(num))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Libro eliminado correctamente"})
}

// ==================== CONEXIÓN A BASE DE DATOS ====================
func ConnectDB() (*sql.DB, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ No se pudo cargar el archivo .env, usando variables del sistema")
	}

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("error al abrir la conexión: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error al hacer ping: %w", err)
	}

	// 🔥 Crear tabla automáticamente si no existe
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS books (
		id INT AUTO_INCREMENT PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		year INT NOT NULL
	);
	`
	_, err = db.Exec(createTableQuery)
	if err != nil {
		return nil, fmt.Errorf("error al crear la tabla books: %w", err)
	}

	log.Println("✅ Tabla 'books' verificada o creada correctamente")
	log.Println("✅ Conexión a MySQL exitosa")
	return db, nil
}

// ==================== RUTAS ====================
func RegisterBookRoutes(router *gin.Engine, bookController *BookController) {
	routes := router.Group("/books")
	{
		routes.GET("", bookController.GetAllBooks)
		routes.GET("/:id", bookController.GetBookByID)
		routes.POST("", bookController.CreateBook)
		routes.PUT("/:id", bookController.UpdateBook)
		routes.DELETE("/:id", bookController.DeleteBook)
	}
}

// ==================== MAIN ====================
func main() {
	db, err := ConnectDB()
	if err != nil {
		log.Fatalf("❌ Error al conectar con la base de datos: %v", err)
	}
	defer db.Close()

	bookRepo := NewMySQLBookRepository(db)
	bookService := NewBookService(bookRepo)
	bookController := NewBookController(bookService)

	router := gin.Default()

	// 🧠 CORS CONFIGURATION
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"}, // Frontend React
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 🔹 Endpoint con tu apellido
	router.GET("/abarca", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"nombre_completo": "Wilver De Jesús Abarca Sánchez",
		})
	})

	RegisterBookRoutes(router, bookController)

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "📚 API de Libros corriendo correctamente",
			"endpoints": []string{
				"GET /books",
				"GET /books/:id",
				"POST /books",
				"PUT /books/:id",
				"DELETE /books/:id",
				"GET /abarca",
			},
		})
	})

	log.Println("🚀 Servidor ejecutándose en http://localhost:5000")
	if err := router.Run(":5000"); err != nil {
		log.Fatalf("❌ Error al iniciar el servidor: %v", err)
	}
}
