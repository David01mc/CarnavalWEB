import { useAuth } from '../context/AuthContext';

function AgrupacionCard({ agrupacion, onClick }) {
    return (
        <div className="card clickable-card" onClick={() => onClick(agrupacion)}>
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
                </div>

                <div className="card-hover-indicator">
                    <span><i className="fas fa-eye"></i> Ver detalles</span>
                </div>
            </div>
        </div>
    );
}

export default AgrupacionCard;
