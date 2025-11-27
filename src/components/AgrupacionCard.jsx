import { useAuth } from '../context/AuthContext';

function AgrupacionCard({ agrupacion, onEdit, onDelete }) {
    const { user } = useAuth();
    return (
        <div className="card">
            {agrupacion.image && (
                <img
                    src={agrupacion.image}
                    alt={agrupacion.name}
                    className="card-image"
                    onError={(e) => e.target.style.display = 'none'}
                />
            )}

            <div className="card-content">
                <h3 className="card-title">{agrupacion.name}</h3>

                <div className="card-meta">
                    {agrupacion.category && (
                        <span className="badge"><i className="fas fa-folder"></i> {agrupacion.category}</span>
                    )}
                    {agrupacion.year && (
                        <span className="badge"><i className="fas fa-calendar-alt"></i> {agrupacion.year}</span>
                    )}
                    {agrupacion.posición && (
                        <span className="badge"><i className="fas fa-trophy"></i> {agrupacion.posición}</span>
                    )}
                    {agrupacion.callejera && agrupacion.callejera === 'Sí' && (
                        <span className="badge"><i className="fas fa-walking"></i> Callejera</span>
                    )}
                </div>

                {agrupacion.descripcion && (
                    <div className="card-info" style={{ marginBottom: '1rem' }}>
                        <strong><i className="fas fa-file-alt"></i> Descripción:</strong>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            {agrupacion.descripcion.length > 150
                                ? agrupacion.descripcion.substring(0, 150) + '...'
                                : agrupacion.descripcion}
                        </p>
                    </div>
                )}

                <div className="card-info">
                    {agrupacion.caracteristicas && agrupacion.caracteristicas.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong><i className="fas fa-star"></i> Características:</strong>
                            <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                                {agrupacion.caracteristicas.slice(0, 3).map((car, idx) => (
                                    <li key={idx} style={{ fontSize: '0.9rem' }}>{car}</li>
                                ))}
                                {agrupacion.caracteristicas.length > 3 && (
                                    <li style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                        +{agrupacion.caracteristicas.length - 3} más...
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                    {agrupacion.componentes && agrupacion.componentes.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong><i className="fas fa-users"></i> Componentes:</strong> {agrupacion.componentes.length}
                        </div>
                    )}
                    {agrupacion.authors && agrupacion.authors.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong><i className="fas fa-pen-fancy"></i> Autores:</strong>
                            <div style={{ marginTop: '0.5rem' }}>
                                {agrupacion.authors.map((author, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            marginBottom: '0.75rem',
                                            padding: '0.5rem',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '6px',
                                            borderLeft: '3px solid var(--primary)',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        {author.image && (
                                            <img
                                                src={author.image}
                                                alt={author.name}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '2px solid var(--primary)',
                                                    flexShrink: 0
                                                }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--primary-light)' }}>
                                                {author.name}
                                                {author.role && (
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                                                        • {author.role}
                                                    </span>
                                                )}
                                            </div>
                                            {author.descripcion && (
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    marginTop: '0.25rem',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {author.descripcion.length > 120
                                                        ? author.descripcion.substring(0, 120) + '...'
                                                        : author.descripcion}
                                                </p>
                                            )}
                                            {author.agrupaciones_relacionadas && author.agrupaciones_relacionadas.length > 0 && (
                                                <div style={{
                                                    marginTop: '0.5rem',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    <i className="fas fa-link" style={{ marginRight: '0.3rem', color: 'var(--primary)' }}></i>
                                                    <strong>Agrupaciones relacionadas:</strong>
                                                    {author.agrupaciones_relacionadas[0] === "No hay" ? (
                                                        <span style={{ marginLeft: '0.3rem', fontStyle: 'italic' }}>No hay</span>
                                                    ) : (
                                                        <div style={{
                                                            marginTop: '0.25rem',
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '0.3rem'
                                                        }}>
                                                            {author.agrupaciones_relacionadas.slice(0, 5).map((agrup, i) => (
                                                                <span
                                                                    key={i}
                                                                    style={{
                                                                        background: 'rgba(var(--primary-rgb), 0.15)',
                                                                        padding: '0.15rem 0.4rem',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.75rem',
                                                                        color: 'var(--primary-light)',
                                                                        border: '1px solid rgba(var(--primary-rgb), 0.3)'
                                                                    }}
                                                                >
                                                                    {agrup}
                                                                </span>
                                                            ))}
                                                            {author.agrupaciones_relacionadas.length > 5 && (
                                                                <span style={{
                                                                    fontSize: '0.75rem',
                                                                    color: 'var(--text-secondary)',
                                                                    fontStyle: 'italic',
                                                                    alignSelf: 'center'
                                                                }}>
                                                                    +{author.agrupaciones_relacionadas.length - 5} más
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {agrupacion.lyrics && agrupacion.lyrics.length > 0 && (
                        <div>
                            <strong><i className="fas fa-music"></i> Letras:</strong> {agrupacion.lyrics.length}
                        </div>
                    )}
                </div>

                {user && (
                    <div className="card-actions">
                        <button className="btn btn-primary btn-small" onClick={onEdit}>
                            <i className="fas fa-edit"></i> Editar
                        </button>
                        <button className="btn btn-danger btn-small" onClick={onDelete}>
                            <i className="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AgrupacionCard;
