import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import QRModal from './QRModal';
import '../styles/components/agrupacion-detail.css';

const AgrupacionDetailModal = ({
    agrupacion,
    agrupaciones = [],
    onClose,
    onEdit,
    onDelete,
    onAuthorClick,
    onRelatedAgrupacionClick,
    onNavigatePrev,
    onNavigateNext,
    initialLyricIndex = null
}) => {
    const { user } = useAuth();
    const [selectedLyricIndex, setSelectedLyricIndex] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [slideDirection, setSlideDirection] = useState(null); // 'left' or 'right'

    // Calculate current agrupacion position in list
    const currentAgrupacionIndex = agrupaciones.findIndex(a => a._id === agrupacion._id);
    const hasPrevAgrupacion = currentAgrupacionIndex > 0;
    const hasNextAgrupacion = currentAgrupacionIndex < agrupaciones.length - 1 && currentAgrupacionIndex !== -1;

    // Get current lyric from index
    const selectedLyric = selectedLyricIndex !== null && agrupacion.lyrics
        ? agrupacion.lyrics[selectedLyricIndex]
        : null;

    // Navigation functions with animation direction
    const goToPrevLyric = () => {
        if (selectedLyricIndex > 0) {
            setSlideDirection('right');
            setSelectedLyricIndex(selectedLyricIndex - 1);
            // Reset animation after it completes
            setTimeout(() => setSlideDirection(null), 300);
        }
    };

    const goToNextLyric = () => {
        if (agrupacion.lyrics && selectedLyricIndex < agrupacion.lyrics.length - 1) {
            setSlideDirection('left');
            setSelectedLyricIndex(selectedLyricIndex + 1);
            // Reset animation after it completes
            setTimeout(() => setSlideDirection(null), 300);
        }
    };

    const hasPrevLyric = selectedLyricIndex > 0;
    const hasNextLyric = agrupacion.lyrics && selectedLyricIndex < agrupacion.lyrics.length - 1;

    // Swipe handlers for mobile navigation
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        // If viewing a lyric, navigate between lyrics
        if (selectedLyric) {
            if (isLeftSwipe && hasNextLyric) {
                goToNextLyric();
            } else if (isRightSwipe && hasPrevLyric) {
                goToPrevLyric();
            }
        } else {
            // If not viewing a lyric, navigate between agrupaciones
            if (isLeftSwipe && hasNextAgrupacion && onNavigateNext) {
                onNavigateNext();
            } else if (isRightSwipe && hasPrevAgrupacion && onNavigatePrev) {
                onNavigatePrev();
            }
        }
    };

    // Collect unique related agrupaciones from all authors
    const relatedAgrupaciones = useMemo(() => {
        console.log('DEBUG: agrupacion.authors:', agrupacion.authors);
        if (!agrupacion.authors || agrupacion.authors.length === 0) return [];

        const allRelated = new Set();
        agrupacion.authors.forEach(author => {
            console.log('DEBUG: author:', author.name, 'agrupaciones_relacionadas:', author.agrupaciones_relacionadas);
            if (author.agrupaciones_relacionadas) {
                author.agrupaciones_relacionadas.forEach(name => {
                    // Don't include "No hay" or the current agrupación's name
                    if (name && name !== 'No hay' && name.toLowerCase() !== agrupacion.name?.toLowerCase()) {
                        allRelated.add(name);
                    }
                });
            }
        });
        return Array.from(allRelated).sort();
    }, [agrupacion]);

    // Auto-select lyric based on prop
    useEffect(() => {
        if (initialLyricIndex !== null && agrupacion.lyrics && agrupacion.lyrics[initialLyricIndex]) {
            setSelectedLyricIndex(initialLyricIndex);
        }
    }, [initialLyricIndex, agrupacion]);

    const handleShareQR = (e, lyric) => {
        e.stopPropagation();
        const lyricIdx = agrupacion.lyrics.findIndex(l => l === lyric);
        const url = `${window.location.origin}/?view=agrupacion&id=${agrupacion._id}&lyricIndex=${lyricIdx}`;
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

                {/* Local Curtains Effect */}
                <div className="modal-curtain-valance"></div>
                <div className="modal-curtain-left"></div>
                <div className="modal-curtain-right"></div>

                {/* Close Button - Top Right */}
                <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
                    <i className="fas fa-times"></i>
                </button>

                {/* Navigation Arrows - Fixed on sides */}
                {agrupaciones.length > 1 && (
                    <>
                        <button
                            className="modal-side-nav modal-side-nav-left"
                            onClick={onNavigatePrev}
                            disabled={!hasPrevAgrupacion}
                            aria-label="Agrupación anterior"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <button
                            className="modal-side-nav modal-side-nav-right"
                            onClick={onNavigateNext}
                            disabled={!hasNextAgrupacion}
                            aria-label="Agrupación siguiente"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </>
                )}

                <div className="modal-layout">
                    {/* Left Panel: Main Details with swipe support */}
                    <div
                        className="detail-panel"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
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
                                                className={`lyric-item ${selectedLyricIndex === idx ? 'active' : ''}`}
                                                onClick={() => setSelectedLyricIndex(idx)}
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

                            {/* Related Agrupaciones */}
                            {relatedAgrupaciones.length > 0 && (
                                <div className="detail-section">
                                    <h3 className="section-title"><i className="fas fa-link"></i> Agrupaciones Relacionadas ({relatedAgrupaciones.length})</h3>
                                    <div className="related-agrupaciones-list">
                                        {relatedAgrupaciones.map((name, idx) => (
                                            <button
                                                key={idx}
                                                className="related-agrupacion-tag"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onRelatedAgrupacionClick) {
                                                        onRelatedAgrupacionClick(name);
                                                    }
                                                }}
                                                title={`Ver ${name}`}
                                            >
                                                <i className="fas fa-theater-masks"></i>
                                                <span>{name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                        <div
                            className="lyric-panel"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Top Row: QR left, X right */}
                            <div className="lyric-header-top">
                                <button
                                    className="lyric-action-btn"
                                    onClick={(e) => handleShareQR(e, selectedLyric)}
                                    title="Generar QR para esta letra"
                                >
                                    <i className="fas fa-qrcode"></i>
                                </button>
                                <button
                                    className="lyric-action-btn lyric-close-btn"
                                    onClick={() => setSelectedLyricIndex(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            {/* Navigation Row: Prev | Title + Counter | Next */}
                            <div className="lyric-nav-row">
                                <button
                                    className="lyric-nav-btn"
                                    onClick={goToPrevLyric}
                                    disabled={!hasPrevLyric}
                                    aria-label="Letra anterior"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                <div className="lyric-header-center">
                                    <h3>{selectedLyric.title || 'Letra'}</h3>
                                    <span className="lyric-counter">
                                        {selectedLyricIndex + 1} / {agrupacion.lyrics.length}
                                    </span>
                                </div>

                                <button
                                    className="lyric-nav-btn"
                                    onClick={goToNextLyric}
                                    disabled={!hasNextLyric}
                                    aria-label="Letra siguiente"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>

                            {/* Lyric Content with swipe animation */}
                            <div className={`lyric-content ${slideDirection ? `slide-${slideDirection}` : ''}`}>
                                {selectedLyric.content ? (
                                    <pre>{selectedLyric.content}</pre>
                                ) : (
                                    <div className="empty-lyric">
                                        <i className="fas fa-music"></i>
                                        <p>Contenido de la letra no disponible</p>
                                    </div>
                                )}
                            </div>

                            {/* Swipe hint for mobile */}
                            <div className="swipe-hint">
                                <i className="fas fa-hand-point-left"></i>
                                <span>Desliza para cambiar de letra</span>
                                <i className="fas fa-hand-point-right"></i>
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
