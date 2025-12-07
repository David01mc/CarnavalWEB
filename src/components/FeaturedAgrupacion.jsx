import { useState } from 'react';

function FeaturedAgrupacion({ agrupacion }) {
    const [expandedLyric, setExpandedLyric] = useState(null);
    const [expandedAuthor, setExpandedAuthor] = useState(null);

    const toggleLyric = (index) => {
        setExpandedLyric(expandedLyric === index ? null : index);
    };

    const toggleAuthor = (index) => {
        setExpandedAuthor(expandedAuthor === index ? null : index);
    };

    return (
        <div className="featured-agrupacion">
            {/* Large Image Section */}
            {agrupacion.image && (
                <div className="featured-image-large">
                    <img
                        src={agrupacion.image}
                        alt={agrupacion.name}
                        className="featured-image-main"
                    />
                    <div className="featured-badge-large">
                        <i className="fas fa-star"></i> DESTACADA DEL DÍA
                    </div>
                </div>
            )}

            {/* Info Section */}
            <div className="featured-info-section">
                <h2 className="featured-title-large">{agrupacion.name}</h2>

                <div className="featured-meta-large">
                    {agrupacion.category && (
                        <span className="meta-badge-large">
                            <i className="fas fa-folder"></i> {agrupacion.category}
                        </span>
                    )}
                    {agrupacion.year && (
                        <span className="meta-badge-large">
                            <i className="fas fa-calendar-alt"></i> {agrupacion.year}
                        </span>
                    )}
                    {agrupacion.posición && (
                        <span className="meta-badge-large highlight">
                            <i className="fas fa-trophy"></i> {agrupacion.posición}
                        </span>
                    )}
                </div>
            </div>

            {/* Authors Section - Expandable */}
            {agrupacion.authors && agrupacion.authors.length > 0 && (
                <div className="featured-section">
                    <h3 className="section-title">
                        <i className="fas fa-pen-fancy"></i> Autores ({agrupacion.authors.length})
                    </h3>
                    <div className="authors-list">
                        {agrupacion.authors.map((author, idx) => (
                            <div key={idx} className="author-item">
                                <div
                                    className="author-header"
                                    onClick={() => toggleAuthor(idx)}
                                >
                                    <div className="author-header-content">
                                        {author.image && (
                                            <img
                                                src={author.image}
                                                alt={author.name}
                                                className="author-image-small"
                                            />
                                        )}
                                        <div className="author-title-section">
                                            <h4 className="author-name-title">{author.name}</h4>
                                            {author.role && (
                                                <p className="author-role-text">
                                                    <i className="fas fa-music"></i> {author.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button className="expand-btn">
                                        <i className={`fas fa-chevron-${expandedAuthor === idx ? 'up' : 'down'}`}></i>
                                    </button>
                                </div>

                                {expandedAuthor === idx && (
                                    <div className="author-content">
                                        {author.image && (
                                            <div className="author-image-large-container">
                                                <img
                                                    src={author.image}
                                                    alt={author.name}
                                                    className="author-image-large"
                                                />
                                            </div>
                                        )}
                                        {author.descripcion && (
                                            <div className="author-description">
                                                <h5><i className="fas fa-info-circle"></i> Descripción</h5>
                                                <p>{author.descripcion}</p>
                                            </div>
                                        )}
                                        {author.agrupaciones_relacionadas && author.agrupaciones_relacionadas.length > 0 && (
                                            <div className="author-related">
                                                <h5><i className="fas fa-link"></i> Agrupaciones Relacionadas</h5>
                                                {author.agrupaciones_relacionadas[0] === "No hay" ? (
                                                    <p className="no-related">No hay agrupaciones relacionadas</p>
                                                ) : (
                                                    <div className="related-tags">
                                                        {author.agrupaciones_relacionadas.map((agrup, i) => (
                                                            <span key={i} className="related-tag">
                                                                {agrup}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lyrics Section */}
            {agrupacion.lyrics && agrupacion.lyrics.length > 0 && (
                <div className="featured-section">
                    <h3 className="section-title">
                        <i className="fas fa-music"></i> Letras ({agrupacion.lyrics.length})
                    </h3>
                    <div className="lyrics-list">
                        {agrupacion.lyrics.map((lyric, idx) => (
                            <div key={idx} className={`lyric-item ${expandedLyric === idx ? 'expanded' : ''}`}>
                                <div
                                    className="lyric-header"
                                    onClick={() => toggleLyric(idx)}
                                >
                                    <div className="lyric-title-section">
                                        <h4 className="lyric-title">{lyric.title}</h4>
                                        <div className="lyric-meta">
                                            <span className="lyric-type">
                                                <i className="fas fa-tag"></i> {lyric.type}
                                            </span>
                                            {lyric.views && (
                                                <span className="lyric-views">
                                                    <i className="fas fa-eye"></i> {lyric.views} vistas
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="expand-btn">
                                        <i className={`fas fa-chevron-${expandedLyric === idx ? 'up' : 'down'}`}></i>
                                    </button>
                                </div>

                                {expandedLyric === idx && (
                                    <div className="lyric-content">
                                        <div className="lyric-text">
                                            {lyric.content.split('\n').map((line, lineIdx) => (
                                                <p key={lineIdx}>{line || '\u00A0'}</p>
                                            ))}
                                        </div>
                                        <div className="lyric-footer">
                                            {lyric.last_modification && (
                                                <span className="lyric-date">
                                                    <i className="fas fa-clock"></i> Última modificación: {lyric.last_modification}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* YouTube & Spotify Links */}
            {((agrupacion.youtube && agrupacion.youtube.length > 0) ||
                (agrupacion.spotify && agrupacion.spotify.length > 0)) && (
                    <div className="featured-section">
                        <h3 className="section-title">
                            <i className="fas fa-play-circle"></i> Multimedia
                        </h3>
                        <div className="multimedia-links">
                            {agrupacion.youtube && agrupacion.youtube.length > 0 && (
                                <div className="multimedia-group">
                                    <h4><i className="fab fa-youtube"></i> YouTube</h4>
                                    {agrupacion.youtube.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="multimedia-link youtube"
                                        >
                                            <i className="fab fa-youtube"></i> Ver en YouTube
                                        </a>
                                    ))}
                                </div>
                            )}
                            {agrupacion.spotify && agrupacion.spotify.length > 0 && (
                                <div className="multimedia-group">
                                    <h4><i className="fab fa-spotify"></i> Spotify</h4>
                                    {agrupacion.spotify.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="multimedia-link spotify"
                                        >
                                            <i className="fab fa-spotify"></i> Escuchar en Spotify
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

export default FeaturedAgrupacion;
