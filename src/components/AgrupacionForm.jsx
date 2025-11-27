import { useState } from 'react';

function AgrupacionForm({ initialData, onSave, onCancel }) {
    const [formData, setFormData] = useState(() => {
        // Ensure all fields have default values, even if initialData is missing them
        const defaults = {
            name: '',
            category: '',
            year: '',
            author: '',
            link: '',
            image: '',
            posición: '',
            callejera: 'No',
            descripcion: '',
            caracteristicas: [],
            componentes: [],
            authors: [],
            lyrics: [],
            youtube: [],
            spotify: []
        };

        // Merge initialData with defaults, ensuring arrays are never undefined
        if (initialData) {
            return {
                ...defaults,
                ...initialData,
                callejera: initialData.callejera || 'No',
                descripcion: initialData.descripcion || '',
                caracteristicas: initialData.caracteristicas || [],
                componentes: initialData.componentes || [],
                authors: initialData.authors || [],
                lyrics: initialData.lyrics || [],
                youtube: initialData.youtube || [],
                spotify: initialData.spotify || []
            };
        }

        return defaults;
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Authors management
    const addAuthor = () => {
        setFormData(prev => ({
            ...prev,
            authors: [...prev.authors, { name: '', role: '', image: '', link: '' }]
        }));
    };

    const updateAuthor = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            authors: prev.authors.map((author, i) =>
                i === index ? { ...author, [field]: value } : author
            )
        }));
    };

    const removeAuthor = (index) => {
        setFormData(prev => ({
            ...prev,
            authors: prev.authors.filter((_, i) => i !== index)
        }));
    };

    // Lyrics management
    const addLyric = () => {
        setFormData(prev => ({
            ...prev,
            lyrics: [...prev.lyrics, {
                title: '',
                type: '',
                views: '0',
                url: '',
                content: '',
                features: [],
                last_modification: new Date().toLocaleString('es-ES')
            }]
        }));
    };

    const updateLyric = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            lyrics: prev.lyrics.map((lyric, i) =>
                i === index ? { ...lyric, [field]: value } : lyric
            )
        }));
    };

    // Lyric features management
    const addLyricFeature = (lyricIndex) => {
        setFormData(prev => ({
            ...prev,
            lyrics: prev.lyrics.map((lyric, i) =>
                i === lyricIndex ? { ...lyric, features: [...(lyric.features || []), ''] } : lyric
            )
        }));
    };

    const updateLyricFeature = (lyricIndex, featureIndex, value) => {
        setFormData(prev => ({
            ...prev,
            lyrics: prev.lyrics.map((lyric, i) =>
                i === lyricIndex ? {
                    ...lyric,
                    features: (lyric.features || []).map((f, fi) => fi === featureIndex ? value : f)
                } : lyric
            )
        }));
    };

    const removeLyricFeature = (lyricIndex, featureIndex) => {
        setFormData(prev => ({
            ...prev,
            lyrics: prev.lyrics.map((lyric, i) =>
                i === lyricIndex ? {
                    ...lyric,
                    features: (lyric.features || []).filter((_, fi) => fi !== featureIndex)
                } : lyric
            )
        }));
    };

    const removeLyric = (index) => {
        setFormData(prev => ({
            ...prev,
            lyrics: prev.lyrics.filter((_, i) => i !== index)
        }));
    };

    // Array field management (youtube, spotify)
    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const updateArrayItem = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? '✏️ Editar Agrupación' : '➕ Nueva Agrupación'}</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>📋 Información Básica</h3>

                        <div className="form-group">
                            <label>Nombre *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoría</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="Ej: Chirigota Adultos"
                                />
                            </div>

                            <div className="form-group">
                                <label>Año</label>
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="2025"
                                />
                            </div>

                            <div className="form-group">
                                <label>Posición</label>
                                <input
                                    type="text"
                                    name="posición"
                                    value={formData.posición}
                                    onChange={handleChange}
                                    placeholder="Ej: 1er Premio"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Autor (campo legacy)</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Link</label>
                                <input
                                    type="url"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Imagen URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* New Fields */}
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                            🎪 Información Adicional
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Callejera</label>
                                <select
                                    name="callejera"
                                    value={formData.callejera}
                                    onChange={handleChange}
                                >
                                    <option value="No">No</option>
                                    <option value="Sí">Sí</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Descripción de la Agrupación</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe la agrupación..."
                            />
                        </div>

                        {/* Características */}
                        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                            ⭐ Características Principales
                        </h4>

                        <div className="array-field">
                            {formData.caracteristicas.map((caracteristica, index) => (
                                <div key={index} className="array-item">
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeArrayItem('caracteristicas', index)}
                                    >
                                        ×
                                    </button>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={caracteristica}
                                            onChange={(e) => updateArrayItem('caracteristicas', index, e.target.value)}
                                            placeholder={`Característica ${index + 1}`}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="btn btn-secondary" onClick={() => addArrayItem('caracteristicas')}>
                                ➕ Añadir Característica
                            </button>
                        </div>

                        {/* Componentes */}
                        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                            👥 Componentes de la Agrupación
                        </h4>

                        <div className="array-field">
                            {formData.componentes.map((componente, index) => (
                                <div key={index} className="array-item">
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeArrayItem('componentes', index)}
                                    >
                                        ×
                                    </button>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={componente}
                                            onChange={(e) => updateArrayItem('componentes', index, e.target.value)}
                                            placeholder="Nombre del componente"
                                        />
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="btn btn-secondary" onClick={() => addArrayItem('componentes')}>
                                ➕ Añadir Componente
                            </button>
                        </div>

                        {/* Authors */}
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                            ✍️ Autores
                        </h3>

                        <div className="array-field">
                            {formData.authors.map((author, index) => (
                                <div key={index} className="array-item">
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeAuthor(index)}
                                    >
                                        ×
                                    </button>

                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            value={author.name}
                                            onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Rol</label>
                                        <input
                                            type="text"
                                            value={author.role}
                                            onChange={(e) => updateAuthor(index, 'role', e.target.value)}
                                            placeholder="Ej: Autor de letra y música"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Descripción del Autor</label>
                                        <textarea
                                            value={author.descripcion || ''}
                                            onChange={(e) => updateAuthor(index, 'descripcion', e.target.value)}
                                            rows="3"
                                            placeholder="Breve descripción del autor, su estilo, trayectoria..."
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Imagen URL</label>
                                            <input
                                                type="url"
                                                value={author.image}
                                                onChange={(e) => updateAuthor(index, 'image', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Link</label>
                                            <input
                                                type="url"
                                                value={author.link}
                                                onChange={(e) => updateAuthor(index, 'link', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="btn btn-secondary" onClick={addAuthor}>
                                ➕ Añadir Autor
                            </button>
                        </div>

                        {/* Lyrics */}
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                            🎵 Letras
                        </h3>

                        <div className="array-field">
                            {formData.lyrics.map((lyric, index) => (
                                <div key={index} className="array-item">
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeLyric(index)}
                                    >
                                        ×
                                    </button>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Título</label>
                                            <input
                                                type="text"
                                                value={lyric.title}
                                                onChange={(e) => updateLyric(index, 'title', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Tipo</label>
                                            <input
                                                type="text"
                                                value={lyric.type}
                                                onChange={(e) => updateLyric(index, 'type', e.target.value)}
                                                placeholder="Ej: Pasodoble"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Vistas</label>
                                            <input
                                                type="text"
                                                value={lyric.views}
                                                onChange={(e) => updateLyric(index, 'views', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>URL</label>
                                            <input
                                                type="url"
                                                value={lyric.url}
                                                onChange={(e) => updateLyric(index, 'url', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Contenido</label>
                                        <textarea
                                            value={lyric.content}
                                            onChange={(e) => updateLyric(index, 'content', e.target.value)}
                                            rows="6"
                                        />
                                    </div>

                                    {/* Features de la letra */}
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                                        <h5 style={{ marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.95rem' }}>
                                            🏷️ Features/Palabras Clave
                                        </h5>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {(lyric.features || []).map((feature, fIndex) => (
                                                <div key={fIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(e) => updateLyricFeature(index, fIndex, e.target.value)}
                                                        placeholder={`Palabra ${fIndex + 1}`}
                                                        style={{ width: '120px', padding: '0.4rem', fontSize: '0.9rem' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLyricFeature(index, fIndex)}
                                                        style={{
                                                            background: 'var(--error)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            width: '24px',
                                                            height: '24px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-small"
                                            onClick={() => addLyricFeature(index)}
                                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            ➕ Añadir Feature
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="btn btn-secondary" onClick={addLyric}>
                                ➕ Añadir Letra
                            </button>
                        </div>

                        {/* YouTube Links */}
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                            📺 YouTube
                        </h3>

                        <div className="array-field">
                            {formData.youtube.map((link, index) => (
                                <div key={index} className="array-item">
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeArrayItem('youtube', index)}
                                    >
                                        ×
                                    </button>
                                    <div className="form-group">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateArrayItem('youtube', index, e.target.value)}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="btn btn-secondary" onClick={() => addArrayItem('youtube')}>
                                ➕ Añadir YouTube
                            </button>
                        </div>

                        {/* Spotify Links */}
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                            🎧 Spotify
                        </h3>

                        <div className="array-field">
                            {formData.spotify.map((link, index) => (
                                <div key={index} className="array-item">
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeArrayItem('spotify', index)}
                                    >
                                        ×
                                    </button>
                                    <div className="form-group">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateArrayItem('spotify', index, e.target.value)}
                                            placeholder="https://spotify.com/..."
                                        />
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="btn btn-secondary" onClick={() => addArrayItem('spotify')}>
                                ➕ Añadir Spotify
                            </button>
                        </div>

                        {/* Form Actions */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '2px solid var(--border)'
                        }}>
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                                💾 Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AgrupacionForm;
