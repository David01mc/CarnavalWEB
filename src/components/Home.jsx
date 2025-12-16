import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import FeaturedAgrupacion from './FeaturedAgrupacion';
import InstagramFeed from './InstagramFeed';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const API_ENDPOINT = `${API_URL}/api/agrupaciones`;

function Home({ onViewChange, onSelectAgrupacion }) {
  const [featuredAgrupacion, setFeaturedAgrupacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAgrupacion();

    // Trigger confetti falling from both sides
    const duration = 6 * 1000; // 6 seconds
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 5;

      // Left side confetti - falling down
      confetti({
        particleCount,
        startVelocity: 15,
        spread: 45,
        angle: 270, // Straight down
        origin: { x: 0.05, y: 0 }, // Top left
        colors: ['#FFD700', '#FF1493', '#00CED1', '#FF6347', '#32CD32', '#FFA500', '#9370DB', '#FF69B4'],
        ticks: 300, // Longer life to reach bottom
        gravity: 0.8,
        scalar: 1.2,
        drift: 0.2,
        zIndex: 1003
      });

      // Right side confetti - falling down
      confetti({
        particleCount,
        startVelocity: 15,
        spread: 45,
        angle: 270, // Straight down
        origin: { x: 0.95, y: 0 }, // Top right
        colors: ['#FFD700', '#FF1493', '#00CED1', '#FF6347', '#32CD32', '#FFA500', '#9370DB', '#FF69B4'],
        ticks: 300, // Longer life to reach bottom
        gravity: 0.8,
        scalar: 1.2,
        drift: 0.2,
        zIndex: 1003
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedAgrupacion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/agrupaciones/featured`);
      if (!response.ok) throw new Error('Error al cargar los datos');

      const data = await response.json();

      // Set the featured agrupación from the response
      setFeaturedAgrupacion(data.agrupacion);
    } catch (err) {
      console.error('Error fetching featured agrupación:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Featured Agrupación of the Day - FIRST */}
      <section className="featured-section-main">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Cargando agrupación del día...
          </div>
        ) : featuredAgrupacion ? (
          <FeaturedAgrupacion
            agrupacion={featuredAgrupacion}
            onClick={() => onSelectAgrupacion && onSelectAgrupacion(featuredAgrupacion)}
          />
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '4rem' }}>
              <i className="fas fa-theater-masks"></i>
            </div>
            <h3>No hay agrupaciones disponibles</h3>
            <p>Agrega algunas agrupaciones para ver la destacada del día</p>
          </div>
        )}
      </section>

      {/* Quick Navigation Cards */}
      <section className="quick-nav-section">
        <div className="quick-nav-grid">
          <button
            className="quick-nav-card letras"
            onClick={() => onViewChange && onViewChange('collection')}
          >
            <div className="quick-nav-icon">
              <i className="fas fa-music"></i>
            </div>
            <div className="quick-nav-content">
              <h3>Letras</h3>
              <p>Explora la colección completa</p>
            </div>
            <div className="quick-nav-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>

          <button
            className="quick-nav-card calendario"
            onClick={() => onViewChange && onViewChange('calendar-2026')}
          >
            <div className="quick-nav-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="quick-nav-content">
              <h3>Calendario 2026</h3>
              <p>Programa del concurso</p>
            </div>
            <div className="quick-nav-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>

          <button
            className="quick-nav-card foro"
            onClick={() => onViewChange && onViewChange('forum')}
          >
            <div className="quick-nav-icon">
              <i className="fas fa-comments"></i>
            </div>
            <div className="quick-nav-content">
              <h3>Foro</h3>
              <p>Únete a la conversación</p>
            </div>
            <div className="quick-nav-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>

          <button
            className="quick-nav-card ia wip"
            disabled
          >
            <div className="wip-badge">Próximamente</div>
            <div className="quick-nav-icon">
              <i className="fas fa-robot"></i>
            </div>
            <div className="quick-nav-content">
              <h3>IA Carnavalera</h3>
              <p>En desarrollo...</p>
            </div>
            <div className="quick-nav-arrow">
              <i className="fas fa-hourglass-half"></i>
            </div>
          </button>
        </div>
      </section>

      {/* Hero Section - Carnaval Introduction */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <i className="fas fa-theater-masks"></i>
          </div>
          <h1 className="hero-title">El Carnaval de Cádiz</h1>
          <div className="hero-text">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      {/* <InstagramFeed /> */}
    </div>
  );
}

export default Home;
