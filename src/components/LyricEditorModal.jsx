import { useState, useEffect } from 'react';
import '../styles/components/lyric-editor.css';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function LyricEditorModal({ lyrics, onSave, onCancel }) {
    const [editingLyrics, setEditingLyrics] = useState(lyrics || []);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Extract video ID from YouTube URL
    const extractVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    // Handle URL input change
    const handleUrlChange = (url) => {
        setYoutubeUrl(url);
        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
        }
    };

    // Search YouTube
    const searchYouTube = async () => {
        if (!searchQuery.trim() || !YOUTUBE_API_KEY) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`
            );
            const data = await response.json();

            if (data.items) {
                setSearchResults(data.items);
            }
        } catch (error) {
            console.error('Error searching YouTube:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Select video from search results
    const selectVideo = (video) => {
        setVideoId(video.id.videoId);
        setYoutubeUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
        setSearchResults([]);
        setSearchQuery('');
    };

    // Add new lyric
    const addLyric = () => {
        const newLyric = {
            title: '',
            type: '',
            views: '0',
            url: '',
            content: '',
            features: [],
            last_modification: new Date().toLocaleString('es-ES')
        };
        setEditingLyrics([...editingLyrics, newLyric]);
        setExpandedIndex(editingLyrics.length);
    };

    // Update lyric field
    const updateLyric = (index, field, value) => {
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === index ? { ...lyric, [field]: value } : lyric
        ));
    };

    // Remove lyric
    const removeLyric = (index) => {
        setEditingLyrics(prev => prev.filter((_, i) => i !== index));
        if (expandedIndex === index) {
            setExpandedIndex(null);
        } else if (expandedIndex > index) {
            setExpandedIndex(expandedIndex - 1);
        }
    };

    // Add feature to lyric
    const addFeature = (lyricIndex) => {
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === lyricIndex
                ? { ...lyric, features: [...(lyric.features || []), ''] }
                : lyric
        ));
    };

    // Update feature
    const updateFeature = (lyricIndex, featureIndex, value) => {
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === lyricIndex
                ? {
                    ...lyric,
                    features: (lyric.features || []).map((f, fi) => fi === featureIndex ? value : f)
                }
                : lyric
        ));
    };

    // Remove feature
    const removeFeature = (lyricIndex, featureIndex) => {
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === lyricIndex
                ? {
                    ...lyric,
                    features: (lyric.features || []).filter((_, fi) => fi !== featureIndex)
                }
                : lyric
        ));
    };

    // Handle save
    const handleSave = () => {
        onSave(editingLyrics);
    };

    return (
        <div className="lyric-editor-overlay" onClick={onCancel}>
            <div className="lyric-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="lyric-editor-header">
                    <h2><i className="fas fa-music"></i> Editor de Letras</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <div className="lyric-editor-content">
                    {/* Left Panel - Lyrics */}
                    <div className="lyric-editor-left">
                        <div className="lyrics-list-header">
                            <h3><i className="fas fa-list"></i> Letras ({editingLyrics.length})</h3>
                            <button className="btn btn-primary btn-sm" onClick={addLyric}>
                                <i className="fas fa-plus"></i> Nueva Letra
                            </button>
                        </div>

                        <div className="lyrics-list">
                            {editingLyrics.length === 0 ? (
                                <div className="empty-lyrics">
                                    <i className="fas fa-file-alt"></i>
                                    <p>No hay letras</p>
                                    <button className="btn btn-secondary" onClick={addLyric}>
                                        <i className="fas fa-plus"></i> Añadir primera letra
                                    </button>
                                </div>
                            ) : (
                                editingLyrics.map((lyric, index) => (
                                    <div key={index} className={`lyric-item ${expandedIndex === index ? 'expanded' : ''}`}>
                                        <div
                                            className="lyric-item-header"
                                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                        >
                                            <div className="lyric-item-info">
                                                <i className={`fas fa-chevron-${expandedIndex === index ? 'down' : 'right'}`}></i>
                                                <span className="lyric-title">
                                                    {lyric.title || `Letra ${index + 1}`}
                                                </span>
                                                {lyric.type && <span className="lyric-type">{lyric.type}</span>}
                                            </div>
                                            <button
                                                className="remove-lyric-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeLyric(index);
                                                }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>

                                        {expandedIndex === index && (
                                            <div className="lyric-item-form">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Título</label>
                                                        <input
                                                            type="text"
                                                            value={lyric.title}
                                                            onChange={(e) => updateLyric(index, 'title', e.target.value)}
                                                            placeholder="Nombre de la letra"
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
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label>Contenido</label>
                                                    <textarea
                                                        value={lyric.content}
                                                        onChange={(e) => updateLyric(index, 'content', e.target.value)}
                                                        rows="12"
                                                        placeholder="Escribe la letra aquí..."
                                                    />
                                                </div>

                                                <div className="features-section">
                                                    <h5><i className="fas fa-tags"></i> Features/Palabras Clave</h5>
                                                    <div className="features-list">
                                                        {(lyric.features || []).map((feature, fIndex) => (
                                                            <div key={fIndex} className="feature-item">
                                                                <input
                                                                    type="text"
                                                                    value={feature}
                                                                    onChange={(e) => updateFeature(index, fIndex, e.target.value)}
                                                                    placeholder={`Palabra ${fIndex + 1}`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="remove-feature-btn"
                                                                    onClick={() => removeFeature(index, fIndex)}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => addFeature(index)}
                                                    >
                                                        <i className="fas fa-plus"></i> Añadir Feature
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel - YouTube */}
                    <div className="lyric-editor-right">
                        <h3><i className="fab fa-youtube"></i> Reproductor de YouTube</h3>

                        {/* YouTube Search */}
                        {YOUTUBE_API_KEY && (
                            <div className="youtube-search">
                                <div className="search-input-group">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchYouTube()}
                                        placeholder="Buscar en YouTube..."
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={searchYouTube}
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-search"></i>
                                        )}
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="search-results">
                                        {searchResults.map((result) => (
                                            <div
                                                key={result.id.videoId}
                                                className="search-result-item"
                                                onClick={() => selectVideo(result)}
                                            >
                                                <img
                                                    src={result.snippet.thumbnails.default.url}
                                                    alt={result.snippet.title}
                                                />
                                                <div className="result-info">
                                                    <span className="result-title">{result.snippet.title}</span>
                                                    <span className="result-channel">{result.snippet.channelTitle}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* URL Input */}
                        <div className="youtube-url-input">
                            <label>O pega una URL de YouTube:</label>
                            <input
                                type="url"
                                value={youtubeUrl}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>

                        {/* Video Player */}
                        <div className="youtube-player">
                            {videoId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="no-video">
                                    <i className="fab fa-youtube"></i>
                                    <p>Busca o pega una URL para reproducir</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lyric-editor-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="btn btn-success" onClick={handleSave}>
                        <i className="fas fa-save"></i> Guardar Letras
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LyricEditorModal;
