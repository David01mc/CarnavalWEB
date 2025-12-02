import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/forum.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const ForumList = ({ onViewChange, onTopicSelect }) => {
    const { user } = useAuth();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTopic, setNewTopic] = useState({ title: '', content: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const response = await fetch(`${API_URL}/api/forum/topics`);
            if (!response.ok) throw new Error('Error al cargar temas');
            const data = await response.json();
            setTopics(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/forum/topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newTopic)
            });

            if (!response.ok) throw new Error('Error al crear tema');

            const createdTopic = await response.json();
            setTopics([createdTopic, ...topics]);
            setShowCreateForm(false);
            setNewTopic({ title: '', content: '' });
            // Navigate to the new topic
            onTopicSelect(createdTopic._id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteTopic = async (topicId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/forum/topics/${topicId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) throw new Error('Error al borrar tema');

            setTopics(topics.filter(t => t._id !== topicId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Cargando foro...</div>;

    return (
        <div className="forum-container">
            <div className="forum-header">
                <div>
                    <h1>Foro de Carnaval</h1>
                    <p>Debate sobre agrupaciones, noticias y rumores</p>
                </div>
                {user && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        <i className="fas fa-plus"></i> Nuevo Tema
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {showCreateForm && (
                <div className="forum-form animate-fade-in">
                    <h3>Crear Nuevo Tema</h3>
                    <form onSubmit={handleCreateTopic}>
                        <div className="form-group">
                            <label>Título</label>
                            <input
                                type="text"
                                value={newTopic.title}
                                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                placeholder="¿Qué opinas sobre...?"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mensaje Inicial</label>
                            <textarea
                                value={newTopic.content}
                                onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                                placeholder="Escribe tu mensaje aquí..."
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Publicar Tema
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="topics-list">
                {topics.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-comments fa-3x"></i>
                        <h3>No hay temas todavía</h3>
                        <p>¡Sé el primero en iniciar una conversación!</p>
                    </div>
                ) : (
                    topics.map(topic => (
                        <div
                            key={topic._id}
                            className="topic-card"
                            onClick={() => onTopicSelect(topic._id)}
                        >
                            <div className="topic-main-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3>{topic.title}</h3>
                                    {user && (user.role === 'admin' || user._id === topic.author.id) && (
                                        <button
                                            className="btn btn-danger btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('¿Estás seguro de que quieres borrar este tema?')) {
                                                    handleDeleteTopic(topic._id);
                                                }
                                            }}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginLeft: '1rem' }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="topic-meta">
                                    <span>
                                        <i className="fas fa-user"></i> {topic.author.username}
                                    </span>
                                    <span>
                                        <i className="fas fa-clock"></i> {new Date(topic.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="topic-stats">
                                <span>
                                    <i className="fas fa-comment-alt"></i> {topic.repliesCount || 0} respuestas
                                </span>
                                <span>
                                    <i className="fas fa-eye"></i> {topic.views || 0} vistas
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ForumList;
