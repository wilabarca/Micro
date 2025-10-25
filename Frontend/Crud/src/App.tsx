import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Book, Search } from 'lucide-react';
import './App.css';

interface BookType {
  id: number;
  title: string;
  year: number;
}

// 🔹 Actualizamos la URL base al puerto 5000
const API_BASE_URL = 'http://localhost:5000';

const API_ENDPOINTS = {
  getAllBooks: `${API_BASE_URL}/books`,
  getBookById: (id: number) => `${API_BASE_URL}/books/${id}`,
  createBook: `${API_BASE_URL}/books`,
  updateBook: (id: number) => `${API_BASE_URL}/books/${id}`,
  deleteBook: (id: number) => `${API_BASE_URL}/books/${id}`,
  getNombreCompleto: `${API_BASE_URL}/abarca`,
};

const App: React.FC = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
  });

  // 🔹 Obtener todos los libros
  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.getAllBooks);
      if (!response.ok) throw new Error('Error al obtener los libros');
      const data = await response.json();
      setBooks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener nombre completo desde endpoint /abarca
  const fetchNombreCompleto = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getNombreCompleto);
      if (!response.ok) throw new Error('Error al obtener el nombre completo');
      const data = await response.json();
      setNombreCompleto(data.nombre_completo || '');
    } catch (err) {
      console.error(err);
    }
  };

  const createBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.createBook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Error al crear el libro');
      await fetchBooks();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear libro');
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async () => {
    if (!editingBook) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.updateBook(editingBook.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Error al actualizar el libro');
      await fetchBooks();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar libro');
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este libro?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.deleteBook(id), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el libro');
      await fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar libro');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setFormData({ title: '', year: new Date().getFullYear() });
    setIsModalOpen(true);
  };

  const openEditModal = (book: BookType) => {
    setEditingBook(book);
    setFormData({ title: book.title, year: book.year });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setFormData({ title: '', year: new Date().getFullYear() });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) updateBook();
    else createBook();
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.year.toString().includes(searchTerm)
  );

  useEffect(() => {
    fetchBooks();
    fetchNombreCompleto();
  }, []);

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-title">
            <Book className="icon" />
            <h1>📚 Biblioteca Digital</h1>
            <span className="developer-name">
              Desarrollado por: {nombreCompleto || 'Wilver De Jesús Abarca Sánchez'}
            </span>
          </div>
          <div className="header-actions">
            <button onClick={openCreateModal} className="add-btn">
              <Plus className="icon-small" /> Agregar Libro
            </button>
          </div>
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar libro por título o año..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error">⚠️ {error}</div>}

        {/* Books */}
        <div className="books-grid">
          {filteredBooks.length === 0 && !loading && (
            <div className="no-books">
              <Book className="icon-large" />
              <p>{searchTerm ? 'No se encontraron libros' : 'No hay libros registrados aún.'}</p>
            </div>
          )}

          {filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              <h3>{book.title}</h3>
              <p>📅 Año: <strong>{book.year}</strong></p>
              <p className="book-id">ID: {book.id}</p>
              <div className="book-actions">
                <button onClick={() => openEditModal(book)} className="btn btn-edit"><Edit className="icon-small" /> Editar</button>
                <button onClick={() => deleteBook(book.id)} className="btn btn-delete"><Trash2 className="icon-small" /> Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="modal-close" onClick={closeModal}><X /></button>
              <h2>{editingBook ? '✏️ Editar Libro' : '📘 Nuevo Libro'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Año de Publicación</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn btn-cancel">Cancelar</button>
                  <button type="submit" className="btn btn-confirm">{editingBook ? 'Actualizar' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
