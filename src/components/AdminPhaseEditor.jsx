import { useState, useEffect } from 'react';
import '../styles/components/admin-phase-editor.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

function AdminPhaseEditor({ selectedDate, selectedPhase, onAgrupacionAdded, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allAgrupaciones, setAllAgrupaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all agrupaciones on mount for preview
    useEffect(() => {
        const loadAllAgrupaciones = async () => {
            try {
                const response = await fetch(`${API_URL}/api/preliminares2026`);
                if (!response.ok) throw new Error('Error loading agrupaciones');
                const data = await response.json();
                // Filter only Preliminares with valid tipo and sort alphabetically
                const preliminares = data
                    .filter(ag => ag.fase === 'Preliminares' && ag.tipo && ag.tipo !== 'N/A')
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));
                setAllAgrupaciones(preliminares);
                setSearchResults(preliminares.slice(0, 20)); // Show first 20
            } catch (err) {
                console.error('Error loading agrupaciones:', err);
            }
        };
        loadAllAgrupaciones();
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            // Show alphabetical preview when no search
            setSearchResults(allAgrupaciones.slice(0, 20));
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
    }, [searchQuery, allAgrupaciones]);

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
                            <div
                                key={agrupacion._id}
                                className="search-result-item"
                                onClick={() => handleAddAgrupacion(agrupacion)}
                                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                <span className={`result-type ${agrupacion.tipo?.toLowerCase()}`}>
                                    {agrupacion.tipo}
                                </span>
                                <div className="result-name">{agrupacion.nombre}</div>
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
