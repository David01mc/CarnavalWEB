import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import GifPicker from './GifPicker';
import '../../styles/components/forum.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const ForumTopic = ({ topicId, onBack }) => {
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedGif, setSelectedGif] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopicData();
    }, [topicId]);

    const fetchTopicData = async () => {
        try {
            const [topicRes, postsRes] = await Promise.all([
                fetch(`${API_URL}/api/forum/topics/${topicId}`),
                fetch(`${API_URL}/api/forum/topics/${topicId}/posts`)
            ]);

            if (!topicRes.ok || !postsRes.ok) throw new Error('Error al cargar datos');

            const topicData = await topicRes.json();
            const postsData = await postsRes.json();

            setTopic(topicData);
            setPosts(postsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() && !selectedGif) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/forum/topics/${topicId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    content: replyContent || 'GIF',
                    gifUrl: selectedGif
                })
            });

            if (!response.ok) throw new Error('Error al publicar respuesta');

            const newPost = await response.json();
            setPosts([...posts, newPost]);
            setReplyContent('');
            setSelectedGif(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGifSelect = (gifUrl) => {
        setSelectedGif(gifUrl);
        setShowGifPicker(false);
    };

    const handleReaction = async (postId, type) => {
        if (!user) return;

        if (type === 'like') {
            const post = posts.find(p => p._id === postId);
            const alreadyLiked = post.reactions?.likes?.includes(user._id);

            if (!alreadyLiked) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF4500', '#8A2BE2', '#FF00FF']
                });
            }
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/forum/posts/${postId}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) throw new Error('Error al reaccionar');

            const updatedReactions = await response.json();

            setPosts(posts.map(post =>
                post._id === postId
                    ? { ...post, reactions: updatedReactions }
                    : post
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('¿Estás seguro de que quieres borrar este mensaje?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) throw new Error('Error al borrar mensaje');

            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Cargando conversación...</div>;
    if (!topic) return <div className="error-message">Tema no encontrado</div>;

    return (
        <div className="forum-container">
            {/* Theater Curtains */}
            <div className="forum-curtain forum-curtain-left"></div>
            <div className="forum-curtain forum-curtain-right"></div>

            <button className="btn btn-secondary mb-4" onClick={onBack}>
                <i className="fas fa-arrow-left"></i> Volver al Foro
            </button>

            <div className="topic-detail-header">
                <h1 className="topic-title">{topic.title}</h1>
                <div className="topic-meta">
                    <span>Iniciado por {topic.author.username}</span>
                    <span>•</span>
                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="posts-list">
                {posts.map((post, index) => {
                    const likesCount = post.reactions?.likes?.length || 0;
                    const dislikesCount = post.reactions?.dislikes?.length || 0;
                    const userLiked = user && post.reactions?.likes?.includes(user._id);
                    const userDisliked = user && post.reactions?.dislikes?.includes(user._id);

                    return (
                        <div key={post._id} className="post-card" id={`post-${post._id}`}>
                            <div className="post-author">
                                <div className="author-avatar">
                                    {post.author.avatarUrl ? (
                                        <img
                                            src={post.author.avatarUrl}
                                            alt={post.author.username}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        post.author.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="author-name">{post.author.username}</span>
                                {index === 0 && <span className="badge badge-primary">OP</span>}
                            </div>

                            <div className="post-content-wrapper">
                                <div className="post-header">
                                    <span>Publicado el {new Date(post.createdAt).toLocaleString()}</span>
                                    <span>#{index + 1}</span>
                                    {user && (user.role === 'admin' || user._id === post.author.id) && (
                                        <button
                                            className="btn btn-danger btn-small"
                                            onClick={() => handleDeletePost(post._id)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginLeft: '1rem', border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer' }}
                                            title="Borrar mensaje"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>

                                <div className="post-body">
                                    {post.content}
                                    {post.gifUrl && (
                                        <div className="post-gif">
                                            <img src={post.gifUrl} alt="GIF" />
                                        </div>
                                    )}
                                </div>

                                <div className="post-actions">
                                    <button
                                        className={`reaction-btn ${userLiked ? 'active' : ''}`}
                                        onClick={() => handleReaction(post._id, 'like')}
                                        disabled={!user}
                                        title={user ? "Me gusta" : "Inicia sesión para votar"}
                                    >
                                        <i className="fas fa-thumbs-up"></i> {likesCount}
                                    </button>

                                    <button
                                        className={`reaction-btn ${userDisliked ? 'active' : ''}`}
                                        onClick={() => handleReaction(post._id, 'dislike')}
                                        disabled={!user}
                                        title={user ? "No me gusta" : "Inicia sesión para votar"}
                                    >
                                        <i className="fas fa-thumbs-down"></i> {dislikesCount}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {user ? (
                <div className="forum-form">
                    <h3>Responder al tema</h3>
                    <form onSubmit={handleReply}>
                        <div className="form-group">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Escribe tu respuesta..."
                                required={!selectedGif}
                            />
                        </div>

                        {selectedGif && (
                            <div className="gif-preview">
                                <img src={selectedGif} alt="Selected GIF" />
                                <button
                                    type="button"
                                    className="remove-gif-btn"
                                    onClick={() => setSelectedGif(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}

                        <div className="forum-form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowGifPicker(true)}
                                title="Buscar un GIF"
                            >
                                <i className="fas fa-film"></i> GIF
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-paper-plane"></i> Publicar Respuesta
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="alert alert-info text-center">
                    <p>Debes <button className="btn-link" onClick={() => document.querySelector('.login-btn')?.click()}>iniciar sesión</button> para responder.</p>
                </div>
            )}

            {showGifPicker && (
                <GifPicker
                    onSelect={handleGifSelect}
                    onClose={() => setShowGifPicker(false)}
                />
            )}
        </div>
    );
};

export default ForumTopic;
