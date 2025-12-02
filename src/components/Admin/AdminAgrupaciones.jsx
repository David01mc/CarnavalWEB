import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/admin.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const AdminAgrupaciones = () => {
    // Force update
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const initialFormState = {
        name: '',
        author: '', // We'll convert this to authors array on submit
        year: new Date().getFullYear(),
        category: 'Comparsa Adultos',
        city: 'Cádiz',
        callejera: 'No',
        descripcion: '',
        tipo: '' // Costume description
    };
    const [formData, setFormData] = useState(initialFormState);

    // Edit Mode State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${API_URL}/api/agrupaciones/${editingId}`
                : `${API_URL}/api/agrupaciones`;

            const method = editingId ? 'PUT' : 'POST';

            // Format data for backend
            const payload = {
                ...formData,
                authors: [{ name: formData.author, role: 'Autor' }] // Simple author handling for now
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error al guardar la agrupación');

            setMessage({
                type: 'success',
                text: editingId ? 'Agrupación actualizada correctamente' : 'Agrupación creada correctamente'
            });

            if (!editingId) {
                setFormData(initialFormState);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const searchAgrupaciones = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/agrupaciones?title=${query}`);
            const data = await response.json();
            setSearchResults(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectForEdit = (agrupacion) => {
        setEditingId(agrupacion._id);
        setFormData({
            name: agrupacion.name,
            author: agrupacion.authors?.[0]?.name || '',
            year: agrupacion.year,
            category: agrupacion.category,
            city: agrupacion.city || 'Cádiz',
            callejera: agrupacion.callejera || 'No',
            descripcion: agrupacion.descripcion || '',
            tipo: agrupacion.tipo || ''
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    if (!user || user.role !== 'admin') {
        return <div className="admin-container">Acceso denegado</div>;
    }

    return (
        <div className="admin-container animate-fade-in">
            <div className="admin-header">
                <h1><i className="fas fa-crown"></i> Gestión de Agrupaciones</h1>
                <p>Añade o edita las agrupaciones del Carnaval</p>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('create');
                        setEditingId(null);
                        setFormData(initialFormState);
                        setMessage({ type: '', text: '' });
                    }}
                >
                    <i className="fas fa-plus-circle"></i> Crear Nueva
                </button>
                <button
                    className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('edit');
                        setMessage({ type: '', text: '' });
                    }}
                >
                    <i className="fas fa-edit"></i> Editar Existente
                </button>
            </div>

            <div className="admin-content">
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'edit' && !editingId && (
                    <div className="search-section">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Buscar agrupación para editar..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    searchAgrupaciones(e.target.value);
                                }}
                            />
                        </div>
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
                    </div>
                )}

                {(activeTab === 'create' || editingId) && (
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre de la Agrupación</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ej: Los Carnívales"
                                />
                            </div>
                            <div className="form-group">
                                <label>Año</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Autor Principal</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ej: Martínez Ares"
                                />
                            </div>
                            <div className="form-group">
                                <label>Modalidad</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="Comparsa Adultos">Comparsa Adultos</option>
                                    <option value="Chirigota Adultos">Chirigota Adultos</option>
                                    <option value="Coro Adultos">Coro Adultos</option>
                                    <option value="Cuarteto Adultos">Cuarteto Adultos</option>
                                    <option value="Murga Adultos">Murga Adultos</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Localidad</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>¿Es Callejera?</label>
                                <select
                                    name="callejera"
                                    value={formData.callejera}
                                    onChange={handleInputChange}
                                >
                                    <option value="No">No (Concurso)</option>
                                    <option value="Si">Sí (Callejera)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tipo (Disfraz)</label>
                            <input
                                type="text"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                placeholder="Descripción breve del disfraz"
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción / Historia</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Cuenta algo sobre esta agrupación..."
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setEditingId(null);
                                        setActiveTab('edit');
                                        setMessage({ type: '', text: '' });
                                    }}
                                >
                                    Cancelar Edición
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Guardar Cambios' : 'Crear Agrupación'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminAgrupaciones;
