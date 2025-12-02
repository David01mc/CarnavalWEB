import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ onViewChange, onLoginClick, currentView }) {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleNavigation = (view) => {
        onViewChange(view);
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => handleNavigation('home')}>
                <i className="fas fa-theater-masks"></i>
                <span>Carnaval de Cádiz</span>
            </div>

            <div className="navbar-actions">
                {user && (
                    <span className="user-info-nav">
                        <i className="fas fa-user-circle"></i> {user.username}
                    </span>
                )}

                <button
                    className="hamburger-menu"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            {/* Dropdown Menu */}
            <div className={`dropdown-menu ${menuOpen ? 'open' : ''}`}>
                <div className="dropdown-header">
                    <h3>Menú</h3>
                    <button className="close-dropdown" onClick={() => setMenuOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="dropdown-content">
                    <button
                        className={`dropdown-item ${currentView === 'home' ? 'active' : ''}`}
                        onClick={() => handleNavigation('home')}
                    >
                        <i className="fas fa-home"></i>
                        <span>Inicio</span>
                    </button>

                    <button
                        className={`dropdown-item ${currentView === 'collection' ? 'active' : ''}`}
                        onClick={() => handleNavigation('collection')}
                    >
                        <i className="fas fa-database"></i>
                        <span>Colección de Datos</span>
                    </button>

                    <button
                        className={`dropdown-item ${currentView === 'forum' ? 'active' : ''}`}
                        onClick={() => handleNavigation('forum')}
                    >
                        <i className="fas fa-comments"></i>
                        <span>Foro</span>
                    </button>

                    <div className="dropdown-divider"></div>

                    {user ? (
                        <>
                            <button
                                className={`dropdown-item ${currentView === 'profile' ? 'active' : ''}`}
                                onClick={() => handleNavigation('profile')}
                            >
                                <i className="fas fa-user-circle"></i>
                                <span>Mi Perfil</span>
                            </button>

                            <button
                                className="dropdown-item logout-item"
                                onClick={() => {
                                    logout();
                                    setMenuOpen(false);
                                }}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Cerrar Sesión</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                onLoginClick();
                                setMenuOpen(false);
                            }}
                        >
                            <i className="fas fa-sign-in-alt"></i>
                            <span>Iniciar Sesión</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Overlay when menu is open */}
            {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
        </nav>
    );
}

export default Navbar;
