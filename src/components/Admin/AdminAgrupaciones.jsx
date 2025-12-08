import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AgrupacionForm from '../AgrupacionForm';
import '../../styles/components/admin.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const AdminAgrupaciones = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState({ type: '', text: '' });

    // Search/Edit State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [editingAgrupacion, setEditingAgrupacion] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const searchAgrupaciones = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/agrupaciones?title=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectForEdit = (agrupacion) => {
        setEditingAgrupacion(agrupacion);
        setShowForm(true);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleCreateNew = () => {
        setEditingAgrupacion(null);
        setShowForm(true);
    };

    const handleSave = async (formData) => {
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const url = editingAgrupacion
                ? `${API_URL}/api/agrupaciones/${editingAgrupacion._id}`
                : `${API_URL}/api/agrupaciones`;

            const method = editingAgrupacion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al guardar la agrupación');

            setMessage({
                type: 'success',
                text: editingAgrupacion ? 'Agrupación actualizada correctamente' : 'Agrupación creada correctamente'
            });

            setShowForm(false);
            setEditingAgrupacion(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingAgrupacion(null);
    };

    if (!user || user.role !== 'admin') {
        return <div className="admin-container">Acceso denegado</div>;
    }

    return (
        <div className="admin-container animate-fade-in">
            <div className="admin-header">
                <h1><i className="fas fa-crown"></i> Gestión de Agrupaciones</h1>
                <p>Busca para editar o crea una nueva agrupación con el formulario completo</p>
            </div>

            <div className="admin-content">
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Search Section */}
                <div className="search-section">
                    <h3><i className="fas fa-search"></i> Buscar para Editar</h3>
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Escribe el nombre de la agrupación..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                searchAgrupaciones(e.target.value);
                            }}
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map(result => (
                                <div
                                    key={result._id}
                                    className="search-result-item"
                                    onClick={() => handleSelectForEdit(result)}
                                >
                                    <div className="result-info">
                                        <strong>{result.name}</strong>
                                        <span>{result.year} - {result.category}</span>
                                    </div>
                                    <button className="btn-edit-action">
                                        <i className="fas fa-edit"></i> Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <hr className="admin-divider" />

                {/* Create New Button */}
                <div className="form-section">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleCreateNew}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                    >
                        <i className="fas fa-plus-circle"></i> Crear Nueva Agrupación
                    </button>
                </div>
            </div>

            {/* Use the full AgrupacionForm modal */}
            {showForm && (
                <AgrupacionForm
                    initialData={editingAgrupacion}
                    onSave={handleSave}
                    onCancel={handleCancelForm}
                />
            )}
        </div>
    );
};

export default AdminAgrupaciones;
