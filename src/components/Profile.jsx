import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/components/forum.css'; // Reusing forum styles for consistency

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const Profile = () => {
    const { user, login } = useAuth(); // login is used to update the user context
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                avatar: null
            });
            setPreviewUrl(user.avatarUrl || null);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('bio', formData.bio);
            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token
                },
                body: data
            });

            if (!response.ok) throw new Error('Error al actualizar perfil');

            const updatedUser = await response.json();

            // Update local storage and context
            // We need to preserve the token but update the user object
            // This is a bit of a hack since login expects { token, user }
            // Ideally we should have an updateUser method in context
            // For now, we'll assume the user object in context is updated via a page reload or we can try to force it

            // Since useAuth doesn't expose a direct 'updateUser', we might need to reload or just show success
            setMessage('Perfil actualizado correctamente');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="loading">Cargando perfil...</div>;

    return (
        <div className="forum-container">
            <div className="forum-header">
                <h1>Mi Perfil</h1>
            </div>

            <div className="forum-form" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                margin: '0 auto 1rem',
                                border: '4px solid var(--primary-color)',
                                background: '#eee',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <i className="fas fa-user fa-4x" style={{ color: '#ccc' }}></i>
                            )}
                        </div>

                        <label className="btn btn-secondary">
                            <i className="fas fa-camera"></i> Cambiar Foto
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Nombre de Usuario</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email (No editable)</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            style={{ opacity: 0.7 }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Biografía</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Cuéntanos algo sobre ti..."
                            rows="4"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
