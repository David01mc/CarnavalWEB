import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import QRModal from './QRModal';
import '../styles/components/agrupacion-detail.css';

const AgrupacionDetailModal = ({ agrupacion, onClose, onEdit, onDelete, onAuthorClick, initialLyricIndex = null }) => {
    const { user } = useAuth();
    const [selectedLyric, setSelectedLyric] = useState(null);
    const [qrData, setQrData] = useState(null);

    // Auto-select lyric based on prop
    useEffect(() => {
        if (initialLyricIndex !== null && agrupacion.lyrics && agrupacion.lyrics[initialLyricIndex]) {
            setSelectedLyric(agrupacion.lyrics[initialLyricIndex]);
        }
    }, [initialLyricIndex, agrupacion]);

    const handleShareQR = (e, lyric) => {
        e.stopPropagation();
        const lyricIndex = agrupacion.lyrics.findIndex(l => l === lyric);
        const url = `${window.location.origin}/?view=agrupacion&id=${agrupacion._id}&lyricIndex=${lyricIndex}`;
        setQrData({
            value: url,
            title: lyric.title
        });
    };

    // Close on escape key and lock body scroll
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);

        // Calculate scrollbar width and compensate
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Lock body scroll and compensate for scrollbar
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            window.removeEventListener('keydown', handleEsc);
            // Unlock body scroll and remove padding
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [onClose]);

    if (!agrupacion) return null;

    return (
        <motion.div
            className="agrupacion-detail-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className={`agrupacion-detail-modal ${selectedLyric ? 'expanded' : ''}`}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="modal-layout">
                    {/* Left Panel: Main Details */}
                    <div className="detail-panel">
                        {/* Header Image & Title */}
                        <div className="detail-header">
                            {agrupacion.image ? (
                                <img src={agrupacion.image} alt={agrupacion.name} className="detail-banner" />
                            ) : (
                                <div className="detail-banner" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)' }} />
                            )}
                            <div className="detail-header-overlay">
                                <div className="detail-title-section">
                                    <h2 className="detail-title">{agrupacion.name}</h2>
                                    <div className="detail-badges">
                                        {agrupacion.category && (
                                            <span className="detail-badge badge-category">
                                                <i className="fas fa-masks-theater"></i> {agrupacion.category}
                                            </span>
                                        )}
                                        {agrupacion.year && (
                                            <span className="detail-badge badge-year">
                                                <i className="fas fa-calendar"></i> {agrupacion.year}
                                            </span>
                                        )}
                                        {agrupacion.posición && (
                                            <span className="detail-badge badge-position">
                                                <i className="fas fa-trophy"></i> {agrupacion.posición}º Premio
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="detail-content">
                            {/* Description */}
                            {agrupacion.descripcion && (
                                <div className="detail-section">
                                    <h3 className="section-title"><i className="fas fa-align-left"></i> Descripción</h3>
                                    <p className="detail-description">{agrupacion.descripcion}</p>
                                </div>
                            )}

                            {/* Authors */}
                            {agrupacion.authors && agrupacion.authors.length > 0 && (
                                <div className="detail-section">
                                    <h3 className="section-title"><i className="fas fa-pen-nib"></i> Autores</h3>
                                    <div className="authors-grid">
                                        {agrupacion.authors.map((author, idx) => (
                                            <div
                                                key={idx}
                                                className="author-card clickable-author"
                                                onClick={() => {
                                                    if (onAuthorClick) {
                                                        onAuthorClick(author.name);
                                                        // Don't close the main modal, let the author modal stack on top
                                                    }
                                                }}
                                                title="Ver más agrupaciones de este autor"
                                            >
                                                {author.image && (
                                                    <img src={author.image} alt={author.name} className="author-img" />
                                                )}
                                                <div className="author-info">
                                                    <h4>{author.name}</h4>
                                                    {author.role && <span className="author-role">{author.role}</span>}
                                                    {author.descripcion && <p className="author-desc">{author.descripcion}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lyrics List */}
                            {agrupacion.lyrics && agrupacion.lyrics.length > 0 && (
                                <div className="detail-section">
                                    <h3 className="section-title"><i className="fas fa-music"></i> Letras ({agrupacion.lyrics.length})</h3>
                                    <div className="lyrics-list">
                                        {agrupacion.lyrics.map((lyric, idx) => (
                                            <div
                                                key={idx}
                                                className={`lyric-item ${selectedLyric === lyric ? 'active' : ''}`}
                                                onClick={() => setSelectedLyric(lyric)}
                                            >
                                                <i className="fas fa-file-audio"></i>
                                                <span>{lyric.title || `Letra ${idx + 1}`}</span>
                                                <i className="fas fa-chevron-right" style={{ marginLeft: 'auto', opacity: 0.5 }}></i>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Components Info */}
                            <div className="detail-section">
                                <h3 className="section-title"><i className="fas fa-info-circle"></i> Información Adicional</h3>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    {agrupacion.componentes && (
                                        <div className="components-count">
                                            <strong><i className="fas fa-users"></i> Componentes:</strong> {agrupacion.componentes.length} miembros
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {user && (user.role === 'admin' || user.isAdmin) && (
                            <div className="detail-actions">
                                <button className="btn btn-danger" onClick={() => {
                                    if (window.confirm('¿Estás seguro de eliminar esta agrupación?')) {
                                        onDelete(agrupacion);
                                        onClose();
                                    }
                                }}>
                                    <i className="fas fa-trash"></i> Eliminar
                                </button>
                                <button className="btn btn-primary" onClick={() => {
                                    onEdit(agrupacion);
                                    onClose();
                                }}>
                                    <i className="fas fa-edit"></i> Editar Agrupación
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Lyric Content */}
                    {selectedLyric && (
                        <div className="lyric-panel">
                            <div className="lyric-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <h3>{selectedLyric.title || 'Letra'}</h3>
                                    <button
                                        className="icon-btn qr-btn"
                                        onClick={(e) => handleShareQR(e, selectedLyric)}
                                        title="Generar QR para esta letra"
                                    >
                                        <i className="fas fa-qrcode"></i>
                                    </button>
                                </div>
                                <button className="close-lyric-btn" onClick={() => setSelectedLyric(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="lyric-content">
                                {selectedLyric.content ? (
                                    <pre>{selectedLyric.content}</pre>
                                ) : (
                                    <div className="empty-lyric">
                                        <i className="fas fa-music"></i>
                                        <p>Contenido de la letra no disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* QR Modal */}
                <AnimatePresence>
                    {qrData && (
                        <QRModal
                            value={qrData.value}
                            title={qrData.title}
                            onClose={() => setQrData(null)}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default AgrupacionDetailModal;
