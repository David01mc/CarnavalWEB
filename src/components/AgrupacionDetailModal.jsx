import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/components/agrupacion-detail.css';

const AgrupacionDetailModal = ({ agrupacion, onClose, onEdit, onDelete }) => {
    const { user } = useAuth();

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!agrupacion) return null;

    return (
        <div className="agrupacion-detail-overlay" onClick={onClose}>
            <div className="agrupacion-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

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
                                    <div key={idx} className="author-card">
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

                    {/* Components & Lyrics Info */}
                    <div className="detail-section">
                        <h3 className="section-title"><i className="fas fa-info-circle"></i> Información Adicional</h3>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            {agrupacion.componentes && (
                                <div className="components-count">
                                    <strong><i className="fas fa-users"></i> Componentes:</strong> {agrupacion.componentes.length} miembros
                                </div>
                            )}
                            {agrupacion.lyrics && (
                                <div className="components-count">
                                    <strong><i className="fas fa-music"></i> Letras disponibles:</strong> {agrupacion.lyrics.length}
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
        </div>
    );
};

export default AgrupacionDetailModal;
