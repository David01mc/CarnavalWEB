function DeleteConfirmModal({ item, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><i className="fas fa-exclamation-triangle"></i> Confirmar Eliminación</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        ¿Estás seguro de que quieres eliminar <strong>{item.name}</strong>?
                    </p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Esta acción no se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={onCancel}>
                            Cancelar
                        </button>
                        <button className="btn btn-danger" onClick={onConfirm}>
                            <i className="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
