import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import './styles/index.css';
import AgrupacionCard from './components/AgrupacionCard';
import AgrupacionDetailModal from './components/AgrupacionDetailModal';
import AuthorDetailModal from './components/AuthorDetailModal';
import AgrupacionForm from './components/AgrupacionForm';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Navbar from './components/Navbar';
import ForumList from './components/Forum/ForumList';
import ForumTopic from './components/Forum/ForumTopic';
import Profile from './components/Profile';
import AdminAgrupaciones from './components/Admin/AdminAgrupaciones';
import AdminUsers from './components/Admin/AdminUsers';
import TaskManager from './components/Admin/TaskManager';
import Calendar2026 from './components/Calendar2026';
import Bingo2026 from './components/Bingo2026';
import AboutMe from './components/AboutMe';
import { AuthProvider, useAuth } from './context/AuthContext';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const API_ENDPOINT = `${API_URL}/api/agrupaciones`;

// Hook personalizado para debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function AppContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [agrupaciones, setAgrupaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titleSearch, setTitleSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');

  // Debounce search terms (wait 500ms after typing stops)
  const debouncedTitle = useDebounce(titleSearch, 500);
  const debouncedAuthor = useDebounce(authorSearch, 500);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Start collapsed on mobile devices
    return window.innerWidth <= 768;
  });
  const [selectedAgrupacion, setSelectedAgrupacion] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [selectedLyricIndex, setSelectedLyricIndex] = useState(null);

  // Deep Linking Effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const id = params.get('id');
    const lyricIndex = params.get('lyricIndex');

    if (view === 'agrupacion' && id) {
      // Fetch specific agrupacion
      const fetchDeepLink = async () => {
        try {
          // If we have the token, use it
          const token = localStorage.getItem('token');
          const headers = token ? { 'x-auth-token': token } : {};

          const response = await fetch(`${API_ENDPOINT}/${id}`, { headers });
          if (response.ok) {
            const data = await response.json();
            setSelectedAgrupacion(data);
            if (lyricIndex !== null) {
              setSelectedLyricIndex(parseInt(lyricIndex));
            }
            setCurrentView('collection'); // Switch to collection view to show background
          }
        } catch (error) {
          console.error("Error fetching deep link:", error);
        }
      };

      fetchDeepLink();

      // Clean URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Infinite Scroll Observer
  const observer = useRef();
  const lastAgrupacionElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch data
  const fetchAgrupaciones = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedTitle) params.append('title', debouncedTitle);
      if (debouncedAuthor) params.append('author', debouncedAuthor);
      if (categoryFilter) params.append('category', categoryFilter);
      if (yearFilter) params.append('year', yearFilter);

      // Pagination params
      params.append('page', pageNum);
      params.append('limit', 12);

      // Default sort: year descending (newest first)
      params.append('sort', 'year');
      params.append('order', 'desc');

      const response = await fetch(`${API_ENDPOINT}?${params}`);
      if (!response.ok) throw new Error('Error al cargar los datos');

      const result = await response.json();

      // Handle paginated response
      if (reset) {
        setAgrupaciones(result.data);
      } else {
        setAgrupaciones(prev => [...prev, ...result.data]);
      }

      setTotalItems(result.pagination.total);
      setHasMore(result.pagination.page < result.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters effect
  useEffect(() => {
    setPage(1);
    fetchAgrupaciones(1, true);
  }, [debouncedTitle, debouncedAuthor, categoryFilter, yearFilter]);

  // Load more effect (triggered by page change)
  useEffect(() => {
    if (page > 1) {
      fetchAgrupaciones(page, false);
    }
  }, [page]);

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

      setPage(1);
      await fetchAgrupaciones(1, true);
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete
  const handleDeleteClick = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINT}/${deleteItem._id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setPage(1);
      await fetchAgrupaciones(1, true);
      setDeleteItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // State for curtain animation
  const [curtainAnimating, setCurtainAnimating] = useState(false);

  // Toggle curtains based on current view
  useEffect(() => {
    const showCurtainViews = ['home', 'calendar-2026', 'bingo-2026', 'profile', 'admin-users'];

    if (showCurtainViews.includes(currentView)) {
      // Trigger opening animation when entering any curtain view
      setCurtainAnimating(true);
      document.body.classList.add('curtain-opening');
      setTimeout(() => {
        setCurtainAnimating(false);
        document.body.classList.remove('curtain-opening');
      }, 1200); // Animation duration
      document.body.classList.add('show-curtains');
    } else {
      document.body.classList.remove('show-curtains');
      document.body.classList.remove('curtain-opening');
    }
  }, [currentView]);

  if (authLoading) return <div className="loading">Cargando...</div>;

  return (
    <div className="app">
      {/* Theater Curtain Elements - Show on views with animation */}
      {(['home', 'calendar-2026', 'bingo-2026', 'profile', 'admin-users'].includes(currentView)) && (
        <>
          <div className={`curtain-right ${curtainAnimating ? 'opening' : ''}`}></div>
          <div className="curtain-valance"></div>
        </>
      )}

      <Navbar
        user={user}
        onLogout={logout}
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => setShowLogin(false)}
          onRegisterClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <Register onSuccess={() => {
              setShowRegister(false);
            }} />
            <button className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowRegister(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {currentView === 'home' ? (
        <Home
          onViewChange={setCurrentView}
          onSelectAgrupacion={(agrupacion) => {
            setSelectedAgrupacion(agrupacion);
            setCurrentView('collection');
          }}
        />
      ) : currentView === 'forum' ? (
        selectedTopicId ? (
          <ForumTopic
            topicId={selectedTopicId}
            onBack={() => setSelectedTopicId(null)}
          />
        ) : (
          <ForumList
            onViewChange={setCurrentView}
            onTopicSelect={setSelectedTopicId}
          />
        )
      ) : currentView === 'profile' ? (
        <Profile />
      ) : currentView === 'task-manager' ? (
        <TaskManager />
      ) : currentView === 'admin-agrupaciones' ? (
        <AdminAgrupaciones />
      ) : currentView === 'admin-users' ? (
        <AdminUsers />
      ) : currentView === 'calendar-2026' ? (
        <Calendar2026 />
      ) : currentView === 'bingo-2026' ? (
        <Bingo2026 />
      ) : currentView === 'about' ? (
        <AboutMe />
      ) : (
        <div className="collection-layout">
          {/* Sidebar Overlay for Mobile */}
          {!sidebarCollapsed && (
            <div
              className="sidebar-overlay visible"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Floating Toggle Button (Visible when sidebar is collapsed) */}
          {sidebarCollapsed && (
            <button
              className="floating-sidebar-toggle"
              onClick={() => setSidebarCollapsed(false)}
              title="Mostrar filtros"
            >
              <i className="fas fa-filter"></i>
            </button>
          )}

          {/* Sidebar */}
          <aside className={`filters-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
              <h3><i className="fas fa-filter"></i> Filtros</h3>
              <button
                className="toggle-sidebar-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Expandir" : "Colapsar"}
              >
                <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
              </button>
            </div>

            <div className="sidebar-content">
              <div className="filter-section">
                <label><i className="fas fa-heading"></i> Buscar por Título</label>
                <input
                  type="text"
                  placeholder="Nombre de la agrupación..."
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                />
              </div>

              <div className="filter-section">
                <label><i className="fas fa-user"></i> Buscar por Autor</label>
                <input
                  type="text"
                  placeholder="Nombre del autor..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                />
              </div>

              <div className="filter-section">
                <label><i className="fas fa-tag"></i> Categoría</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">Todas</option>
                  <option value="Comparsa Adultos">Comparsa Adultos</option>
                  <option value="Chirigota Adultos">Chirigota Adultos</option>
                  <option value="Coro Adultos">Coro Adultos</option>
                  <option value="Cuarteto Adultos">Cuarteto Adultos</option>
                  <option value="Murga Adultos">Murga Adultos</option>
                </select>
              </div>

              <div className="filter-section">
                <label><i className="fas fa-calendar"></i> Año</label>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {Array.from({ length: 30 }, (_, i) => 2025 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {user && (
                <button className="btn btn-primary btn-block" onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}>
                  <i className="fas fa-plus"></i> Nueva Agrupación
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="collection-main">
            {error && <div className="error-message">{error}</div>}

            {loading && agrupaciones.length === 0 ? (
              <div className="loading"><i className="fas fa-spinner fa-spin"></i> Cargando...</div>
            ) : (
              <>
                {agrupaciones.length === 0 && !loading && (
                  <div className="empty-state">
                    <div style={{ fontSize: '4rem' }}><i className="fas fa-theater-masks"></i></div>
                    <h2>No hay agrupaciones</h2>
                    <p>Comienza agregando una nueva agrupación</p>
                  </div>
                )}

                {/* Cards Grid */}
                <div className="cards-grid">
                  {agrupaciones.map((item, index) => {
                    if (agrupaciones.length === index + 1) {
                      return (
                        <div ref={lastAgrupacionElementRef} key={item._id}>
                          <AgrupacionCard
                            agrupacion={item}
                            onClick={setSelectedAgrupacion}
                            index={index}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <AgrupacionCard
                          key={item._id}
                          agrupacion={item}
                          onClick={setSelectedAgrupacion}
                          index={index}
                        />
                      );
                    }
                  })}
                </div>

                {/* Loading Indicator for Infinite Scroll */}
                {loading && agrupaciones.length > 0 && (
                  <div style={{ textAlign: 'center', margin: '2rem 0', width: '100%' }}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary-color)' }}></i>
                  </div>
                )}

                {!hasMore && agrupaciones.length > 0 && (
                  <div style={{ textAlign: 'center', margin: '2rem 0', opacity: 0.5 }}>
                    <p>Has llegado al final</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAgrupacion && (
          <AgrupacionDetailModal
            key="agrupacion-modal"
            agrupacion={selectedAgrupacion}
            agrupaciones={agrupaciones}
            initialLyricIndex={selectedLyricIndex}
            onClose={() => {
              setSelectedAgrupacion(null);
              setSelectedLyricIndex(null);
            }}
            onNavigatePrev={() => {
              const currentIndex = agrupaciones.findIndex(a => a._id === selectedAgrupacion._id);
              if (currentIndex > 0) {
                setSelectedLyricIndex(null);
                setSelectedAgrupacion(agrupaciones[currentIndex - 1]);
              }
            }}
            onNavigateNext={() => {
              const currentIndex = agrupaciones.findIndex(a => a._id === selectedAgrupacion._id);
              if (currentIndex < agrupaciones.length - 1) {
                setSelectedLyricIndex(null);
                setSelectedAgrupacion(agrupaciones[currentIndex + 1]);

                // Auto-load more when reaching near the end (last 3 items)
                if (currentIndex >= agrupaciones.length - 4 && hasMore && !loading) {
                  setPage(prevPage => prevPage + 1);
                }
              }
            }}
            onEdit={(item) => {
              setEditingItem(item);
              setShowForm(true);
            }}
            onDelete={(item) => setDeleteItem(item)}
            onAuthorClick={(authorName) => {
              // Find author details from the current agrupacion
              const author = selectedAgrupacion.authors.find(a => a.name === authorName);
              if (author) {
                setSelectedAuthor(author);
              }
            }}
            onRelatedAgrupacionClick={async (name) => {
              // Search for the agrupacion by name
              try {
                const response = await fetch(`${API_URL}/api/agrupaciones?title=${encodeURIComponent(name)}&limit=1`);
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                  // Close current and open the related one
                  setSelectedLyricIndex(null);
                  setSelectedAgrupacion(data.data[0]);
                } else {
                  console.log('Agrupación no encontrada:', name);
                }
              } catch (error) {
                console.error('Error buscando agrupación relacionada:', error);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Author Detail Modal */}
      <AnimatePresence>
        {selectedAuthor && (
          <AuthorDetailModal
            author={selectedAuthor}
            onClose={() => setSelectedAuthor(null)}
            onAgrupacionClick={async (name) => {
              // Search for the agrupacion by name
              try {
                const response = await fetch(`${API_URL}/api/agrupaciones?title=${encodeURIComponent(name)}&limit=1`);
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                  // Close author modal and open agrupacion
                  setSelectedAuthor(null);
                  setSelectedLyricIndex(null);
                  setSelectedAgrupacion(data.data[0]);
                } else {
                  console.log('Agrupación no encontrada:', name);
                }
              } catch (error) {
                console.error('Error buscando agrupación:', error);
              }
            }}
          />
        )}
      </AnimatePresence>

      {showForm && (
        <AgrupacionForm
          key={editingItem?._id || 'new'}
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
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteItem(null)}
        />
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
