import { useState, useEffect } from 'react';
import './index.css';
import AgrupacionCard from './components/AgrupacionCard';
import AgrupacionForm from './components/AgrupacionForm';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const API_ENDPOINT = `${API_URL}/api/agrupaciones`;

function AppContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const [agrupaciones, setAgrupaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Fetch data
  const fetchAgrupaciones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (yearFilter) params.append('year', yearFilter);

      const response = await fetch(`${API_ENDPOINT}?${params}`);
      if (!response.ok) throw new Error('Error al cargar los datos');

      const data = await response.json();
      setAgrupaciones(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgrupaciones();
  }, [searchTerm, categoryFilter, yearFilter]);

  // Create or Update
  const handleSave = async (formData) => {
    try {
      const url = editingItem ? `${API_ENDPOINT}/${editingItem._id}` : API_ENDPOINT;
      const method = editingItem ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');

      await fetchAgrupaciones();
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_ENDPOINT}/${deleteItem._id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Error al eliminar');

      await fetchAgrupaciones();
      setDeleteItem(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Get unique categories and years
  const categories = [...new Set(agrupaciones.map(a => a.category))].filter(Boolean);
  const years = [...new Set(agrupaciones.map(a => a.year))].filter(Boolean).sort().reverse();

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1><i className="fas fa-theater-masks"></i> Gestión de Carnaval</h1>
          <p>Sistema de administración de agrupaciones y letras</p>
        </div>
        <div className="auth-section">
          {user ? (
            <>
              <span className="user-info">
                <i className="fas fa-user-circle"></i> {user.username}
              </span>
              <button className="btn btn-secondary btn-small" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-small" onClick={() => setShowLogin(true)}>
              <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      <div className="controls">
        <div className="search-box">
          <span className="search-icon"><i className="fas fa-search"></i></span>
          <input
            type="text"
            placeholder="Buscar por nombre o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {user && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            <i className="fas fa-plus"></i> Nueva Agrupación
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="loading"><i className="fas fa-spinner fa-spin"></i> Cargando...</div>
      ) : agrupaciones.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '4rem' }}><i className="fas fa-theater-masks"></i></div>
          <h2>No hay agrupaciones</h2>
          <p>Comienza agregando una nueva agrupación</p>
        </div>
      ) : (
        <div className="cards-grid">
          {agrupaciones.map(agrupacion => (
            <AgrupacionCard
              key={agrupacion._id}
              agrupacion={agrupacion}
              onEdit={() => {
                setEditingItem(agrupacion);
                setShowForm(true);
              }}
              onDelete={() => setDeleteItem(agrupacion)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AgrupacionForm
          initialData={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          item={deleteItem}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
