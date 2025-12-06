import { useState, useEffect } from 'react';
import '../styles/components/admin-phase-editor.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

function AdminPhaseEditor({ selectedDate, selectedPhase, onAgrupacionAdded, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/preliminares2026/search?q=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) throw new Error('Error searching agrupaciones');
                const data = await response.json();
                setSearchResults(data);
            } catch (err) {
                setError(err.message);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAddAgrupacion = async (agrupacion) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/preliminares2026/add-to-phase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agrupacionId: agrupacion._id,
                    fecha: selectedDate,
                    fase: selectedPhase
                })
            });

            if (!response.ok) throw new Error('Error adding agrupación');

            const newAgrupacion = await response.json();
            onAgrupacionAdded(newAgrupacion);
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-phase-editor">
            <div className="editor-header">
                <h3>Agregar Agrupación</h3>
                <button className="close-editor-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar agrupación por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {loading && <i className="fas fa-spinner fa-spin loading-icon"></i>}
                </div>

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((agrupacion) => (
                            <div key={agrupacion._id} className="search-result-item">
                                <div className="result-info">
                                    <div className="result-name">{agrupacion.nombre}</div>
                                    <div className="result-meta">
                                        <span className={`result-type ${agrupacion.tipo?.toLowerCase()}`}>
                                            {agrupacion.tipo}
                                        </span>
                                        <span className="result-location">
                                            <i className="fas fa-map-marker-alt"></i> {agrupacion.localidad}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="add-btn"
                                    onClick={() => handleAddAgrupacion(agrupacion)}
                                    disabled={loading}
                                >
                                    <i className="fas fa-plus"></i> Agregar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {searchQuery.trim().length >= 2 && !loading && searchResults.length === 0 && (
                    <div className="no-results">
                        <i className="fas fa-search"></i>
                        <p>No se encontraron agrupaciones</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPhaseEditor;
