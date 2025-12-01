import { useState, useEffect } from 'react';
import AgrupacionCard from './AgrupacionCard';

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
            const response = await fetch(API_ENDPOINT);
            if (!response.ok) throw new Error('Error al cargar los datos');

            const data = await response.json();

            // Select a random agrupación as "featured of the day"
            // In production, you could use a date-based selection or backend logic
            if (data.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.length);
                setFeaturedAgrupacion(data[randomIndex]);
            }
        } catch (err) {
            console.error('Error fetching featured agrupación:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
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

            {/* Featured Agrupación of the Day */}
            <section className="featured-section">
                <div className="section-header">
                    <h2>
                        <i className="fas fa-star"></i> Agrupación del Día
                    </h2>
                    <p className="section-subtitle">Descubre cada día una nueva agrupación destacada</p>
                </div>

                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i> Cargando agrupación del día...
                    </div>
                ) : featuredAgrupacion ? (
                    <div className="featured-card-container">
                        <AgrupacionCard
                            agrupacion={featuredAgrupacion}
                            onEdit={null}
                            onDelete={null}
                        />
                    </div>
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
        </div>
    );
}

export default Home;
