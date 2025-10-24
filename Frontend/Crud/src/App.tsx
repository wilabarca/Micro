import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Book, Search } from 'lucide-react';

// Tipos
interface BookType {
  id: number;
  title: string;
  year: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ApiResponse {
  message?: string;
  book?: BookType;
  error?: string;
}

// Configuración de la API
const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
  getAllBooks: `${API_BASE_URL}/books`,
  getBookById: (id: number) => `${API_BASE_URL}/books/${id}`,
  createBook: `${API_BASE_URL}/books`,
  updateBook: (id: number) => `${API_BASE_URL}/books/${id}`,
  deleteBook: (id: number) => `${API_BASE_URL}/books/${id}`,
};

const App: React.FC = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
  });

  // Obtener todos los libros
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

  // Crear libro
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

  // Actualizar libro
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

  // Eliminar libro
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

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingBook(null);
    setFormData({ title: '', year: new Date().getFullYear() });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (book: BookType) => {
    setEditingBook(book);
    setFormData({ title: book.title, year: book.year });
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setFormData({ title: '', year: new Date().getFullYear() });
    setError(null);
  };

  // Submit del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateBook();
    } else {
      createBook();
    }
  };

  // Filtrar libros por búsqueda
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.year.toString().includes(searchTerm)
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Book className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Biblioteca de Libros</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Libro
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título o año..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📡 Endpoints de la API</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-start gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">GET</span>
              <span className="text-gray-600">{API_ENDPOINTS.getAllBooks}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">GET</span>
              <span className="text-gray-600">{API_BASE_URL}/books/:id</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">POST</span>
              <span className="text-gray-600">{API_ENDPOINTS.createBook}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">PUT</span>
              <span className="text-gray-600">{API_BASE_URL}/books/:id</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">DELETE</span>
              <span className="text-gray-600">{API_BASE_URL}/books/:id</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No se encontraron libros' : 'No hay libros registrados'}
                </p>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
                      <p className="text-gray-600">Año: {book.year}</p>
                      <p className="text-gray-400 text-sm mt-1">ID: {book.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(book)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingBook ? 'Editar Libro' : 'Nuevo Libro'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Don Quijote de la Mancha"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Año de Publicación
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.title}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingBook ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;