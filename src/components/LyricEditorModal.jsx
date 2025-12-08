import { useState, useEffect } from 'react';
import '../styles/components/lyric-editor.css';

// Try to get API key from any env variable
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

function LyricEditorModal({ lyrics, onSave, onCancel }) {
    const [editingLyrics, setEditingLyrics] = useState(lyrics || []);
    const [selectedIndex, setSelectedIndex] = useState(lyrics && lyrics.length > 0 ? 0 : -1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [videoId, setVideoId] = useState('');

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
        setSelectedIndex(editingLyrics.length);
    };

    // Update lyric field
    const updateLyric = (field, value) => {
        if (selectedIndex < 0) return;
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === selectedIndex ? { ...lyric, [field]: value } : lyric
        ));
    };

    // Remove lyric
    const removeLyric = (index) => {
        setEditingLyrics(prev => prev.filter((_, i) => i !== index));
        if (selectedIndex === index) {
            setSelectedIndex(editingLyrics.length > 1 ? 0 : -1);
        } else if (selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    // Add feature to current lyric
    const addFeature = () => {
        if (selectedIndex < 0) return;
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === selectedIndex
                ? { ...lyric, features: [...(lyric.features || []), ''] }
                : lyric
        ));
    };

    // Update feature
    const updateFeature = (featureIndex, value) => {
        if (selectedIndex < 0) return;
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === selectedIndex
                ? {
                    ...lyric,
                    features: (lyric.features || []).map((f, fi) => fi === featureIndex ? value : f)
                }
                : lyric
        ));
    };

    // Remove feature
    const removeFeature = (featureIndex) => {
        if (selectedIndex < 0) return;
        setEditingLyrics(prev => prev.map((lyric, i) =>
            i === selectedIndex
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

    const currentLyric = selectedIndex >= 0 ? editingLyrics[selectedIndex] : null;

    return (
        <div className="lyric-editor-overlay" onClick={onCancel}>
            <div className="lyric-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="lyric-editor-header">
                    <h2><i className="fas fa-music"></i> Editor de Letras</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <div className="lyric-editor-content">
                    {/* Top Panel - Lyrics Tabs */}
                    <div className="lyric-editor-top">
                        <h3><i className="fas fa-list"></i> Letras ({editingLyrics.length})</h3>
                        <div className="lyrics-tabs">
                            {editingLyrics.map((lyric, index) => (
                                <div
                                    key={index}
                                    className={`lyric-tab ${selectedIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    <span>{lyric.title || `Letra ${index + 1}`}</span>
                                    {lyric.type && <small>({lyric.type})</small>}
                                    <button
                                        className="delete-tab"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeLyric(index);
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={addLyric}>
                            <i className="fas fa-plus"></i> Nueva
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="lyric-editor-main">
                        {/* Left Panel - Lyric Form */}
                        <div className="lyric-editor-left">
                            <div className="lyric-form-container">
                                {currentLyric ? (
                                    <div className="lyric-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Título</label>
                                                <input
                                                    type="text"
                                                    value={currentLyric.title}
                                                    onChange={(e) => updateLyric('title', e.target.value)}
                                                    placeholder="Nombre de la letra"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Tipo</label>
                                                <input
                                                    type="text"
                                                    value={currentLyric.type}
                                                    onChange={(e) => updateLyric('type', e.target.value)}
                                                    placeholder="Ej: Pasodoble"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Vistas</label>
                                                <input
                                                    type="text"
                                                    value={currentLyric.views}
                                                    onChange={(e) => updateLyric('views', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>URL</label>
                                                <input
                                                    type="url"
                                                    value={currentLyric.url}
                                                    onChange={(e) => updateLyric('url', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Contenido</label>
                                            <textarea
                                                value={currentLyric.content}
                                                onChange={(e) => updateLyric('content', e.target.value)}
                                                rows="15"
                                                placeholder="Escribe la letra aquí..."
                                            />
                                        </div>

                                        <div className="features-section">
                                            <h5><i className="fas fa-tags"></i> Features/Palabras Clave</h5>
                                            <div className="features-list">
                                                {(currentLyric.features || []).map((feature, fIndex) => (
                                                    <div key={fIndex} className="feature-item">
                                                        <input
                                                            type="text"
                                                            value={feature}
                                                            onChange={(e) => updateFeature(fIndex, e.target.value)}
                                                            placeholder={`Palabra ${fIndex + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="remove-feature-btn"
                                                            onClick={() => removeFeature(fIndex)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={addFeature}
                                            >
                                                <i className="fas fa-plus"></i> Añadir Feature
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-lyrics">
                                        <i className="fas fa-file-alt"></i>
                                        <p>No hay letras</p>
                                        <button className="btn btn-secondary" onClick={addLyric}>
                                            <i className="fas fa-plus"></i> Añadir primera letra
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel - YouTube */}
                        <div className="lyric-editor-right">
                            <h3><i className="fab fa-youtube"></i> Reproductor de YouTube</h3>

                            {/* YouTube Search */}
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
                                        <p>Busca para reproducir</p>
                                    </div>
                                )}
                            </div>
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
