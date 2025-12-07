import { useState, useEffect } from 'react';
import FeaturedAgrupacion from './FeaturedAgrupacion';
import InstagramFeed from './InstagramFeed';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const API_ENDPOINT = `${API_URL}/api/agrupaciones`;

function Home() {
  const [featuredAgrupacion, setFeaturedAgrupacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAgrupacion();
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
      {/* Confetti Effect on Laterals - Only on page load */}
      <div className="confetti-container">
        {/* Left side confetti - 6 pieces */}
        <div className="confetti confetti-left-1"></div>
        <div className="confetti confetti-left-2"></div>
        <div className="confetti confetti-left-3"></div>
        <div className="confetti confetti-left-4"></div>
        <div className="confetti confetti-left-5"></div>
        <div className="confetti confetti-left-6"></div>

        {/* Right side confetti - 6 pieces */}
        <div className="confetti confetti-right-1"></div>
        <div className="confetti confetti-right-2"></div>
        <div className="confetti confetti-right-3"></div>
        <div className="confetti confetti-right-4"></div>
        <div className="confetti confetti-right-5"></div>
        <div className="confetti confetti-right-6"></div>
      </div>

      {/* Featured Agrupación of the Day - FIRST */}
      <section className="featured-section-main">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Cargando agrupación del día...
          </div>
        ) : featuredAgrupacion ? (
          <FeaturedAgrupacion agrupacion={featuredAgrupacion} />
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
      <InstagramFeed />
    </div>
  );
}

export default Home;
