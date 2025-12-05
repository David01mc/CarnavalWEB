import React, { useEffect } from 'react';
import '../styles/components/author-detail.css';

const AuthorDetailModal = ({ author, onClose }) => {
    // Close on escape key and lock body scroll
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);

        // Lock body scroll (stacked with AgrupacionDetailModal if needed)
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            // Only unlock if no other modal is open (simplified for now, assumes this is top layer)
            // Ideally we'd check if another modal is open, but for now let's just unset.
            // If AgrupacionDetailModal is open, it will re-lock or keep locked? 
            // Actually, if we stack modals, we might want to be careful.
            // But since this replaces the filter action, let's assume it might be standalone or on top.
            // If on top of AgrupacionDetailModal, that one also locks scroll.
            // When this closes, AgrupacionDetailModal is still open, so scroll should remain locked.
            // We can check if AgrupacionDetailModal is present in DOM or just rely on the parent to manage.
            // For safety, let's just unset, but if AgrupacionDetailModal is open, it's useEffect dependency might not re-trigger.
            // A safer approach for stacked modals is a global modal manager, but for this simple case:
            // We can just not touch overflow on unmount if we know another modal is underneath.
            // Or better: check if 'agrupacion-detail-modal' exists in DOM.
            if (!document.querySelector('.agrupacion-detail-modal')) {
                document.body.style.overflow = 'unset';
            }
        };
    }, [onClose]);

    if (!author) return null;

    return (
        <div className="author-detail-overlay" onClick={onClose}>
            <div className="author-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="author-header">
                    {author.image ? (
                        <img src={author.image} alt={author.name} className="author-banner-img" />
                    ) : (
                        <div className="author-banner-placeholder">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    )}
                    <div className="author-header-content">
                        <h2>{author.name}</h2>
                        {author.role && <span className="author-role-badge">{author.role}</span>}
                    </div>
                </div>

                <div className="author-content">
                    {author.descripcion && (
                        <div className="author-section">
                            <h3><i className="fas fa-align-left"></i> Biografía</h3>
                            <p>{author.descripcion}</p>
                        </div>
                    )}

                    {/* Future: List of agrupaciones by this author could go here */}
                    {/* For now, just the basic info as requested */}
                </div>
            </div>
        </div>
    );
};

export default AuthorDetailModal;
