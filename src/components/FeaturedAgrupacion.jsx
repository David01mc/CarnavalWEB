function FeaturedAgrupacion({ agrupacion, onClick }) {
    return (
        <div className="featured-agrupacion-simple" onClick={onClick}>
            {/* Large Image with Gradient Overlay */}
            <div className="featured-image-container">
                {agrupacion.image ? (
                    <img
                        src={agrupacion.image}
                        alt={agrupacion.name}
                        className="featured-image"
                    />
                ) : (
                    <div className="featured-image-placeholder">
                        <i className="fas fa-theater-masks"></i>
                    </div>
                )}

                {/* Badge */}
                <div className="featured-badge">
                    <i className="fas fa-star"></i> DESTACADA DEL DÍA
                </div>

                {/* Gradient Overlay with Info */}
                <div className="featured-overlay">
                    <h2 className="featured-title">{agrupacion.name}</h2>
                    <div className="featured-meta">
                        {agrupacion.category && (
                            <span className="meta-badge">
                                <i className="fas fa-masks-theater"></i> {agrupacion.category}
                            </span>
                        )}
                        {agrupacion.year && (
                            <span className="meta-badge year">
                                <i className="fas fa-calendar-alt"></i> {agrupacion.year}
                            </span>
                        )}
                    </div>
                    <div className="featured-cta">
                        <span><i className="fas fa-hand-pointer"></i> Toca para ver más</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeaturedAgrupacion;
