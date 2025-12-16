import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/components/bingo.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const PASE_OPTIONS = ['Pasodoble', 'Cuplé', 'Presentación', 'Popurrí'];

function BingoCellModal({ cell, cellData, isAdmin, onSave, onUnmark, onTitleEdit, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [selectedAgrupacion, setSelectedAgrupacion] = useState(null);
    const [selectedPase, setSelectedPase] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(cell.title);

    const isMarked = !!cellData;

    // Pre-fill if cell is already marked
    useEffect(() => {
        if (cellData) {
            setSelectedAgrupacion({
                _id: cellData.agrupacionId,
                nombre: cellData.agrupacionName,
                tipo: cellData.agrupacionTipo
            });
            setSelectedPase(cellData.pase);
        }
    }, [cellData]);

    // Fetch agrupaciones on mount and when search changes
    useEffect(() => {
        const fetchAgrupaciones = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const params = searchQuery.length >= 2 ? `?q=${encodeURIComponent(searchQuery)}` : '';
                const response = await fetch(`${API_URL}/api/bingo/2026/agrupaciones${params}`, {
                    headers: { 'x-auth-token': token }
                });

                if (!response.ok) throw new Error('Error loading agrupaciones');
                const data = await response.json();
                setAgrupaciones(data);
            } catch (error) {
                console.error('Error fetching agrupaciones:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchAgrupaciones, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleAgrupacionSelect = (ag) => {
        setSelectedAgrupacion(ag);
    };

    const handleSave = () => {
        if (!selectedAgrupacion || !selectedPase) return;

        onSave({
            agrupacionId: selectedAgrupacion._id,
            agrupacionName: selectedAgrupacion.nombre,
            agrupacionTipo: selectedAgrupacion.tipo,
            pase: selectedPase
        });
    };

    const handleTitleSave = () => {
        if (newTitle.trim() && newTitle !== cell.title) {
            onTitleEdit(newTitle.trim());
        }
        setEditingTitle(false);
    };

    const canSave = selectedAgrupacion && selectedPase;

    return (
        <motion.div
            className="bingo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bingo-cell-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    {editingTitle ? (
                        <div className="title-edit-container">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                autoFocus
                            />
                            <button className="btn-icon" onClick={handleTitleSave}>
                                <i className="fas fa-check"></i>
                            </button>
                            <button className="btn-icon" onClick={() => setEditingTitle(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <h3>
                            {cell.title}
                            {isAdmin && (
                                <button
                                    className="btn-edit-title"
                                    onClick={() => setEditingTitle(true)}
                                    title="Editar título (Admin)"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                            )}
                        </h3>
                    )}
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Agrupación Selection */}
                    <div className="form-section">
                        <label>
                            <i className="fas fa-users"></i> Agrupación
                        </label>

                        {selectedAgrupacion ? (
                            <div className="selected-agrupacion">
                                <span className={`tipo-badge ${selectedAgrupacion.tipo?.toLowerCase()}`}>
                                    {selectedAgrupacion.tipo}
                                </span>
                                <span className="agrupacion-name">{selectedAgrupacion.nombre}</span>
                                <button
                                    className="btn-change"
                                    onClick={() => setSelectedAgrupacion(null)}
                                >
                                    <i className="fas fa-exchange-alt"></i> Cambiar
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="search-input-wrapper">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar agrupación..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus={!isMarked}
                                    />
                                    {loading && <i className="fas fa-spinner fa-spin"></i>}
                                </div>

                                <div className="agrupaciones-list">
                                    {agrupaciones.map((ag) => (
                                        <div
                                            key={ag._id}
                                            className="agrupacion-item"
                                            onClick={() => handleAgrupacionSelect(ag)}
                                        >
                                            <span className={`tipo-badge ${ag.tipo?.toLowerCase()}`}>
                                                {ag.tipo}
                                            </span>
                                            <span className="agrupacion-name">{ag.nombre}</span>
                                        </div>
                                    ))}
                                    {!loading && agrupaciones.length === 0 && searchQuery.length >= 2 && (
                                        <div className="no-results">
                                            <i className="fas fa-search"></i>
                                            <span>No se encontraron agrupaciones</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pase Selection */}
                    <div className="form-section">
                        <label>
                            <i className="fas fa-music"></i> Tipo de Pase
                        </label>
                        <div className="pase-options">
                            {PASE_OPTIONS.map((pase) => (
                                <button
                                    key={pase}
                                    className={`pase-btn ${selectedPase === pase ? 'selected' : ''}`}
                                    onClick={() => setSelectedPase(pase)}
                                >
                                    {pase}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {isMarked && (
                        <button className="btn btn-danger" onClick={onUnmark}>
                            <i className="fas fa-times"></i> Desmarcar
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!canSave}
                    >
                        <i className="fas fa-check"></i> {isMarked ? 'Actualizar' : 'Marcar'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default BingoCellModal;
