import { motion } from 'framer-motion';

function AgrupacionCard({ agrupacion, onClick, index = 0 }) {
    return (
        <motion.div
            className="card clickable-card"
            onClick={() => onClick(agrupacion)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: Math.min(index * 0.05, 0.5), // Max 0.5s delay
                ease: [0.25, 0.1, 0.25, 1] // Smooth cubic bezier
            }}
            whileHover={{
                y: -6,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
        >
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
        </motion.div>
    );
}

export default AgrupacionCard;
